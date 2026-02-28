import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Alerts from './components/Alerts';
import Beneficiaries from './components/Beneficiaries';
import ComplaintForm from './components/ComplaintForm';
import FraudNetworks from './components/FraudNetworks';
import Analytics from './components/Analytics';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Router>
      <div className="App">
        <header className="app-header">
          <div className="header-content">
            <h1>🛡️ Economic Leakage Detection</h1>
            <p>AI-Powered Governance Intelligence Platform</p>
          </div>
        </header>

        <nav className="app-nav">
          <Link to="/" className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </Link>
          <Link to="/alerts" className={activeTab === 'alerts' ? 'active' : ''} onClick={() => setActiveTab('alerts')}>
            Alerts
          </Link>
          <Link to="/beneficiaries" className={activeTab === 'beneficiaries' ? 'active' : ''} onClick={() => setActiveTab('beneficiaries')}>
            Beneficiaries
          </Link>
          <Link to="/fraud-networks" className={activeTab === 'networks' ? 'active' : ''} onClick={() => setActiveTab('networks')}>
            Fraud Networks
          </Link>
          <Link to="/analytics" className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>
            Analytics
          </Link>
          <Link to="/complaint" className={activeTab === 'complaint' ? 'active' : ''} onClick={() => setActiveTab('complaint')}>
            Submit Complaint
          </Link>
        </nav>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/beneficiaries" element={<Beneficiaries />} />
            <Route path="/fraud-networks" element={<FraudNetworks />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/complaint" element={<ComplaintForm />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>© 2026 Economic Leakage Detection Platform | Built for Transparent Governance</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
