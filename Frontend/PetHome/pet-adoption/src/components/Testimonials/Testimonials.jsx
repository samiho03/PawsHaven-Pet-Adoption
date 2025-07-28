// src/components/Testimonials/Testimonials.jsx
import React from 'react';
import { FaQuoteLeft } from 'react-icons/fa';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "We adopted our dog Max from this shelter and couldn't be happier. The staff was so helpful throughout the entire process.",
      author: "Sarah Johnson"
    },
    {
      quote: "The adoption process was smooth and transparent. Our cat Luna has brought so much joy to our family.",
      author: "Michael Chen"
    },
    {
      quote: "The after-adoption support is amazing. They helped us with all our questions as first-time pet owners.",
      author: "Emma Rodriguez"
    }
  ];

  return (
    <section className="testimonials-section">
      <h2>Happy Families</h2>
      <div className="testimonials-grid">
        {testimonials.map((testimonial, index) => (
          <div className="testimonial-card" key={index}>
            <FaQuoteLeft className="quote-icon" />
            <p className="testimonial-text">{testimonial.quote}</p>
            <p className="testimonial-author">— {testimonial.author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;