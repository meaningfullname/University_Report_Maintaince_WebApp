// Authentication API Service

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function для обработки ответов
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Set token to localStorage
const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Remove token from localStorage
const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Auth API
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      
      if (data.token) {
        setToken(data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  logout: () => {
    removeToken();
  },

  // Get current user profile
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      
      if (data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }
      
      return data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Change password error:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  getUsers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}/role`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role }),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Update user role error:', error);
      throw error;
    }
  },

  // Deactivate user (admin only)
  deactivateUser: async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Deactivate user error:', error);
      throw error;
    }
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!getToken();
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Check if user is admin
  isAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Check if user is technician or admin
  isTechnicianOrAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user && (user.role === 'technician' || user.role === 'admin');
  },
};

export default authAPI;

