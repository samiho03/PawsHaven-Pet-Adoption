import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaw, FaChevronRight, FaChevronLeft, FaCheck, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import FavoriteButton from '../Favorites/FavoriteButton';
import PetImage from '../Profile/PetImage';
import axiosInstance from "../../api/axiosConfig";
import './Quiz.css';

const Quiz = () => {
  const [speciesOptions, setSpeciesOptions] = useState([
    { value: '', label: 'Select' },
    { value: 'dog', label: 'Dog' },
    { value: 'cat', label: 'Cat' },
    { value: 'rabbit', label: 'Rabbit' },
    { value: 'bird', label: 'Bird' }
  ]);
  
  const [currentPetsOptions, setCurrentPetsOptions] = useState([
    { value: '', label: 'Select' },
    { value: 'none', label: 'None' },
    { value: 'cat(s)', label: 'Cat(s)' },
    { value: 'dog(s)', label: 'Dog(s)'},
  ]);  

  const [formData, setFormData] = useState({
    petType: '',
    adoptionPurpose: '',
    isFirstTimeOwner: false,
    currentPets: '',
    hasFencedYard: false,
    hoaRestrictions: '',
    preferredSize: '',
    preferredGender: '',
    preferredAge: ''
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [matchedPets, setMatchedPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  const questions = [
    {
      id: 'petType',
      label: 'What type of pet are you looking for?',
      type: 'select',
      options: speciesOptions,
      required: true,
      icon: '🐕'
    },
    {
      id: 'adoptionPurpose',
      label: 'What is your purpose for adoption?',
      type: 'select',
      options: [
        { value: '', label: 'Select' },
        { value: 'myself', label: 'For myself' },
        { value: 'gift', label: 'As a gift' },
        { value: 'child', label: 'For my child' }
      ],
      required: true,
      icon: '🎯'
    },
    {
      id: 'isFirstTimeOwner',
      label: 'Are you a first-time pet owner?',
      type: 'checkbox',
      required: false,
      icon: '🆕'
    },
    {
      id: 'currentPets',
      label: 'Do you have other pets at home?',
      type: 'select',
      options: currentPetsOptions,
      required: true,
      icon: '🏠'
    },
    {
      id: 'hasFencedYard',
      label: 'Do you have a fenced yard?',
      type: 'checkbox',
      required: false,
      icon: '🌳'
    },
    {
      id: 'hoaRestrictions',
      label: 'Are there any HOA restrictions?',
      type: 'select',
      options: [
        { value: '', label: 'Select' },
        { value: 'no breed restrictions', label: 'No breed restrictions' },
        { value: 'weight limit', label: 'Weight limit' },
        { value: 'no restrictions', label: 'No restrictions' }
      ],
      required: true,
      icon: '📜'
    },
    {
      id: 'preferredSize',
      label: 'What size pet do you prefer?',
      type: 'select',
      options: [
        { value: '', label: 'Select' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' }
      ],
      required: true,
      icon: '📏'
    },
    {
      id: 'preferredGender',
      label: 'Do you have a gender preference?',
      type: 'select',
      options: [
        { value: '', label: 'Select' },
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'either', label: 'Either' }
      ],
      required: true,
      icon: '⚥'
    },
    {
      id: 'adoptionFeePreference',
      label: 'Do you want a pet with no adoption fee?',
      type: 'select',
      options: [
        { value: '', label: 'Select' },
        { value: 'free', label: 'Free adoption only' },
        { value: 'any', label: 'Any (free or paid)' }
      ],
      required: true,
      icon: '💰'
    }
  ];

  useEffect(() => {
    const fetchSpecies = async () => {
      try {
        const response = await axiosInstance.get('/species/for-quiz');
        const backendSpecies = response.data;
        
        // Combine default species with backend species, removing duplicates
        const defaultSpecies = [
          { value: 'dog', label: 'Dog' },
          { value: 'cat', label: 'Cat' },
          { value: 'rabbit', label: 'Rabbit' },
          { value: 'bird', label: 'Bird' }
        ];
        
        // Merge arrays and remove duplicates
        const allSpecies = [
          ...defaultSpecies,
          ...backendSpecies.filter(species => 
            !defaultSpecies.some(defaultSp => defaultSp.value === species.value)
          )
        ];
        
        // Update species options (keeping the "Select" option first)
        setSpeciesOptions(prev => [
          prev[0], // Keep the "Select" option
          ...allSpecies
        ]);
        
        // Update current pets options
        setCurrentPetsOptions(prev => {
          const newOptions = [...prev];
          allSpecies.forEach(species => {
            const petOption = `${species.value}(s)`;
            if (!prev.some(opt => opt.value === petOption)) {
              newOptions.splice(-1, 0, { // Insert before "Other"
                value: petOption,
                label: `${species.label}(s)`
              });
            }
          });
          return newOptions;
        });
      } catch (error) {
        console.error('Error fetching species:', error);
        // Keep the default options if fetch fails
      }
    };

    fetchSpecies();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const nextStep = () => {
    setDirection(1);
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    setDirection(-1);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowResults(false);
    
    try {
      const response = await axios.post('http://localhost:8080/api/v1/pets/quiz', formData);
      setMatchedPets(response.data);
      setShowResults(true);
    } catch (err) {
      setError('Failed to fetch matching pets. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isNextDisabled = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.required) {
      return !formData[currentQuestion.id];
    }
    return false;
  };

  const getAnswerDisplay = (questionId) => {
    const value = formData[questionId];
    if (value === '') return 'Not answered';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
      const option = question.options.find(opt => opt.value === value);
      return option ? option.label : value;
    }
    
    return value;
  };

  const questionVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const answerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <main className="quiz-page-container">
      <motion.button
        className="quiz-back-button"
        onClick={() => window.location.href = '/'}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft className="quiz-back-icon" />
      </motion.button>

      <motion.div 
        className="quiz-header-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="quiz-main-title"
        >
          Find Your Perfect Pet
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="quiz-subtitle"
        >
          Answer a few questions to find your ideal companion
        </motion.p>
      </motion.div>

      {!showResults ? (
        <div className="quiz-main-container">
          <motion.div 
            className="quiz-progress-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="quiz-progress-track">
              <motion.div 
                className="quiz-progress-bar" 
                initial={{ width: 0 }}
                animate={{ 
                  width: `${((currentStep + 1) / questions.length) * 100}%`,
                  transition: { duration: 0.8, ease: "easeInOut" }
                }}
              ></motion.div>
            </div>
            <div className="quiz-progress-text">
              Question {currentStep + 1} of {questions.length}
            </div>
          </motion.div>

          <motion.div 
            className="quiz-answered-questions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            {questions.slice(0, currentStep).map((question, index) => (
              <motion.div 
                key={question.id} 
                className="quiz-answered-question-item"
                custom={index}
                initial="hidden"
                animate="visible"
                variants={answerVariants}
              >
                <div className="quiz-question-icon">{question.icon}</div>
                <div className="quiz-question-content">
                  <div className="quiz-question-label">{question.label}</div>
                  <div className="quiz-question-answer">{getAnswerDisplay(question.id)}</div>
                </div>
                {index < currentStep && (
                  <button 
                    className="quiz-edit-question-btn" 
                    onClick={() => {
                      setDirection(-1);
                      setCurrentStep(index);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Edit
                  </button>
                )}
              </motion.div>
            ))}
          </motion.div>

          <form onSubmit={currentStep === questions.length - 1 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }} className="quiz-form-container">
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentStep}
                className="quiz-current-question"
                custom={direction}
                variants={questionVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <div className="quiz-question-header">
                  <div className="quiz-question-number">{currentStep + 1}</div>
                  <div className="quiz-question-icon">{questions[currentStep].icon}</div>
                  <h3 className="quiz-question-title">{questions[currentStep].label}</h3>
                </div>
                
                <div className="quiz-question-input-container">
                  {questions[currentStep].type === 'select' ? (
                    <select 
                      name={questions[currentStep].id} 
                      value={formData[questions[currentStep].id]} 
                      onChange={handleChange} 
                      required={questions[currentStep].required}
                      className="quiz-question-select"
                    >
                      {questions[currentStep].options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <motion.label 
                      className="quiz-checkbox-container"
                      whileTap={{ scale: 0.95 }}
                    >
                      <input 
                        type="checkbox" 
                        name={questions[currentStep].id} 
                        checked={formData[questions[currentStep].id]} 
                        onChange={handleChange} 
                        className="quiz-checkbox-input"
                      />
                      <span className="quiz-checkmark">
                        <FaCheck className="quiz-check-icon" />
                      </span>
                      <span className="quiz-checkbox-label">Yes</span>
                    </motion.label>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="quiz-navigation-buttons">
              {currentStep > 0 && (
                <motion.button 
                  type="button" 
                  onClick={prevStep} 
                  className="quiz-nav-button quiz-prev-button"
                  whileHover={{ 
                    x: -5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaChevronLeft /> Previous
                </motion.button>
              )}
              
              {currentStep < questions.length - 1 ? (
                <motion.button 
                  type="submit" 
                  className="quiz-nav-button quiz-next-button"
                  disabled={isNextDisabled()}
                  whileHover={!isNextDisabled() ? { 
                    x: 5,
                    transition: { type: "spring", stiffness: 400, damping: 10 }
                  } : {}}
                  whileTap={{ scale: 0.95 }}
                >
                  Next <FaChevronRight />
                </motion.button>
              ) : (
                <motion.button 
                  type="submit" 
                  className="quiz-nav-button quiz-submit-button"
                  disabled={isNextDisabled()}
                  whileHover={!isNextDisabled() ? { 
                    scale: 1.05,
                    boxShadow: "0 5px 15px rgba(159, 122, 234, 0.4)"
                  } : {}}
                  whileTap={!isNextDisabled() ? { scale: 0.95 } : {}}
                >
                  {loading ? (
                    <span className="quiz-loading-dots">
                      <span>.</span><span>.</span><span>.</span>
                    </span>
                  ) : (
                    'Find My Pet'
                  )}
                </motion.button>
              )}
            </div>
          </form>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div 
            className="quiz-results-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {matchedPets.length > 0 ? (
              <div className="quiz-matching-pets">
                <motion.h3
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="quiz-results-title"
                >
                  We found {matchedPets.length} perfect match{matchedPets.length !== 1 ? 'es' : ''}!
                </motion.h3>
                <motion.div 
                  className="favorites-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {matchedPets.map((pet, index) => (
                    <motion.div 
                      key={pet.id} 
                      className="favorite-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                      whileHover={{ y: -5 }}
                    >
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
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            ) : (
              <motion.div 
                className="quiz-no-results"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <p className="quiz-no-results-text">No pets found matching your criteria.</p>
                <motion.button 
                  onClick={() => {
                    setShowResults(false);
                    setCurrentStep(0);
                  }}
                  className="quiz-try-again-button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <motion.p 
          className="quiz-error-message"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.p>
      )}
    </main>
  );
};

export default Quiz;