// src/components/PetImage.js
import React, { useState, useEffect } from 'react';
import './Profile.css';  // Assuming you have some CSS for styling
const PetImage = ({ pet }) => {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!pet.photoUrl) {  // Changed from pet.photo to pet.photoUrl
      console.log('No photo path for pet:', pet.id);
      return;
    }

    // Use the already constructed URL from photoUrl
    const url = pet.photoUrl;
    
    // Verify image exists
    const img = new Image();
    img.src = url;
    
    img.onload = () => {
      setImageUrl(url);
      console.log('Image verified:', url);
    };
    
    img.onerror = () => {
      console.error('Image not found:', url);
      setImageUrl(null);
    };
  }, [pet.photoUrl]);  // Changed dependency from pet.photo to pet.photoUrl

  return (
    <img
      src={imageUrl || 'https://images.freeimages.com/image/previews/5eb/purple-rose-pet-paw-pattern-png-art-5696324.png?h=350'}
      alt={pet.petName}
      className="profile-pet-image"
      onError={(e) => {
        e.target.src = 'https://images.freeimages.com/image/previews/5eb/purple-rose-pet-paw-pattern-png-art-5696324.png?h=350';
      }}
    />
  );
};

export default PetImage;