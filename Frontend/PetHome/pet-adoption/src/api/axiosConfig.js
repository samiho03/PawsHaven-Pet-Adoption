import axios from 'axios';

// Create an instance of axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // Your API base URL
});

// Add a request interceptor to include the token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Get the token from local storage
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Set the Authorization header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
axios.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post('/api/v1/auth/refresh', { refreshToken });
            localStorage.setItem('token', response.data.token);
            originalRequest.headers['Authorization'] = 'Bearer ' + response.data.token;
            return axios(originalRequest);
        }
        return Promise.reject(error);
    }
);
export default axiosInstance;