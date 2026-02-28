import React, { useState, useEffect } from 'react';
import { getBeneficiaries, getRiskAssessment } from '../api';

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBen, setSelectedBen] = useState(null);
  const [riskDetails, setRiskDetails] = useState(null);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const data = await getBeneficiaries();
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewRiskDetails = async (ben) => {
    setSelectedBen(ben);
    try {
      const risk = await getRiskAssessment(ben.beneficiary_id);
      setRiskDetails(risk);
    } catch (error) {
      console.error('Error loading risk details:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading beneficiaries...</div>;
  }

  return (
    <div className="beneficiaries-page">
      <h2 className="section-title">Beneficiaries</h2>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>District</th>
              <th>Scheme</th>
              <th>Amount</th>
              <th>Risk Score</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {beneficiaries.map(ben => (
              <tr key={ben.beneficiary_id}>
                <td>{ben.beneficiary_id}</td>
                <td>{ben.name}</td>
                <td>{ben.district}</td>
                <td>{ben.scheme}</td>
                <td>₹{ben.amount.toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${ben.risk_category}`}>
                    {(ben.risk_score * 100).toFixed(0)}%
                  </span>
                </td>
                <td>
                  {ben.is_duplicate && <span className="badge badge-critical">Duplicate</span>}
                  {ben.is_flagged && <span className="badge badge-high">Flagged</span>}
                  {!ben.is_duplicate && !ben.is_flagged && <span className="badge badge-low">Normal</span>}
                </td>
                <td>
                  <button 
                    className="btn btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '12px' }}
                    onClick={() => viewRiskDetails(ben)}
                  >
                    View Risk
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedBen && riskDetails && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            background: 'white', 
            borderRadius: '8px', 
            padding: '30px', 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>Risk Assessment - {selectedBen.name}</h3>
              <button 
                onClick={() => { setSelectedBen(null); setRiskDetails(null); }}
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '20px', padding: '20px', background: '#f9fafb', borderRadius: '6px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Overall Risk Score</div>
              <div style={{ fontSize: '36px', fontWeight: '700', color: '#ef4444' }}>
                {(riskDetails.risk_score * 100).toFixed(0)}%
              </div>
              <span className={`badge badge-${riskDetails.risk_category}`}>{riskDetails.risk_category}</span>
            </div>

            <h4 style={{ marginBottom: '15px' }}>Risk Factors</h4>
            {riskDetails.factors.map((factor, idx) => (
              <div key={idx} style={{ marginBottom: '15px', padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>{factor.factor.replace(/_/g, ' ').toUpperCase()}</strong>
                  <span>{(factor.percentage).toFixed(1)}%</span>
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  {factor.explanation}
                </div>
                <div style={{ background: '#e5e7eb', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    background: '#ef4444', 
                    height: '100%', 
                    width: `${factor.percentage}%` 
                  }}></div>
                </div>
              </div>
            ))}

            <h4 style={{ marginTop: '20px', marginBottom: '15px' }}>Recommended Actions</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {riskDetails.recommended_actions.map((action, idx) => (
                <li key={idx} style={{ marginBottom: '8px', color: '#374151' }}>
                  {action.replace(/_/g, ' ').toUpperCase()}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Beneficiaries;
