import React, { useState, useEffect } from 'react';
import { getDistrictRisk, getFraudNetworks, getSummary, getTrends } from '../api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingDown, TrendingUp, MapPin, Network, DollarSign, Users } from 'lucide-react';

const Analytics = () => {
  const [districtData, setDistrictData] = useState([]);
  const [fraudNetworks, setFraudNetworks] = useState([]);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const [districts, networks, summaryData, trendsData] = await Promise.all([
        getDistrictRisk(),
        getFraudNetworks(),
        getSummary(),
        getTrends()
      ]);
      
      setDistrictData(districts);
      setFraudNetworks(networks.networks || []);
      setSummary(summaryData);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gov-blue"></div>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
          <p className="mt-2 text-sm text-gray-600">Comprehensive fraud detection insights and trends</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="text-xs font-semibold text-gray-500">TOTAL</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary?.total_beneficiaries || 0}</p>
            <p className="text-sm text-gray-600 mt-1">Beneficiaries</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-green-600" />
              <span className="text-xs font-semibold text-gray-500">DISBURSED</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary?.total_amount || 0)}</p>
            <p className="text-sm text-gray-600 mt-1">Total Amount</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <span className="text-xs font-semibold text-gray-500">LEAKAGE</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary?.potential_leakage || 0)}</p>
            <p className="text-sm text-gray-600 mt-1">Potential Loss</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Network className="h-8 w-8 text-purple-600" />
              <span className="text-xs font-semibold text-gray-500">NETWORKS</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fraudNetworks.length}</p>
            <p className="text-sm text-gray-600 mt-1">Fraud Networks</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* District Risk Analysis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">District Risk Analysis</h3>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={districtData.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="district" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'total_amount') return formatCurrency(value);
                    return value;
                  }}
                />
                <Legend />
                <Bar dataKey="high_risk_count" fill="#ef4444" name="High Risk Cases" />
                <Bar dataKey="total_beneficiaries" fill="#3b82f6" name="Total Beneficiaries" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detection Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Detection Trend</h3>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trends?.detection_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ fill: '#10b981', r: 4 }}
                  name="Cases Detected"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Risk Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Category Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={districtData.map(d => ({ name: d.district, value: d.high_risk_count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {districtData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leakage Reduction Trend */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leakage Reduction Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trends?.leakage_trend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Potential Leakage"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Trend</span>
                <div className="flex items-center space-x-2">
                  {trends?.trend_direction === 'improving' ? (
                    <TrendingDown className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-red-600" />
                  )}
                  <span className={`text-lg font-bold ${trends?.trend_direction === 'improving' ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(trends?.percentage_change || 0)}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {trends?.trend_direction === 'improving' ? 'Leakage decreasing' : 'Leakage increasing'}
              </p>
            </div>
          </div>
        </div>

        {/* District Details Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">District-wise Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">High Risk</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {districtData.map((district, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{district.district}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              district.risk_score >= 0.6 ? 'bg-red-600' :
                              district.risk_score >= 0.4 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${district.risk_score * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{(district.risk_score * 100).toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        district.risk_category === 'high' ? 'bg-red-100 text-red-800' :
                        district.risk_category === 'medium' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {district.risk_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{district.total_beneficiaries}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">{district.high_risk_count}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(district.total_amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
