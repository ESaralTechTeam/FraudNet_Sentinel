import React, { useState, useEffect } from 'react';
import { getAlerts } from '../api';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Filter, Search } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAlerts();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, searchTerm]);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getAlerts();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAlerts = () => {
    let filtered = alerts;

    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === selectedSeverity);
    }

    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.beneficiary_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlerts(filtered);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" strokeWidth={2} />;
      case 'high':
        return <AlertCircle className="h-5 w-5 text-orange-600" strokeWidth={2} />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" strokeWidth={2} />;
      default:
        return <CheckCircle className="h-5 w-5 text-blue-600" strokeWidth={2} />;
    }
  };

  const getSeverityBadge = (severity) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return styles[severity] || styles.low;
  };

  const getAlertCardBorder = (severity) => {
    const styles = {
      critical: 'border-l-4 border-l-red-500',
      high: 'border-l-4 border-l-orange-500',
      medium: 'border-l-4 border-l-yellow-500',
      low: 'border-l-4 border-l-blue-500'
    };
    return styles[severity] || styles.low;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-primary-600 rounded-full pulse"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
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
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-1">Alert Management</h1>
        <p className="text-sm text-neutral-600">Monitor and manage high-risk cases and fraud alerts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="glass-card rounded-lg p-4 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Alerts</p>
              <p className="text-2xl font-bold text-neutral-900">{severityCounts.all}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-blue-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Critical</p>
              <p className="text-2xl font-bold text-red-600">{severityCounts.critical}</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">High</p>
              <p className="text-2xl font-bold text-orange-600">{severityCounts.high}</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <AlertCircle className="h-6 w-6 text-orange-600" strokeWidth={2} />
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4 card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Medium</p>
              <p className="text-2xl font-bold text-yellow-600">{severityCounts.medium}</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <Info className="h-6 w-6 text-yellow-600" strokeWidth={2} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-neutral-400" strokeWidth={2} />
            <span className="text-sm font-medium text-neutral-700">Filter by Severity:</span>
            <div className="flex space-x-2">
              {['all', 'critical', 'high', 'medium'].map((severity) => (
                <button
                  key={severity}
                  onClick={() => setSelectedSeverity(severity)}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    selectedSeverity === severity
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => (
            <div
              key={alert.alert_id}
              className={`glass-card rounded-lg p-6 card-hover ${getAlertCardBorder(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-base font-semibold text-neutral-900">{alert.title}</h3>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getSeverityBadge(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-600 mb-3">{alert.description}</p>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-500">
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Beneficiary ID:</span>
                        <span className="text-primary-600 font-mono">{alert.beneficiary_id}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Risk Score:</span>
                        <span className="font-semibold text-red-600">{(alert.risk_score * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Type:</span>
                        <span>{alert.alert_type}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="font-medium">Date:</span>
                        <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-all btn-animate">
                    Investigate
                  </button>
                  <button className="px-4 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-200 transition-all">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-card rounded-lg p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" strokeWidth={2} />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Alerts Found</h3>
            <p className="text-sm text-neutral-600">
              {searchTerm || selectedSeverity !== 'all'
                ? 'Try adjusting your filters'
                : 'All systems are operating normally'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
