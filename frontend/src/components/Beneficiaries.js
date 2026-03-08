import React, { useState, useEffect } from 'react';
import { getBeneficiaries, getRiskAssessment } from '../api';
import { Search, Filter, Eye, X, TrendingUp, AlertCircle } from 'lucide-react';

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBen, setSelectedBen] = useState(null);
  const [riskDetails, setRiskDetails] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('all');

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

  const getRiskColor = (category) => {
    const colors = {
      critical: 'text-red-700 bg-red-50 border-red-200',
      high: 'text-orange-700 bg-orange-50 border-orange-200',
      medium: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      low: 'text-green-700 bg-green-50 border-green-200',
    };
    return colors[category] || 'text-neutral-700 bg-neutral-50 border-neutral-200';
  };

  const filteredBeneficiaries = beneficiaries.filter(ben => {
    const matchesSearch = ben.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ben.beneficiary_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRisk === 'all' || ben.risk_category === filterRisk;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Beneficiaries</h1>
        <p className="text-sm text-gray-600">Monitor and assess beneficiary risk profiles</p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={2} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" strokeWidth={2} />
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="pl-10 pr-10 py-2.5 text-sm glass-card rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none cursor-pointer transition-all"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-lg overflow-hidden card-hover">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Scheme</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Risk Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50">
              {filteredBeneficiaries.map((ben) => (
                <tr key={ben.beneficiary_id} className="hover:bg-white/40">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{ben.beneficiary_id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{ben.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ben.district}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{ben.scheme}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">₹{ben.amount.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${getRiskColor(ben.risk_category)}`}>
                      {(ben.risk_score * 100).toFixed(0)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {ben.is_duplicate && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          Duplicate
                        </span>
                      )}
                      {ben.is_flagged && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                          Flagged
                        </span>
                      )}
                      {!ben.is_duplicate && !ben.is_flagged && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Normal
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewRiskDetails(ben)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-medium rounded-lg btn-animate shadow-sm"
                    >
                      <Eye className="h-4 w-4" strokeWidth={2} />
                      <span>View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Details Modal */}
      {selectedBen && riskDetails && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 fade-in">
          <div className="glass-card rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-auto scale-in">
            {/* Modal Header */}
            <div className="sticky top-0 glass border-b border-white/20 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">Risk Assessment</h3>
                <p className="text-sm text-neutral-600 mt-0.5">{selectedBen.name}</p>
              </div>
              <button
                onClick={() => { setSelectedBen(null); setRiskDetails(null); }}
                className="p-2 hover:bg-white/50 rounded-lg transition-all"
              >
                <X className="h-5 w-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Risk Score */}
              <div className="mb-6 p-6 glass-card rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-neutral-600 uppercase tracking-wider mb-2">Overall Risk Score</div>
                    <div className="text-4xl font-semibold text-neutral-900">
                      {(riskDetails.risk_score * 100).toFixed(0)}%
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold border ${getRiskColor(riskDetails.risk_category)}`}>
                    {riskDetails.risk_category.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Risk Factors */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-neutral-600" strokeWidth={2} />
                  <h4 className="text-sm font-semibold text-neutral-900">Risk Factors</h4>
                </div>
                <div className="space-y-3">
                  {riskDetails.factors.map((factor, idx) => (
                    <div key={idx} className="p-4 glass-card rounded-lg slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-900">
                          {factor.factor.replace(/_/g, ' ').toUpperCase()}
                        </span>
                        <span className="text-sm font-semibold text-neutral-900">{factor.percentage.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-neutral-600 mb-3">{factor.explanation}</p>
                      <div className="relative h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-primary-600 rounded-full"
                          style={{ width: `${factor.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Actions */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-neutral-600" strokeWidth={2} />
                  <h4 className="text-sm font-semibold text-neutral-900">Recommended Actions</h4>
                </div>
                <div className="space-y-2">
                  {riskDetails.recommended_actions.map((action, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-sm text-neutral-700">
                        {action.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Beneficiaries;
