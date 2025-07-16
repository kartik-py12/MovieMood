import axios from 'axios';

// Manage authentication token
export const setAuthToken = (token) => {
  if (token) {
    // Set token in localStorage
    localStorage.setItem('authToken', token);
    // Set auth header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    // Remove token from localStorage
    localStorage.removeItem('authToken');
    // Remove auth header
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Get the current stored token
export const getStoredToken = () => {
  return localStorage.getItem('authToken');
};

// Get the current stored user
export const getStoredUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Clear all auth data
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  delete axios.defaults.headers.common['Authorization'];
};
