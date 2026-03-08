import React, { useState, useEffect } from 'react';
import { getFraudNetworks } from '../api';
import { Network, Users, AlertTriangle, TrendingUp, FileText, Flag, Download } from 'lucide-react';

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

  const getPatternIcon = (pattern) => {
    const icons = {
      hub: '🔗',
      star: '⭐',
      chain: '🔗',
      cluster: '🎯'
    };
    return icons[pattern] || '🔍';
  };

  const getPatternGradient = (pattern) => {
    const gradients = {
      hub: 'from-red-500 to-pink-600',
      star: 'from-orange-500 to-red-600',
      chain: 'from-purple-500 to-pink-600',
      cluster: 'from-blue-500 to-purple-600'
    };
    return gradients[pattern] || 'from-gray-500 to-slate-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1800px] mx-auto fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fraud Network Detection</h1>
        <p className="text-sm text-gray-600">Identify and analyze suspicious beneficiary clusters</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card rounded-2xl p-6 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Network className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Networks Detected</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{stats?.total_networks || 0}</p>
          <p className="text-xs text-gray-500">Suspicious Clusters</p>
        </div>

        <div className="glass-card rounded-2xl p-6 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Beneficiaries Involved</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{stats?.total_beneficiaries || 0}</p>
          <p className="text-xs text-gray-500">In Networks</p>
        </div>

        <div className="glass-card rounded-2xl p-6 card-hover group">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <TrendingUp className="h-6 w-6 text-white" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">Pattern Types</p>
          <p className="text-4xl font-bold text-gray-900 mb-1">{stats?.patterns?.shared_resources || 0}</p>
          <p className="text-xs text-gray-500">Shared Resources</p>
        </div>
      </div>

      {/* Networks List */}
      <div className="space-y-6 mb-8">
        {networks.length === 0 ? (
          <div className="glass-card rounded-2xl p-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Network className="h-10 w-10 text-indigo-600" strokeWidth={2} />
            </div>
            <p className="text-base font-semibold text-gray-900 mb-2">No fraud networks detected</p>
            <p className="text-sm text-gray-600">The system is monitoring for suspicious patterns</p>
          </div>
        ) : (
          networks.map((network, idx) => (
            <div key={idx} className="glass-card rounded-2xl overflow-hidden card-hover slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
              {/* Network Header with Gradient */}
              <div className={`bg-gradient-to-r ${getPatternGradient(network.pattern)} p-6`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="text-5xl opacity-80">{getPatternIcon(network.pattern)}</div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        Network #{idx + 1} - {network.pattern.toUpperCase()} Pattern
                      </h3>
                      <p className="text-white/90 text-sm">
                        {network.size} beneficiaries sharing {network.resource_type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right bg-white/20 backdrop-blur-xl rounded-xl px-5 py-3 border border-white/30">
                    <div className="text-4xl font-bold text-white">
                      {(network.risk_score * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-white/80 font-medium mt-1">Risk Score</div>
                  </div>
                </div>
              </div>

              {/* Network Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 glass-card rounded-xl">
                    <div className="text-xs font-medium text-gray-600 mb-1">Shared Resource</div>
                    <div className="text-sm font-semibold text-gray-900">{network.shared_resource}</div>
                  </div>
                  <div className="p-4 glass-card rounded-xl">
                    <div className="text-xs font-medium text-gray-600 mb-1">Total Amount</div>
                    <div className="text-sm font-semibold text-gray-900">₹{network.total_amount.toLocaleString()}</div>
                  </div>
                  <div className="p-4 glass-card rounded-xl">
                    <div className="text-xs font-medium text-gray-600 mb-1">Network Size</div>
                    <div className="text-sm font-semibold text-gray-900">{network.size} beneficiaries</div>
                  </div>
                </div>

                {/* Connected Beneficiaries */}
                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2 text-indigo-600" strokeWidth={2} />
                    Connected Beneficiaries
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {network.beneficiary_ids.map(benId => (
                      <span key={benId} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-semibold rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                        {benId}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 btn-animate">
                    <FileText className="h-4 w-4" strokeWidth={2} />
                    <span>Investigate</span>
                  </button>
                  <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200 btn-animate">
                    <Flag className="h-4 w-4" strokeWidth={2} />
                    <span>Flag All</span>
                  </button>
                  <button className="flex items-center space-x-2 px-5 py-2.5 glass-card hover:bg-white/60 text-gray-700 font-medium rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
                    <Download className="h-4 w-4" strokeWidth={2} />
                    <span>Export</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pattern Explanations */}
      <div className="glass-card rounded-2xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-orange-100 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-orange-600" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Network Patterns</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100 card-hover">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Hub Pattern</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              Multiple beneficiaries sharing the same resource (bank account, address, or phone number). 
              This is the most common fraud pattern indicating coordinated fraud.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100 card-hover">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Star Pattern</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              One officer approving many suspicious beneficiaries. Indicates potential officer involvement 
              in fraud or corruption.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 card-hover">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Chain Pattern</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
              Sequential approvals through multiple officers. May indicate organized fraud network 
              spanning multiple administrative levels.
            </p>
          </div>

          <div className="p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 card-hover">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Cluster Pattern</h4>
            <p className="text-xs text-gray-700 leading-relaxed">
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
