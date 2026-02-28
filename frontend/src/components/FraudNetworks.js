import React, { useState, useEffect } from 'react';
import { getFraudNetworks } from '../api';

function FraudNetworks() {
  const [networks, setNetworks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNetworks();
  }, []);

  const loadNetworks = async () => {
    try {
      const data = await getFraudNetworks();
      setNetworks(data.networks);
      setStats({
        total_networks: data.total_networks,
        total_beneficiaries: data.total_beneficiaries_involved,
        patterns: data.patterns
      });
    } catch (error) {
      console.error('Error loading fraud networks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading fraud networks...</div>;
  }

  return (
    <div className="fraud-networks-page">
      <h2 className="section-title">Fraud Network Detection</h2>

      <div className="grid grid-3" style={{ marginBottom: '30px' }}>
        <div className="stat-card critical">
          <h3>Networks Detected</h3>
          <div className="value">{stats?.total_networks || 0}</div>
          <div className="label">Suspicious Clusters</div>
        </div>

        <div className="stat-card high">
          <h3>Beneficiaries Involved</h3>
          <div className="value">{stats?.total_beneficiaries || 0}</div>
          <div className="label">In Networks</div>
        </div>

        <div className="stat-card">
          <h3>Pattern Types</h3>
          <div className="value">{stats?.patterns?.shared_resources || 0}</div>
          <div className="label">Shared Resources</div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Detected Networks</h3>
        
        {networks.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>
            No fraud networks detected
          </p>
        ) : (
          <div>
            {networks.map((network, idx) => (
              <div key={idx} style={{ 
                marginBottom: '20px', 
                padding: '20px', 
                background: '#fef2f2', 
                borderRadius: '8px',
                border: '2px solid #fecaca'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '5px' }}>
                      Network #{idx + 1} - {network.pattern.toUpperCase()} Pattern
                    </h4>
                    <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
                      {network.size} beneficiaries sharing {network.resource_type}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#ef4444' }}>
                      {(network.risk_score * 100).toFixed(0)}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Risk Score</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', padding: '15px', background: 'white', borderRadius: '6px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Shared Resource:</span>
                    <div style={{ fontWeight: '500', marginTop: '3px' }}>{network.shared_resource}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Total Amount:</span>
                    <div style={{ fontWeight: '500', marginTop: '3px' }}>₹{network.total_amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Network Size:</span>
                    <div style={{ fontWeight: '500', marginTop: '3px' }}>{network.size} beneficiaries</div>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
                    Connected Beneficiaries:
                  </strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {network.beneficiary_ids.map(benId => (
                      <span key={benId} className="badge badge-critical">
                        {benId}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn btn-primary">Investigate Network</button>
                  <button className="btn btn-danger">Flag All</button>
                  <button className="btn" style={{ background: '#6b7280', color: 'white' }}>
                    Export Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3 className="section-title">Network Patterns Explained</h3>
        <div className="grid grid-2">
          <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '10px' }}>🔗 Hub Pattern</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Multiple beneficiaries sharing the same resource (bank account, address, or phone number). 
              This is the most common fraud pattern indicating coordinated fraud.
            </p>
          </div>
          <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '10px' }}>⭐ Star Pattern</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              One officer approving many suspicious beneficiaries. Indicates potential officer involvement 
              in fraud or corruption.
            </p>
          </div>
          <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '10px' }}>🔗 Chain Pattern</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Sequential approvals through multiple officers. May indicate organized fraud network 
              spanning multiple administrative levels.
            </p>
          </div>
          <div style={{ padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
            <h4 style={{ marginBottom: '10px' }}>🎯 Cluster Pattern</h4>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Tightly connected groups of beneficiaries with multiple shared attributes. 
              Indicates sophisticated fraud operations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FraudNetworks;
