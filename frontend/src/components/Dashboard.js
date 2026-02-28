import React, { useState, useEffect } from 'react';
import { getSummary, getAlerts } from '../api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, alertsData] = await Promise.all([
        getSummary(),
        getAlerts()
      ]);
      setSummary(summaryData);
      setAlerts(alertsData.alerts.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2 className="section-title">Dashboard Overview</h2>

      <div className="grid grid-4">
        <div className="stat-card">
          <h3>Total Beneficiaries</h3>
          <div className="value">{summary?.total_beneficiaries || 0}</div>
          <div className="label">Registered</div>
        </div>

        <div className="stat-card critical">
          <h3>High Risk</h3>
          <div className="value">{summary?.high_risk_count || 0}</div>
          <div className="label">Flagged Beneficiaries</div>
        </div>

        <div className="stat-card high">
          <h3>Active Alerts</h3>
          <div className="value">{summary?.active_alerts || 0}</div>
          <div className="label">Requires Action</div>
        </div>

        <div className="stat-card success">
          <h3>Potential Leakage</h3>
          <div className="value">₹{(summary?.potential_leakage / 100000 || 0).toFixed(1)}L</div>
          <div className="label">Prevented</div>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginTop: '30px' }}>
        <div className="card">
          <h3 className="section-title">Recent Alerts</h3>
          {alerts.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No active alerts</p>
          ) : (
            alerts.map(alert => (
              <div key={alert.alert_id} className={`alert-item ${alert.severity}`}>
                <div className="alert-header">
                  <span className="alert-title">{alert.title}</span>
                  <span className={`badge badge-${alert.severity}`}>{alert.severity}</span>
                </div>
                <div className="alert-description">{alert.description}</div>
                <div className="alert-meta">
                  <span>ID: {alert.beneficiary_id}</span>
                  <span>Risk: {(alert.risk_score * 100).toFixed(0)}%</span>
                  <span>{new Date(alert.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="card">
          <h3 className="section-title">Alert Breakdown</h3>
          <div style={{ padding: '20px 0' }}>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Critical</span>
                <span className="badge badge-critical">{summary?.alert_breakdown?.critical || 0}</span>
              </div>
              <div style={{ background: '#fee2e2', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  background: '#ef4444', 
                  height: '100%', 
                  width: `${(summary?.alert_breakdown?.critical / summary?.active_alerts * 100) || 0}%` 
                }}></div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>High</span>
                <span className="badge badge-high">{summary?.alert_breakdown?.high || 0}</span>
              </div>
              <div style={{ background: '#fed7aa', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  background: '#f59e0b', 
                  height: '100%', 
                  width: `${(summary?.alert_breakdown?.high / summary?.active_alerts * 100) || 0}%` 
                }}></div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Medium</span>
                <span className="badge badge-medium">{summary?.alert_breakdown?.medium || 0}</span>
              </div>
              <div style={{ background: '#fef3c7', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ 
                  background: '#eab308', 
                  height: '100%', 
                  width: `${(summary?.alert_breakdown?.medium / summary?.active_alerts * 100) || 0}%` 
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3 className="section-title">Quick Stats</h3>
        <div className="grid grid-3">
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>Duplicate Beneficiaries</p>
            <p style={{ fontSize: '24px', fontWeight: '600' }}>{summary?.duplicate_count || 0}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>Flagged for Review</p>
            <p style={{ fontSize: '24px', fontWeight: '600' }}>{summary?.flagged_count || 0}</p>
          </div>
          <div>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '5px' }}>Total Disbursed</p>
            <p style={{ fontSize: '24px', fontWeight: '600' }}>₹{(summary?.total_amount / 10000000 || 0).toFixed(2)}Cr</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
