// Admin API Service

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

// Get headers with token
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Admin API
export const adminAPI = {
  // Get all reports with filters
  getReports: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.urgency && filters.urgency !== 'all') params.append('urgency', filters.urgency);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    
    const url = `${API_BASE_URL}/admin/reports${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get reports error:', error);
      throw error;
    }
  },

  // Update report status
  updateStatus: async (reportId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Update status error:', error);
      throw error;
    }
  },

  // Assign report to technician
  assignReport: async (reportId, assignedTo) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}/assign`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ assignedTo }),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Assign report error:', error);
      throw error;
    }
  },

  // Update report
  updateReport: async (reportId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Update report error:', error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (reportId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports/${reportId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('Delete report error:', error);
      throw error;
    }
  },

  // Get statistics
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  },

  // Get technicians list
  getTechnicians: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/technicians`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get technicians error:', error);
      throw error;
    }
  },
};

export default adminAPI;

