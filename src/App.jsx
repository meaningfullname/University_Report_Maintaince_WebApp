import React, { useState, useRef, useEffect } from 'react';
import { AlertCircle, Camera, MapPin, Send, CheckCircle2, Clock, Wrench, Home, Wifi, Lightbulb, Thermometer, Droplets, MessageCircle, X, Bot, User, Trash2, RefreshCw, Bell, Search, Filter, LogOut } from 'lucide-react';
import { reportsAPI } from './services/api';
import { mlAPI } from './services/ml';

const MaintenanceApp = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('report');
  const [formData, setFormData] = useState({
    location: '',
    category: '',
    urgency: 'medium',
    description: '',
    contactInfo: ''
  });
  
  // Reports state with API integration
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Enhanced chat state - removed localStorage
  const [showAIChat, setShowAIChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI Maintenance Assistant. I can help you troubleshoot issues, fill out reports more accurately, or answer questions about the maintenance process. How can I help you today?', timestamp: new Date().toISOString() }
  ]);
  const [aiInput, setAIInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

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

  // Enhanced AI response system with ML integration
  const getAIResponse = async (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Попробовать ML модель сначала
    try {
      const mlResult = await mlAPI.analyzeIssue(message);
      
      if (mlResult && !mlResult.fallback && mlResult.confidence !== 'low') {
        // Форматировать ML ответ
        let content = `🤖 **ML Analysis** (${mlResult.confidence} confidence)\n\n`;
        
        if (mlResult.similar_issues_count > 0) {
          content += `Found ${mlResult.similar_issues_count} similar issues in our database.\n\n`;
        }
        
        content += `**Suggested Solution:**\n${mlResult.solution}\n\n`;
        
        if (mlResult.estimated_time) {
          content += `⏱️ **Estimated time:** ${mlResult.estimated_time}\n`;
        }
        
        if (mlResult.diy_possible) {
          content += `✅ **DIY possible:** Yes\n`;
          if (mlResult.tools_needed && mlResult.tools_needed.length > 0) {
            content += `🛠️ **Tools needed:** ${mlResult.tools_needed.join(', ')}\n`;
          }
        } else {
          content += `📞 **DIY possible:** No - Call technician\n`;
        }
        
        if (mlResult.steps && mlResult.steps.length > 0) {
          content += `\n**Steps to try:**\n`;
          mlResult.steps.forEach((step, idx) => {
            content += `${idx + 1}. ${step}\n`;
          });
        }
        
        content += `\n💡 *This recommendation is based on ${mlResult.similar_issues_count || 'historical'} similar cases*`;
        
        return {
          content,
          suggestion: {
            category: mlResult.suggested_category || null,
            urgency: mlResult.suggested_priority || 'medium',
          },
          mlConfidence: mlResult.confidence,
          mlAnalysis: true,
        };
      }
    } catch (error) {
      console.error('ML analysis failed, using fallback:', error);
    }
    
    // Fallback к существующей rule-based логике
    // Emergency keywords
    if (message.includes('emergency') || message.includes('flood') || message.includes('fire') || message.includes('gas leak')) {
      return { 
        content: '🚨 EMERGENCY DETECTED!\n\n1. Call Campus Security immediately: 911\n2. Evacuate if necessary\n3. I\'m marking this as HIGH PRIORITY\n\nPlease provide your exact location for the emergency report.', 
        suggestion: { category: 'other', urgency: 'high' },
        isEmergency: true
      };
    }
    
    // Plumbing issues
    if (message.includes('sink') || message.includes('drain') || message.includes('clog') || message.includes('faucet') || message.includes('tap') || message.includes('leak')) {
      return { 
        content: 'For sink/drain issues, here\'s what you can try first:\n\n1. Check if there\'s a visible clog you can remove\n2. Try using a plunger\n3. Pour hot water down the drain\n4. Check if the shut-off valve is fully open\n\nIf none of these work, I can help you submit a maintenance request. Would you like me to help you fill out the report form?', 
        suggestion: { category: 'plumbing', urgency: 'medium' } 
      };
    }
    
    if (message.includes('toilet')) {
      const isOverflow = message.includes('overflow') || message.includes('flooding');
      return { 
        content: isOverflow 
          ? '⚠️ A toilet overflow is urgent! Here\'s what to do:\n\n1. Turn off the water valve behind the toilet immediately\n2. This is a HIGH PRIORITY issue\n3. I\'ll help you submit an urgent report right now\n\nShall I pre-fill the form for you?'
          : 'Toilet issues can be frustrating. Let me help:\n\n1. Is it clogged? Try a plunger first\n2. Not flushing? Check if the chain is connected inside the tank\n3. Running constantly? The flapper might need adjustment\n\nIf these don\'t work, let\'s submit a maintenance request. What specific issue are you having?',
        suggestion: { category: 'plumbing', urgency: isOverflow ? 'high' : 'medium' } 
      };
    }
    
    // Electrical issues
    if (message.includes('light') || message.includes('electricity') || message.includes('power') || message.includes('outlet')) {
      const isDangerous = message.includes('spark') || message.includes('shock') || message.includes('burn') || message.includes('smoke');
      return { 
        content: isDangerous
          ? '⚠️ SAFETY ALERT! Sparks, shocks, or burning smells are DANGEROUS.\n\n1. Do NOT use that outlet/switch\n2. Unplug everything nearby\n3. Turn off the circuit breaker if you know which one\n4. This is EMERGENCY level - call campus security at 911 immediately\n5. Also submit a HIGH PRIORITY report\n\nWould you like me to help you submit the urgent report?'
          : 'Electrical issue detected. Let\'s troubleshoot:\n\n1. Check if the light bulb needs replacing\n2. Test other outlets/lights in the same room\n3. Check your circuit breaker panel\n\nIf the problem persists, it needs professional attention. Should I help you create a maintenance report?',
        suggestion: { category: 'electrical', urgency: isDangerous ? 'high' : 'low' } 
      };
    }
    
    // HVAC issues
    if (message.includes('cold') || message.includes('hot') || message.includes('heat') || message.includes('ac') || message.includes('air') || message.includes('temperature')) {
      const isWinter = new Date().getMonth() >= 10 || new Date().getMonth() <= 2;
      const noHeat = message.includes('no heat') || message.includes('freezing');
      return { 
        content: `Temperature control issues noted. Let me help:\n\n1. Check thermostat settings (should be 68-72°F)\n2. Ensure vents aren\'t blocked\n3. Check if the unit is actually running\n4. Try resetting the thermostat\n\n${noHeat && isWinter ? '⚠️ No heat in winter is HIGH PRIORITY!' : 'If these don\'t help, we should submit a maintenance request.'}\n\nWhat\'s your specific situation?`,
        suggestion: { category: 'hvac', urgency: noHeat && isWinter ? 'high' : 'medium' } 
      };
    }
    
    // Internet issues
    if (message.includes('wifi') || message.includes('internet') || message.includes('connection') || message.includes('network')) {
      return { 
        content: 'Internet connectivity issues - let\'s diagnose:\n\n1. Restart your device\n2. Forget and reconnect to the network\n3. Try ethernet if available\n4. Check IT status page: status.university.edu\n5. Test on another device\n\nCampus-wide issues are usually resolved quickly. If it\'s just your room after 24 hours, we should report it. Is this affecting just you or multiple people?',
        suggestion: { category: 'internet', urgency: 'low' } 
      };
    }
    
    // Status check
    if (message.includes('status') || message.includes('check') || message.includes('track')) {
      return { 
        content: 'To check your report status:\n\n1. Click the "My Reports" tab\n2. You\'ll see color-coded status badges:\n   • 🟡 Pending: Received, in queue\n   • 🔵 In Progress: Technician assigned\n   • 🟢 Completed: Issue resolved\n\nYou can also see estimated completion times and assigned technicians. Would you like to know typical wait times?',
        suggestion: null 
      };
    }
    
    // Help with form
    if (message.includes('help') || message.includes('form') || message.includes('report')) {
      return { 
        content: 'I\'ll guide you through the report process!\n\n📍 **Location**: Be specific (Building, Room, Area)\n🔧 **Category**: I\'ll help determine this based on your issue\n⚡ **Priority**: I\'ll suggest based on urgency\n📝 **Description**: More detail = faster fix\n\nTell me about your issue and I\'ll help fill everything out correctly!',
        suggestion: null 
      };
    }
    
    // Default response with better guidance
    return { 
      content: 'I\'m here to help! I can assist with:\n\n🔧 Troubleshooting common issues\n📝 Filling out maintenance reports\n⚡ Determining priority levels\n⏰ Estimating response times\n📊 Checking report status\n\nPlease describe your specific issue (e.g., "my sink is clogged" or "the heater isn\'t working") and I\'ll provide targeted help!',
      suggestion: null 
    };
  };

  const handleAISubmit = async () => {
    if (!aiInput.trim()) return;
    
    const userMessage = { role: 'user', content: aiInput, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMessage]);
    const currentInput = aiInput;
    setAIInput('');
    setIsTyping(true);
    
    try {
      // Использовать async версию getAIResponse
      const response = await getAIResponse(currentInput);
      
      const aiMessage = { 
        role: 'assistant', 
        content: response.content, 
        timestamp: new Date().toISOString(), 
        suggestion: response.suggestion,
        isEmergency: response.isEmergency,
        mlAnalysis: response.mlAnalysis,
        mlConfidence: response.mlConfidence,
      };
      
      setChatMessages(prev => [...prev, aiMessage]);
      
      // Auto-apply suggestions for emergencies
      if (response.isEmergency && response.suggestion) {
        applySuggestion(response.suggestion);
        showNotificationMessage('⚠️ Emergency detected - Form pre-filled with high priority');
      } else if (response.suggestion) {
        // For non-emergencies, just update the form
        if (response.suggestion.category) setFormData(prev => ({ ...prev, category: response.suggestion.category }));
        if (response.suggestion.urgency) setFormData(prev => ({ ...prev, urgency: response.suggestion.urgency }));
      }
      
      // Show ML notification if ML was used
      if (response.mlAnalysis) {
        showNotificationMessage(`🤖 ML recommendation (${response.mlConfidence} confidence)`);
      }
    } catch (error) {
      console.error('AI response error:', error);
      // Fallback response
      const fallbackResponse = {
        content: 'I\'m having trouble processing that. Could you please describe your issue in more detail?',
        suggestion: null,
      };
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse.content,
        timestamp: new Date().toISOString(),
        suggestion: fallbackResponse.suggestion,
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.category) setFormData(prev => ({ ...prev, category: suggestion.category }));
    if (suggestion.urgency) setFormData(prev => ({ ...prev, urgency: suggestion.urgency }));
    setActiveTab('report');
    setShowAIChat(false);
    showNotificationMessage('Form updated based on AI suggestion');
  };

  const clearChat = () => {
    setChatMessages([
      { role: 'assistant', content: 'Hi! I\'m your AI Maintenance Assistant. I can help you troubleshoot issues, fill out reports more accurately, or answer questions about the maintenance process. How can I help you today?', timestamp: new Date().toISOString() }
    ]);
    showNotificationMessage('Chat history cleared');
  };

  const showNotificationMessage = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Fetch reports from API
  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        status: filterStatus,
        urgency: filterUrgency,
        search: searchTerm
      };
      const data = await reportsAPI.getAll(filters);
      setReports(data);
    } catch (err) {
      setError(err.message);
      showNotificationMessage('❌ Failed to load reports: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load reports on mount and when filters change
  useEffect(() => {
    fetchReports();
  }, [filterStatus, filterUrgency, searchTerm]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSubmit = async () => {
    // Validation
    if (!formData.location || !formData.category || !formData.description) {
      showNotificationMessage('❌ Please fill in all required fields');
      return;
    }
    
    if (formData.description.length < 10) {
      showNotificationMessage('❌ Please provide more detail in the description');
      return;
    }
    
    setLoading(true);
    try {
      const newReport = await reportsAPI.create(formData);
      setFormData({ location: '', category: '', urgency: 'medium', description: '', contactInfo: '' });
      showNotificationMessage('✅ Report submitted successfully! Tracking ID: #' + newReport._id);
      setActiveTab('status');
      // Refresh reports list
      await fetchReports();
    } catch (err) {
      showNotificationMessage('❌ Failed to submit report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getEstimatedCompletion = (urgency) => {
    const date = new Date();
    const daysToAdd = urgency === 'high' ? 1 : urgency === 'medium' ? 3 : 5;
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split('T')[0];
  };

  const deleteReport = async (id) => {
    setLoading(true);
    try {
      await reportsAPI.delete(id);
      showNotificationMessage('✅ Report deleted successfully');
      // Refresh reports list
      await fetchReports();
    } catch (err) {
      showNotificationMessage('❌ Failed to delete report: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconMap = { droplets: Droplets, lightbulb: Lightbulb, thermometer: Thermometer, wifi: Wifi, home: Home, wrench: Wrench };
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

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top">
          <div className="bg-white rounded-lg shadow-lg px-6 py-4 flex items-center space-x-3">
            <Bell className="h-5 w-5 text-indigo-600" />
            <span className="text-gray-800 font-medium">{notificationMessage}</span>
          </div>
        </div>
      )}

      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-500 mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Wrench className="h-6 w-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Campus Fix</h1>
                <p className="text-sm text-gray-600">University Maintenance Reporting</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {reports.filter(r => r.status === 'pending').length} pending • 
                {reports.filter(r => r.status === 'in-progress').length} in progress
              </div>
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="bg-indigo-50 px-3 py-1 rounded-full">
                    <span className="text-sm font-medium text-indigo-700 capitalize">{user.role} Portal</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="w-500 px-6">
          <div className="flex space-x-8">
            <button onClick={() => setActiveTab('report')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'report' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Send className="h-4 w-4 inline mr-2" />Report Issue
            </button>
            <button onClick={() => setActiveTab('status')} className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${activeTab === 'status' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              <Clock className="h-4 w-4 inline mr-2" />
              My Reports ({reports.length})
              {reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {reports.filter(r => r.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-500 px-6 py-8">
        {activeTab === 'report' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Report a Maintenance Issue</h2>
                <p className="text-lg text-gray-600">Tell us about any broken equipment or maintenance needs in your dorm or campus facilities.</p>
                {formData.urgency === 'high' && (
                  <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium">⚠️ High priority issues are typically addressed within 2-4 hours</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><MapPin className="h-4 w-4 inline mr-1" />Location *</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => setFormData({...formData, location: e.target.value})} 
                      placeholder="e.g., Dorm A - Room 205, Library 2nd Floor, Cafeteria" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    />
                    {formData.location && formData.location.length < 5 && (
                      <p className="text-xs text-red-600 mt-1">Please be more specific about the location</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Issue Category *</label>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.map((category) => {
                        const IconComponent = getIconComponent(category.icon);
                        return (
                          <button 
                            key={category.id} 
                            type="button" 
                            onClick={() => setFormData({...formData, category: category.id})} 
                            className={`p-4 border-2 rounded-lg text-left transition-all ${formData.category === category.id ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                          >
                            <IconComponent className={`h-6 w-6 ${category.color} mb-2`} />
                            <div className="font-medium text-gray-900 text-sm">{category.name}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Information (Optional)</label>
                    <input 
                      type="text" 
                      value={formData.contactInfo} 
                      onChange={(e) => setFormData({...formData, contactInfo: e.target.value})} 
                      placeholder="Phone number or email for updates" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3"><AlertCircle className="h-4 w-4 inline mr-1" />Priority Level</label>
                    <div className="space-y-3">
                      {urgencyLevels.map((level) => (
                        <button 
                          key={level.value} 
                          type="button" 
                          onClick={() => setFormData({...formData, urgency: level.value})} 
                          className={`w-full flex items-start space-x-3 p-4 border-2 rounded-lg text-left transition-all ${formData.urgency === level.value ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
                        >
                          <div className={`w-4 h-4 mt-0.5 border-2 rounded-full flex items-center justify-center ${formData.urgency === level.value ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                            {formData.urgency === level.value && <div className="w-2 h-2 bg-white rounded-full"></div>}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${level.color}`}>{level.label}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{level.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2"><Camera className="h-4 w-4 inline mr-1" />Add Photos (Optional)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">Click to upload photos</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Problem Description *</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  rows={5} 
                  placeholder="Please describe the issue in detail. Include any relevant information that might help our maintenance team." 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none" 
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">Minimum 10 characters required</p>
                  <p className={`text-xs ${formData.description.length < 10 ? 'text-red-600' : 'text-gray-500'}`}>
                    {formData.description.length} characters
                  </p>
                </div>
              </div>

              <div className="mt-8 flex space-x-4">
                <button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="flex-1 bg-indigo-600 text-white py-4 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-5 w-5 inline mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 inline mr-2" />
                      Submit Report
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setFormData({ location: '', category: '', urgency: 'medium', description: '', contactInfo: '' })} 
                  disabled={loading}
                  className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear Form
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
              
              {/* Search and Filter Bar */}
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">All Urgency</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <RefreshCw className="h-16 w-16 text-indigo-600 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading reports...</h3>
                  <p className="text-gray-600">Please wait while we fetch your maintenance reports.</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                  <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">You haven't submitted any maintenance reports yet or your search filters returned no results.</p>
                  <button 
                    onClick={() => {setActiveTab('report'); setSearchTerm(''); setFilterStatus('all'); setFilterUrgency('all');}} 
                    className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Submit a Report
                  </button>
                </div>
              ) : (
                reports.map((report) => {
                  const IconComponent = getCategoryIcon(report.category);
                  const categoryColor = getCategoryColor(report.category);
                  return (
                    <div key={report._id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className={`p-3 rounded-lg bg-gray-50`}>
                            <IconComponent className={`h-6 w-6 ${categoryColor}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{report.location}</h3>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[report.status]}`}>
                                {report.status === 'in-progress' ? 'In Progress' : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgencyLevels.find(u => u.value === report.urgency).color}`}>
                                {report.urgency.charAt(0).toUpperCase() + report.urgency.slice(1)} Priority
                              </span>
                            </div>
                            <p className="text-gray-600 mb-3">{report.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center"><Clock className="h-4 w-4 mr-1" />Submitted: {formatDate(report.date || report.createdAt)}</span>
                              {report.status === 'completed' ? (
                                <span className="flex items-center text-green-600">
                                  <CheckCircle2 className="h-4 w-4 mr-1" />Completed: {formatDate(report.completedDate)}
                                </span>
                              ) : report.estimatedCompletion && (
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />Est. Completion: {formatDate(report.estimatedCompletion)}
                                </span>
                              )}
                              {report.assignedTo && (
                                <span className="flex items-center">
                                  <User className="h-4 w-4 mr-1" />Assigned: {report.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => deleteReport(report._id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Report"
                          disabled={loading}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      {report.status === 'in-progress' && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Progress Update:</span> A technician has been assigned and is working on your issue.
                            </p>
                            <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Widget - Fixed Implementation */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showAIChat ? (
          <button 
            onClick={() => setShowAIChat(true)} 
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 group"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-8 right-0 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              AI Assistant
            </span>
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl w-96 max-h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Maintenance Assistant</h3>
                  <p className="text-xs opacity-90">Always here to help</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearChat}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title="Clear Chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setShowAIChat(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
              {chatMessages.map((msg, idx) => (
                <div key={`${msg.timestamp}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`p-2 rounded-lg flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                      {msg.role === 'user' ? <User className="h-4 w-4 text-indigo-600" /> : <Bot className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div className={`px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      {msg.suggestion && (
                        <button 
                          onClick={() => applySuggestion(msg.suggestion)}
                          className="mt-2 text-xs bg-white/20 backdrop-blur px-3 py-1 rounded-full hover:bg-white/30 transition-colors flex items-center space-x-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Apply to form</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Bot className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-gray-100">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200">
              <form onSubmit={(e) => { e.preventDefault(); handleAISubmit(); }} className="flex space-x-2">
                <input 
                  type="text" 
                  value={aiInput} 
                  onChange={(e) => setAIInput(e.target.value)} 
                  placeholder="Describe your maintenance issue..." 
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  disabled={isTyping}
                />
                <button 
                  type="submit"
                  disabled={!aiInput.trim() || isTyping}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2">Type your issue and I'll help troubleshoot or fill out a report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaintenanceApp;