// src/components/About/About.jsx
import React from 'react';
import { FaPaw, FaHeart, FaUsers, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './About.css';

const About = () => {
  const stats = [
    { number: "500+", label: "Pets Adopted", icon: <FaPaw />, color: "#ffa8d9" },
    { number: "100%", label: "Happy Families", icon: <FaHeart />, color: "#a1fcc1" },
    { number: "50+", label: "Volunteers", icon: <FaUsers />, color: "#dbbafe" },
    { number: "10+", label: "Years Experience", icon: <FaHome />, color: "#fef08a" }
  ];

  return (
    <section className="about-section" id="about">
      <div className="about-container">
        <div className="about-header">
          <motion.h2 
            className="about-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Our <span className="text-gradient">Story</span>
          </motion.h2>
          
          <motion.p 
            className="about-subtitle"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Bringing pets and people together since 2012
          </motion.p>
        </div>

        <div className="about-content-wrapper">
          <div className="about-text-content">
            <motion.div 
              className="about-text"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <p>
                Founded by a team of passionate animal lovers, our shelter has grown from a small 
                neighborhood initiative to one of the most trusted pet adoption centers in the region. 
                We believe every pet deserves a loving home.
              </p>
              <p>
                Our dedicated team works tirelessly to ensure each adoption is a perfect match, 
                providing comprehensive support through the lifetime of your pet.
              </p>
            </motion.div>
            
            <motion.div 
              className="stats-grid"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <motion.div 
                  className="stat-card" 
                  key={index}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  style={{ '--card-color': stat.color }}
                >
                  <div className="stat-icon">{stat.icon}</div>
                  <h3 className="stat-number">{stat.number}</h3>
                  <p className="stat-label">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
          
          <motion.div 
            className="about-image-container"
            initial={{ opacity: 0, x: 50, rotate: -5 }}
            whileInView={{ 
              opacity: 1, 
              x: 0, 
              rotate: 0,
              transition: { 
                type: "spring",
                stiffness: 60,
                damping: 10,
                delay: 0.3
              }
            }}
            whileHover={{
              y: -10,
              rotate: 1,
              boxShadow: "0 25px 50px -12px rgba(138, 92, 246, 0.4)"
            }}
            transition={{ 
              hover: { 
                duration: 0.4,
                type: "spring",
                stiffness: 300
              }
            }}
          >
            <motion.img 
              src="https://natyka.com/wp-content/uploads/photo-contact.png" 
              alt="Happy dog with owner" 
              className="about-image"
              initial={{ scale: 0.9 }}
              whileInView={{ 
                scale: 1,
                transition: { 
                  delay: 0.5,
                  type: "spring",
                  bounce: 0.4
                }
              }}
              whileHover={{
                scale: 1.03,
                transition: { duration: 0.3 }
              }}
            />
            
            {/* Floating paw prints */}
            <motion.div 
              className="floating-paw"
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 1
                }
              }}
              style={{ left: '10%', top: '15%' }}
            >
              <FaPaw />
            </motion.div>
            <motion.div 
              className="floating-paw"
              initial={{ y: 0, opacity: 0 }}
              animate={{ 
                y: [0, -15, 0],
                opacity: [0, 1, 0],
                transition: {
                  duration: 3.5,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                  delay: 0.5
                }
              }}
              style={{ right: '15%', bottom: '20%' }}
            >
              <FaPaw />
            </motion.div>
            
            <div className="image-overlay"></div>
            <div className="image-highlight"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;