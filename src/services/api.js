// API Service для взаимодействия с backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function для обработки ответов
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// Reports API
export const reportsAPI = {
  // Получить все отчеты с фильтрами
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status && filters.status !== 'all') {
      params.append('status', filters.status);
    }
    
    if (filters.urgency && filters.urgency !== 'all') {
      params.append('urgency', filters.urgency);
    }
    
    if (filters.search) {
      params.append('search', filters.search);
    }
    
    const url = `${API_BASE_URL}/reports${params.toString() ? '?' + params.toString() : ''}`;
    
    try {
      const response = await fetch(url);
      const data = await handleResponse(response);
      return data.data; // Возвращаем только массив отчетов
    } catch (error) {
      console.error('Error fetching reports:', error);
      throw error;
    }
  },

  // Получить один отчет по ID
  getById: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`);
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },

  // Создать новый отчет
  create: async (reportData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  },

  // Обновить отчет
  update: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  // Удалить отчет
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/${id}`, {
        method: 'DELETE',
      });
      await handleResponse(response);
      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  // Получить статистику
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/stats/summary`);
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { success: false, message: 'API is not available' };
  }
};

export default reportsAPI;

