import axios from 'axios';
import { toast } from '../components/GlobalToast';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // If it's a 401, AuthContext redirects to login. 
        // For everything else, trigger our custom MUI toast!
        if (error.response && error.response.status !== 401) {
            const message = error.response.data?.message || 'Something went wrong';
            toast.error(message);
        } else if (!error.response) {
            toast.error('Network Error: Cannot connect to server');
        }
        return Promise.reject(error);
    }
);

export default api;