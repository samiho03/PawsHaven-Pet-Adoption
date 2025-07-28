import React, { useState, useEffect } from 'react';
import { 
  FaArrowLeft, FaCamera, FaHeart, FaPaw, FaUserPlus, FaLock, 
  FaCheck, FaPhone, FaEnvelope, FaExclamationTriangle, FaInfoCircle,
  FaPlus, FaUser, FaIdCard, FaDog, FaCat, FaDove, FaFish
} from 'react-icons/fa';
import { GiRabbit, GiParrotHead } from 'react-icons/gi';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig'; 
import './UserForm.css';
import axios from "axios";

const UserForm = ({ onLogout }) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [speed, setSpeed] = useState(null);
  const [submissionComplete, setSubmissionComplete] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const [speciesOptions, setSpeciesOptions] = useState([
    { value: 'dog', label: 'Dog', icon: <FaDog /> },
    { value: 'cat', label: 'Cat', icon: <FaCat /> },
    { value: 'rabbit', label: 'Rabbit', icon: <GiRabbit /> },
    { value: 'bird', label: 'Bird', icon: <GiParrotHead /> }
  ]);

  const [formData, setFormData] = useState({
    petName: '',
    specie: '',
    breed: '',
    location: '',
    age: '',
    gender: '',
    reason: '',
    ifTemp: '',
    justify: '',
    ownerName: '',
    nic: '',
    contactEmail: '',
    contactPhoneNumber: '',
    vaccinationStatus: '',
    colorMarkings: '',
    size: '',
    spayedNeutered: false,
    medicalHistory: '',
    behavior: '',
    specialNeeds: '',
    adoptionFee: 0,
    adoptionFeeFree: false,
  });

  // 1. Fix species fetching with duplicate prevention
  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axiosInstance.get('/species/for-quiz');
        const backendSpecies = response.data.map(species => ({
          value: species.value,
          label: species.label,
          icon: getSpecieIcon(species.value)
        }));
        
        // Merge and remove duplicates by value
        setSpeciesOptions(prev => {
          const merged = [...prev, ...backendSpecies];
          const unique = merged.reduce((acc, current) => {
            if (!acc.find(item => item.value === current.value)) {
              acc.push(current);
            }
            return acc;
          }, []);
          return unique;
        });
      } catch (error) {
        console.error('Error fetching species:', error);
        // Keep default options if fetch fails
      }
    };
    fetchSpecies();
  }, []);

  // 2. Make getSpecieIcon more robust
  const getSpecieIcon = (specie) => {
    // Define default icons that always exist
    const defaultIcons = {
      dog: <FaDog />,
      cat: <FaCat />,
      rabbit: <GiRabbit />,
      bird: <GiParrotHead />,
    };

    // Check both speciesOptions and defaults
    const foundInOptions = speciesOptions.find(s => s.value === specie);
    if (foundInOptions) return foundInOptions.icon;
    
    return defaultIcons[specie] || <FaPaw />;
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const fetchUserData = async () => {
        try {
          const response = await axiosInstance.get('/auth/me');
          setUserData(response.data);
          setFormData(prev => ({
            ...prev,
            contactEmail: response.data.email || '',
            contactPhoneNumber: response.data.phone || '',
            location: response.data.location || '',
            ownerName: response.data.name || '',
            nic: response.data.nic || ''
          }));
        } catch (error) {
          console.error("Error fetching user data", error);
        }
      };
      fetchUserData();
    }
  }, []);

  const showNotification = (message, type = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showNotification('Image size should be less than 2MB', 'error');
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      const requiredFields = ['petName', 'specie', 'breed', 'location', 'age', 'gender'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
          return;
        }
      }
    } else if (currentStep === 2) {
      // Only require duration if residency type is Temporary
      const requiredFields = ['reason', 'justify'];
      if (formData.reason === 'Temporary') {
        requiredFields.push('ifTemp');
      }
      
      for (const field of requiredFields) {
        if (!formData[field]) {
          showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
          return;
        }
      }
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePredictAdoption = async () => {
    try {
      const payload = {
        specie: formData.specie,
        breed: formData.breed,
        age: parseFloat(formData.age),
        colorMarkings: formData.colorMarkings,
        size: formData.size,
        vaccinationStatus: formData.vaccinationStatus === "Up-to-date" ? "Up-to-date" : "Not vaccinated",
        behavior: formData.behavior || "",
        adoptionFee: parseFloat(formData.adoptionFee || 0),
      };

      const response = await axios.post("http://127.0.0.1:5000/predict_adoption", payload);
      setSpeed(response.data.prediction);
      showNotification('Adoption speed predicted successfully!', 'success');
    } catch (error) {
      console.error("Adoption speed prediction error:", error);
      setSpeed("Error");
      showNotification('Failed to predict adoption speed', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
      
      if (photoFile) {
        formDataToSend.append('photo', photoFile);
      }
      
      await axiosInstance.post('/pets/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSubmissionComplete(true);
      showNotification('Pet submitted successfully!', 'success');
    } catch (error) {
      console.error("Error submitting pet", error);
      showNotification('Error submitting pet. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      petName: '',
      specie: '',
      breed: '',
      location: userData?.location || '',
      age: '',
      gender: '',
      reason: '',
      ifTemp: '', // Clear duration
      justify: '',
      vaccinationStatus: '',
      colorMarkings: '',
      size: '',
      spayedNeutered: false,
      medicalHistory: '',
      behavior: '',
      specialNeeds: '',
      adoptionFee: 0,
      adoptionFeeFree: false,
      ownerName: userData?.name || '',
      nic: userData?.nic || '',
      contactEmail: userData?.email || '',
      contactPhoneNumber: userData?.phone || '',
    });
    setPhotoFile(null);
    setPhotoPreview(null);
    setCurrentStep(1);
    setSpeed(null);
    setSubmissionComplete(false);
  };

  if (!isLoggedIn) {
    return (
      <div className="isolated-guest-container">
        <div className="isolated-guest-content">
          <div className="isolated-guest-header">
            <FaLock className="isolated-guest-lock-icon" />
            <h2 className="isolated-guest-title">Secure Pet Submission</h2>
          </div>
          
          <div className="isolated-guest-message">
            <div className="isolated-guest-icon">
              <FaPaw />
            </div>
            <h3>Join Our Pet Adoption Community</h3>
            <p>
              To submit a pet for adoption, we require you to create an account. 
              This helps us maintain a safe and trustworthy environment for all pets and adopters.
            </p>
            
            <div className="isolated-guest-benefits">
              <h4>By creating an account, you'll be able to:</h4>
              <ul>
                <li><FaPaw className="benefit-icon" /> Submit pets for adoption with full details</li>
                <li><FaPaw className="benefit-icon" /> Manage all your pet listings in one place</li>
                <li><FaPaw className="benefit-icon" /> Communicate securely with potential adopters</li>
                <li><FaPaw className="benefit-icon" /> Receive updates on your pet's adoption status</li>
                <li><FaPaw className="benefit-icon" /> Access our community resources for pet owners</li>
              </ul>
            </div>
            
            <div className="isolated-guest-cta">
              <button 
                className="isolated-guest-button"
                onClick={() => navigate('/signup')}
              >
                <FaUserPlus /> Create Your Free Account
              </button>
              <p className="isolated-guest-login">
                Already have an account? <Link to="/login">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="isolated-container-form">
      {/* Notification */}
      {notification && (
        <div className={`pet-notification pet-notification-${notification.type}`}>
          <div className="pet-notification-icon">
            {notification.type === 'error' ? <FaExclamationTriangle /> : <FaInfoCircle />}
          </div>
          <div className="pet-notification-message">{notification.message}</div>
        </div>
      )}

      <div className="plp-header-container">
        <div className="plp-header">
          <h1 className="plp-title">
            <span className="plp-title-highlight">Rehome Your Pet with Love</span>
          </h1>
          <p className="plp-subtitle2">Fill out the form to help your furry friend find a safe and happy new home</p>
          <div className="plp-header-decoration">
            <div className="plp-header-paw plp-header-paw-1"><FaPaw /></div>
            <div className="plp-header-paw plp-header-paw-2"><FaPaw /></div>
            <div className="plp-header-paw plp-header-paw-3"><FaPaw /></div>
          </div>
        </div>
      </div>

      {submissionComplete ? (
        <div className="pet-submission-complete-container">
          <div className="pet-submission-complete-card">
            <div className="pet-submission-complete-icon">
              <FaCheck />
            </div>
            <h2>Pet Submission Complete!</h2>
            <p>
              Our team will review your pet's information and you'll be notified 
              once it's approved. You can track the status of your submission 
              through your profile.
            </p>
            <p className="pet-submission-note">
              <FaInfoCircle /> Note: Your email and phone number will be displayed 
              on the pet's listing so potential adopters can contact you. 
              Please ensure they are correct and up-to-date.
            </p>
            
            <div className="pet-submission-actions">
              <button 
                className="pet-submission-profile-btn"
                onClick={() => navigate('/profile')}
              >
                <FaUser /> Go to My Profile
              </button>
              <button 
                className="pet-submission-another-btn"
                onClick={resetForm}
              >
                <FaPlus /> Submit Another Pet
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="pet-form-progress-container">
            <div className="pet-form-progress-line">
              <div 
                className="pet-form-progress-fill" 
                style={{ width: `${(currentStep - 1) * 33.33}%` }}
              ></div>
            </div>
            
            <div className="pet-form-steps">
              <div 
                className={`pet-form-step ${currentStep >= 1 ? 'active' : ''}`}
                onClick={() => currentStep > 1 && setCurrentStep(1)}
              >
                <div className="pet-form-step-number">1</div>
                <div className="pet-form-step-label">Basic Details</div>
              </div>
              <div 
                className={`pet-form-step ${currentStep >= 2 ? 'active' : ''}`}
                onClick={() => currentStep > 2 && setCurrentStep(2)}
              >
                <div className="pet-form-step-number">2</div>
                <div className="pet-form-step-label">Additional Info</div>
              </div>
              <div 
                className={`pet-form-step ${currentStep >= 3 ? 'active' : ''}`}
                onClick={() => currentStep > 3 && setCurrentStep(3)}
              >
                <div className="pet-form-step-number">3</div>
                <div className="pet-form-step-label">Your Info</div>
              </div>
              <div 
                className={`pet-form-step ${currentStep >= 4 ? 'active' : ''}`}
                onClick={() => currentStep > 4 && setCurrentStep(4)}
              >
                <div className="pet-form-step-number">4</div>
                <div className="pet-form-step-label">Prediction</div>
              </div>
            </div>
          </div>

          <form className="isolated-user-form" onSubmit={handleSubmit}>
            {/* Step 1: Basic Details */}
            {currentStep === 1 && (
              <div className="pet-form-step-content">
                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-8">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                       Name of your pet
                      </label>
                      <input
                        className="isolated-form-input"
                        type="text"
                        name="petName"
                        placeholder="Enter the name"
                        value={formData.petName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="isolated-form-col isolated-form-col-4 isolated-form-center">
                    <div className="isolated-photo-upload">
                      <div className="isolated-photo-wrapper">
                        <div className="isolated-photo-icon">
                          {photoPreview ? (
                            <img
                              src={photoPreview}
                              alt="Uploaded preview"
                              className="isolated-uploaded-photo"
                            />
                          ) : (
                            <FaCamera className="isolated-camera-icon" />
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="isolated-photo-input"
                        />
                      </div>
                      <label className="isolated-form-label">Add Photo</label>
                    </div>
                  </div>
                </div>

                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                        {formData.specie ? getSpecieIcon(formData.specie) : <FaPaw />} Specie
                      </label>
                      <select
                        className="isolated-form-select"
                        name="specie"
                        value={formData.specie}
                        onChange={handleInputChange}
                      >
                        <option value="">Select specie</option>
                        {speciesOptions
                          .filter(option => option.value !== '') // Ensure empty option isn't duplicated
                          .map(specie => (
                            <option key={specie.value} value={specie.value}>
                              {specie.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                        Breed
                      </label>
                      <input
                        className="isolated-form-input"
                        type="text"
                        name="breed"
                        placeholder="Enter the breed"
                        value={formData.breed}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                         Age
                      </label>
                      <input
                        className="isolated-form-input"
                        type="text"
                        name="age"
                        placeholder="Enter pet's age"
                        value={formData.age}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                       Gender
                      </label>
                      <div className="isolated-radio-group">
                        <label className="isolated-radio-label">
                          <input
                            type="radio"
                            name="gender"
                            value="Male"
                            checked={formData.gender === 'Male'}
                            onChange={handleInputChange}
                          />
                          <span className="isolated-radio-custom"></span>
                          Male
                        </label>
                        <label className="isolated-radio-label">
                          <input
                            type="radio"
                            name="gender"
                            value="Female"
                            checked={formData.gender === 'Female'}
                            onChange={handleInputChange}
                          />
                          <span className="isolated-radio-custom"></span>
                          Female
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                    Location
                  </label>
                  <input
                    className="isolated-form-input"
                    type="text"
                    name="location"
                    placeholder="Enter the location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="pet-form-step-buttons">
                  <button
                    type="button"
                    className="pet-form-next-btn"
                    onClick={handleNextStep}
                  >
                    Next <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Additional Info */}
            {currentStep === 2 && (
              <div className="pet-form-step-content">
                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-6">
                  <div className="isolated-form-group">
                    <label className="isolated-form-label">
                       Residency Type
                    </label>
                    <div className="isolated-radio-group">
                      <label className="isolated-radio-label">
                        <input
                          type="radio"
                          name="reason"
                          value="Temporary"
                          checked={formData.reason === 'Temporary'}
                          onChange={(e) => {
                            handleInputChange(e);
                            // Clear duration if switching to Adopt
                            if (e.target.value === 'Adopt') {
                              setFormData({...formData, reason: 'Adopt', ifTemp: ''});
                            } else {
                              handleInputChange(e);
                            }
                          }}
                        />
                        <span className="isolated-radio-custom"></span>
                        Temporary
                      </label>
                      <label className="isolated-radio-label">
                        <input
                          type="radio"
                          name="reason"
                          value="Adopt"
                          checked={formData.reason === 'Adopt'}
                          onChange={(e) => {
                            handleInputChange(e);
                            // Clear duration if switching to Adopt
                            if (e.target.value === 'Adopt') {
                              setFormData({...formData, reason: 'Adopt', ifTemp: ''});
                            } else {
                              handleInputChange(e);
                            }
                          }}
                        />
                        <span className="isolated-radio-custom"></span>
                        Adoption
                      </label>
                    </div>
                  </div>
                  </div>
                  {formData.reason === 'Temporary' && (
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                           Duration
                        </label>
                        <select
                          className="isolated-form-select"
                          name="ifTemp"
                          value={formData.ifTemp}
                          onChange={handleInputChange}
                        >
                          <option value="">Select duration</option>
                          <option value="1">1 month</option>
                          <option value="2">3 months</option>
                          <option value="3">6 months</option>
                          <option value="4">1 year</option>
                          <option value="5">2 years</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                     Justification for giving the pet
                  </label>
                  <textarea
                    className="isolated-form-textarea"
                    name="justify"
                    placeholder="Type here..."
                    value={formData.justify}
                    onChange={handleInputChange}
                    rows={3}
                  ></textarea>
                </div>

                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                        Vaccination Status
                      </label>
                      <select
                        className="isolated-form-select"
                        name="vaccinationStatus"
                        value={formData.vaccinationStatus}
                        onChange={handleInputChange}
                      >
                        <option value="">Select status</option>
                        <option value="Up-to-date">Up-to-date</option>
                        <option value="Not vaccinated">Not vaccinated</option>
                      </select>
                    </div>
                  </div>
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                         Size
                      </label>
                      <select
                        className="isolated-form-select"
                        name="size"
                        value={formData.size}
                        onChange={handleInputChange}
                      >
                        <option value="">Select size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                     Color/Markings
                  </label>
                  <input
                    className="isolated-form-input"
                    type="text"
                    name="colorMarkings"
                    placeholder="Describe color and markings"
                    value={formData.colorMarkings}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                   Spayed/Neutered
                  </label>
                  <div className="isolated-radio-group">
                    <label className="isolated-radio-label">
                      <input
                        type="radio"
                        name="spayedNeutered"
                        value={true}
                        checked={formData.spayedNeutered === true}
                        onChange={() => setFormData({...formData, spayedNeutered: true})}
                      />
                      <span className="isolated-radio-custom"></span>
                      Yes
                    </label>
                    <label className="isolated-radio-label">
                      <input
                        type="radio"
                        name="spayedNeutered"
                        value={false}
                        checked={formData.spayedNeutered === false}
                        onChange={() => setFormData({...formData, spayedNeutered: false})}
                      />
                      <span className="isolated-radio-custom"></span>
                      No
                    </label>
                  </div>
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                     Medical History
                  </label>
                  <textarea
                    className="isolated-form-textarea"
                    name="medicalHistory"
                    placeholder="Any illnesses, surgeries, or allergies"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    rows={3}
                  ></textarea>
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                    Behavior
                  </label>
                  <textarea
                    className="isolated-form-textarea"
                    name="behavior"
                    placeholder="Describe pet's behavior (friendly, aggressive, shy, trained, etc.)"
                    value={formData.behavior}
                    onChange={handleInputChange}
                    rows={3}
                  ></textarea>
                </div>

                <div className="isolated-form-group">
                  <label className="isolated-form-label">
                   Special Needs or Instructions
                  </label>
                  <textarea
                    className="isolated-form-textarea"
                    name="specialNeeds"
                    placeholder="Any special care requirements"
                    value={formData.specialNeeds}
                    onChange={handleInputChange}
                    rows={3}
                  ></textarea>
                </div>

                <div className="isolated-form-row">
                  <div className="isolated-form-col isolated-form-col-6">
                    <div className="isolated-form-group">
                      <label className="isolated-form-label">
                        Adoption Fee
                      </label>
                      <div className="isolated-radio-group">
                        <label className="isolated-radio-label">
                          <input
                            type="radio"
                            name="adoptionFeeFree"
                            value={true}
                            checked={formData.adoptionFeeFree === true}
                            onChange={() => setFormData({...formData, adoptionFeeFree: true, adoptionFee: 0})}
                          />
                          <span className="isolated-radio-custom"></span>
                          Free
                        </label>
                        <label className="isolated-radio-label">
                          <input
                            type="radio"
                            name="adoptionFeeFree"
                            value={false}
                            checked={formData.adoptionFeeFree === false}
                            onChange={() => setFormData({...formData, adoptionFeeFree: false})}
                          />
                          <span className="isolated-radio-custom"></span>
                          Has Fee
                        </label>
                      </div>
                    </div>
                  </div>
                  {!formData.adoptionFeeFree && (
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                           Fee Amount
                        </label>
                        <input
                          className="isolated-form-input"
                          type="number"
                          name="adoptionFee"
                          placeholder="Enter amount"
                          value={formData.adoptionFee}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="pet-form-step-buttons">
                  <button
                    type="button"
                    className="pet-form-prev-btn"
                    onClick={handlePrevStep}
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    type="button"
                    className="pet-form-next-btn"
                    onClick={handleNextStep}
                  >
                    Next <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Owner Info */}
            {currentStep === 3 && (
              <div className="pet-form-step-content">
                <div className="contact-info-note">
                  <FaInfoCircle /> Note: Your contact information will be displayed on the pet's 
                  listing so potential adopters can reach you. Please ensure it's accurate.
                </div>

                <h4 className="isolated-section-title">
                  Contact Information
                </h4>
                <div className="isolated-contact-section">
                  <div className="isolated-form-row">
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                          <FaUser /> Name
                        </label>
                        <input
                          className="isolated-form-input"
                          type="text"
                          name="ownerName"
                          placeholder="Enter your name"
                          value={formData.ownerName}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                          <FaIdCard /> NIC
                        </label>
                        <input
                          className="isolated-form-input"
                          type="text"
                          name="nic"
                          placeholder="Enter your NIC"
                          value={formData.nic}
                          onChange={handleInputChange}
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  <div className="isolated-form-row">
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                          <FaEnvelope /> Email
                        </label>
                        <input
                          className="isolated-form-input"
                          type="email"
                          name="contactEmail"
                          placeholder="Enter your email"
                          value={formData.contactEmail}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div className="isolated-form-col isolated-form-col-6">
                      <div className="isolated-form-group">
                        <label className="isolated-form-label">
                          <FaPhone /> Phone Number
                        </label>
                        <input
                          className="isolated-form-input"
                          type="text"
                          name="contactPhoneNumber"
                          placeholder="Enter your phone number"
                          value={formData.contactPhoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pet-form-step-buttons">
                  <button
                    type="button"
                    className="pet-form-prev-btn"
                    onClick={handlePrevStep}
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    type="button"
                    className="pet-form-next-btn"
                    onClick={handleNextStep}
                  >
                    Next <FaArrowLeft style={{ transform: 'rotate(180deg)' }} />
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Prediction */}
            {currentStep === 4 && (
              <div className="pet-form-step-content">
                <div className="pet-prediction-section">
                  <h3 className="pet-prediction-title">
                    <FaInfoCircle /> Adoption Speed Prediction
                  </h3>
                  <p className="pet-prediction-description">
                    Get an estimate of how quickly your pet might find a new home based on the information provided.
                  </p>
                  
                  <div className="pet-prediction-action">
                    <button
                      type="button"
                      className="pet-prediction-btn"
                      onClick={handlePredictAdoption}
                    >
                      <FaHeart /> Predict Adoption Speed
                    </button>
                  </div>
                  
                  {speed && (
                    <div className="pet-prediction-result">
                      <h4>Prediction Result:</h4>
                      <p>Your pet's likely adoption speed: <strong>{speed}</strong></p>
                    </div>
                  )}
                </div>

                <div className="pet-form-step-buttons">
                  <button
                    type="button"
                    className="pet-form-prev-btn"
                    onClick={handlePrevStep}
                  >
                    <FaArrowLeft /> Back
                  </button>
                  <button
                    type="submit"
                    className="pet-form-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : (
                      <>
                        <FaCheck /> Submit Your Pet
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};

export default UserForm;