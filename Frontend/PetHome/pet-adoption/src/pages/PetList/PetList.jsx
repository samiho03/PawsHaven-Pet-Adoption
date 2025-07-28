import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaPaw, FaMapMarkerAlt, FaTimes, FaUserPlus, FaHeart, FaCat, FaArrowRight } from 'react-icons/fa';
import { GiRabbit, GiParrotHead } from 'react-icons/gi';
import axiosInstance from "../../api/axiosConfig";
import { IoMdPaw } from 'react-icons/io';
import PetImage from '../Profile/PetImage';
import search from '../../assets/search.png';
import FavoriteButton from '../Favorites/FavoriteButton';
import './PetList.css';

const PetList = () => {
    const location = useLocation();
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        specie: location.state?.specie || location.state?.initialFilter || '',
        breed: '',
        gender: '',
        location: '',
        size: '',
        vaccinationStatus: '',
        spayedNeutered: '',
        adoptionFee: '',
        search: ''
    });
    const [showFilters, setShowFilters] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [speciesList, setSpeciesList] = useState([]);
    const navigate = useNavigate();

    // Default species configuration (always included)
    const defaultSpeciesConfig = {
        dog: {
            icon: <IoMdPaw className="plp-specie-icon" />,
            title: 'Available Dogs',
            subtitle: 'Find your perfect canine companion'
        },
        cat: {
            icon: <FaCat className="plp-specie-icon" />,
            title: 'Available Cats',
            subtitle: 'Discover your ideal feline friend'
        },
        rabbit: {
            icon: <GiRabbit className="plp-specie-icon" />,
            title: 'Available Rabbits',
            subtitle: 'Meet adorable bunnies waiting for homes'
        },
        bird: {
            icon: <GiParrotHead className="plp-specie-icon" />,
            title: 'Available Birds',
            subtitle: 'Find colorful feathered friends'
        }
    };

    // Default icons for any additional species
    const defaultIcons = {
        ...defaultSpeciesConfig,
        default: <FaPaw className="plp-specie-icon" />
    };

    // Sri Lankan districts
    const districts = [
        'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale',
        'Nuwara Eliya', 'Galle', 'Matara', 'Hambantota', 'Jaffna',
        'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu', 'Batticaloa',
        'Ampara', 'Trincomalee', 'Kurunegala', 'Puttalam', 'Anuradhapura',
        'Polonnaruwa', 'Badulla', 'Moneragala', 'Ratnapura', 'Kegalle'
    ];

    // Fetch all species from backend and combine with defaults
    useEffect(() => {
        const fetchSpecies = async () => {
            try {
                const response = await axiosInstance.get('/species');
                // Combine default species with fetched species, removing duplicates
                const combinedSpecies = [
                    ...Object.keys(defaultSpeciesConfig).map(name => ({ 
                        name: name.charAt(0).toUpperCase() + name.slice(1) 
                    })),
                    ...response.data.filter(species => 
                        !Object.keys(defaultSpeciesConfig).includes(species.name.toLowerCase())
                    )
                ];
                setSpeciesList(combinedSpecies);
            } catch (err) {
                console.error('Error fetching species:', err);
                // If fetch fails, just use the default species
                setSpeciesList(
                    Object.keys(defaultSpeciesConfig).map(name => ({ 
                        name: name.charAt(0).toUpperCase() + name.slice(1) 
                    }))
                );
            }
        };
        fetchSpecies();
    }, []);

    // Generate combined species configuration
    const getSpeciesConfig = () => {
        // Start with default configuration
        const config = { ...defaultSpeciesConfig };
        
        // Add dynamic species
        speciesList.forEach(species => {
            const lowerName = species.name.toLowerCase();
            if (!config[lowerName]) { // Only add if not already in defaults
                config[lowerName] = {
                    icon: defaultIcons[lowerName] || defaultIcons.default,
                    title: `Available ${species.name}s`,
                    subtitle: `Find your perfect ${species.name.toLowerCase()} companion`
                };
            }
        });
        
        return config;
    };

    const speciesConfig = getSpeciesConfig();

    const getTitle = () => {
        const activeSpecie = filters.specie.toLowerCase();
        return speciesConfig[activeSpecie]?.title || 'Available Pets';
    };

    const getSubtitle = () => {
        const activeSpecie = filters.specie.toLowerCase();
        return speciesConfig[activeSpecie]?.subtitle || 'Find your perfect companion from our loving pets';
    };

    const getSpecieIcon = (specie) => {
        return speciesConfig[specie.toLowerCase()]?.icon || defaultIcons.default;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, []);

    useEffect(() => {
        const fetchPets = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setLoading(false);
                    return;
                }
                
                const response = await axiosInstance.get('/pets/approved', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const sortedPets = [...response.data].sort((a, b) => b.id - a.id);
                setPets(sortedPets);
                setFilteredPets(sortedPets);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching pets:', err);
                setError('Failed to load pets. Please try again later.');
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchPets();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        const filtered = pets.filter(pet => {
            const safeToLower = (value) => (value || '').toString().toLowerCase();

            const matchesSearch = filters.search === '' || 
                pet.petName.toLowerCase().includes(filters.search.toLowerCase()) ||
                pet.breed.toLowerCase().includes(filters.search.toLowerCase()) ||
                pet.location.toLowerCase().includes(filters.search.toLowerCase());

            const matchesSpecie = filters.specie === '' || 
                pet.specie.toLowerCase() === filters.specie.toLowerCase();

            const matchesBreed = filters.breed === '' || 
                pet.breed.toLowerCase().includes(filters.breed.toLowerCase());

            const matchesGender = filters.gender === '' || 
                pet.gender.toLowerCase() === filters.gender.toLowerCase();

            const matchesLocation = filters.location === '' || 
                pet.location.toLowerCase() === filters.location.toLowerCase();

            const matchesSize = filters.size === '' || 
                pet.size?.toLowerCase() === filters.size.toLowerCase();

            const matchesVaccination = filters.vaccinationStatus === '' || 
                pet.vaccinationStatus?.toLowerCase() === filters.vaccinationStatus.toLowerCase();

            const matchesSpayedNeutered = filters.spayedNeutered === '' || 
                (filters.spayedNeutered === 'yes' && pet.spayedNeutered) || 
                (filters.spayedNeutered === 'no' && !pet.spayedNeutered);

            const matchesAdoptionFee = filters.adoptionFee === '' || 
                (filters.adoptionFee === 'free' && pet.adoptionFeeFree) ||
                (filters.adoptionFee === 'paid' && !pet.adoptionFeeFree);

            return matchesSearch && matchesSpecie && matchesBreed && 
                   matchesGender && matchesLocation && matchesSize &&
                   matchesVaccination && matchesSpayedNeutered && matchesAdoptionFee;
        });

        setFilteredPets(filtered);
    }, [filters, pets]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearchChange = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const resetFilters = () => {
        setFilters({
            specie: '',
            breed: '',
            gender: '',
            location: '',
            size: '',
            vaccinationStatus: '',
            spayedNeutered: '',
            adoptionFee: '',
            search: ''
        });
    };

    const activeFilterCount = Object.values(filters).filter(val => val !== '').length;

    if (!isLoggedIn) {
        return (
            <div className="plp-container">
                <div className="plp-hero">
                    <div className="plp-hero-content">
                        <h1 className="plp-hero-title">
                            <span className="plp-hero-highlight">Find Your</span> Perfect Furry Companion
                        </h1>
                        <p className="plp-hero-subtitle">Join thousands of happy pets and owners in our loving community</p>
                        <div className="plp-hero-cta">
                            <button 
                                className="plp-cta-button plp-primary-btn"
                                onClick={() => navigate('/signup')}
                            >
                                <FaUserPlus /> Join Now
                            </button>
                            <button 
                                className="plp-cta-button plp-secondary-btn"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </button>
                        </div>
                    </div>
                    <div className="plp-hero-image"></div>
                </div>

                <div className="plp-guest-message">
                    <div className="plp-guest-content">
                        <div className="plp-features">
                            <div className="plp-feature-card">
                                <div className="plp-feature-icon plp-purple-bg">
                                    <FaPaw />
                                </div>
                                <h3>Browse Pets</h3>
                                <p>Discover pets waiting for their forever homes in your area</p>
                            </div>
                            <div className="plp-feature-card">
                                <div className="plp-feature-icon plp-purple-bg">
                                    <FaHeart />
                                </div>
                                <h3>Save Favorites</h3>
                                <p>Keep track of pets you're interested in with our favorites system</p>
                            </div>
                            <div className="plp-feature-card">
                                <div className="plp-feature-icon plp-purple-bg">
                                    <FaMapMarkerAlt />
                                </div>
                                <h3>Local Matches</h3>
                                <p>Find pets near you with our location-based search</p>
                            </div>
                        </div>

                        <div className="plp-testimonials">
                            <h2>Success Stories</h2>
                            <div className="plp-testimonial-slider">
                                <div className="plp-testimonial">
                                    <div className="plp-testimonial-content">
                                        "We found our perfect match with Luna. The adoption process was smooth and the team was incredibly helpful!"
                                    </div>
                                    <div className="plp-testimonial-author">- The Silva Family, Colombo</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="plp-container">
            <div className="plp-header-container">
                <div className="plp-header">
                    <h1 className="plp-title">
                        <span className="plp-title-highlight">{getTitle()}</span>
                    </h1>
                    <p className="plp-subtitle">{getSubtitle()}</p>
                    <div className="plp-header-decoration">
                        <div className="plp-header-paw plp-header-paw-1"><FaPaw /></div>
                        <div className="plp-header-paw plp-header-paw-2"><FaPaw /></div>
                        <div className="plp-header-paw plp-header-paw-3"><FaPaw /></div>
                    </div>
                </div>
            </div>

            <div className="plp-search-filter-container">
                <div className="plp-paw-holder">
                    <img src={search} alt="Paw" className="plp-paw-image" />
                </div>
                <div className="plp-search-box">
                    <FaSearch className="plp-search-icon" />
                    <input
                        type="text"
                        className="plp-search-input"
                        placeholder="Search by name, breed or location..."
                        value={filters.search}
                        onChange={handleSearchChange}
                    />
                    {filters.search && (
                        <button 
                            className="plp-clear-search"
                            onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>
                
                <button 
                    className={`plp-filter-toggle-btn ${activeFilterCount > 0 ? 'plp-has-filters' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FaFilter className="plp-filter-icon" /> 
                    {showFilters ? 'Hide Filters' : 'Filters'}
                    {activeFilterCount > 0 && (
                        <span className="plp-filter-count">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {showFilters && (
                <div className="plp-filter-panel">
                    <div className="plp-filter-section">
                        <h3 className="plp-section-title">Basic Info</h3>
                        <div className="plp-filter-grid">
                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Species</label>
                                <select 
                                    name="specie" 
                                    className="plp-filter-select"
                                    value={filters.specie}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Species</option>
                                    {speciesList.map(species => (
                                        <option key={species.name} value={species.name}>
                                            {species.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Breed</label>
                                <input
                                    type="text"
                                    name="breed"
                                    className="plp-filter-input"
                                    placeholder="Any breed"
                                    value={filters.breed}
                                    onChange={handleFilterChange}
                                />
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Gender</label>
                                <select 
                                    name="gender" 
                                    className="plp-filter-select"
                                    value={filters.gender}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Location</label>
                                <select 
                                    name="location" 
                                    className="plp-filter-select"
                                    value={filters.location}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">All Locations</option>
                                    {districts.map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Size</label>
                                <select 
                                    name="size" 
                                    className="plp-filter-select"
                                    value={filters.size}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any Size</option>
                                    <option value="Small">Small</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Large">Large</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="plp-filter-section">
                        <h3 className="plp-section-title">Health & Adoption</h3>
                        <div className="plp-filter-grid">
                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Vaccination</label>
                                <select 
                                    name="vaccinationStatus" 
                                    className="plp-filter-select"
                                    value={filters.vaccinationStatus}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any Status</option>
                                    <option value="Up-to-date">Up-to-date</option>
                                    <option value="Not vaccinated">Not vaccinated</option>
                                </select>
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Spayed/Neutered</label>
                                <select 
                                    name="spayedNeutered" 
                                    className="plp-filter-select"
                                    value={filters.spayedNeutered}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any</option>
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>

                            <div className="plp-filter-group">
                                <label className="plp-filter-label">Adoption Fee</label>
                                <select 
                                    name="adoptionFee" 
                                    className="plp-filter-select"
                                    value={filters.adoptionFee}
                                    onChange={handleFilterChange}
                                >
                                    <option value="">Any</option>
                                    <option value="free">Free</option>
                                    <option value="paid">Paid</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="plp-filter-actions">
                        <button 
                            className="plp-reset-filters-btn"
                            onClick={resetFilters}
                            disabled={activeFilterCount === 0}
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="plp-loading-state">
                    <div className="plp-loading-spinner"></div>
                    <p>Finding your perfect pets...</p>
                </div>
            ) : error ? (
                <div className="plp-error-state">
                    <div className="plp-error-icon">⚠</div>
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button 
                        className="plp-retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="plp-pets-section">
                    {filteredPets.length > 0 ? (
                        <>
                            <div className="plp-grid">
                                {filteredPets.slice(0, 2).map(pet => (
                                    <div key={pet.id} className="plp-pet-card">
                                        <div className="plp-pet-image-wrapper">
                                            <Link to={`/petDetail/${pet.id}`} className="plp-pet-card-link">
                                                <div className="plp-pet-image-container">
                                                    <PetImage pet={pet} />
                                                </div>
                                            </Link>
                                            <div className="plp-favorite-button-container">
                                                <FavoriteButton petId={pet.id} />
                                            </div>
                                        </div>
                                        <div className="plp-pet-info">
                                            <div className="plp-pet-info-header">
                                                {getSpecieIcon(pet.specie)}
                                                <h3>{pet.petName}</h3>
                                                <div className="plp-pet-meta">
                                                    <span className="plp-pet-gender">{pet.gender}</span>
                                                </div>
                                            </div>
                                            <div className="plp-pet-details">
                                                <p className="plp-pet-breed">
                                                    {pet.breed}
                                                </p>
                                                <div className="plp-pet-location">
                                                    <FaMapMarkerAlt className="plp-location-icon" /> 
                                                    <span>{pet.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <div className="plp-quiz-card">
                                    <div className="plp-quiz-content">
                                        <h3>Can't find your perfect pet match?</h3>
                                        <p>Take our quick quiz and we'll help you discover the ideal companion based on your lifestyle!</p>
                                        <button 
                                            className="plp-quiz-button"
                                            onClick={() => navigate('/quiz')}
                                        >
                                            Take Quiz <FaArrowRight />
                                        </button>
                                    </div>
                                    <div className="plp-quiz-decoration"></div>
                                </div>
                                {filteredPets.slice(2).map(pet => (
                                    <div key={pet.id} className="plp-pet-card">
                                        <div className="plp-pet-image-wrapper">
                                            <Link to={`/petDetail/${pet.id}`} className="plp-pet-card-link">
                                                <div className="plp-pet-image-container">
                                                    <PetImage pet={pet} />
                                                </div>
                                            </Link>
                                            <div className="plp-favorite-button-container">
                                                <FavoriteButton petId={pet.id} />
                                            </div>
                                        </div>
                                        <div className="plp-pet-info">
                                            <div className="plp-pet-info-header">
                                                {getSpecieIcon(pet.specie)}
                                                <h3>{pet.petName}</h3>
                                                <div className="plp-pet-meta">
                                                    <span className="plp-pet-gender">{pet.gender}</span>
                                                </div>
                                            </div>
                                            <div className="plp-pet-details">
                                                <p className="plp-pet-breed">
                                                    {pet.breed}
                                                </p>
                                                <div className="plp-pet-location">
                                                    <FaMapMarkerAlt className="plp-location-icon" /> 
                                                    <span>{pet.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="plp-empty-state">
                            <div className="plp-empty-icon">
                                <FaPaw />
                            </div>
                            <h3>No pets found matching your criteria</h3>
                            <p>Try adjusting your filters or search term</p>
                            <button 
                                className="plp-reset-btn plp-purple-bg"
                                onClick={resetFilters}
                            >
                                Reset all filters
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PetList;