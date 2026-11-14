
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  baseURL: 'http://10.236.197.8:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Automatically attach JWT to API requests
API.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(
      'expenseflow_auth_token'
    );

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
