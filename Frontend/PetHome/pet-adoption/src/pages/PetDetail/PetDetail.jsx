import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPaw, FaMapMarkerAlt, FaPhone, FaEnvelope, 
  FaUserCircle, FaHeart, FaRegHeart, FaShare, 
  FaComment, FaArrowLeft, FaSyringe, FaCut, 
  FaNotesMedical, FaInfoCircle, FaPaperPlane, 
  FaSpinner, FaTimes, FaExclamationTriangle
} from 'react-icons/fa';
import PetImage from '../Profile/PetImage';
import FavoriteButton from '../Favorites/FavoriteButton';
import './PetDetail.css';

const PetDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [recommendedPets, setRecommendedPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChatBox, setShowChatBox] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('about');
    const [conversation, setConversation] = useState([]);
    const [userId, setUserId] = useState(null);
    const [sending, setSending] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [notification, setNotification] = useState(null);
    const [connectionError, setConnectionError] = useState(null);
    const messagesEndRef = useRef(null);
    const eventSourceRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axios.get('http://localhost:8080/api/v1/auth/me', {
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    setUserId(response.data.id);
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    if (err.response?.status === 401) {
                        localStorage.removeItem('token');
                    }
                }
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        if (!userId || !pet?.ownerId || userId === pet.ownerId) return;

        const eventSource = new EventSource(`http://localhost:8080/api/v1/messages/stream?userId=${userId}`);
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
            try {
                const newMessage = JSON.parse(event.data);
                const formattedMessage = {
                    ...newMessage,
                    isRead: newMessage.read
                };
                
                if (newMessage.senderId === pet.ownerId) {
                    setNotification({
                        message: `${pet.ownerName} replied to your message`,
                        content: newMessage.content
                    });
                    setConversation(prev => [...prev, formattedMessage]);
                    scrollToBottom();
                }
            } catch (err) {
                console.error('Error parsing SSE message:', err);
            }
        };

        eventSource.onerror = (err) => {
            console.error('SSE connection error:', err);
            setConnectionError('Realtime updates disconnected. Messages may not update in real-time.');
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, [userId, pet?.ownerId]);

    useEffect(() => {
        const fetchPetData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const token = localStorage.getItem('token');
                const config = token ? { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                } : {};
                
                const petResponse = await axios.get(
                    `http://localhost:8080/api/v1/pets/get/${id}`,
                    config
                );
                
                const petData = {
                    ...petResponse.data,
                    ownerId: petResponse.data.ownerId || null,
                    ownerName: petResponse.data.ownerName || 'Unknown Owner',
                    ownerProfileImage: petResponse.data.ownerProfileImage || null
                };
                
                setPet(petData);
                
                if (petData.specie) {
                    const recommendedResponse = await axios.get(
                        `http://localhost:8080/api/v1/pets/recommended?specie=${petData.specie}&exclude=${id}`,
                        config
                    );
                    setRecommendedPets(recommendedResponse.data);
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error fetching pet data:', err);
                setError(err.response?.data?.message || 'Failed to load pet details. Please try again later.');
                setLoading(false);
            }
        };

        fetchPetData();
    }, [id]);

    useEffect(() => {
        if (showChatBox && pet?.id && userId && pet.ownerId) {
            fetchConversation();
        }
    }, [showChatBox, pet?.id, userId, pet?.ownerId]);

    const fetchConversation = useCallback(async () => {
        if (!pet?.id || !userId || !pet.ownerId) return;
        
        try {
            setLoadingMessages(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(
                'http://localhost:8080/api/v1/messages/conversation',
                {
                    params: {
                        petId: pet.id,
                        senderId: userId,
                        receiverId: pet.ownerId
                    },
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            const formattedMessages = response.data.map(msg => ({
                ...msg,
                isRead: msg.read
            }));
            
            const sortedMessages = formattedMessages.sort((a, b) => 
                new Date(a.timestamp) - new Date(b.timestamp)
            );
            
            setConversation(sortedMessages);
            
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
            
            scrollToBottom();
        } catch (err) {
            console.error('Error fetching conversation:', err);
            setError(err.response?.data?.message || 'Failed to load conversation');
        } finally {
            setLoadingMessages(false);
        }
    }, [pet, userId, navigate]);

    const handleSendMessage = useCallback(async (e) => {
        e.preventDefault();
        const trimmedMessage = message.trim();
        if (!trimmedMessage || !pet?.id || !userId || !pet.ownerId || sending) return;
        
        try {
            setSending(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.post(
                'http://localhost:8080/api/v1/messages',
                {
                    receiverId: pet.ownerId,
                    petId: pet.id,
                    content: trimmedMessage
                },
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            const newMessage = {
                ...response.data,
                isRead: response.data.read,
                senderId: userId,
                senderName: 'You',
                timestamp: new Date().toISOString()
            };
            
            setConversation(prev => [...prev, newMessage]);
            setMessage('');
            scrollToBottom();
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    }, [message, pet, userId, sending, navigate]);

    const toggleChatBox = () => {
        if (!userId) {
            navigate('/login');
            return;
        }
        
        if (!pet?.ownerId) {
            setError('Cannot message - pet owner information is missing');
            return;
        }
        
        setShowChatBox(!showChatBox);
    };

    const generateAboutText = () => {
        if (!pet) return '';
        
        const parts = [];
        
        if (pet.specie && pet.breed) {
            parts.push(`${pet.petName} is a ${pet.age ? pet.age + ' old ' : ''}${pet.breed} ${pet.specie}.`);
        }

        if (pet.gender) {
            parts.push(`${pet.petName} is ${pet.gender === 'Male' ? 'a male' : 'a female'}.`);
        }

        if (pet.size) {
            parts.push(`This ${pet.specie || 'pet'} is ${pet.size.toLowerCase()} sized.`);
        }

        if (pet.colorMarkings) {
            parts.push(`They have beautiful ${pet.colorMarkings}.`);
        }

        if (pet.behavior) {
            parts.push(`In terms of personality, ${pet.petName} is ${pet.behavior.toLowerCase()}.`);
        }

        return parts.length > 0 
            ? parts.join(' ') 
            : `Meet ${pet.petName}, a wonderful ${pet.specie || 'pet'} looking for a new home.`;
    };

    if (loading) {
        return (
            <div className="pet-detail-loading">
                <FaSpinner className="spinner-icon" />
                <p>Loading pet details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="pet-detail-error">
                <FaExclamationTriangle className="error-icon" />
                <p>{error}</p>
                <Link to="/pets" className="pet-detail-back-btn">
                    <FaArrowLeft /> Back to Pets
                </Link>
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="pet-detail-not-found">
                <h2>Pet not found</h2>
                <Link to="/pets" className="pet-detail-back-btn">
                    <FaArrowLeft /> Back to Pets
                </Link>
            </div>
        );
    }

    return (
        <div className="pet-detail-container">
            {notification && (
                <div className="message-notification">
                    <div className="notification-content">
                        <button 
                            className="notification-close"
                            onClick={() => setNotification(null)}
                        >
                            <FaTimes />
                        </button>
                        <h4>{notification.message}</h4>
                        <p>{notification.content}</p>
                        <button 
                            className="notification-view-btn"
                            onClick={() => {
                                setShowChatBox(true);
                                setNotification(null);
                            }}
                        >
                            View Conversation
                        </button>
                    </div>
                </div>
            )}

            {connectionError && (
                <div className="connection-error">
                    <FaExclamationTriangle /> {connectionError}
                </div>
            )}

            <div className="pet-detail-gradient-bg">
                <div className="pet-detail-main">
                    <div className="pet-detail-gallery">
                        <div className="pet-detail-main-image highlight reflection">
                            <PetImage pet={pet} />
                        </div>
                    </div>

                    <div className="pet-detail-info">
                        <div className="pet-detail-header">
                            <h1 className="pet-detail-name">{pet.petName}</h1>
                            <div className="pet-detail-actions">
                                <FavoriteButton petId={pet.id} />
                                <button className="pet-detail-share-btn">
                                    <FaShare />
                                </button>
                            </div>
                        </div>

                        <div className="pet-detail-meta">
                            {pet.specie && <span className="pet-detail-specie">{pet.specie}</span>}
                            {pet.breed && <span className="pet-detail-breed">{pet.breed}</span>}
                            {pet.age && <span className="pet-detail-age">{pet.age}</span>}
                            {pet.gender && <span className="pet-detail-gender">{pet.gender}</span>}
                            {pet.size && <span className="pet-detail-size">{pet.size}</span>}
                        </div>

                        {pet.location && (
                            <div className="pet-detail-location">
                                <FaMapMarkerAlt className="pet-detail-location-icon" />
                                <span>{pet.location}</span>
                            </div>
                        )}

                        <div className="pet-detail-quick-facts">
                            <div className="quick-fact">
                                <FaSyringe />
                                <span>Vaccination: <br />{pet.vaccinationStatus || 'Unknown'}</span>
                            </div>
                            <div className="quick-fact">
                                <FaCut />
                                <span>Spayed/Neutered: <br />{pet.spayedNeutered ? 'Yes' : 'No'}</span>
                            </div>
                            {pet.adoptionFeeFree ? (
                                <div className="quick-fact">
                                    <FaHeart /><span>Adoption Fee: <br />Free</span>
                                </div>
                            ) : (
                                <div className="quick-fact">
                                    <FaHeart />
                                    <span>Adoption Fee: <br />Rs.{pet.adoptionFee || 'Negotiable'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="full-width-content">
                <div className="pet-detail-tabs">
                    <button 
                        className={`tab-button ${activeTab === 'about' ? 'active' : ''}`}
                        onClick={() => setActiveTab('about')}
                    >
                        About
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'health' ? 'active' : ''}`}
                        onClick={() => setActiveTab('health')}
                    >
                        Health
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'behavior' ? 'active' : ''}`}
                        onClick={() => setActiveTab('behavior')}
                    >
                        Behavior
                    </button>
                </div>

                <div className="pet-detail-tab-content">
                    {activeTab === 'about' && (
                        <>
                            <div className="pet-detail-section">
                                <h3 className="pet-detail-section-title">
                                    <FaInfoCircle /> About {pet.petName}
                                </h3>
                                <p className="pet-detail-description">{generateAboutText()}</p>
                                
                                <div className="pet-detail-features">
                                    <div className="pd-feature">
                                        <span className="pd-feature-label">Breed:</span>
                                        <span>{pet.breed || 'Mixed breed'}</span>
                                    </div>
                                    <div className="pd-feature">
                                        <span className="pd-feature-label">Age:</span>
                                        <span>{pet.age || 'Unknown'}</span>
                                    </div>
                                    <div className="pd-feature">
                                        <span className="pd-feature-label">Gender:</span>
                                        <span>{pet.gender || 'Unknown'}</span>
                                    </div>
                                    {pet.colorMarkings && (
                                        <div className="pd-feature">
                                            <span className="pd-feature-label">Color/Markings:</span>
                                            <span>{pet.colorMarkings}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pet-detail-section">
                                <h3 className="pet-detail-section-title">
                                    <FaHeart /> Adoption Information
                                </h3>
                                <p className="pet-detail-description">
                                    <strong>Reason for adoption:</strong> {pet.justify || 'Not specified'}
                                </p>
                                {pet.ifTemp && pet.reason === 'Temporary' && (
                                    <p className="pet-detail-description">
                                        <strong>Temporary duration:</strong> {pet.ifTemp}
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    {activeTab === 'health' && (
                        <div className="pet-detail-section">
                            <h3 className="pet-detail-section-title">
                                <FaNotesMedical /> Health Information
                            </h3>
                            <div className="pet-detail-features">
                                <div className="pd-feature">
                                    <span className="pd-feature-label">Vaccination Status:</span>
                                    <span>{pet.vaccinationStatus || 'Unknown'}</span>
                                </div>
                                <div className="pd-feature">
                                    <span className="pd-feature-label">Spayed/Neutered:</span>
                                    <span>{pet.spayedNeutered ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="pd-feature">
                                    <span className="pd-feature-label">Medical History:</span>
                                    <span>{pet.medicalHistory || 'No significant medical history'}</span>
                                </div>
                                <div className="pd-feature">
                                    <span className="pd-feature-label">Special Needs:</span>
                                    <span>{pet.specialNeeds || 'None reported'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'behavior' && (
                        <div className="pet-detail-section">
                            <h3 className="pet-detail-section-title">
                                <FaPaw /> Behavior & Personality
                            </h3>
                            <div className="pet-detail-features">
                                <div className="pd-feature">
                                    <span className="pd-feature-label">Temperament:</span>
                                    <span>{pet.behavior || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pet-detail-section">
                    <h3 className="pet-detail-section-title">Owner Information</h3>
                    <div className="pet-detail-owner">
                        {pet.ownerProfileImage ? (
                            <img 
                                src={pet.ownerProfileImage.startsWith('http') ? pet.ownerProfileImage : `http://localhost:8080${pet.ownerProfileImage}`}
                                alt={pet.ownerName}
                                className="pet-detail-owner-avatar"
                                onError={(e) => {
                                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542486.png';
                                }}
                            />
                        ) : (
                            <FaUserCircle className="pet-detail-owner-avatar" />
                        )}
                        <div className="pet-detail-owner-info">
                            <h4 className="pet-detail-owner-name">
                                {pet.ownerName}
                            </h4>
                            
                            <button 
                                className="pet-detail-message-btn"
                                onClick={toggleChatBox}
                                disabled={!pet.ownerId}
                            >
                                <FaComment /> {pet.ownerId ? 'Message Owner' : 'Owner Info Unavailable'}
                            </button>
                        </div>   
                    </div>
                    
                    {showChatBox && (
                        <div className="pet-detail-chat-box">
                            <div className="chat-box-header">
                                <h4>Chat with {pet.ownerName}</h4>
                                <button 
                                    className="chat-box-close"
                                    onClick={() => setShowChatBox(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <div className="chat-box-messages">
                                {loadingMessages ? (
                                    <div className="chat-loading">
                                        <FaSpinner className="spinner-icon" />
                                    </div>
                                ) : conversation.length === 0 ? (
                                    <p className="no-messages">No messages yet. Start the conversation!</p>
                                ) : (
                                    conversation.map((msg) => (
                                        <div 
                                            key={msg.id} 
                                            className={`message ${msg.senderId === userId ? 'sent' : 'received'}`}
                                        >
                                            <div className="message-content">{msg.content}</div>
                                            <div className="message-meta">
                                                <span className="message-sender">{msg.senderName}</span>
                                                <span className="message-time">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                                                        hour: '2-digit', 
                                                        minute: '2-digit' 
                                                    })}
                                                </span>
                                                {!msg.isRead && msg.senderId === userId && (
                                                    <span className="message-status">✓</span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="chat-box-input">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    disabled={sending}
                                />
                                <button 
                                    type="submit"
                                    className="send-message-btn"
                                    disabled={!message.trim() || sending}
                                >
                                    {sending ? <FaSpinner className="spinner-icon" /> : <FaPaperPlane />}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
            
            {recommendedPets.length > 0 && (
                <div className="pet-detail-recommended">
                    <h2 className="pet-detail-recommended-title">Other {pet.specie}s you might like</h2>
                    <div className="pet-detail-recommended-grid">
                        {recommendedPets.map(recommendedPet => (
                            <div key={recommendedPet.id} className="plp-pet-card">
                                <div className="plp-pet-image-wrapper">
                                    <Link to={`/petDetail/${recommendedPet.id}`} className="plp-pet-card-link">
                                        <div className="plp-pet-image-container">
                                            <PetImage pet={recommendedPet} />
                                            <div className={`plp-pet-status ${recommendedPet.isAvailable ? 'available' : 'adopted'}`}>
                                                {recommendedPet.isAvailable ? 'Available' : 'Adopted'}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="plp-favorite-button-container">
                                        <FavoriteButton petId={recommendedPet.id} />
                                    </div>
                                </div>
                                <div className="plp-pet-info">
                                    <div className="plp-pet-info-header">
                                        <h3>{recommendedPet.petName}</h3>
                                        <div className="plp-pet-meta">
                                            <span className="plp-pet-gender">{recommendedPet.gender}</span>
                                        </div>
                                    </div>
                                    <div className="plp-pet-details">
                                        <p className="plp-pet-breed">
                                            {recommendedPet.breed}
                                        </p>
                                        <div className="plp-pet-location">
                                            <FaMapMarkerAlt className="plp-location-icon" /> 
                                            <span>{recommendedPet.location}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetDetail;