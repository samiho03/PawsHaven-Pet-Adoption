// src/components/FAQ/FAQ.jsx
import React, { useState } from 'react';
import { FaPaw, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqItems = [
  {
    question: 'How does the pet adoption process work?',
    answer: 'It’s easy! Just follow our 3-step process: 1) Browse available pets, 2) Connect with the owner using provided contact info, and 3) Arrange to meet and adopt your new furry friend. 🐾'
  },
  {
    question: 'Can I submit my pet for adoption?',
    answer: 'Yes! Fill out our submission form with your pet’s details. Our team will review and approve it within 1–2 days, then your pet will appear on our PetList. ❤️'
  },
  {
    question: 'How do I find the perfect pet for my lifestyle?',
    answer: 'Use our Pet Match Quiz! It asks simple lifestyle questions and gives you personalized pet recommendations. 🐶🐱'
  },
  {
    question: 'How do I contact a pet’s owner?',
    answer: 'Each pet profile includes contact details like email and phone number. Use those to connect directly—just don’t share your own sensitive info online.'
  },
  {
    question: 'Is there a way to save pets I like?',
    answer: 'Yes! Use the ❤️ icon on each pet profile to add them to your Favorites. You can view them anytime from your Favorites page.'
  }
];


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

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const answerVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    exit: {
      height: 0,
      opacity: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut"
      }
    }
  };

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <motion.section 
      className="faq-section"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="paww-prints-bg">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              fontSize: `${Math.random() * 1 + 1}rem`,
              opacity: 0,
              color: '#b889e0'
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ 
              opacity: Math.random() * 0.2 + 0.1,
              y: 0 
            }}
            transition={{ 
              delay: i * 0.1,
              duration: 0.5 
            }}
            viewport={{ once: true }}
          >
            <FaPaw />
          </motion.div>
        ))}
      </div>
      
      <div className="faq-container">
        <motion.div 
          className="faq-header"
          variants={itemVariants}
        >
          <motion.img 
            src="/images/beagle.gif" 
            alt="" 
            className="deco-image top-left"
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70 }}
            viewport={{ once: true }}
          />
          <motion.img 
            src="/images/bone.gif" 
            alt="" 
            className="deco-image top-right"
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 70 }}
            viewport={{ once: true }}
          />
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about adopting</p>
        </motion.div>

        <motion.div 
          className="faq-items"
          variants={containerVariants}
        >
          {faqItems.map((item, index) => (
            <motion.div 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              key={index}
              variants={itemVariants}
              custom={index}
              whileHover={{ y: -3 }}
            >
              <motion.div 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
                whileTap={{ scale: 0.98 }}
              >
                <h3>{item.question}</h3>
                <motion.div
                  animate={{ rotate: activeIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeIndex === index ? (
                    <FaChevronUp className="chevvron" />
                  ) : (
                    <FaChevronDown className="chevvron" />
                  )}
                </motion.div>
              </motion.div>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    className="faq-answer"
                    variants={answerVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <p>{item.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FAQ;