import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import signupGif from '../../../assets/wave.gif'; 
import { FaPaw } from 'react-icons/fa';
import './Signup.css';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('notification--fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/signup', {
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            
            showNotification('Signup successful! Redirecting to login...');
            setFormData({
                name: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            
            setTimeout(() => {
                navigate('/login', {
                    state: { 
                        fromSignup: true,
                        email: formData.email
                    }
                });
            }, 1500);
            
        } catch (error) {
            let errorMessage = 'Signup failed. Please try again.';
            
            if (error.response && error.response.status === 409) {
                errorMessage = 'Email already exists. Please use a different email or login.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="signup">
            <form className="signup__form" onSubmit={handleSubmit}>
                <div className="signup__content-wrapper">
                    <div className="signup__left-section">
                        <Link to="/" className="signup__logo">
                            <FaPaw className="signup__paw-icon" />
                            <h1 className="signup__logo-text">Paws Haven</h1>
                        </Link>
                        <div className="signup__gif-container">
                            <img 
                                src={signupGif} 
                                alt="Signup animation" 
                                className="signup__gif"
                            />
                        </div>
                    </div>
                    
                    <div className="signup__form-content">
                        <h2 className="signup__title">Join Us!</h2>

                        <div className="signup__form-group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Name"
                                required
                                className="signup__input"
                            />
                        </div>

                        <div className="signup__form-group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                required
                                className="signup__input"
                            />
                        </div>

                        <div className="signup__form-group signup__form-group--password">
                            <div className="signup__password-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    required
                                    className="signup__input"
                                />
                                <span 
                                    className="signup__password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </div>

                        <div className="signup__form-group signup__form-group--password">
                            <div className="signup__password-container">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                    className="signup__input"
                                />
                                <span 
                                    className="signup__password-toggle"
                                    onClick={toggleConfirmPasswordVisibility}
                                >
                                    {showConfirmPassword ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`signup__button ${isSubmitting ? 'signup__button--disabled' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : 'Sign Up'}
                        </button>

                        <p className="signup__login-text">
                            Already have an account?{' '}
                            <span onClick={() => navigate('/login')} className="signup__login-link">
                                Log in
                            </span>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Signup;