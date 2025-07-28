// FavoritesPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaPaw } from 'react-icons/fa';
import axios from 'axios';
import PetImage from '../Profile/PetImage';
import FavoriteButton from './FavoriteButton';
import './Favorites.css';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('User not authenticated');
                }

                const response = await axios.get(
                    'http://localhost:8080/api/v1/favorites',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setFavorites(response.data);
            } catch (err) {
                console.error('Error fetching favorites:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) {
        return <div className="loading">Loading your favorites...</div>;
    }

    if (error) {
        return (
            <div className="error">
                <p>{error}</p>
                <Link to="/login">Please login to view favorites</Link>
            </div>
        );
    }

    return (
        <div className="favorites-container">
             <div className="plp-header-container">
                    <div className="plp-header">
                      <h1 className="plp-title">
                        <span className="plp-title-highlight">Your Favorite Pets</span>
                      </h1>
                      <p className="plp-subtitle3">Keep track of the pets you love and revisit them anytime</p>
                      <div className="plp-header-decoration">
                        <div className="plp-header-paw plp-header-paw-1"><FaPaw /></div>
                        <div className="plp-header-paw plp-header-paw-2"><FaPaw /></div>
                        <div className="plp-header-paw plp-header-paw-3"><FaPaw /></div>
                      </div>
                    </div>
                  </div>
            
            {favorites.length === 0 ? (
                <div className="no-favorites">
                    <p>You haven't favorited any pets yet.</p>
                    <Link to="/pets" className="favorite-browse-link">
                        Browse available pets
                    </Link>
                </div>
            ) : (
                <div className="favorites-grid">
                    {favorites.map(pet => (
                        <div key={pet.id} className="favorite-card">
                            <div className="favorite-image-wrapper">
                                <Link to={`/petDetail/${pet.id}`} className="favorite-card-link">
                                    <div className="favorite-image">
                                        <PetImage pet={pet} />
                                    </div>
                                </Link>
                                <div className="favorite-button-container">
                                    <FavoriteButton petId={pet.id} />
                                </div>
                            </div>
                            <div className="favorite-info">
                                <div className="pet-info-header">
                                    <h3>{pet.petName}</h3>
                                    <span className="pet-gender">{pet.gender}</span>
                                </div>
                                <div className="favorite-pet-details">
                                    <p className="favorite-pet-breed">
                                        {pet.breed}
                                    </p>

                                    <p className='favorite-pet-loc'><FaMapMarkerAlt /> {pet.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Favorites;