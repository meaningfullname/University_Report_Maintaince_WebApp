import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Settings, BarChart3, AlertCircle, CheckCircle2, Clock,
  Wrench, Loader, Search, Filter, Edit2, Trash2, UserCheck, X, TrendingUp,
  Home, Wifi, Lightbulb, Thermometer, Droplets, LogOut
} from 'lucide-react';
import { adminAPI } from '../services/admin';
import { authAPI } from '../services/auth';

const AdminPanel = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'all',
    urgency: 'all',
    category: 'all',
    search: ''
  });

  // Load data on mount
  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    } else if (activeTab === 'reports') {
      loadReports();
    } else if (activeTab === 'users' && user.role === 'admin') {
      loadUsers();
    }
  }, [activeTab, filters]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await adminAPI.getReports(filters);
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await authAPI.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    try {
      await adminAPI.updateStatus(reportId, newStatus);
      showNotification('✅ Status updated successfully');
      loadReports();
    } catch (err) {
      showNotification('❌ ' + err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await adminAPI.deleteReport(reportId);
      showNotification('✅ Report deleted successfully');
      loadReports();
      if (activeTab === 'dashboard') loadStats();
    } catch (err) {
      showNotification('❌ ' + err.message);
    }
  };

  const handleUserRoleUpdate = async (userId, newRole) => {
    try {
      await authAPI.updateUserRole(userId, newRole);
      showNotification('✅ User role updated successfully');
      loadUsers();
    } catch (err) {
      showNotification('❌ ' + err.message);
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await authAPI.deactivateUser(userId);
      showNotification('✅ User deactivated successfully');
      loadUsers();
    } catch (err) {
      showNotification('❌ ' + err.message);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      plumbing: Droplets,
      electrical: Lightbulb,
      hvac: Thermometer,
      internet: Wifi,
      furniture: Home,
      other: Wrench
    };
    return icons[category] || Wrench;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200'
  };

  const urgencyColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen min-w-500 bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center space-x-3">
            <span className="text-gray-800 font-medium">{notification}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Campus Fix Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600 capitalize">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'reports'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Wrench className="h-4 w-4 inline mr-2" />
              Reports ({reports.length})
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Users className="h-4 w-4 inline mr-2" />
                Users ({users.length})
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Total Reports */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Total Reports</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.reports.total}</p>
                      </div>
                      <div className="bg-indigo-100 p-3 rounded-lg">
                        <Wrench className="h-6 w-6 text-indigo-600" />
                      </div>
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Pending</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.reports.byStatus.pending}</p>
                      </div>
                      <div className="bg-yellow-100 p-3 rounded-lg">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">In Progress</p>
                        <p className="text-3xl font-bold text-blue-600 mt-2">{stats.reports.byStatus.inProgress}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  {/* Completed */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium">Completed</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{stats.reports.byStatus.completed}</p>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Stats (Admin only) */}
                {user.role === 'admin' && stats.users && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Students</p>
                        <p className="text-2xl font-bold text-indigo-600">{stats.users.byRole.student}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Technicians</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.users.byRole.technician}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Admins</p>
                        <p className="text-2xl font-bold text-purple-600">{stats.users.byRole.admin}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Recent Reports */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                  <div className="space-y-3">
                    {stats.recentReports && stats.recentReports.slice(0, 5).map((report) => {
                      const IconComponent = getCategoryIcon(report.category);
                      return (
                        <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-3">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                            <div>
                              <p className="font-medium text-gray-900">{report.location}</p>
                              <p className="text-sm text-gray-600">{report.description.substring(0, 50)}...</p>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            {report.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Urgency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Categories</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="hvac">HVAC</option>
                  <option value="internet">Internet</option>
                  <option value="furniture">Furniture</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-lg">
                  <Loader className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : reports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              ) : (
                reports.map((report) => {
                  const IconComponent = getCategoryIcon(report.category);
                  return (
                    <div key={report._id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <IconComponent className="h-6 w-6 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{report.location}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColors[report.status]}`}>
                                {report.status}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${urgencyColors[report.urgency]}`}>
                                {report.urgency}
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{report.description}</p>
                            {report.user && (
                              <p className="text-sm text-gray-500">
                                Reported by: {report.user.name} ({report.user.email})
                              </p>
                            )}
                            <div className="mt-4 flex items-center space-x-3">
                              <select
                                value={report.status}
                                onChange={(e) => handleStatusUpdate(report._id, e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="in-progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              {user.role === 'admin' && (
                                <button
                                  onClick={() => handleDeleteReport(report._id)}
                                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm flex items-center space-x-1"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>Delete</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Users Tab (Admin Only) */}
        {activeTab === 'users' && user.role === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12 bg-white rounded-xl shadow-lg">
                <Loader className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((usr) => (
                      <tr key={usr._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <span className="text-indigo-600 font-medium">{usr.name.charAt(0)}</span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{usr.name}</div>
                              {usr.studentId && <div className="text-sm text-gray-500">{usr.studentId}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{usr.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={usr.role}
                            onChange={(e) => handleUserRoleUpdate(usr._id, e.target.value)}
                            disabled={usr._id === user._id}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm capitalize disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="student">Student</option>
                            <option value="technician">Technician</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${usr.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {usr.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {usr._id !== user._id && usr.isActive && (
                            <button
                              onClick={() => handleDeactivateUser(usr._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

