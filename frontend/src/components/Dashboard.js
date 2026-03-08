import React, { useState, useEffect } from 'react';
import { getSummary, getAlerts, getComplaints, getTrends } from '../api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Users, TrendingUp, Shield, FileText, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, alertsData, complaintsData, trendsData] = await Promise.all([
        getSummary(),
        getAlerts(),
        getComplaints(),
        getTrends()
      ]);
      
      setSummary(summaryData);
      setAlerts(alertsData.alerts || []);
      setComplaints(complaintsData.slice(0, 5));
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total Beneficiaries',
      value: summary?.total_beneficiaries || 0,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      title: 'High Risk Cases',
      value: summary?.high_risk_count || 0,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-pink-500',
      change: '-8.2%',
      trend: 'down'
    },
    {
      title: 'Active Alerts',
      value: summary?.active_alerts || 0,
      icon: Shield,
      gradient: 'from-orange-500 to-red-500',
      change: '+5.1%',
      trend: 'up'
    },
    {
      title: 'Total Complaints',
      value: complaints.length,
      icon: FileText,
      gradient: 'from-purple-500 to-indigo-500',
      change: '+3.4%',
      trend: 'up'
    }
  ];

  const riskDistribution = [
    { name: 'Critical', value: summary?.alert_breakdown?.critical || 0, color: '#ef4444' },
    { name: 'High', value: summary?.alert_breakdown?.high || 0, color: '#f59e0b' },
    { name: 'Medium', value: summary?.alert_breakdown?.medium || 0, color: '#3b82f6' },
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1800px] mx-auto fade-in">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-sm text-gray-600">Real-time monitoring and fraud detection analytics</p>
          </div>
          <div className="flex items-center space-x-3 glass-card px-4 py-2.5 rounded-xl">
            <Activity className="h-4 w-4 text-green-500 pulse" />
            <span className="text-sm font-semibold text-gray-700">System Active</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Modern Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={index} className="glass-card rounded-2xl p-6 card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${stat.trend === 'up' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  <TrendIcon className="h-3 w-3" />
                  <span className="text-xs font-semibold">{stat.change}</span>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Financial Overview - Horizontal Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Total Disbursement</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatCurrency(summary?.total_amount || 0)}</p>
          <p className="text-xs text-gray-500">Across all schemes</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Potential Leakage</h3>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-red-600 mb-1">{formatCurrency(summary?.potential_leakage || 0)}</p>
          <p className="text-xs text-gray-500">High-risk cases</p>
        </div>
        
        <div className="glass-card rounded-2xl p-6 card-hover border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Duplicate Cases</h3>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-orange-600 mb-1">{summary?.duplicate_count || 0}</p>
          <p className="text-xs text-gray-500">Flagged beneficiaries</p>
        </div>
      </div>

      {/* Charts Section - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risk Distribution Chart */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Risk Distribution</h3>
            <div className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-lg">
              Live Data
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leakage Trend Chart */}
        <div className="glass-card rounded-2xl p-6 card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Leakage Trend</h3>
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg ${trends?.trend_direction === 'improving' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {trends?.trend_direction === 'improving' ? <ArrowDownRight className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              <span className="text-xs font-semibold">{Math.abs(trends?.percentage_change || 0)}%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trends?.leakage_trend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={3} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Activity Feed - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Complaints</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {complaints.length > 0 ? (
              complaints.map((complaint, index) => (
                <div key={index} className="p-4 bg-white/40 backdrop-blur-sm rounded-xl border border-white/60 hover:bg-white/60 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{complaint.complaint_type}</p>
                    <span className={`px-2 py-0.5 text-2xs font-bold rounded-md ${
                      complaint.status === 'submitted' ? 'bg-yellow-100 text-yellow-700' :
                      complaint.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{complaint.description}</p>
                  <p className="text-2xs text-gray-500">{new Date(complaint.created_at).toLocaleDateString()}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No complaints found</p>
            )}
          </div>
        </div>

        {/* High Risk Alerts */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">High Risk Alerts</h3>
            <button className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1">
              <span>View All</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 5).length > 0 ? (
              alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className={`p-4 rounded-xl border-l-4 ${
                  alert.severity === 'critical' ? 'bg-red-50/80 border-red-500' :
                  alert.severity === 'high' ? 'bg-orange-50/80 border-orange-500' :
                  'bg-yellow-50/80 border-yellow-500'
                } hover:shadow-md transition-all`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <span className={`px-2 py-0.5 text-2xs font-bold rounded-md ${
                      alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      alert.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xs text-gray-500">Risk: {(alert.risk_score * 100).toFixed(0)}%</p>
                    <p className="text-2xs text-gray-500">{new Date(alert.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No alerts found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
