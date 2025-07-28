import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaSync } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 
import axios from 'axios';
import robotIcon from '../../assets/chatbot.png'; 
import './Chatbot.css';

const Chatbot = () => {
  const navigate = useNavigate(); 
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showIcon, setShowIcon] = useState(false);
  const [messages, setMessages] = useState([
    {   
        text: "Hello! I'm Ellie, your pet adoption assistant. How can I help you today? 🐾",
        sender: 'bot', 
        timestamp: new Date(),
        buttons: [] 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  

  const API_URL = 'http://localhost:8080/api/chat';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  // Show icon after 3-4 seconds
  useEffect(() => {
    const iconTimer = setTimeout(() => {
      setShowIcon(true);
    }, 3500);
    return () => clearTimeout(iconTimer);
  }, []);

  // Show welcome message periodically
  useEffect(() => {
    const welcomeInterval = setInterval(() => {
      setShowWelcome(true);
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
      }, 30000);
      return () => clearTimeout(welcomeTimer);
    }, 10000); // Every 30 seconds

    return () => clearInterval(welcomeInterval);
  }, []);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const handleRefresh = () => {
    setMessages([{ text: "Hello! I'm Ellie, your pet adoption assistant. How can I help you today? 🐾", sender: 'bot' }]);
  };

   const handleButtonClick = (path) => {
    navigate(path); // Navigate to the specified path
    setIsOpen(false); // Optional: close chat after navigation
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = { text: inputMessage, sender: 'user', buttons: []  };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    
    try {
       const response = await axios.post(API_URL, {
        message: `You are a pet adoption assistant for PetAdopt website. The website helps people adopt pets.
        Here's how our platform works:
      
        ADOPTION PROCESS (3 Simple Steps):
        1. BROWSE: Users can browse available pets through our PetList
        2. CONNECT: Find your paw-match and contact owners via their provided details (email, chat, or call)
        3. MEET & ADOPT: Arrange to meet and complete the adoption
        
        PET SUBMISSION PROCESS:
        - Owners can submit their pets for adoption by filling our form
        - Users can get predicted adoption time 
        - Our team reviews each submission (approval takes 1-2 days)
        - Approved pets appear on the website for others to see
        - Interested adopters contact owners directly 

        PET MATCH QUIZ:
        - Helps users find their perfect pet match
        - simple questions about lifestyle
        - Generates personalized recommendations
        
        FAVORITES SYSTEM:
        - Users can save favorite pets
        - Accessible via Favorites page

        PETLIST FEATURES:
        - Each displayed pet includes full details such as breed, age, location, and contact info
        - Users can apply filters (e.g., species, age, gender, location) and search function to find their perfect pet
        - For more info, users can directly contact the pet owner using the provided details

        PET HOSPITAL LOCATOR:
        - Users can find nearby veterinary hospitals using our map
        - Just enter the location (e.g., city or district)
        - The map will show available pet hospitals in that area

        Current user question: "${inputMessage}"
        
        Guidelines:
        1. Keep responses friendly and pet-themed (use these emojis occasionally: 🐶, 🐱, 🐾, ❤️)
        2. For adoption questions, explain our simple 3-step process
        3. For pet care, provide concise tips
        4. For specific pets, suggest browsing our PetList
        5. Never share personal contact info
        6. For matching, promote the pet quiz
        7. For favorites, explain how to save/view
        8. When mentioning forms or PetList, include BUTTONS in this format:
           BUTTONS: [{"text":"View PetList","path":"/petlist"},{"text":"Submit Pet","path":"/form"},
           {"text":"Start Quiz","path":"/quiz"},{"text":"View Favorites","path":"/favorites"},  {"text":"Find Pet Hospitals","path":"/map"}]`
      });

      if (response.data.success) {
        const botResponse = response.data.response;
        
        // Extract buttons from response if they exist
        const buttonRegex = /BUTTONS: (\[.*?\])/;
        const buttonMatch = botResponse.match(buttonRegex);
        let buttons = [];
        let cleanedResponse = botResponse;
        
        if (buttonMatch) {
          try {
            buttons = JSON.parse(buttonMatch[1]);
            cleanedResponse = botResponse.replace(buttonRegex, '').trim();
          } catch (e) {
            console.error('Error parsing buttons:', e);
          }
        }
        
        setMessages(prev => [...prev, { 
          text: cleanedResponse, 
          sender: 'bot',
          buttons: buttons 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: response.data.error || "Sorry, I'm having trouble responding. Please try again later.", 
          sender: 'bot',
          buttons: [] 
        }]);
      }
    } catch (error) {
      console.error('Error calling API:', error);
      setMessages(prev => [...prev, { 
        text: error.response?.data?.error || "Service unavailable. Please try again later.", 
        sender: 'bot',
        buttons: [] 
      }]);
    } finally {
      setIsTyping(false);
    }
  };




  return (
    <>
      {/* Welcome message bubble */}
      {showWelcome && !isOpen && (
        <div className="welcome-bubble" onClick={toggleChat}>
          <div className="welcome-message">
            Hello! I'm Ellie👋🏻, how can I help you today?🐶
          </div>
        </div>
      )}

      {/* Chatbot icon */}
      {showIcon && !isOpen && (
        <div className="chatbot-icon-container" onClick={toggleChat}>
          <img src={robotIcon} alt="Ellie the Chatbot" className="robot-icon" />
        </div>
      )}

      {/* Chat window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-profile">
              <img src={robotIcon} alt="Ellie" className="chatbot-profile-pic" />
              <div className="chatbot-name">Ellie </div>
            </div>
            <div className="chatbot-controls">
              <button className="chatbot-refresh-btn" onClick={handleRefresh}>
                <FaSync />
              </button>
              <button className="chatbot-close-btn" onClick={toggleChat}>
                <FaTimes />
              </button>
            </div>
          </div>
          
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div key={index} className={`message ${message.sender}`}>
                {message.text}
                {message.buttons && message.buttons.length > 0 && (
                    <div className="chatbot-buttons">
                    {message.buttons.map((button, btnIndex) => (
                        <button
                        key={btnIndex}
                        className="chatbot-action-btn"
                        onClick={() => handleButtonClick(button.path)}
                        >
                        {button.text}
                        </button>
                    ))}
                    </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="message bot">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <form className="chatbot-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={isTyping}
            />
            <button type="submit" disabled={!inputMessage.trim() || isTyping}>
              <FaPaperPlane />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Chatbot;