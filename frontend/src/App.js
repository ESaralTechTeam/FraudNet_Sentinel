import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AlertMonitoring from './components/AlertMonitoring';
import Alerts from './components/Alerts';
import Beneficiaries from './components/Beneficiaries';
import ComplaintForm from './components/ComplaintForm';
import ComplaintsInvestigation from './components/ComplaintsInvestigation';
import FraudNetworks from './components/FraudNetworks';
import Analytics from './components/Analytics';
import FraudAnalyticsDashboard from './components/FraudAnalyticsDashboard';
import { LayoutDashboard, AlertTriangle, Users, Network, BarChart3, FileText, Menu, X, Shield, Headphones, Bell, LineChart, LogOut } from 'lucide-react';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout, user } = useAuth();

  const navigation = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Alert Monitoring', path: '/alert-monitoring', icon: Bell },
    { name: 'Fraud Analytics', path: '/fraud-analytics', icon: LineChart },
    { name: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { name: 'Beneficiaries', path: '/beneficiaries', icon: Users },
    { name: 'Fraud Networks', path: '/fraud-networks', icon: Network },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Complaints Investigation', path: '/complaints-investigation', icon: Headphones },
    { name: 'Submit Complaint', path: '/complaint', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  // Don't show sidebar on login page
  if (location.pathname === '/login') {
    return null;
  }

  return (
    <div className="min-h-screen relative">
      {/* Premium Animated Background */}
      <div className="animated-bg">
        <div className="animated-bg-orb"></div>
      </div>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Glass Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/20 transform transition-transform duration-200 ease-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 px-6 flex items-center justify-between border-b border-white/30">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-gray-800">FraudNet Sentinel</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-1 rounded-lg hover:bg-white/30 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/40 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/30">
            {user && (
              <div className="mb-3 p-3 glass-card rounded-lg">
                <p className="text-xs font-medium text-gray-700 truncate">{user.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="h-4 w-4" strokeWidth={2} />
              <span>Logout</span>
            </button>
            <div className="mt-3 text-2xs text-gray-600">
              <p>FraudNet Sentinel</p>
              <p className="mt-1">© 2026 Government of India</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-30 glass border-b border-white/30 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-white/30 transition-all"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <span className="text-sm font-semibold text-gray-800">FraudNet Sentinel</span>
            </div>
            <div className="w-9" />
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen relative z-10">
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/alert-monitoring" element={<ProtectedRoute><AlertMonitoring /></ProtectedRoute>} />
            <Route path="/fraud-analytics" element={<ProtectedRoute><FraudAnalyticsDashboard /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />
            <Route path="/beneficiaries" element={<ProtectedRoute><Beneficiaries /></ProtectedRoute>} />
            <Route path="/fraud-networks" element={<ProtectedRoute><FraudNetworks /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/complaints-investigation" element={<ProtectedRoute><ComplaintsInvestigation /></ProtectedRoute>} />
            <Route path="/complaint" element={<ProtectedRoute><ComplaintForm /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<AppContent />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
