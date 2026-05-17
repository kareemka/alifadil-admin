import axios from 'axios';
import Cookies from 'js-cookie';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = Cookies.get('token');
  
   const isFormData = options.body instanceof FormData;
   
   const defaultOptions: RequestInit = {
     headers: {
       ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
       ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
     },
   };

   const finalOptions = {
     ...defaultOptions,
     ...options,
     headers: {
       ...defaultOptions.headers,
       ...options.headers,
     },
   };

   const response = await fetch(url, finalOptions);

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  // Handle empty responses
  const text = await response.text();
  return text ? JSON.parse(text) : {};
}
