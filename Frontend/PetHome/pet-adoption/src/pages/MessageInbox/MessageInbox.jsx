import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaEnvelope, FaReply, FaSpinner, FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './MessageInbox.css';

const MessageInbox = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const eventSourceRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchConversations = useCallback(async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            
            const [conversationsResponse, unreadResponse] = await Promise.all([
                axios.get(`http://localhost:8080/api/v1/messages/conversations`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }),
                axios.get(`http://localhost:8080/api/v1/messages/unread-count`, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                })
            ]);
            
            setConversations(conversationsResponse.data);
            
            // Initialize unread counts
            const counts = {};
            conversationsResponse.data.forEach(conv => {
                const key = `${conv.petId}-${conv.otherUserId}`;
                counts[key] = 0;
            });
            
            // Update with actual unread counts
            counts['total'] = unreadResponse.data;
            setUnreadCounts(counts);
            
            if (conversationsResponse.data.length > 0) {
                selectConversation(conversationsResponse.data[0].petId, conversationsResponse.data[0].otherUserId);
            }
        } catch (err) {
            console.error('Error fetching conversations:', err);
            setError(err.response?.data?.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    }, []);

    const selectConversation = useCallback(async (petId, otherUserId) => {
        try {
            setLoading(true);
            setSelectedConversation({ petId, otherUserId });
            const token = localStorage.getItem('token');
            
            const response = await axios.get(
                `http://localhost:8080/api/v1/messages/conversation`,
                {
                    params: { 
                        petId, 
                        senderId: userId, 
                        receiverId: otherUserId 
                    },
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            setMessages(response.data.sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            ));
            
            // Mark messages as read
            await Promise.all(
                response.data
                    .filter(msg => !msg.read && msg.receiverId === userId)
                    .map(msg => 
                        axios.put(
                            `http://localhost:8080/api/v1/messages/${msg.id}/read`,
                            {},
                            { 
                                headers: { 
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                } 
                            }
                        )
                    )
            );
            
            // Update unread count
            setUnreadCounts(prev => ({
                ...prev,
                [`${petId}-${otherUserId}`]: 0
            }));
            
            scrollToBottom();
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError(err.response?.data?.message || 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const sendMessage = useCallback(async () => {
        if (!newMessage.trim() || !selectedConversation || sending) return;
        
        try {
            setSending(true);
            const token = localStorage.getItem('token');
            
            const response = await axios.post(
                'http://localhost:8080/api/v1/messages',
                {
                    receiverId: selectedConversation.otherUserId,
                    petId: selectedConversation.petId,
                    content: newMessage
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            setMessages(prev => [...prev, {
                ...response.data,
                senderId: userId,
                senderName: 'You',
                isRead: true
            }]);
            setNewMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    }, [newMessage, selectedConversation, sending, userId]);

    // SSE for real-time updates
    useEffect(() => {
        if (!userId) return;

        const setupSSE = () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            const token = localStorage.getItem('token');
            const eventSource = new EventSource(`http://localhost:8080/api/v1/messages/stream?userId=${userId}&token=${token}`);
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const newMessage = JSON.parse(event.data);
                    const formattedMessage = {
                        ...newMessage,
                        isRead: newMessage.read
                    };
                    
                    // Update conversation if it's the active one
                    if (selectedConversation && 
                        ((newMessage.senderId === selectedConversation.otherUserId && 
                          newMessage.petId === selectedConversation.petId) ||
                         (newMessage.receiverId === selectedConversation.otherUserId && 
                          newMessage.petId === selectedConversation.petId))) {
                        setMessages(prev => [...prev, formattedMessage]);
                        scrollToBottom();
                    }
                    
                    // Update unread counts
                    if (newMessage.receiverId === userId && !newMessage.read) {
                        const convKey = `${newMessage.petId}-${newMessage.senderId}`;
                        setUnreadCounts(prev => ({
                            ...prev,
                            [convKey]: (prev[convKey] || 0) + 1,
                            total: (prev.total || 0) + 1
                        }));
                    }
                } catch (err) {
                    console.error('Error parsing SSE message:', err);
                }
            };

            eventSource.onerror = (err) => {
                console.error('SSE error:', err);
                eventSource.close();
                setTimeout(setupSSE, 5000);
            };
        };

        setupSSE();

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
        };
    }, [userId, selectedConversation]);

    // Fetch user data on component mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        axios.get('http://localhost:8080/api/v1/auth/me', {
            headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            setUserId(response.data.id);
            fetchConversations(response.data.id);
        })
        .catch(err => {
            console.error('Error fetching user data:', err);
            if (err.response?.status === 401) {
                navigate('/login');
            }
        });
    }, [navigate, fetchConversations]);

    if (loading && conversations.length === 0) {
        return (
            <div className="loading-container">
                <FaSpinner className="spinner" />
                <p>Loading messages...</p>
            </div>
        );
    }

    return (
        <div className="message-inbox-container">
            <div className="inbox-header">
               
                <h2><FaEnvelope /> Messages {unreadCounts.total > 0 && `(${unreadCounts.total})`}</h2>
            </div>
            
      
            
            <div className="inbox-layout">
                <div className="conversation-list">
                    {conversations.length === 0 ? (
                        <div className="no-conversations">
                            <p>No messages yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const convKey = `${conv.petId}-${conv.otherUserId}`;
                            const unreadCount = unreadCounts[convKey] || 0;
                            
                            return (
                                <div 
                                    key={convKey}
                                    className={`conversation-item ${
                                        selectedConversation?.petId === conv.petId && 
                                        selectedConversation?.otherUserId === conv.otherUserId ? 'active' : ''
                                    }`}
                                    onClick={() => selectConversation(conv.petId, conv.otherUserId)}
                                >
                                    <div className="conversation-avatar">
                                        {conv.otherUserProfileImage ? (
                                            <img 
                                                src={conv.otherUserProfileImage} 
                                                alt={conv.otherUserName}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542486.png';
                                                }}
                                            />
                                        ) : (
                                            <FaUserCircle />
                                        )}
                                    </div>
                                    <div className="conversation-details">
                                        <h4>{conv.otherUserName}</h4>
                                        <p className="pet-name">About: {conv.petName}</p>
                                        <p className="last-message">{conv.lastMessage}</p>
                                    </div>
                                    <div className="conversation-meta">
                                        <span className="message-time">
                                            {new Date(conv.lastMessageTime).toLocaleTimeString([], { 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </span>
                                        {unreadCount > 0 && (
                                            <span className="unread-count">{unreadCount}</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="message-view">
                    {selectedConversation ? (
                        <>
                            <div className="messages-container">
                                {messages.map((msg, index) => (
                                    <div 
                                        key={index} 
                                        className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                                    >
                                        <div className="message-content">{msg.content}</div>
                                        <div className="message-meta">
                                            <span className="message-sender">
                                                {msg.senderId === userId ? 'You' : msg.senderName}
                                            </span>
                                            <span className="message-time">
                                                {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                            {msg.senderId === userId && !msg.isRead && (
                                                <span className="message-status">✓</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="message-input">
                                <textarea
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                />
                                <button 
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || sending}
                                >
                                    {sending ? <FaSpinner className="spinner" /> : <FaReply />}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="select-conversation">
                            <p>Select a conversation to view messages</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessageInbox;