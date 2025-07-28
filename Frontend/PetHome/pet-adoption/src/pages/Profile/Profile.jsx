import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPaw, 
  FaUserEdit, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaIdCard, 
  FaEdit, 
  FaTrash,
  FaLock,
  FaSignOutAlt,
  FaTimes,
  FaCheck,
  FaEllipsisH,
  FaCog,
  FaPlus,
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaEnvelope,
  FaUser
} from 'react-icons/fa';
import { IoMdPaw } from 'react-icons/io';
import { RiShieldUserLine } from 'react-icons/ri';
import PetImage from './PetImage';
import './Profile.css';

const Profile = () => {
    // User data state
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        profileImage: '',
        nic: '',
        location: '',
        phone: ''
    });

    const [statusFilter, setStatusFilter] = useState('all'); 
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');

    const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    petId: null,
    petName: ''
    });

    // Pet list state
    const [pets, setPets] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [activeTab, setActiveTab] = useState('pets');
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [likedPets, setLikedPets] = useState({});

    // Fetch user data and pets on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
    
                console.log('Fetching user profile...');
                const userResponse = await axios.get('http://localhost:8080/api/v1/profile/get', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const userData = userResponse.data;
                console.log('User profile response:', userResponse.data);
    
                // Handle profile image URL
                let profileImage = 'https://cdn-icons-png.flaticon.com/512/10542/10542486.png';
                if (userResponse.data.profileImage) {
                    profileImage = userResponse.data.profileImage.startsWith('http')
                        ? userResponse.data.profileImage
                        : `http://localhost:8080${userResponse.data.profileImage}`;
                    
                    // Add cache busting parameter
                    profileImage += `?t=${Date.now()}`;
                }
                
                setUserData({
                    name: userData.name || '',
                    email: userData.email || '',
                    profileImage: profileImage,
                    nic: userData.nic || '',
                    location: userData.location || '',
                    phone: userData.phone || ''
                });
    
                // Fetch user's pets with the same token
                const petsResponse = await axios.get('http://localhost:8080/api/v1/pets/my-pets', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
    
                // Process pet images
                const processedPets = petsResponse.data.map(pet => ({
                    ...pet,
                    photo: pet.photoUrl,
                    isAvailable: pet.isAvailable !== null ? pet.isAvailable : true // Default to true if null
                }));
                setPets(processedPets);

                 // Fetch user's favorites
                 const favoritesResponse = await axios.get('http://localhost:8080/api/v1/favorites', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setFavorites(favoritesResponse.data);

            } catch (error) {
                console.error('Error fetching data:', error);
                if (error.response?.status === 401) {
                    // Handle unauthorized (redirect to login or show message)
                    showNotification('Please login again', 'error');
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchData();
    }, []);

    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `profile-notification profile-notification--${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
      
        setTimeout(() => {
          notification.classList.add('profile-notification--fade-out');
          setTimeout(() => {
            document.body.removeChild(notification);
          }, 300);
        }, 3000);
    };

    const filteredPets = pets.filter(pet => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'approved') return pet.regStatus === 'Approved';
        if (statusFilter === 'pending') return pet.regStatus === null || pet.regStatus === 'pending';
        if (statusFilter === 'rejected') return pet.regStatus === 'Rejected';
        return true;
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordUpdate = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
          showNotification("New passwords don't match!", 'error');
          return;
        }
      
        if (passwordData.newPassword === passwordData.currentPassword) {
          showNotification("New password must be different from current password", 'warning');
          return;
        }
      
        try {
          const formData = new FormData();
          const jsonData = {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword
          };
          const jsonBlob = new Blob([JSON.stringify(jsonData)], {
            type: 'application/json'
          });
          
          formData.append('updateRequest', jsonBlob);
      
          const response = await axios.put(
            'http://localhost:8080/api/v1/profile/password',
            formData,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'multipart/form-data'
              }
            }
          );
      
          showNotification('Password updated successfully!');
          setShowPasswordForm(false);
          setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
        } catch (error) {
            console.error('Password update error:', error);
            
            if (error.response) {
              let errorMessage = "Failed to update password";
              
              if (error.response.data && error.response.data.message) {
                errorMessage = error.response.data.message;
              } else if (typeof error.response.data === 'string') {
                errorMessage = error.response.data;
              }
              
              showNotification(errorMessage, 'error');
            } else {
              showNotification("Network error. Please try again.", 'error');
            }
          }
    };

    const handleSave = async () => {
        try {
            const formData = new FormData();
            
            if (userData.name) formData.append('name', userData.name);
            if (userData.nic) formData.append('nic', userData.nic);
            if (userData.phone) formData.append('phone', userData.phone);
            if (userData.location) formData.append('location', userData.location);
            
            const fileInput = document.getElementById('profile-image-upload');
            if (fileInput.files[0]) {
                formData.append('profileImage', fileInput.files[0]);
            }
    
            const response = await axios.put(
                'http://localhost:8080/api/v1/profile',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
    
            showNotification('Profile updated successfully!');
            setUserData(prev => ({
                ...prev,
                ...response.data,
                profileImage: response.data.profileImage 
                    ? `http://localhost:8080${response.data.profileImage}`
                    : prev.profileImage
            }));
            setEditMode(false);
        } catch (error) {
            console.error('Update error:', error);
            showNotification(error.response?.data?.message || 'Failed to update profile', 'error');
        }
    };

    const updatePetStatus = async (petId, isAvailable) => {
        try {
            await axios.patch(`http://localhost:8080/api/v1/pets/${petId}/availability?available=${isAvailable}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            setPets(pets.map(pet => 
                pet.id === petId ? { ...pet, isAvailable } : pet
            ));
            showNotification(`Pet marked as ${isAvailable ? 'Available' : 'Not Available'}`);
        } catch (error) {
            console.error('Error updating pet availability:', error);
            showNotification('Failed to update pet availability', 'error');
        }
    };

   const showDeleteConfirmation = (petId, petName) => {
    setDeleteConfirmation({
        show: true,
        petId,
        petName
    });
    };

    const deletePet = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/pets/delete/${deleteConfirmation.petId}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
            });
            setPets(pets.filter(pet => pet.id !== deleteConfirmation.petId));
            showNotification('Pet deleted successfully!');
        } catch (error) {
            console.error('Error deleting pet:', error);
            showNotification('Failed to delete pet', 'error');
        } finally {
            setDeleteConfirmation({
            show: false,
            petId: null,
            petName: ''
            });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const handleDeleteAccount = async () => {
    if (!deletePassword) {
        showNotification('Please enter your password', 'error');
        return;
    }

    try {
        await axios.delete('http://localhost:8080/api/v1/profile', {
            params: { password: deletePassword },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        localStorage.removeItem('token');
        showNotification('Account deleted successfully');
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = '/';
        }, 1500);
    } catch (error) {
        console.error('Error deleting account:', error);
        const errorMessage = error.response?.data?.message || 
                           error.response?.data || 
                           'Failed to delete account';
        showNotification(errorMessage, 'error');
    } finally {
        setDeletePassword('');
        setShowDeleteAccountConfirm(false);
    }
};


    const toggleLike = (petId) => {
        setLikedPets(prev => ({
            ...prev,
            [petId]: !prev[petId]
        }));
    };

    if (isLoading) {
        return (
            <div className="profile-loading-state">
                <div className="profile-loading-spinner"></div>
                <p>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="profile-main-container">
            {/* Gradient Background Section */}
            <div className="profile-gradient-bg">
                {/* Profile Card */}
                <div className="profile-card-container">
                    <div className="profile-card">
                        {/* Logo above profile image */}
                        <div className="profile-logo-container">
                            <Link to="/" className="profile-logo-link">
                                <FaPaw className="profile-main-paw" />
                                <span className="profile-logo-text">Paws Haven</span>
                            </Link>
                        </div>
                        
                        {/* Left Side - Profile Image */}
                        <div className="profile-image-section">
                            <div className="profile-image-wrapper">
                                <img 
                                src={imagePreview || userData.profileImage}
                                alt="Profile" 
                                className="profile-main-image"
                                onError={(e) => {
                                    e.target.src = 'https://cdn-icons-png.flaticon.com/512/10542/10542486.png';
                                }}
                                />
                                {editMode && (
                                <label className="profile-image-upload-label">
                                    <input
                                    id="profile-image-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                    />
                                    <span className="profile-upload-text">Change Photo</span>
                                </label>
                                )}
                            </div>
                            {editMode && (
                                <div className="profile-email-under-image">
                                <FaEnvelope className="profile-email-icon" />
                                <span className="profile-email-text">{userData.email}</span>
                                
                                </div>
                            )}
                            </div>
                        
                        {/* Right Side - Profile Info */}
                        <div className="profile-info-section">
                            <div className="profile-header-actions">
                                <button 
                                    className="profile-settings-btn"
                                    onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                                >
                                    <FaEllipsisH />
                                </button>
                                
                                {showSettingsMenu && (
                                    <div className="profile-settings-menu">
                                        <div className="profile-menu-header">
                                            <h4>Account Settings</h4>
                                            <button 
                                                className="profile-menu-close"
                                                onClick={() => setShowSettingsMenu(false)}
                                            >
                                                <FaTimes />
                                            </button>
                                        </div>
                                        <button 
                                            className="profile-menu-item"
                                            onClick={() => {
                                                setShowPasswordForm(true);
                                                setShowSettingsMenu(false);
                                            }}
                                        >
                                            <FaLock /> Change Password
                                        </button>
                                        <button 
                                            className="profile-menu-item"
                                            onClick={handleLogout}
                                        >
                                            <FaSignOutAlt /> Logout
                                        </button>
                                        <button 
                                            className="profile-menu-item profile-menu-item-danger"
                                            onClick={() => setShowDeleteAccountConfirm(true)}
                                        >
                                            <FaTrash /> Delete Account
                                        </button>
                                    </div>
                                )}
                            </div>
                            
                            <div className="profile-info-content">
                                <div className="profile-name-section">
                                    <h1 className="profile-display-name">{userData.name}</h1>
                                    {editMode ? (
                                        <div className="profile-edit-actions">
                                            <button 
                                                className="profile-cancel-btn"
                                                onClick={() => setEditMode(false)}
                                            >
                                                <FaTimes /> Cancel
                                            </button>
                                            <button 
                                                className="profile-save-btn"
                                                onClick={handleSave}
                                            >
                                                <FaCheck /> Save
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            className="profile-edit-btn"
                                            onClick={() => setEditMode(true)}
                                        >
                                            <FaEdit /> Edit Profile
                                        </button>
                                    )}
                                </div>
                                
                                <div className="profile-stats-container">
                                    <div className="profile-stat-item">
                                        <div className="profile-stat-bubble">
                                            <span className="profile-stat-number">{pets.length}</span>
                                            <span className="profile-stat-label">Pets Added</span>
                                        </div>
                                    </div>
                                    <div className="profile-stat-item">
                                        <div className="profile-stat-bubble">
                                            <span className="profile-stat-number">{favorites.length}</span>
                                            <span className="profile-stat-label">Favorites</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="profile-details-section">
                                    {editMode ? (
                                        <>
                                            <div className="profile-form-group">
                                                <label><FaUser /> Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={userData.name}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                />
                                            </div>
                                          
                                            <div className="profile-form-group">
                                                <label><FaIdCard /> NIC Number</label>
                                                <input
                                                    type="text"
                                                    name="nic"
                                                    value={userData.nic}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter your NIC"
                                                />
                                            </div>
                                           
                                            <div className="profile-form-group">
                                                <label><FaMapMarkerAlt /> Location</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={userData.location}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter your location"
                                                />
                                            </div>
                                            <div className="profile-form-group">
                                                <label><FaPhone /> Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={userData.phone}
                                                    onChange={handleInputChange}
                                                    className="profile-form-input"
                                                    placeholder="Enter your phone number"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="profile-details-row">
                                                <div className="profile-detail-item">
                                                    <FaIdCard className="profile-detail-icon" />
                                                    <span className="profile-detail-text">{userData.nic || 'Not provided'}</span>
                                                </div>
                                                <div className="profile-detail-item">
                                                    <FaEnvelope className="profile-detail-icon" />
                                                    <span className="profile-detail-text">{userData.email}</span>
                                                </div>
                                            </div>
                                            <div className="profile-details-row">
                                                <div className="profile-detail-item">
                                                    <FaMapMarkerAlt className="profile-detail-icon" />
                                                    <span className="profile-detail-text">{userData.location || 'Not provided'}</span>
                                                </div>
                                                <div className="profile-detail-item">
                                                    <FaPhone className="profile-detail-icon" />
                                                    <span className="profile-detail-text">{userData.phone || 'Not provided'}</span>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rest of the profile content (tabs and pet display) */}
            <div className="profile-content-container">
                {/* Tabs */}
                <div className="profile-tabs">
                    <button 
                        className={`profile-tab ${activeTab === 'pets' ? 'profile-tab-active' : ''}`}
                        onClick={() => setActiveTab('pets')}
                    >
                        <IoMdPaw /> My Pets
                    </button>
                    <button 
                        className={`profile-tab ${activeTab === 'saved' ? 'profile-tab-active' : ''}`}
                        onClick={() => setActiveTab('saved')}
                    >
                        <FaRegHeart /> Saved
                    </button>
                </div>

                {/* Conditional rendering based on active tab */}
                {activeTab === 'pets' ? (
                    <>
                        <div className="profile-status-filters">
                            <button 
                                className={`status-filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('all')}
                            >
                                All Pets
                            </button>
                            <button 
                                className={`status-filter-btn ${statusFilter === 'approved' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('approved')}
                            >
                                Approved
                            </button>
                            <button 
                                className={`status-filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('pending')}
                            >
                                Pending
                            </button>
                            <button 
                                className={`status-filter-btn ${statusFilter === 'rejected' ? 'active' : ''}`}
                                onClick={() => setStatusFilter('rejected')}
                            >
                                Rejected
                            </button>
                        </div>

                        <div className="profile-pets-grid">
                            {filteredPets.length === 0 ? (
                                <div className="profile-no-pets">
                                    <div className="profile-no-pets-icon">
                                        <IoMdPaw />
                                    </div>
                                    <h3>No Pets Found</h3>
                                    <p>No pets match the selected filter.</p>
                                </div>
                            ) : (
                                filteredPets.map(pet => (
                                    <div key={pet.id} className="profile-pet-card">
                                        <div className="profile-pet-image-container">
                                            <Link to={`/petDetail/${pet.id}`} className="profile-pet-link">
                                                <PetImage pet={pet} />
                                            </Link>
                                            <div className="profile-pet-overlay">
                                                <div className="profile-pet-actions">
                                                   
                                                    <button 
                                                        className="profile-pet-delete-btn"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            showDeleteConfirmation(pet.id, pet.petName);
                                                        }}
                                                        >
                                                        <FaTrash />
                                                        </button>
                                                </div>
                                                <div className="profile-pet-info">
                                                    <h3>{pet.petName}</h3>
                                                    <p>{pet.breed} • {pet.age}</p>
                                                    <div className="profile-pet-status-container">
                                                        <p className={`profile-registration-status ${!pet.regStatus ? 'pending' : pet.regStatus}`}>
                                                            {!pet.regStatus ? 'Pending' : pet.regStatus}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="profile-favorites-section">
    {favorites.length === 0 ? (
        <div className="profile-no-favorites">
            <p>You haven't favorited any pets yet.</p>
            <Link to="/petlist" className="profile-favorite-browse-link">
                Browse available pets
            </Link>
        </div>
    ) : (
        <div className="profile-favorites-grid">
    {favorites.map(pet => (
        <div key={pet.id} className="profile-favorite-card">
            <div className="profile-favorite-image-wrapper">
                <Link to={`/petDetail/${pet.id}`} className="profile-favorite-card-link">
                    <div className="profile-favorite-image">
                        <PetImage pet={pet} />
                    </div>
                </Link>
                <div className="profile-favorite-overlay">
                    <div className="profile-favorite-info">
                        <div className="profile-pet-info-header">
                            <h3>{pet.petName}</h3>
                            <span className="profile-pet-gender">{pet.gender}</span>
                        </div>
                        <div className="profile-favorite-pet-details">
                            <p className="profile-favorite-pet-breed">
                                {pet.breed}
                            </p>
                            <p className='profile-favorite-pet-loc'>
                                <FaMapMarkerAlt /> {pet.location}
                            </p>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
            ))}
        </div>
    )}
</div>
                )}
            </div>

            {/* Password Update Form */}
            {showPasswordForm && (
                <div className="profile-password-modal">
                    <div className="profile-password-form-container">
                        <div className="profile-password-header">
                            <h3>Change Password</h3>
                            <button 
                                className="profile-close-btn"
                                onClick={() => setShowPasswordForm(false)}
                            >
                                <FaTimes />
                            </button>
                        </div>
                        <div className="profile-form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="profile-form-input"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div className="profile-form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="profile-form-input"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="profile-form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="profile-form-input"
                                placeholder="Confirm new password"
                            />
                        </div>
                        <div className="profile-form-actions">
                            <button 
                                className="profile-cancel-btn"
                                onClick={() => setShowPasswordForm(false)}
                            >
                                Cancel
                            </button>
                            <button 
                                className="profile-save-btn"
                                onClick={handlePasswordUpdate}
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Confirmation */}
            {showDeleteAccountConfirm && (
                <div className="profile-delete-modal">
                    <div className="profile-delete-container">
                        <h3>Delete Your Account</h3>
                        <p>This action cannot be undone. Please enter your password to confirm.</p>
                        
                        <div className="profile-form-group">
                            <label><FaLock /> Password</label>
                            <input
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="profile-form-input"
                                placeholder="Enter your password"
                            />
                        </div>
                        
                        <div className="profile-delete-actions">
                            <button 
                                className="profile-cancel-btn"
                                onClick={() => {
                                    setShowDeleteAccountConfirm(false);
                                    setDeletePassword('');
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                className="profile-delete-account-btn"
                                onClick={handleDeleteAccount}
                                disabled={!deletePassword}
                            >
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Pet Confirmation */}
            {deleteConfirmation.show && (
            <div className="profile-delete-modal">
                <div className="profile-delete-container">
                <h3>Delete Pet</h3>
                <p>Are you sure you want to delete {deleteConfirmation.petName}? This action cannot be undone.</p>
                <div className="profile-delete-actions">
                    <button 
                    className="profile-cancel-btn"
                    onClick={() => setDeleteConfirmation({
                        show: false,
                        petId: null,
                        petName: ''
                    })}
                    >
                    Cancel
                    </button>
                    <button 
                    className="profile-delete-account-btn"
                    onClick={deletePet}
                    >
                    Delete
                    </button>
                </div>
                </div>
            </div>
            )}
        </div>
    );
};

export default Profile;