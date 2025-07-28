import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPaw, FaHeart, FaDog, FaCat, FaArrowRight, FaPlusCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Button from "../ui/button";
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
    
    // Trigger load animation after component mounts
    setTimeout(() => {
      setIsLoaded(true);
    }, 100);
  }, []);

  // Function to create sparkles
  const createSparkle = () => {
    const sparklesContainer = document.querySelector('.sparkles');
    if (sparklesContainer) {
      const sparkle = document.createElement('div');
      sparkle.classList.add('sparkle');
      sparkle.style.left = Math.random() * 100 + '%';
      sparkle.style.top = Math.random() * 100 + '%';
      sparkle.style.animationDelay = Math.random() * 2 + 's';
      sparklesContainer.appendChild(sparkle);

      setTimeout(() => {
        if (sparkle.parentNode) {
          sparkle.remove();
        }
      }, 2000);
    }
  };

  // Set up intervals for animations
  useEffect(() => {
    const sparkleInterval = setInterval(createSparkle, 100);

    return () => {
      clearInterval(sparkleInterval);
    };
  }, []);

  // Handle title click for burst effect
  const handleTitleClick = () => {
    const title = document.querySelector('.hero-title');
    if (title) {
      title.style.animation = 'none';
      setTimeout(() => {
        title.style.animation = 'rainbowFlow 4s ease-in-out infinite, textBounce 2s ease-in-out infinite, glowPulse 3s ease-in-out infinite alternate';
      }, 10);
      
      // Create burst of sparkles on click
      for(let i = 0; i < 15; i++) {
        setTimeout(createSparkle, i * 50);
      }
    }
  };

  // Animation variants
   const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.15 
      }
    }
  };

  const itemVariants = (delay = 0) => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        delay: delay * 0.15, 
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  });


    const buttonVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 150
      }
    },
    hover: { 
      scale: 1.05,
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.4)",
      transition: { duration: 0.3 }
    },
    tap: { scale: 0.98 }
  };

  const imageVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const handleButtonClick = () => {
    if (isLoggedIn) {
      navigate('/form');
    } else {
      navigate('/signup');
    }
  };

  
  
  return (
    <motion.section 
      className="hero" 
      id="home"
      initial="hidden"
      animate={isLoaded ? "visible" : "hidden"}
      variants={containerVariants}
    >
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        

        {/* Enhanced Animated Title Section */}
        <motion.div 
          className="title-container"
          variants={containerVariants}
        >
          <div className="sparkles"></div>
          <motion.h1 
            className="hero-title" 
            onClick={handleTitleClick}
            variants={itemVariants(2)}
          >
            Snag Your Dream Pet Here
          </motion.h1>
          <motion.p 
            className="hero-description"
            variants={itemVariants(3)}
          >
            Changing lives, one adoption at a time. Meet your new best friend today.
          </motion.p>
        </motion.div>

       
         <motion.div
             variants={itemVariants(5)}
            initial="hidden"
            animate={isLoaded ? "visible" : "hidden"}
             whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          >
          <button 
            className="hero-button"
            onClick={handleButtonClick} 
          >
            {isLoggedIn ? (
              <>
                <span className="button-text">Post Your Pet</span>
                <FaPlusCircle className="hero-button-icon plus-icon" /> 
              </>
            ) : (
              <>
                <span className="button-text">Get Started Now</span>
                <div className="arrow-container">
                  <FaArrowRight className="hero-button-icon hero-button-arrow" /> 
                </div>
              </>
            )}
            <div className="ripple-effect"></div>
          </button>
        </motion.div>
      
        <motion.div 
          className="hero-images"
          variants={itemVariants(6)}
        >   
          <div className="clouds-container">
          
            <motion.img 
              src="/images/Frame-44.png" 
              alt="Shih Tzu Dog" 
              className="dog-image"
              initial={{ y: 50, opacity: 0, x: '-50%' }} 
              animate={{ y: 0, opacity: 1, x: '-50%' }} 
              transition={{ delay: 0.7, duration: 0.8 }}
            />
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default Hero;