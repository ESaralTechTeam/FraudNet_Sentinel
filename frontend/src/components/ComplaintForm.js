import React, { useState } from 'react';
import { submitComplaint, uploadComplaintAudio, uploadComplaintReport, createComplaint } from '../api';
import { FileText, CheckCircle, AlertCircle, Info, Send, User, Phone, MapPin, Shield, Upload, Mic, File, X } from 'lucide-react';

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
  const [audioFile, setAudioFile] = useState(null);
  const [reportFile, setReportFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [reportUrl, setReportUrl] = useState(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      setError('Please upload a valid audio file');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError('Audio file size must be less than 50MB');
      return;
    }

    setAudioFile(file);
    setError(null);

    try {
      setUploadingAudio(true);
      const response = await uploadComplaintAudio(file);
      setAudioUrl(response.audio_url);
    } catch (err) {
      setError(`Audio upload failed: ${err.message}`);
      setAudioFile(null);
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleReportUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Report file size must be less than 10MB');
      return;
    }

    setReportFile(file);
    setError(null);

    try {
      setUploadingReport(true);
      const response = await uploadComplaintReport(file);
      setReportUrl(response.report_url);
    } catch (err) {
      setError(`Report upload failed: ${err.message}`);
      setReportFile(null);
    } finally {
      setUploadingReport(false);
    }
  };

  const removeAudioFile = () => {
    setAudioFile(null);
    setAudioUrl(null);
  };

  const removeReportFile = () => {
    setReportFile(null);
    setReportUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      // If audio or report files are uploaded, use createComplaint endpoint
      if (audioUrl || reportUrl) {
        const response = await createComplaint(
          formData.subject_beneficiary_id || 'UNKNOWN',
          formData.description,
          audioUrl,
          reportUrl
        );
        setResult({
          complaint_id: response.complaint_id,
          status: 'submitted',
          message: response.message,
          transcription_job: response.transcription_job
        });
      } else {
        // Otherwise use submitComplaint endpoint
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
      }
      
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
      setAudioFile(null);
      setReportFile(null);
      setAudioUrl(null);
      setReportUrl(null);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  const complaintTypes = [
    { value: 'duplicate_beneficiary', label: 'Duplicate Beneficiary' },
    { value: 'ghost_beneficiary', label: 'Ghost Beneficiary' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'bribery', label: 'Bribery/Corruption' },
    { value: 'wrong_amount', label: 'Wrong Amount' },
  ];

  if (submitted && result) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto fade-in">
        <div className="glass-card rounded-lg overflow-hidden scale-in">
          {/* Success Header */}
          <div className="bg-green-50 border-b border-green-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" strokeWidth={2} />
            </div>
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">Complaint Submitted Successfully</h3>
            <p className="text-sm text-neutral-600">Your complaint has been registered and will be reviewed by our team</p>
          </div>

          {/* Result Details */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="p-4 glass-card rounded-lg">
                <div className="text-xs font-medium text-neutral-600 mb-1">Complaint ID</div>
                <div className="text-base font-semibold text-neutral-900">{result.complaint_id}</div>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="text-xs font-medium text-neutral-600 mb-1">Status</div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                  {result.status}
                </span>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="text-xs font-medium text-neutral-600 mb-1">Urgency Score</div>
                <div className="text-base font-semibold text-neutral-900">{(result.urgency_score * 100).toFixed(0)}%</div>
              </div>
              <div className="p-4 glass-card rounded-lg">
                <div className="text-xs font-medium text-neutral-600 mb-1">Predicted Type</div>
                <div className="text-sm font-medium text-neutral-900">{result.predicted_type}</div>
              </div>
            </div>

            <button 
              onClick={() => setSubmitted(false)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg btn-animate"
            >
              Submit Another Complaint
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary-600" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-semibold text-neutral-900">Submit Complaint</h1>
        </div>
        <p className="text-sm text-neutral-600">Report fraud, corruption, or irregularities in benefit distribution</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 slide-up">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form Card */}
      <div className="glass-card rounded-lg overflow-hidden mb-6">
        <form onSubmit={handleSubmit} className="p-8">
          {/* Complaint Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              Complaint Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complaintTypes.map(type => (
                <label
                  key={type.value}
                  className={`relative flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.complaint_type === type.value
                      ? 'border-primary-500 bg-primary-50 shadow-sm'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="complaint_type"
                    value={type.value}
                    checked={formData.complaint_type === type.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium text-neutral-900">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe the issue in detail..."
              required
              className="w-full px-4 py-3 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Beneficiary ID */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Beneficiary ID (if known)
            </label>
            <input
              type="text"
              name="subject_beneficiary_id"
              value={formData.subject_beneficiary_id}
              onChange={handleChange}
              placeholder="e.g., BEN001"
              className="w-full px-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Audio Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Audio Evidence (Optional)
            </label>
            {!audioFile ? (
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  disabled={uploadingAudio}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className={`flex items-center justify-center w-full px-4 py-8 glass-card rounded-lg border-2 border-dashed border-neutral-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all ${
                    uploadingAudio ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    {uploadingAudio ? (
                      <>
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full spinner mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-600">Uploading audio...</p>
                      </>
                    ) : (
                      <>
                        <Mic className="h-8 w-8 text-neutral-400 mx-auto mb-2" strokeWidth={2} />
                        <p className="text-sm font-medium text-neutral-900 mb-1">Click to upload audio</p>
                        <p className="text-xs text-neutral-500">MP3, WAV, M4A up to 50MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-green-200 bg-green-50/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Mic className="h-5 w-5 text-green-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{audioFile.name}</p>
                    <p className="text-xs text-neutral-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAudioFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* Report Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              Supporting Document (Optional)
            </label>
            {!reportFile ? (
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleReportUpload}
                  disabled={uploadingReport}
                  className="hidden"
                  id="report-upload"
                />
                <label
                  htmlFor="report-upload"
                  className={`flex items-center justify-center w-full px-4 py-8 glass-card rounded-lg border-2 border-dashed border-neutral-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50/30 transition-all ${
                    uploadingReport ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="text-center">
                    {uploadingReport ? (
                      <>
                        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full spinner mx-auto mb-2"></div>
                        <p className="text-sm text-neutral-600">Uploading document...</p>
                      </>
                    ) : (
                      <>
                        <File className="h-8 w-8 text-neutral-400 mx-auto mb-2" strokeWidth={2} />
                        <p className="text-sm font-medium text-neutral-900 mb-1">Click to upload document</p>
                        <p className="text-xs text-neutral-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                      </>
                    )}
                  </div>
                </label>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 glass-card rounded-lg border border-green-200 bg-green-50/30">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <File className="h-5 w-5 text-green-600" strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">{reportFile.name}</p>
                    <p className="text-xs text-neutral-500">{(reportFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeReportFile}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                District <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={2} />
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="Enter district name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-900 mb-2">
                Block
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={2} />
                <input
                  type="text"
                  name="block"
                  value={formData.block}
                  onChange={handleChange}
                  placeholder="Enter block name"
                  className="w-full pl-10 pr-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Anonymous Toggle */}
          <div className="mb-6 p-4 glass-card rounded-lg">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                name="is_anonymous"
                checked={formData.is_anonymous}
                onChange={handleChange}
                className="mt-0.5 w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="h-4 w-4 text-neutral-600" strokeWidth={2} />
                  <span className="text-sm font-medium text-neutral-900">Submit anonymously</span>
                </div>
                <p className="text-xs text-neutral-600">Your details will not be recorded or shared</p>
              </div>
            </label>
          </div>

          {/* Submitter Details */}
          {!formData.is_anonymous && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 slide-up">
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={2} />
                  <input
                    type="text"
                    name="submitter_name"
                    value={formData.submitter_name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  Your Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" strokeWidth={2} />
                  <input
                    type="tel"
                    name="submitter_phone"
                    value={formData.submitter_phone}
                    onChange={handleChange}
                    placeholder="+91XXXXXXXXXX"
                    className="w-full pl-10 pr-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 btn-animate"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spinner"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" strokeWidth={2} />
                <span>Submit Complaint</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Information Card */}
      <div className="glass-card rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Info className="h-4 w-4 text-blue-600" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-neutral-900 mb-3">Important Information</h4>
            <ul className="space-y-2 text-xs text-neutral-700">
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>All complaints are reviewed within 24 hours</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>You can track your complaint status using the Complaint ID</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Anonymous complaints are treated with equal priority</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>False complaints may result in legal action</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComplaintForm;
