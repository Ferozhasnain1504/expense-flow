
import * as SecureStore from 'expo-secure-store';
import API from './api';

const TOKEN_KEY = 'expenseflow_auth_token';

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  const { token } = response.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  const { token } = response.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return response.data;
};

// Check whether a saved token exists
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// Verify the saved token with the backend
export const getCurrentUser = async () => {
  const response = await API.get('/auth/me');
  return response.data.user;
};

// Remove the saved token during logout
export const logoutUser = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
