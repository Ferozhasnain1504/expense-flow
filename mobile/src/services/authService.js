
import * as SecureStore from 'expo-secure-store';
import API from './api';

const TOKEN_KEY = 'expenseflow_auth_token';

// REGISTER
export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);

  const { token } = response.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return response.data;
};

// LOGIN
export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);

  const { token } = response.data;

  await SecureStore.setItemAsync(TOKEN_KEY, token);

  return response.data;
};

// GET SAVED TOKEN
export const getToken = async () => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// LOGOUT
export const logoutUser = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
