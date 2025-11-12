import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://127.0.0.1:8000/api', // Base URL de tu API
});

axiosInstance.interceptors.request.use(
    config => {
        const tokenString = localStorage.getItem('authTokens');
        if (tokenString) {
            const tokens = JSON.parse(tokenString);
            config.headers['Authorization'] = `Bearer ${tokens.access}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default axiosInstance;