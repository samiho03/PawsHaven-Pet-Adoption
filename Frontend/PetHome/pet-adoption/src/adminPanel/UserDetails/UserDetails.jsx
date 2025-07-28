import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import './UserDetails.css';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.min.css';

// Configure axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080', // Your backend URL
});

const UserDetails = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(9);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Wrap refreshToken in useCallback to prevent recreation on every render
  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/v1/auth/refresh', {
        refreshToken: localStorage.getItem('refreshToken'),
      });
      return response.data.accessToken;
    } catch (error) {
      throw error;
    }
  }, []);

  useEffect(() => {
    // Add request interceptor to attach token
    const requestInterceptor = axiosInstance.interceptors.request.use(
      config => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Add response interceptor for token refresh
    const responseInterceptor = axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const newToken = await refreshToken();
            if (newToken) {
              localStorage.setItem('jwtToken', newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // If refresh fails, redirect to login
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('refreshToken');
            navigate('/login');
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [usersResponse, petsResponse] = await Promise.all([
          axiosInstance.get("/api/v1/auth/users"),
          axiosInstance.get("/api/v1/pets/getAll")
        ]);

        const usersWithPets = usersResponse.data.map(user => {
          const petCount = petsResponse.data.filter(pet => {
            return pet.contactEmail === user.email || 
                   pet.ownerId === user.id;
          }).length;
          
          return {
            ...user,
            petCount
          };
        });
    
        // Sort by pet count descending, then by ID ascending
        const sortedUsers = usersWithPets.sort((a, b) => {
          if (b.petCount !== a.petCount) {
            return b.petCount - a.petCount;
          }
          return a.id - b.id;
        });
        
        setUsers(sortedUsers);
        setFilteredUsers(sortedUsers);
      } catch (err) {
        if (err.code === "ERR_NETWORK") {
          setError("Cannot connect to server. Please ensure the backend is running.");
        } else if (err.response?.status === 403) {
          setError("You don't have permission to view this data.");
        } else {
          setError("Failed to load data. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup interceptors when component unmounts
    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate, refreshToken]);

  const handleSearch = () => {
    if (searchId.trim() === '') {
      setFilteredUsers([...users].sort((a, b) => {
        if (b.petCount !== a.petCount) {
          return b.petCount - a.petCount;
        }
        return a.id - b.id;
      }));
      setCurrentPage(1);
      return;
    }
    
    const filtered = users.filter(user => 
      user.id.toString().includes(searchId.toString())
    ).sort((a, b) => {
      if (b.petCount !== a.petCount) {
        return b.petCount - a.petCount;
      }
      return a.id - b.id;
    });
    setFilteredUsers(filtered);
    setCurrentPage(1);
  };

  const safeValue = (value, defaultValue = "N/A") => {
    return value !== null && value !== undefined && value !== "" ? value : defaultValue;
  };

  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return <div className="loading-message">Loading users...</div>;
  }

  if (error) {
    return <div className="error-message" style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div id="user-details-container">
      <h2 className="user-list-title">Registered Users</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by User ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          <i className="fas fa-search"></i> Search
        </button>
      </div>

      {filteredUsers.length > 0 ? (
        <>
          <table className="user-list-table">
            <thead className="user-list-header">
              <tr>
                <th className="user-list-th">ID</th>
                <th className="user-list-th">Name</th>
                <th className="user-list-th">Email</th>
                <th className="user-list-th">Phone</th>
                <th className="user-list-th">Location</th>
                <th className="user-list-th">Pet Count</th>
              </tr>
            </thead>
            <tbody className="user-list-body">
              {currentUsers.map((user) => (
                <tr key={user.id} className="user-list-row">
                  <td>{safeValue(user.id)}</td>
                  <td>{safeValue(user.name)}</td>
                  <td>{safeValue(user.email)}</td>
                  <td>{safeValue(user.phone)}</td>
                  <td>{safeValue(user.location)}</td>
                  <td>{safeValue(user.petCount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination">
            <button 
              onClick={() => paginate(Math.max(1, currentPage - 1))} 
              disabled={currentPage === 1}
              className="pagination-button"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => paginate(index + 1)}
                className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
            
            <button 
              onClick={() => paginate(Math.min(totalPages, currentPage + 1))} 
              disabled={currentPage === totalPages}
              className="pagination-button"
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <p className="no-users-message">No users found matching your criteria.</p>
      )}
    </div>
  );
};

export default UserDetails;