import React, { useState, useEffect } from 'react';
import { authAPI } from './services/auth';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import MaintenanceApp from './App';

const MainApp = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verify token is still valid
          const response = await authAPI.getProfile();
          setCurrentUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token expired or invalid
          console.error('Auth check failed:', error);
          authAPI.logout();
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  // Show Admin Panel for admins and technicians
  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'technician')) {
    return <AdminPanel user={currentUser} onLogout={handleLogout} />;
  }

  // Show regular app for students
  return <MaintenanceApp user={currentUser} onLogout={handleLogout} />;
};

export default MainApp;

