import React, { useState } from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import Call from '../../assets/call.png'; 
import { IoMdPaw } from 'react-icons/io';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch('http://localhost:8080/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({ success: true, message: 'Message sent successfully!' });
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        const errorData = await response.json();
        setSubmitStatus({ 
          success: false, 
          message: errorData.message || 'Failed to send message' 
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        success: false, 
        message: 'Network error. Please try again later.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="contact-container">
      <div className="contact-header-container">
        <div className="contact-header">
          <h1 className="contact-title">
            <span className="contact-title-highlight">Contact</span> PawHaven Team
          </h1>
          <p className="contact-subtitle">Have questions about pet adoption or need help with our platform? We're here to help!</p>
          <div className="contact-header-decoration">
            <div className="contact-header-paw contact-header-paw-1"><IoMdPaw /></div>
            <div className="contact-header-paw contact-header-paw-2"><IoMdPaw /></div>
          </div>
     
        </div>
      </div>
     
          
      <div className="contact-content">

        <div className="contact-form-card">
          <h2><FaPaperPlane className="contact-send-icon" /> Send Us a Message</h2>
          {submitStatus && (
            <div className={`submit-message ${submitStatus.success ? 'success' : 'error'}`}>
              {submitStatus.message}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="contact-form-group">
              <input 
                type="text" 
                id="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Your Name"
                required 
              />
            </div>
            <div className="contact-form-group">
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required 
              />
            </div>
            <div className="contact-form-group">
              <input 
                type="text" 
                id="subject" 
                value={formData.subject}
                onChange={handleChange}
                placeholder="Subject"
                required 
              />
            </div>
            <div className="contact-form-group">
              <textarea 
                id="message" 
                value={formData.message}
                onChange={handleChange}
                placeholder="Your Message"
                required
              ></textarea>
            </div>
            <button 
              type="submit" 
              className="contact-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Sending...</span>
              ) : (
                <>
                  <span>Send Message</span>
                  <FaPaperPlane className="contact-send-icon" />
                </>
              )}
            </button>
          </form>
        </div>

            

          <img src={Call} alt="Contact Us" className="contact-header-image" />

      <div className="contact-info-card">
          <div className="contact-info-content">
           
            
            <div className="contact-details">
              <div className="contact-item">
                <div className="contact-icon-container">
                  <FaEnvelope className="contact-icon" />
                </div>
                <div>
                  <h3>Email Us</h3>
                  <p>support@pawhaven.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon-container">
                  <FaPhone className="contact-icon" />
                </div>
                <div>
                  <h3>Call Us</h3>
                  <p>(555) 123-4567</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon-container">
                  <FaClock className="contact-icon" />
                </div>
                <div>
                  <h3>Hours</h3>
                  <p>Mon-Fri: 9am-7pm<br/>Weekends: 10am-5pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </main>
  );
};

export default Contact;