import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import loginGif from '../../../assets/wave.gif'; 
import { FaPaw } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Login.css';

const Login = ({ onLoginSuccess = () => {} }) => {  
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
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

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        
        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', formData);
            
            if (response.data && response.data.jwt && response.data.userRole) {
                const { jwt, userRole } = response.data;
                
                localStorage.setItem('token', jwt);
                localStorage.setItem('userRole', userRole);

                // Call onLoginSuccess if it exists
                if (typeof onLoginSuccess === 'function') {
                    onLoginSuccess(jwt, userRole);
                }

                showNotification('Login successful! Redirecting...');
                
                setTimeout(() => {
                    navigate(userRole === 'ADMIN' ? '/profile' : '/');
                }, 1500);
            } else {
                throw new Error('Invalid response from server');
            }
            
        } catch (error) {
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.response) {
                errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              errorMessage;
            } else if (error.request) {
                errorMessage = 'Server not responding. Please try again later.';
            } else {
                errorMessage = error.message || errorMessage;
            }
            
            setError(errorMessage);
            showNotification(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const navigateToSignup = () => {
        navigate('/signup');
    };

    return (
        <div className="login">
            <form className="login__form" onSubmit={handleSubmit}>
                <div className="login__content-wrapper">
                    <div className="login__left-section">
                        <Link to="/" className="login__logo">
                            <FaPaw className="login__paw-icon" />
                            <h1 className="login__logo-text">Paws Haven</h1>
                        </Link>
                        <div className="login__gif-container">
                            <img 
                                src={loginGif} 
                                alt="Login animation" 
                                className="login__gif"
                            />
                        </div>
                    </div>
                    
                    <div className="login__form-content">
                        <h2 className="login__title">Welcome Back!</h2>                      

                        <div className="login__form-group">
                            <label className="login__label">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                                className="login__input"
                            />
                        </div>

                        <div className="login__form-group login__form-group--password">
                            <label className="login__label">Password</label>
                            <div className="login__password-container">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    className="login__input"
                                />
                                <span 
                                    className="login__password-toggle"
                                    onClick={togglePasswordVisibility}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={`login__button ${isSubmitting ? 'login__button--disabled' : ''}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Logging in...' : 'Login'}
                        </button>

                        <p className="login__signup-text">
                            Don't have an account?{' '}
                            <span onClick={navigateToSignup} className="login__signup-link">
                                Create an account
                            </span>
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Login;