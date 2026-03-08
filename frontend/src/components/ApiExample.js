import React, { useState, useEffect } from 'react';
import {
  getComplaints,
  getAlerts,
  getBeneficiaries,
  uploadComplaintAudio,
  createComplaint,
  submitComplaint,
  getSummary
} from '../api';

/**
 * Example component demonstrating API service usage
 * This shows best practices for integrating the API layer
 */
function ApiExample() {
  const [complaints, setComplaints] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example 1: Fetch data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch multiple endpoints in parallel
      const [complaintsData, alertsData, beneficiariesData, summaryData] = await Promise.all([
        getComplaints(),
        getAlerts(),
        getBeneficiaries(),
        getSummary()
      ]);

      setComplaints(complaintsData);
      setAlerts(alertsData);
      setBeneficiaries(beneficiariesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Example 2: Handle file upload
  const handleAudioUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const result = await uploadComplaintAudio(file);
      console.log('Audio uploaded:', result.audio_url);
      alert('Audio uploaded successfully!');
    } catch (err) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 3: Submit form data
  const handleSubmitComplaint = async () => {
    const complaintData = {
      complaint_type: 'duplicate_beneficiary',
      description: 'Test complaint description',
      subject_beneficiary_id: 'BEN-001',
      location: {
        district: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      },
      submitter_name: 'Test User',
      submitter_phone: '+919876543210',
      is_anonymous: false
    };

    try {
      setLoading(true);
      const result = await submitComplaint(complaintData);
      console.log('Complaint submitted:', result);
      alert(`Complaint created: ${result.complaint_id}`);
      // Refresh complaints list
      await fetchDashboardData();
    } catch (err) {
      alert(`Submission failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Example 4: Create complaint with audio
  const handleCreateComplaintWithAudio = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);

      // Step 1: Upload audio file
      const uploadResult = await uploadComplaintAudio(file);
      console.log('Audio uploaded:', uploadResult.audio_url);

      // Step 2: Create complaint record
      const complaintResult = await createComplaint(
        'BEN-001',
        'Complaint with audio recording',
        uploadResult.audio_url,
        null
      );

      console.log('Complaint created:', complaintResult);
      alert(`Complaint created: ${complaintResult.complaint_id}`);
      
      // Refresh data
      await fetchDashboardData();
    } catch (err) {
      alert(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !complaints.length) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">API Integration Example</h1>

      {/* Summary Section */}
      {summary && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">System Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-600">Total Beneficiaries</p>
              <p className="text-2xl font-bold">{summary.total_beneficiaries}</p>
            </div>
            <div>
              <p className="text-gray-600">High Risk</p>
              <p className="text-2xl font-bold text-red-600">{summary.high_risk_count}</p>
            </div>
            <div>
              <p className="text-gray-600">Active Alerts</p>
              <p className="text-2xl font-bold text-orange-600">{summary.active_alerts}</p>
            </div>
            <div>
              <p className="text-gray-600">Potential Leakage</p>
              <p className="text-2xl font-bold text-red-600">
                ₹{summary.potential_leakage?.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Complaints Section */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Complaints ({complaints.length})</h2>
          <button
            onClick={handleSubmitComplaint}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            Submit Test Complaint
          </button>
        </div>
        <div className="space-y-2">
          {complaints.slice(0, 5).map((complaint) => (
            <div key={complaint.complaint_id} className="p-3 border rounded">
              <p className="font-semibold">{complaint.complaint_id}</p>
              <p className="text-sm text-gray-600">{complaint.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">
            Alerts ({alerts.total})
          </h2>
          <div className="flex gap-4 mb-4">
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded">
              Critical: {alerts.summary.critical}
            </span>
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded">
              High: {alerts.summary.high}
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded">
              Medium: {alerts.summary.medium}
            </span>
          </div>
          <div className="space-y-2">
            {alerts.alerts.slice(0, 5).map((alert) => (
              <div key={alert.alert_id} className="p-3 border rounded">
                <p className="font-semibold">{alert.title}</p>
                <p className="text-sm text-gray-600">{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Upload Examples */}
      <div className="mb-8 p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">File Upload Examples</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Audio Only
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Audio & Create Complaint
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={handleCreateComplaintWithAudio}
              disabled={loading}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
            />
          </div>
        </div>
      </div>

      {/* Beneficiaries Section */}
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">
          Beneficiaries ({beneficiaries.length})
        </h2>
        <div className="space-y-2">
          {beneficiaries.slice(0, 5).map((beneficiary) => (
            <div key={beneficiary.beneficiary_id} className="p-3 border rounded">
              <p className="font-semibold">{beneficiary.name}</p>
              <p className="text-sm text-gray-600">
                {beneficiary.district}, {beneficiary.state}
              </p>
              <p className="text-sm">
                Risk: <span className={`font-semibold ${
                  beneficiary.risk_category === 'critical' ? 'text-red-600' :
                  beneficiary.risk_category === 'high' ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {beneficiary.risk_category || 'low'}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
        >
          {loading ? 'Refreshing...' : 'Refresh All Data'}
        </button>
      </div>
    </div>
  );
}

export default ApiExample;
