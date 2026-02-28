import React, { useState, useEffect } from 'react';
import { getAlerts } from '../api';

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      const severity = filter === 'all' ? null : filter;
      const data = await getAlerts(severity);
      setAlerts(data.alerts);
    } catch (error) {
      console.error('Error loading alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading alerts...</div>;
  }

  return (
    <div className="alerts-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Risk Alerts</h2>
        <div>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db' }}
          >
            <option value="all">All Alerts</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="card">
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No alerts found
          </p>
        </div>
      ) : (
        <div>
          {alerts.map(alert => (
            <div key={alert.alert_id} className="card" style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '18px' }}>{alert.title}</h3>
                    <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                  </div>
                  <p style={{ color: '#6b7280', margin: 0 }}>{alert.description}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                    {(alert.risk_score * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Risk Score</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Alert ID:</span>
                  <span style={{ marginLeft: '5px', fontWeight: '500' }}>{alert.alert_id}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Beneficiary:</span>
                  <span style={{ marginLeft: '5px', fontWeight: '500' }}>{alert.beneficiary_id}</span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Created:</span>
                  <span style={{ marginLeft: '5px', fontWeight: '500' }}>
                    {new Date(alert.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>Status:</span>
                  <span style={{ marginLeft: '5px', fontWeight: '500' }}>{alert.status}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary">View Details</button>
                <button className="btn" style={{ background: '#10b981', color: 'white' }}>
                  Investigate
                </button>
                <button className="btn" style={{ background: '#6b7280', color: 'white' }}>
                  Acknowledge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Alerts;
