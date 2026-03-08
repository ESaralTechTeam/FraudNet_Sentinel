import React, { useState, useEffect } from 'react';
import { getAlerts, getBeneficiaries } from '../api';
import { 
  AlertTriangle, AlertCircle, Info, Shield, 
  MapPin, Clock, TrendingUp, Filter, Search,
  CheckCircle, XCircle, Eye, Bell
} from 'lucide-react';

const AlertMonitoring = () => {
  const [alerts, setAlerts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState({});
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, searchTerm]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alertsData, beneficiariesData] = await Promise.all([
        getAlerts(),
        getBeneficiaries()
      ]);
      
      // Create beneficiary lookup map
      const benMap = {};
      (beneficiariesData || []).forEach(ben => {
        benMap[ben.beneficiary_id] = ben;
      });
      
      setBeneficiaries(benMap);
      setAlerts(alertsData.alerts || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = [...alerts];

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.beneficiary_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beneficiaries[alert.beneficiary_id]?.district?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by risk score (highest first)
    filtered.sort((a, b) => b.risk_score - a.risk_score);

    setFilteredAlerts(filtered);
  };

  const getSeverityConfig = (severity) => {
    const configs = {
      critical: {
        bg: 'bg-red-50',
        border: 'border-red-500',
        text: 'text-red-800',
        badge: 'bg-red-100 text-red-800 border-red-200',
        icon: AlertTriangle,
        iconColor: 'text-red-600',
        glow: 'shadow-red-200'
      },
      high: {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-800',
        badge: 'bg-orange-100 text-orange-800 border-orange-200',
        icon: AlertCircle,
        iconColor: 'text-orange-600',
        glow: 'shadow-orange-200'
      },
      medium: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-500',
        text: 'text-yellow-800',
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: Info,
        iconColor: 'text-yellow-600',
        glow: 'shadow-yellow-200'
      },
      low: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-800',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: Shield,
        iconColor: 'text-blue-600',
        glow: 'shadow-blue-200'
      }
    };
    return configs[severity] || configs.low;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gov-blue"></div>
      </div>
    );
  }

  const severityCounts = {
    all: alerts.length,
    critical: alerts.filter(a => a.severity === 'critical').length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Bell className="h-8 w-8 mr-3 text-gov-blue" />
                Alert Monitoring
              </h1>
              <p className="mt-2 text-sm text-gray-600">Real-time fraud detection alerts and high-risk cases</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-gov-blue text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gov-blue text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{severityCounts.all}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{severityCounts.critical}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High</p>
                <p className="text-2xl font-bold text-orange-600">{severityCounts.high}</p>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium</p>
                <p className="text-2xl font-bold text-yellow-600">{severityCounts.medium}</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <Info className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Severity:</span>
              <div className="flex space-x-2">
                {['all', 'critical', 'high', 'medium'].map((severity) => (
                  <button
                    key={severity}
                    onClick={() => setSelectedSeverity(severity)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      selectedSeverity === severity
                        ? 'bg-gov-blue text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAlerts.length > 0 ? (
              filteredAlerts.map((alert) => {
                const config = getSeverityConfig(alert.severity);
                const Icon = config.icon;
                const beneficiary = beneficiaries[alert.beneficiary_id] || {};
                
                return (
                  <div
                    key={alert.alert_id}
                    className={`bg-white rounded-lg shadow-md border-l-4 ${config.border} hover:shadow-lg transition-all duration-200 overflow-hidden ${config.glow}`}
                  >
                    {/* Card Header */}
                    <div className={`${config.bg} px-4 py-3 border-b border-gray-200`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-5 w-5 ${config.iconColor}`} />
                          <span className={`text-xs font-bold uppercase tracking-wide ${config.text}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${config.badge}`}>
                          {alert.alert_type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {alert.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {alert.description}
                      </p>

                      {/* Key Metrics */}
                      <div className="space-y-3 mb-4">
                        {/* Beneficiary ID */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">Beneficiary ID</span>
                          <span className="text-sm font-mono font-semibold text-gov-blue">
                            {alert.beneficiary_id}
                          </span>
                        </div>

                        {/* Fraud Score */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium">Fraud Score</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  alert.risk_score >= 0.8 ? 'bg-red-600' :
                                  alert.risk_score >= 0.6 ? 'bg-orange-500' :
                                  alert.risk_score >= 0.4 ? 'bg-yellow-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${alert.risk_score * 100}%` }}
                              />
                            </div>
                            <span className={`text-sm font-bold ${
                              alert.risk_score >= 0.8 ? 'text-red-600' :
                              alert.risk_score >= 0.6 ? 'text-orange-600' :
                              alert.risk_score >= 0.4 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {(alert.risk_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* District */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            District
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {beneficiary.district || 'Unknown'}
                          </span>
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-medium flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Detected
                          </span>
                          <span className="text-sm font-medium text-gray-700">
                            {formatTimestamp(alert.created_at)}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                        <button className="flex-1 px-3 py-2 bg-gov-blue text-white text-sm font-medium rounded-lg hover:bg-gov-darkblue transition-colors flex items-center justify-center">
                          <Eye className="h-4 w-4 mr-1" />
                          Investigate
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Risk Indicator Bar */}
                    <div className={`h-1 ${
                      alert.risk_score >= 0.8 ? 'bg-red-600' :
                      alert.risk_score >= 0.6 ? 'bg-orange-500' :
                      alert.risk_score >= 0.4 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                  </div>
                );
              })
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Shield className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Alerts Found</h3>
                <p className="text-sm text-gray-600">
                  {searchTerm || selectedSeverity !== 'all'
                    ? 'Try adjusting your filters'
                    : 'All systems are operating normally'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Beneficiary ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fraud Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAlerts.map((alert) => {
                    const config = getSeverityConfig(alert.severity);
                    const beneficiary = beneficiaries[alert.beneficiary_id] || {};
                    
                    return (
                      <tr key={alert.alert_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${config.badge}`}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gov-blue">
                          {alert.beneficiary_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  alert.risk_score >= 0.8 ? 'bg-red-600' :
                                  alert.risk_score >= 0.6 ? 'bg-orange-500' :
                                  'bg-yellow-500'
                                }`}
                                style={{ width: `${alert.risk_score * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-bold text-gray-900">
                              {(alert.risk_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {beneficiary.district || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(alert.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-gov-blue hover:text-gov-darkblue font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertMonitoring;
