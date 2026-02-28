import React, { useState } from 'react';
import { submitComplaint } from '../api';

function ComplaintForm() {
  const [formData, setFormData] = useState({
    complaint_type: 'duplicate_beneficiary',
    description: '',
    subject_beneficiary_id: '',
    district: '',
    block: '',
    submitter_name: '',
    submitter_phone: '',
    is_anonymous: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const complaint = {
        complaint_type: formData.complaint_type,
        description: formData.description,
        subject_beneficiary_id: formData.subject_beneficiary_id || null,
        location: {
          district: formData.district,
          block: formData.block || null
        },
        submitter_name: formData.is_anonymous ? null : formData.submitter_name,
        submitter_phone: formData.is_anonymous ? null : formData.submitter_phone,
        is_anonymous: formData.is_anonymous
      };

      const response = await submitComplaint(complaint);
      setResult(response);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        complaint_type: 'duplicate_beneficiary',
        description: '',
        subject_beneficiary_id: '',
        district: '',
        block: '',
        submitter_name: '',
        submitter_phone: '',
        is_anonymous: false
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit complaint');
    }
  };

  if (submitted && result) {
    return (
      <div className="complaint-form">
        <div className="card">
          <div className="success">
            <h3>✅ Complaint Submitted Successfully</h3>
            <p style={{ marginTop: '10px' }}>Your complaint has been registered and will be reviewed by our team.</p>
          </div>

          <div style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '6px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Complaint ID:</strong> {result.complaint_id}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Status:</strong> <span className="badge badge-medium">{result.status}</span>
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Urgency Score:</strong> {(result.urgency_score * 100).toFixed(0)}%
            </div>
            <div>
              <strong>Predicted Type:</strong> {result.predicted_type}
            </div>
          </div>

          <button 
            className="btn btn-primary" 
            style={{ marginTop: '20px' }}
            onClick={() => setSubmitted(false)}
          >
            Submit Another Complaint
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="complaint-form">
      <h2 className="section-title">Submit Complaint</h2>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Complaint Type *</label>
            <select 
              name="complaint_type" 
              value={formData.complaint_type} 
              onChange={handleChange}
              required
            >
              <option value="duplicate_beneficiary">Duplicate Beneficiary</option>
              <option value="ghost_beneficiary">Ghost Beneficiary</option>
              <option value="fraud">Fraud</option>
              <option value="bribery">Bribery/Corruption</option>
              <option value="wrong_amount">Wrong Amount</option>
            </select>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              rows="5"
              placeholder="Describe the issue in detail..."
              required
            />
          </div>

          <div className="form-group">
            <label>Beneficiary ID (if known)</label>
            <input 
              type="text" 
              name="subject_beneficiary_id" 
              value={formData.subject_beneficiary_id} 
              onChange={handleChange}
              placeholder="e.g., BEN001"
            />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label>District *</label>
              <input 
                type="text" 
                name="district" 
                value={formData.district} 
                onChange={handleChange}
                placeholder="Enter district name"
                required
              />
            </div>

            <div className="form-group">
              <label>Block</label>
              <input 
                type="text" 
                name="block" 
                value={formData.block} 
                onChange={handleChange}
                placeholder="Enter block name"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                name="is_anonymous" 
                checked={formData.is_anonymous} 
                onChange={handleChange}
                style={{ width: 'auto', marginRight: '10px' }}
              />
              <span>Submit anonymously (your details will not be recorded)</span>
            </label>
          </div>

          {!formData.is_anonymous && (
            <div className="grid grid-2">
              <div className="form-group">
                <label>Your Name</label>
                <input 
                  type="text" 
                  name="submitter_name" 
                  value={formData.submitter_name} 
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Your Phone</label>
                <input 
                  type="tel" 
                  name="submitter_phone" 
                  value={formData.submitter_phone} 
                  onChange={handleChange}
                  placeholder="+91XXXXXXXXXX"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            Submit Complaint
          </button>
        </form>
      </div>

      <div className="card" style={{ marginTop: '20px', background: '#eff6ff' }}>
        <h4 style={{ marginBottom: '10px', color: '#1e40af' }}>ℹ️ Information</h4>
        <ul style={{ paddingLeft: '20px', color: '#1e40af' }}>
          <li>All complaints are reviewed within 24 hours</li>
          <li>You can track your complaint status using the Complaint ID</li>
          <li>Anonymous complaints are treated with equal priority</li>
          <li>False complaints may result in legal action</li>
        </ul>
      </div>
    </div>
  );
}

export default ComplaintForm;
