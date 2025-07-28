import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaPaw, FaArrowRight, FaHeart, FaRegHeart } from 'react-icons/fa';
import PetImage from '../../pages/Profile/PetImage';
import cat from '../../assets/Bee.gif';
import FavoriteButton from '../../pages/Favorites/FavoriteButton';
import './Pets.css';
import '../PetCategory/PetCategory.css';

const Pets = () => {
    const [recentPets, setRecentPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

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
        hidden: { y: 50, opacity: 0 },
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

    const cardVariants = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: (i) => ({
            scale: 1,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 150
            }
        })
    };

    useEffect(() => {
        const fetchRecentPets = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const response = await axios.get('http://localhost:8080/api/v1/pets/recent-approved', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setRecentPets(response.data);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching recent pets:', err);
                setError('Failed to load recent pets. Please try again later.');
                setIsLoading(false);
            }
        };
    
        fetchRecentPets();
    }, []);

    if (isLoading) {
        return (
            <div className="recent-pets-loading">
                <div className="loading-spinner"></div>
                <p>Loading recent pets...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recent-pets-error">
                <p>{error}</p>
            </div>
        );
    }
   
    return (
        <motion.div 
            className="recent-pets-sectionn"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
        >
            <motion.section className="recent-pets-section">
              <motion.div 
                className="recent-pets-header"
                variants={itemVariants}
            >
                <div className="header-content-wrapper">
                    <img src={cat} alt="Cat walking" className="recent-pet-gif" />
                    <h2>Recently Added Pets</h2>
                </div>
                <p className="header-description">Meet our newest furry friends looking for homes</p>
            </motion.div>
                <motion.div 
                    className="recent-pets-grid"
                    variants={containerVariants}
                >
                    {recentPets.length > 0 ? (
                        recentPets.map((pet, index) => (
                            <motion.div 
                                key={pet.id} 
                                className="recent-pet-card"
                                variants={cardVariants}
                                custom={index}
                                whileHover={{ y: -10 }}
                            >
                                <div className="recent-pet-image-wrapper">
                                    <Link to={`/petDetail/${pet.id}`} className="recent-pet-card-link">
                                        <motion.div 
                                            className="recent-pet-image-container"
                                            whileHover={{ scale: 1.03 }}
                                        >
                                            <PetImage pet={pet} />
                                        </motion.div>
                                    </Link>
                                    <motion.div 
                                        className="favorite-button-container"
                                        whileHover={{ scale: 1.1 }}
                                    >
                                        <FavoriteButton petId={pet.id} />
                                    </motion.div>
                                </div>
                                <div className="recent-pet-info">
                                    <div className="pet-info-header">
                                        <h3>{pet.petName}</h3>
                                        <span className="pet-gender">{pet.gender}</span>
                                    </div>
                                    <div className="pet-details">
                                        <p className="recent-pet-breed">
                                            {pet.breed}
                                        </p>        
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            className="recent-no-pets-message"
                            variants={itemVariants}
                        >
                            <p>No recently added pets available at the moment.</p>
                        </motion.div>
                    )}
                </motion.div>

                <motion.div 
                    className="recent-view-more-container"
                    variants={itemVariants}
                >
                    <Link to="/petlist" className="recent-view-more-btn hero-button">
                        <motion.span
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            View More Pets 
                        </motion.span>
                        <motion.span
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <FaArrowRight className="hero-button-arrow" />
                        </motion.span>
                    </Link>
                </motion.div>
            </motion.section>
        </motion.div>
    );
};

export default Pets;