import React, { useState } from 'react';
import { AlertCircle, Camera, MapPin, Send, CheckCircle2, Clock, Wrench, Home, Wifi, Lightbulb, Thermometer, Droplets } from 'lucide-react';

const MaintenanceApp = () => {
  const [activeTab, setActiveTab] = useState('report');
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    urgency: 'medium',
    description: '',
    contactInfo: ''
  });
  
  const [reports, setReports] = useState([
    { 
      id: 1, 
      location: 'Dorm A - Room 205', 
      category: 'plumbing', 
      urgency: 'high', 
      description: 'Bathroom sink not working', 
      status: 'pending', 
      date: '2025-09-20' 
    },
    { 
      id: 2, 
      location: 'Library - 2nd Floor', 
      category: 'electrical', 
      urgency: 'medium', 
      description: 'Light fixture flickering', 
      status: 'completed', 
      date: '2025-09-18' 
    },
    { 
      id: 3, 
      location: 'Dorm B - Common Room', 
      category: 'hvac', 
      urgency: 'low', 
      description: 'AC making noise', 
      status: 'pending', 
      date: '2025-09-22' 
    }
  ]);

  const categories = [
    { id: 'plumbing', name: 'Plumbing', icon: 'droplets', color: 'text-blue-500' },
    { id: 'electrical', name: 'Electrical', icon: 'lightbulb', color: 'text-yellow-500' },
    { id: 'hvac', name: 'HVAC', icon: 'thermometer', color: 'text-green-500' },
    { id: 'internet', name: 'Internet/WiFi', icon: 'wifi', color: 'text-purple-500' },
    { id: 'furniture', name: 'Furniture', icon: 'home', color: 'text-amber-600' },
    { id: 'other', name: 'Other', icon: 'wrench', color: 'text-gray-500' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800', description: 'Can wait a few days' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800', description: 'Should be fixed soon' },
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800', description: 'Urgent - needs immediate attention' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
  };

  const handleSubmit = () => {
    if (!formData.location || !formData.category || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newReport = {
      id: reports.length + 1,
      ...formData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    
    setReports([newReport, ...reports]);
    setFormData({ location: '', category: '', urgency: 'medium', description: '', contactInfo: '' });
    alert('Report submitted successfully!');
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      droplets: Droplets,
      lightbulb: Lightbulb,
      thermometer: Thermometer,
      wifi: Wifi,
      home: Home,
      wrench: Wrench
    };
    return iconMap[iconName] || Wrench;
  };

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? getIconComponent(category.icon) : Wrench;
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - Full Width */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Fix</h1>
                <p className="text-sm text-gray-600">University Maintenance Reporting</p>
              </div>
            </div>
            <div className="bg-indigo-50 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-indigo-700">Student Portal</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Full Width */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-full px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'report'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Send className="h-4 w-4 inline mr-2" />
              Report Issue
            </button>
            <button
              onClick={() => setActiveTab('status')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'status'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="h-4 w-4 inline mr-2" />
              My Reports ({reports.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Full Width with responsive containers */}
      <div className="w-full px-6 py-8">
        {activeTab === 'report' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Report a Maintenance Issue</h2>
                <p className="text-lg text-gray-600">Tell us about any broken equipment or maintenance needs in your dorm or campus facilities.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Location Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Location *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      placeholder="e.g., Dorm A - Room 205, Library 2nd Floor, Cafeteria"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Issue Category *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setFormData({...formData, category: category.id})}
                            className={`p-4 border-2 rounded-lg text-left transition-all ${
                              formData.category === category.id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <IconComponent className={`h-6 w-6 ${category.color} mb-2`} />
                            <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contact Information (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.contactInfo}
                      onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
                      placeholder="Phone number or email for updates"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Priority Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      Priority Level
                    </label>
                    <div className="space-y-3">
                      {urgencyLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({...formData, urgency: level.value})}
                          className={`w-full flex items-start space-x-3 p-4 border-2 rounded-lg text-left transition-all ${
                            formData.urgency === level.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`w-4 h-4 mt-0.5 border-2 rounded-full flex items-center justify-center ${
                            formData.urgency === level.value
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-300'
                          }`}>
                            {formData.urgency === level.value && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${level.color}`}>
                                {level.label}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Photo Upload Placeholder */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Camera className="h-4 w-4 inline mr-1" />
                      Add Photos (Coming Soon)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-500">Photo upload feature will be available soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description - Full Width */}
              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Problem Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={5}
                  placeholder="Please describe the issue in detail. Include any relevant information that might help our maintenance team."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="mt-8">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-indigo-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
                >
                  <Send className="h-5 w-5 inline mr-2" />
                  Submit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'status' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-3">My Maintenance Reports</h2>
              <p className="text-lg text-gray-600">Track the status of your submitted maintenance requests.</p>
            </div>

            {reports.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {reports.map((report) => {
                  const IconComponent = getCategoryIcon(report.category);
                  return (
                    <div key={report.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-gray-100 p-3 rounded-lg">
                            <IconComponent className={`h-6 w-6 ${getCategoryColor(report.category)}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{report.location}</h3>
                            <p className="text-sm text-gray-600 capitalize">{report.category.replace('-', ' ')}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                            {report.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            urgencyLevels.find(l => l.value === report.urgency)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {report.urgency.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-4 leading-relaxed">{report.description}</p>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
                        <span>Submitted: {new Date(report.date).toLocaleDateString()}</span>
                        {report.status === 'completed' && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Completed
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-16 text-center">
                <Clock className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Reports Yet</h3>
                <p className="text-gray-600 mb-6 text-lg">You haven't submitted any maintenance reports yet.</p>
                <button
                  onClick={() => setActiveTab('report')}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Submit Your First Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Emergency Notice - Full Width */}
      <div className="w-full px-6 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-4 flex-shrink-0" />
              <div>
                <p className="text-red-800">
                  <span className="font-semibold">Emergency?</span> For urgent issues like gas leaks, electrical hazards, or water flooding, call Campus Security immediately at{' '}
                  <span className="font-bold">911</span> or{' '}
                  <span className="font-bold">(555) 123-4567</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <footer className="bg-white border-t border-gray-200">
        <div className="w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <p className="text-sm text-gray-600">Facilities Management</p>
                <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
                <p className="text-sm text-gray-600">Email: facilities@university.edu</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Office Hours</h3>
                <p className="text-sm text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-sm text-gray-600">Emergency repairs: 24/7</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Student Housing Portal</p>
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Campus Map</p>
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Maintenance Schedule</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Support</h3>
                <div className="space-y-2">
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Help Center</p>
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Report Bug</p>
                  <p className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">Feature Request</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-6 text-center">
              <p className="text-sm text-gray-600">© 2025 Campus Fix - University Maintenance Portal. Built for students, by students.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MaintenanceApp;