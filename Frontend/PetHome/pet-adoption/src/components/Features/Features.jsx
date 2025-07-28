// src/components/Features/Features.jsx
import React from 'react';
import { FaHeart, FaMedkit, FaHandsHelping, FaHome, FaPaw } from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const features = [
    {
      icon: <FaHeart />,
      title: "Adoption Process",
      description: "Our streamlined 3-step process ensures perfect matches between pets and families",
      bgColor: "#ffa8d9" // pink
    },
    {
      icon: <FaMedkit />,
      title: "Health Guarantee",
      description: "All pets receive complete veterinary checkups and vaccinations",
      bgColor: "#a1fcc1" // green
    },
    {
      icon: <FaHandsHelping />,
      title: "Lifetime Support",
      description: "24/7 support and training resources for all adopted pets",
      bgColor: "#fef08a" // yellow
    },
    {
      icon: <FaHome />,
      title: "Home Checks",
      description: "We ensure every pet goes to a safe and loving environment",
      bgColor: "#dbbafe" // purple
    }
  ];

  return (
    <section className="features-section">
      <h2 className="features-title">Why Choose Our Shelter?</h2>
      <p className="features-description">We provide the best care and support for both pets and their new families</p>
      <div className="features-grid">
        {features.map((feature, index) => (
          <div className="feature-card" key={index}>
            <div className="feature-icon" style={{ backgroundColor: feature.bgColor }}>
              {feature.icon}
            </div>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;