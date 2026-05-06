import React, { useState } from 'react';
import GrievanceForm from './components/GrievanceForm';
import Dashboard from './components/Dashboard';
import TrackStatus from './components/TrackStatus';
import AadharLogin from './components/AadharLogin';
import { LayoutDashboard, Send, Search, LogOut } from 'lucide-react';

function App() {
  const [view, setView] = useState('citizen'); // 'citizen' or 'admin'
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="App">
        <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '0.5rem', borderRadius: '10px' }}>
              <Send size={20} color="white" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }} className="gradient-text">CivicAI</h2>
          </div>
        </nav>
        <AadharLogin onLogin={(token) => setIsAuthenticated(true)} />
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '0.5rem', borderRadius: '10px' }}>
            <Send size={20} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }} className="gradient-text">CivicAI</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={view === 'citizen' ? 'btn-primary' : 'glass'} 
            onClick={() => setView('citizen')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Send size={18} /> Report Issue
          </button>
          <button 
            className={view === 'track' ? 'btn-primary' : 'glass'} 
            onClick={() => setView('track')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <Search size={18} /> Track Status
          </button>
          <button 
            className={view === 'admin' ? 'btn-primary' : 'glass'} 
            onClick={() => setView('admin')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <LayoutDashboard size={18} /> Admin Panel
          </button>
          <button 
            className="glass" 
            onClick={() => setIsAuthenticated(false)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', color: '#ef4444' }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </nav>

      <main className="container">
        {view === 'citizen' ? (
          <div className="animate-fade-in">
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h1 style={{ fontSize: '3rem' }}>Report a <span className="gradient-text">Grievance</span></h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Our AI will automatically categorize and route your issue to the right department.</p>
            </header>
            <GrievanceForm />
          </div>
        ) : view === 'track' ? (
          <div className="animate-fade-in">
             <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
              <h1 style={{ fontSize: '2.5rem' }}>Track <span className="gradient-text">Grievance</span></h1>
              <p style={{ color: 'var(--text-muted)' }}>Enter your tracking ID to see the current status of your request.</p>
            </header>
            <TrackStatus />
          </div>
        ) : (
          <div className="animate-fade-in">
             <header style={{ marginBottom: '2rem' }}>
              <h1 style={{ fontSize: '2.5rem' }}>Admin <span className="gradient-text">Dashboard</span></h1>
              <p style={{ color: 'var(--text-muted)' }}>Monitor and resolve city-wide complaints in real-time.</p>
            </header>
            <Dashboard />
          </div>
        )}
      </main>
      
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 CivicAI Smart City Platform. Powered by Hugging Face Transformers.
      </footer>
    </div>
  );
}

export default App;
