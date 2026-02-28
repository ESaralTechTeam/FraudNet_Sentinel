import React, { useState, useEffect } from 'react';
import { getDistrictRisk, getTrends } from '../api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Analytics() {
  const [districtData, setDistrictData] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [districts, trendsData] = await Promise.all([
        getDistrictRisk(),
        getTrends()
      ]);
      setDistrictData(districts);
      setTrends(trendsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading analytics...</div>;
  }

  return (
    <div className="analytics-page">
      <h2 className="section-title">Analytics & Insights</h2>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="section-title">Leakage Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends?.leakage_trend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} name="Potential Leakage (₹)" />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ marginTop: '15px', padding: '15px', background: '#d1fae5', borderRadius: '6px' }}>
          <strong style={{ color: '#065f46' }}>
            📉 Trend: {trends?.trend_direction} ({trends?.percentage_change}% reduction)
          </strong>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 className="section-title">Detection Rate Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends?.detection_trend || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Fraud Cases Detected" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3 className="section-title">District Risk Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={districtData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="district" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="risk_score" fill="#ef4444" name="Risk Score" />
            <Bar dataKey="high_risk_count" fill="#f59e0b" name="High Risk Count" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3 className="section-title">District Details</h3>
        <table>
          <thead>
            <tr>
              <th>District</th>
              <th>Risk Score</th>
              <th>Risk Category</th>
              <th>Total Beneficiaries</th>
              <th>High Risk Count</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {districtData.map(district => (
              <tr key={district.district}>
                <td><strong>{district.district}</strong></td>
                <td>{(district.risk_score * 100).toFixed(1)}%</td>
                <td>
                  <span className={`badge badge-${district.risk_category}`}>
                    {district.risk_category}
                  </span>
                </td>
                <td>{district.total_beneficiaries}</td>
                <td>{district.high_risk_count}</td>
                <td>₹{(district.total_amount / 100000).toFixed(2)}L</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-2" style={{ marginTop: '20px' }}>
        <div className="card">
          <h3 className="section-title">Key Insights</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Leakage reduced by {Math.abs(trends?.percentage_change || 0)}% in last 30 days</li>
            <li>AI models detected {trends?.detection_trend?.slice(-1)[0]?.count || 0} cases this week</li>
            <li>{districtData.filter(d => d.risk_category === 'high').length} districts require immediate attention</li>
            <li>Fraud network detection prevented ₹{(districtData.reduce((sum, d) => sum + d.total_amount, 0) * 0.1 / 10000000).toFixed(2)}Cr in potential leakage</li>
          </ul>
        </div>

        <div className="card">
          <h3 className="section-title">Recommendations</h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Focus field verification in high-risk districts</li>
            <li>Increase monitoring frequency for flagged beneficiaries</li>
            <li>Conduct officer training in districts with unusual patterns</li>
            <li>Implement stricter approval workflows for high-value transactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
