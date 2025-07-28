import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { FaTrashAlt, FaPlus, FaCamera } from 'react-icons/fa';
import './SpeciesAdmin.css';

const SpeciesAdmin = () => {
  const [speciesList, setSpeciesList] = useState([]);
  const [newSpecies, setNewSpecies] = useState({
    name: '',
    photo: null
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axiosInstance.get('/species');
        setSpeciesList(response.data);
      } catch (err) {
        setError('Failed to fetch species');
      }
    };
    fetchSpecies();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSpecies({...newSpecies, photo: file});
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newSpecies.name) {
      setError('Species name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('name', newSpecies.name);
      if (newSpecies.photo) {
        formData.append('photo', newSpecies.photo);
      }

      const response = await axiosInstance.post('/species', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setSpeciesList([...speciesList, response.data]);
      setNewSpecies({ name: '', photo: null });
      setPreviewImage(null);
      document.getElementById('species-photo-upload').value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add species');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this species?')) {
      try {
        await axiosInstance.delete(`/species/${id}`);
        setSpeciesList(speciesList.filter(species => species.id !== id));
      } catch (err) {
        setError('Failed to delete species');
      }
    }
  };

  return (
    <div className="species-admin-main-container">
      <h1 className="species-admin-title">Manage Species</h1>
      
      {error && <div className="species-admin-error">{error}</div>}
      
      <div className="species-admin-form-wrapper">
        <h2 className="species-admin-subtitle">Add New Species</h2>
        <form onSubmit={handleSubmit} className="species-admin-form">
          <div className="species-form-row">
            <div className="species-photo-upload-container">
              <div className="species-photo-wrapper">
                <div className="species-photo-icon">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Uploaded preview"
                      className="species-uploaded-photo"
                    />
                  ) : (
                    <FaCamera className="species-camera-icon" />
                  )}
                </div>
                <input
                  type="file"
                  id="species-photo-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="species-photo-input"
                />
              </div>
              <label className="species-upload-label">Click to upload image</label>
            </div>

            <div className="species-name-input-container">
              <label htmlFor="species-name" className="species-admin-label">Species Name:</label>
              <input
                type="text"
                id="species-name"
                className="species-admin-input"
                value={newSpecies.name}
                onChange={(e) => setNewSpecies({...newSpecies, name: e.target.value})}
                required
              />
            </div>
          </div>
          
          <button type="submit" disabled={isLoading} className="species-admin-submit-btn">
            <FaPlus /> {isLoading ? 'Adding...' : 'Add Species'}
          </button>
        </form>
      </div>
      
      <div className="species-admin-list-wrapper">
        <h2 className="species-admin-subtitle">Existing Species</h2>
        {speciesList.length === 0 ? (
          <p className="species-admin-empty-message">No species found</p>
        ) : (
          <div className="species-admin-grid">
            {speciesList.map((species) => (
              <div key={species.id} className="species-admin-card">
                <div className="species-admin-card-image">
                  {species.photo ? (
                    <img 
                      src={`http://localhost:8080${species.photo}`} 
                      alt={species.name} 
                      className="species-admin-card-img"
                    />
                  ) : (
                    <div className="species-admin-no-image">No Image Available</div>
                  )}
                </div>
                <div className="species-admin-card-details">
                  <h3 className="species-admin-card-title">{species.name}</h3>
                  <button 
                    onClick={() => handleDelete(species.id)}
                    className="species-admin-delete-btn"
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeciesAdmin;