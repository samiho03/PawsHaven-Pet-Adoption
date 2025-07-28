import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MessageDetails.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const MessageDetails = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const navigate = useNavigate();

  const fetchMessages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('http://localhost:8080/api/v1/contact/admin/messages', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login', { state: { from: '/admin/messages' } });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Sort by newest first
      const sortedMessages = data.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setMessages(sortedMessages);
      setFilteredMessages(sortedMessages);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err.message);
      setMessages([]);
      setFilteredMessages([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsResponded = async (messageId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `http://localhost:8080/api/v1/contact/admin/messages/${messageId}/respond`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          navigate('/login', { state: { from: '/admin/messages' } });
          return;
        }
        throw new Error(`Failed to update message status: ${response.status}`);
      }

      const updatedMessages = messages.map(msg =>
        msg.id === messageId ? { ...msg, responded: true } : msg
      );
      
      setMessages(updatedMessages);
      setFilteredMessages(updatedMessages);
      setSuccessMessage('Message marked as responded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating message:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      applyFilter(activeFilter);
      setCurrentPage(1);
      return;
    }
    
    const filtered = messages.filter(message => 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredMessages(filtered);
    setCurrentPage(1);
  };

  const applyFilter = (filter) => {
    setActiveFilter(filter);
    let filtered = [];
    
    switch(filter) {
      case 'responded':
        filtered = messages.filter(msg => msg.responded);
        break;
      case 'pending':
        filtered = messages.filter(msg => !msg.responded);
        break;
      default:
        filtered = [...messages];
    }
    
    setFilteredMessages(filtered);
    setCurrentPage(1);
  };

  // Get current messages for pagination
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = filteredMessages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading && messages.length === 0) {
    return (
      <div className="messages-container">
        <div className="loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div id="messages-container">
      <h2 className="messages-title">Contact Messages</h2>

      <div className="messages-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            <i className="fas fa-search"></i> Search
          </button>
        </div>

        <div className="filter-buttons">
          <button 
            onClick={() => applyFilter('all')} 
            className={`filter-button ${activeFilter === 'all' ? 'active' : ''}`}
          >
            All Messages
          </button>
          <button 
            onClick={() => applyFilter('pending')} 
            className={`filter-button ${activeFilter === 'pending' ? 'active' : ''}`}
          >
            Pending
          </button>
          <button 
            onClick={() => applyFilter('responded')} 
            className={`filter-button ${activeFilter === 'responded' ? 'active' : ''}`}
          >
            Responded
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchMessages} className="retry-button">
            <i className="fas fa-sync-alt"></i> Try Again
          </button>
        </div>
      )}

      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> {successMessage}
        </div>
      )}

      {filteredMessages.length === 0 ? (
        <p className="no-messages">
          {error ? 'Failed to load messages' : 'No messages found matching your criteria'}
        </p>
      ) : (
        <>
          <div className="messages-grid">
            {currentMessages.map(message => (
              <div key={message.id} className={`message-card ${message.responded ? 'responded' : ''}`}>
                <div className="message-header">
                  <h3 className="message-subject">
                    <i className={`fas ${message.responded ? 'fa-check-circle' : 'fa-envelope'}`}></i>
                    {message.subject}
                  </h3>
                  <div className="message-meta">
                    <span className="message-date">
                      <i className="far fa-clock"></i> {new Date(message.createdAt).toLocaleString()}
                    </span>
                    {message.responded && (
                      <span className="responded-badge">
                        <i className="fas fa-check"></i> Responded
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="message-sender">
                  <div className="sender-info">
                    <i className="fas fa-user"></i>
                    <span className="sender-name">{message.name}</span>
                    <span className="sender-email">&lt;{message.email}&gt;</span>
                  </div>
                </div>
                
                <div className="message-content">
                  <p>{message.message}</p>
                </div>
                
                <div className="message-actions">
                  {!message.responded && (
                    <button 
                      onClick={() => markAsResponded(message.id)}
                      className="respond-button"
                      disabled={loading}
                    >
                      <i className="fas fa-reply"></i> Mark as Responded
                    </button>
                  )}
                 
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {filteredMessages.length > messagesPerPage && (
            <div className="pagination">
              <button 
                onClick={() => paginate(Math.max(1, currentPage - 1))} 
                disabled={currentPage === 1}
                className="pagination-button"
              >
                <i className="fas fa-chevron-left"></i> Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  onClick={() => paginate(index + 1)}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
                disabled={currentPage === totalPages}
                className="pagination-button"
              >
                Next <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageDetails;