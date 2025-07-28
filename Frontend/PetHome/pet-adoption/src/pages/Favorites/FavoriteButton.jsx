import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const FavoriteButton = ({ petId }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkFavoriteStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await axios.get(
                    `http://localhost:8080/api/v1/favorites/${petId}/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                setIsFavorite(response.data);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            }
        };

        checkFavoriteStatus();
    }, [petId]);

    const toggleFavorite = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }
    
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            };
    
            if (isFavorite) {
                await axios.delete(
                    `http://localhost:8080/api/v1/favorites/${petId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } else {
                await axios.post(
                    `http://localhost:8080/api/v1/favorites/${petId}`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }
            setIsFavorite(!isFavorite);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            
            if (error.response?.status === 401) {
                // Unauthorized - token expired or invalid
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response?.status === 404) {
                // Favorite not found - update UI to reflect this
                setIsFavorite(false);
            } else {
                // Show error to user
                alert('Failed to update favorite. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };
    return (
        <button 
            onClick={toggleFavorite}
            disabled={loading}
            className={`favorite-button ${isFavorite ? 'active' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isFavorite ? (
                <FaHeart className="favorite-icon" />
            ) : (
                <FaRegHeart className="favorite-icon" />
            )}
        </button>
    );
};

export default FavoriteButton;