import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GrievanceForm from './components/GrievanceForm';
import Dashboard from './components/Dashboard';
import TrackStatus from './components/TrackStatus';
import AadharLogin from './components/AadharLogin';
<<<<<<< HEAD
import UserDashboard from './components/UserDashboard';
import { LayoutDashboard, Send, Search, LogOut, PlusCircle } from 'lucide-react';

function App() {
  const [view, setView] = useState('citizen'); // 'citizen', 'track', 'admin', 'user-dashboard'
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAadhar, setUserAadhar] = useState(null);

  const handleLogin = (token, aadhar) => {
    setUserAadhar(aadhar);
    setIsAuthenticated(true);
    setView('user-dashboard'); // Go to dashboard after login
  };
=======
import { Send, Search, LogOut, LayoutDashboard, HelpCircle, FileText, CheckCircle, Home, ShieldCheck, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';

function App() {
  const [view, setView] = useState(() => localStorage.getItem('view') || 'home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [stats, setStats] = useState(null);
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/public-stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch public stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setView('report');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setView('home');
  };

  const handleViewChange = (newView) => {
    setView(newView);
    localStorage.setItem('view', newView);
    window.scrollTo(0, 0);
  };

  const InstitutionalHeader = () => (
    <header className="sticky-header">
      <div className="container header-inner">
        <div className="logo-section" onClick={() => handleViewChange('home')} style={{ cursor: 'pointer' }}>
          <div style={{ background: 'var(--gov-navy)', color: 'white', padding: '0.6rem', borderRadius: '4px' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0, lineHeight: 1 }}>JANSAHAYAK</h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Government of India</p>
          </div>
        </div>
        
        <nav className="nav-links">
          <div className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => handleViewChange('home')}>HOME</div>
          <div className={`nav-item ${view === 'report' ? 'active' : ''}`} onClick={() => handleViewChange('report')}>REPORT GRIEVANCE</div>
          <div className={`nav-item ${view === 'track' ? 'active' : ''}`} onClick={() => handleViewChange('track')}>TRACK STATUS</div>

          {isAuthenticated && (
            <div className={`nav-item ${view === 'admin' ? 'active' : ''}`} onClick={() => handleViewChange('admin')}>ADMIN</div>
          )}
        </nav>
<<<<<<< HEAD
        <AadharLogin onLogin={(token, aadhar) => handleLogin(token, aadhar)} />
=======

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="btn-gov-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>LOGOUT</button>
          ) : (
            <button onClick={() => handleViewChange('report')} className="btn-gov-primary" style={{ padding: '0.5rem 1.5rem', fontSize: '0.8rem' }}>LOGIN</button>
          )}
        </div>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
      </div>
    </header>
  );

  return (
    <div className="App">
<<<<<<< HEAD
      <nav className="glass" style={{ margin: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1rem', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '0.5rem', borderRadius: '10px' }}>
            <Send size={20} color="white" />
          </div>
          <h2 style={{ margin: 0, fontSize: '1.25rem' }} className="gradient-text">CivicAI</h2>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className={view === 'user-dashboard' ? 'btn-primary' : 'glass'} 
            onClick={() => setView('user-dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
          >
            <LayoutDashboard size={18} /> Dashboard
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
            <GrievanceForm userAadhar={userAadhar} onSuccess={() => setView('user-dashboard')} />
          </div>
        ) : view === 'user-dashboard' ? (
          <div className="animate-fade-in">
             <UserDashboard userAadhar={userAadhar} onReportIssue={() => setView('citizen')} />
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
=======
      <InstitutionalHeader />
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
      
      {view === 'home' ? (
        <HomePage 
          onReportGrievance={() => handleViewChange('report')} 
          onTrackStatus={() => handleViewChange('track')} 
          stats={stats}
        />
      ) : (
        <main className={view === 'admin' ? '' : 'container'} style={{ padding: view === 'admin' ? '0' : '4rem 0', minHeight: '60vh' }}>
          {!isAuthenticated && view === 'report' ? (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>Identity Verification</h2>
                <p style={{ color: 'var(--gov-text-muted)' }}>Please verify your identity via Aadhar to access citizen services.</p>
              </div>
              <AadharLogin onLogin={handleLogin} />
            </div>
          ) : (
            <>
              {view === 'report' && <GrievanceForm />}
              {view === 'track' && <TrackStatus />}
              {view === 'admin' && <Dashboard />}
            </>
          )}
        </main>
      )}

      <footer className="gov-footer">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
            <div>
              <div className="logo-section" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', color: 'var(--gov-navy)', padding: '0.4rem', borderRadius: '4px' }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ color: 'white', margin: 0 }}>JANSAHAYAK</h4>
              </div>
              <p style={{ color: '#cbd5e0', fontSize: '0.9rem', lineHeight: '1.8' }}>
                The AI-Powered Grievance Redressal System is a flagship initiative to ensure efficient, transparent, and timely resolution of public issues using cutting-edge technology.
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>QUICK LINKS</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  National Portal of India <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Digital India Mission <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  MyGov.in <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  RTI Online <ExternalLink size={12} />
                </a>
              </nav>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>HELP & SUPPORT</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <span onClick={() => handleViewChange('home')} style={{ color: '#cbd5e0', cursor: 'pointer' }}>About the Platform</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>Privacy Policy</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>Terms & Conditions</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>Help Desk</span>
              </nav>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>CONTACT US</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#cbd5e0', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Phone size={16} /> <span>1800-111-XXXX (Toll Free)</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <Mail size={16} /> <span>support-civic@gov.in</span>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <MapPin size={16} /> <span>NIC HQ, CGO Complex, New Delhi</span>
                </div>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ borderLeft: '3px solid var(--gov-saffron)', paddingLeft: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>MINISTRY OF</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>ELECTRONICS & IT</div>
              </div>
              <div style={{ borderLeft: '3px solid white', paddingLeft: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>POWERED BY</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>NATIONAL INFORMATICS CENTRE</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--gov-green)', paddingLeft: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>GOVERNMENT OF</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>INDIA</div>
              </div>
            </div>
            <p>&copy; 2026 National Informatics Centre. Content owned and updated by relevant departments.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
