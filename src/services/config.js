const envApiUrl = import.meta.env.VITE_API_URL;
const API_URL = envApiUrl && envApiUrl.trim() !== '' ? envApiUrl : 'http://localhost:5000';

console.log('Backend API URL initialized:', API_URL);

export default API_URL;
