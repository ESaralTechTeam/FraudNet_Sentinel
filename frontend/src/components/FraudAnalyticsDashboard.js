import React, { useState, useEffect } from 'react';
import { getSummary, getDistrictRisk, getComplaints, getTrends, getBeneficiaries } from '../api';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  AreaChart, Area, ComposedChart, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, MapPin, AlertTriangle, 
  PieChart as PieChartIcon, BarChart3, Activity, 
  Download, RefreshCw, Calendar, Filter
} from 'lucide-react';

const FraudAnalyticsDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [districtData, setDistrictData] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [trends, setTrends] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [summaryData, districts, complaintsData, trendsData, beneficiariesData] = await Promise.all([
        getSummary(),
        getDistrictRisk(),
        getComplaints(),
        getTrends(),
        getBeneficiaries()
      ]);
      
      setSummary(summaryData);
      setDistrictData(districts);
      setComplaints(complaintsData || []);
      setTrends(trendsData);
      setBeneficiaries(beneficiariesData || []);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare fraud cases over time data
  const getFraudCasesOverTime = () => {
    if (!trends?.detection_trend) return [];
    
    return trends.detection_trend.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      cases: item.count,
      cumulative: trends.detection_trend
        .slice(0, trends.detection_trend.indexOf(item) + 1)
        .reduce((sum, i) => sum + i.count, 0)
    }));
  };

  // Prepare high risk districts data
  const getHighRiskDistricts = () => {
    return districtData
      .sort((a, b) => b.risk_score - a.risk_score)
      .slice(0, 10)
      .map(d => ({
        district: d.district,
        riskScore: (d.risk_score * 100).toFixed(1),
        highRiskCount: d.high_risk_count,
        totalBeneficiaries: d.total_beneficiaries,
        riskPercentage: ((d.high_risk_count / d.total_beneficiaries) * 100).toFixed(1)
      }));
  };

  // Prepare complaint category distribution
  const getComplaintDistribution = () => {
    const categories = {};
    complaints.forEach(c => {
      const type = c.complaint_type || 'other';
      categories[type] = (categories[type] || 0) + 1;
    });

    return Object.entries(categories).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value,
      percentage: ((value / complaints.length) * 100).toFixed(1)
    }));
  };

  // Prepare fraud score histogram
  const getFraudScoreHistogram = () => {
    const bins = [
      { range: '0-20%', min: 0, max: 0.2, count: 0 },
      { range: '20-40%', min: 0.2, max: 0.4, count: 0 },
      { range: '40-60%', min: 0.4, max: 0.6, count: 0 },
      { range: '60-80%', min: 0.6, max: 0.8, count: 0 },
      { range: '80-100%', min: 0.8, max: 1.0, count: 0 }
    ];

    beneficiaries.forEach(ben => {
      const score = ben.risk_score || 0;
      const bin = bins.find(b => score >= b.min && score < b.max) || bins[bins.length - 1];
      bin.count++;
    });

    return bins;
  };

  const COLORS = {
    primary: '#003d82',
    secondary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6'
  };

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gov-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const fraudCasesData = getFraudCasesOverTime();
  const highRiskDistricts = getHighRiskDistricts();
  const complaintDistribution = getComplaintDistribution();
  const fraudScoreHistogram = getFraudScoreHistogram();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Activity className="h-8 w-8 mr-3 text-gov-blue" />
                Fraud Analytics Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-600">Comprehensive fraud detection insights and trends</p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
              <button
                onClick={loadAnalyticsData}
                className="px-4 py-2 bg-gov-blue text-white rounded-lg hover:bg-gov-darkblue transition-colors flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="h-8 w-8 opacity-80" />
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">TOTAL</span>
            </div>
            <p className="text-3xl font-bold">{summary?.total_beneficiaries || 0}</p>
            <p className="text-sm opacity-90 mt-1">Total Cases</p>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-8 w-8 opacity-80" />
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">HIGH RISK</span>
            </div>
            <p className="text-3xl font-bold">{summary?.high_risk_count || 0}</p>
            <p className="text-sm opacity-90 mt-1">Fraud Cases</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 opacity-80" />
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">LEAKAGE</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary?.potential_leakage || 0)}</p>
            <p className="text-sm opacity-90 mt-1">Potential Loss</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="h-8 w-8 opacity-80" />
              <span className="text-xs font-semibold bg-white bg-opacity-20 px-2 py-1 rounded">TREND</span>
            </div>
            <p className="text-3xl font-bold">{Math.abs(trends?.percentage_change || 0)}%</p>
            <p className="text-sm opacity-90 mt-1">
              {trends?.trend_direction === 'improving' ? 'Decreasing' : 'Increasing'}
            </p>
          </div>
        </div>

        {/* Chart Row 1: Fraud Cases Over Time */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Fraud Cases Over Time</h3>
                <p className="text-sm text-gray-500 mt-1">Detection trend and cumulative cases</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Daily Cases</span>
                </div>
                <div className="flex items-center ml-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Cumulative</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={fraudCasesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Daily Cases', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Cumulative', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  yAxisId="left"
                  dataKey="cases" 
                  fill={COLORS.danger} 
                  name="Daily Cases"
                  radius={[8, 8, 0, 0]}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke={COLORS.secondary} 
                  strokeWidth={3}
                  dot={{ fill: COLORS.secondary, r: 4 }}
                  name="Cumulative Cases"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Complaint Category Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Complaint Categories</h3>
                <p className="text-sm text-gray-500 mt-1">Distribution by type</p>
              </div>
              <PieChartIcon className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={complaintDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complaintDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {complaintDistribution.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: PIE_COLORS[index] }}
                    ></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Row 2: High Risk Districts & Fraud Score Histogram */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* High Risk Districts */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">High Risk Districts</h3>
                <p className="text-sm text-gray-500 mt-1">Top 10 districts by risk score</p>
              </div>
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={highRiskDistricts}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  type="number"
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                />
                <YAxis 
                  type="category"
                  dataKey="district" 
                  tick={{ fontSize: 11 }}
                  stroke="#6b7280"
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="riskScore" 
                  fill={COLORS.danger}
                  name="Risk Score (%)"
                  radius={[0, 8, 8, 0]}
                >
                  {highRiskDistricts.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        entry.riskScore >= 70 ? COLORS.danger :
                        entry.riskScore >= 50 ? COLORS.warning :
                        COLORS.success
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Fraud Score Histogram */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Fraud Score Distribution</h3>
                <p className="text-sm text-gray-500 mt-1">Histogram of risk scores</p>
              </div>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={fraudScoreHistogram}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Risk Score Range', position: 'insideBottom', offset: -5, style: { fontSize: 12 } }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  stroke="#6b7280"
                  label={{ value: 'Number of Cases', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="count" 
                  fill={COLORS.secondary}
                  name="Cases"
                  radius={[8, 8, 0, 0]}
                >
                  {fraudScoreHistogram.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        index === 4 ? COLORS.danger :
                        index === 3 ? COLORS.warning :
                        index === 2 ? COLORS.secondary :
                        COLORS.success
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Details Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">District Risk Analysis</h3>
              <p className="text-sm text-gray-500 mt-1">Detailed breakdown by district</p>
            </div>
            <button className="px-3 py-1 text-sm text-gov-blue hover:bg-blue-50 rounded-lg transition-colors">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">District</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">High Risk Cases</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Beneficiaries</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {highRiskDistricts.slice(0, 5).map((district, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {district.district}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              district.riskScore >= 70 ? 'bg-red-600' :
                              district.riskScore >= 50 ? 'bg-orange-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${district.riskScore}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{district.riskScore}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600">
                      {district.highRiskCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {district.totalBeneficiaries}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        district.riskPercentage >= 30 ? 'bg-red-100 text-red-800' :
                        district.riskPercentage >= 15 ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {district.riskPercentage}%
                      </span>
                    </td>
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

export default FraudAnalyticsDashboard;
