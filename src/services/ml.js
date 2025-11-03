// ML API Service для взаимодействия с ML backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function для обработки ответов
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

// ML API
export const mlAPI = {
  /**
   * Анализ проблемы и получение ML рекомендаций
   * @param {string} description - Описание проблемы
   * @param {string} category - Категория (optional)
   * @param {string} location - Локация (optional)
   * @returns {Promise<Object|null>} ML рекомендация или null при ошибке
   */
  analyzeIssue: async (description, category = null, location = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          category,
          location,
        }),
      });
      
      const data = await handleResponse(response);
      
      // Если ML сервис недоступен или вернул fallback - вернуть null
      if (!data.success || data.data.fallback) {
        console.log('ML analysis fallback:', data.message || 'low confidence');
        return null;
      }
      
      return data.data;
    } catch (error) {
      console.error('ML analysis error:', error);
      return null; // Fallback к существующей логике
    }
  },

  /**
   * Проверка статуса ML сервиса
   * @returns {Promise<Object>} Статус ML сервиса
   */
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ml/health`);
      const data = await handleResponse(response);
      return data.ml_service || { status: 'unknown' };
    } catch (error) {
      console.error('ML health check error:', error);
      return { status: 'offline' };
    }
  },

  /**
   * Быстрая проверка доступности ML сервиса
   * @returns {Promise<boolean>} true если ML доступен
   */
  isAvailable: async () => {
    try {
      const health = await mlAPI.checkHealth();
      return health.status === 'ok';
    } catch (error) {
      return false;
    }
  },
};

export default mlAPI;

