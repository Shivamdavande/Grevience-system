import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GrievanceForm from './components/GrievanceForm';
import Dashboard from './components/Dashboard';
import TrackStatus from './components/TrackStatus';
import AadharLogin from './components/AadharLogin';
import UserDashboard from './components/UserDashboard';
import DeptAuth from './components/DeptAuth';

import { useTranslation } from 'react-i18next';
import { Send, Search, LogOut, LayoutDashboard, HelpCircle, FileText, CheckCircle, Home, ShieldCheck, ExternalLink, Mail, Phone, MapPin, PlusCircle, Globe } from 'lucide-react';

function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState(() => localStorage.getItem('view') || 'home');
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [userAadhar, setUserAadhar] = useState(() => localStorage.getItem('userAadhar') || null);
  
  // Departmental Auth
  const [isDeptAuthenticated, setIsDeptAuthenticated] = useState(() => !!localStorage.getItem('deptToken'));
  const [deptUser, setDeptUser] = useState(() => JSON.parse(localStorage.getItem('deptUser')) || null);

  const [stats, setStats] = useState(null);

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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogin = (token, aadhar) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userAadhar', aadhar);
    setUserAadhar(aadhar);
    setIsAuthenticated(true);
    handleViewChange('user-dashboard');
  };

  const handleDeptLogin = (token, user) => {
    localStorage.setItem('deptToken', token);
    localStorage.setItem('deptUser', JSON.stringify(user));
    setDeptUser(user);
    setIsDeptAuthenticated(true);
    handleViewChange('admin');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    setIsDeptAuthenticated(false);
    setUserAadhar(null);
    setDeptUser(null);
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
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0, lineHeight: 1 }}>{t('nav.brand') || 'JANSAHAYAK'}</h1>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('common.govOfIndia')}</p>
          </div>
        </div>
        
        <nav className="nav-links">
          <div className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => handleViewChange('home')}>{t('nav.home')}</div>
          {!isDeptAuthenticated && !isAuthenticated && (
            <>
              <div className={`nav-item ${view === 'report' ? 'active' : ''}`} onClick={() => handleViewChange('report')}>{t('nav.report')}</div>
              <div className={`nav-item ${view === 'track' ? 'active' : ''}`} onClick={() => handleViewChange('track')}>{t('nav.track')}</div>
            </>
          )}
          
          {isAuthenticated && (
            <div className={`nav-item ${view === 'user-dashboard' ? 'active' : ''}`} onClick={() => handleViewChange('user-dashboard')}>{t('nav.dashboard')}</div>
          )}
          
          {isDeptAuthenticated && (
            <div className={`nav-item ${view === 'admin' ? 'active' : ''}`} onClick={() => handleViewChange('admin')}>Dept Portal</div>
          )}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="lang-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
            <Globe size={16} color="var(--gov-navy)" />
            <select 
              onChange={(e) => changeLanguage(e.target.value)} 
              value={i18n.language}
              style={{ background: 'none', border: 'none', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', color: 'var(--gov-navy)', outline: 'none' }}
            >
              <option value="en">ENGLISH</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="ta">தமிழ்</option>
              <option value="bn">বাংলা</option>
              <option value="gu">ગુજરાતી</option>
              <option value="te">తెలుగు</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ml">മലയാളം</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
              <option value="ur">اردو</option>
              <option value="or">ଓଡ଼ିଆ</option>
              <option value="as">অসমীয়া</option>
              <option value="kok">कोंकणी</option>
              <option value="mai">मैथिली</option>
              <option value="sa">संस्कृतम्</option>
              <option value="ks">کٲشُر</option>
              <option value="ne">नेपाली</option>
              <option value="sd">سنڌي</option>
              <option value="doi">डोगरी</option>
              <option value="mni">মণিপুরী</option>
              <option value="brx">बर'</option>
              <option value="sat">संताली</option>
            </select>
          </div>

          {(isAuthenticated || isDeptAuthenticated) ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {isDeptAuthenticated && (
                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                  {deptUser?.fullName} ({deptUser?.department})
                </div>
              )}
              <button onClick={handleLogout} className="btn-gov-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>{t('nav.logout')}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleViewChange('report')} className="btn-gov-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Citizen Login</button>
              <button onClick={() => handleViewChange('dept-auth')} className="btn-gov-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Dept Portal</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );

  return (
    <div className="App">
      <InstitutionalHeader />
      
      <main className={(view === 'admin' || view === 'user-dashboard' || view === 'dept-auth') ? '' : 'container'} style={{ padding: (view === 'admin' || view === 'user-dashboard' || view === 'dept-auth') ? '0' : '4rem 0', minHeight: '60vh' }}>
        {view === 'home' && (
          <HomePage 
            onReportGrievance={() => handleViewChange('report')} 
            onTrackStatus={() => handleViewChange('track')} 
            stats={stats}
            isDeptAuthenticated={isDeptAuthenticated}
            isAuthenticated={isAuthenticated}
          />
        )}
        
        {view === 'dept-auth' && <DeptAuth onLogin={handleDeptLogin} />}

        {!isAuthenticated && view === 'report' && (
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              <h2 style={{ color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('common.verification')}</h2>
              <p style={{ color: 'var(--gov-text-muted)' }}>{t('common.verifySub')}</p>
            </div>
            <AadharLogin onLogin={handleLogin} />
          </div>
        )}

        {view === 'report' && isAuthenticated && <GrievanceForm userAadhar={userAadhar} onSuccess={() => handleViewChange('user-dashboard')} />}
        {view === 'track' && <TrackStatus />}
        {view === 'user-dashboard' && isAuthenticated && <UserDashboard userAadhar={userAadhar} onReportIssue={() => handleViewChange('report')} />}
        
        {view === 'admin' && isDeptAuthenticated && <Dashboard userDepartment={deptUser?.department} />}
        
        {view === 'admin' && !isDeptAuthenticated && (
          <div style={{ textAlign: 'center', padding: '5rem' }}>
            <h2 style={{ color: 'var(--gov-navy)' }}>Access Denied</h2>
            <p>Please login via the Departmental Portal to access this dashboard.</p>
            <button onClick={() => handleViewChange('dept-auth')} className="btn-gov-primary" style={{ marginTop: '1rem' }}>Login Now</button>
          </div>
        )}
      </main>

      <footer className="gov-footer">
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '4rem' }}>
            <div>
              <div className="logo-section" style={{ marginBottom: '1.5rem' }}>
                <div style={{ background: 'white', color: 'var(--gov-navy)', padding: '0.4rem', borderRadius: '4px' }}>
                  <ShieldCheck size={20} />
                </div>
                <h4 style={{ color: 'white', margin: 0 }}>{t('nav.brand') || 'JANSAHAYAK'}</h4>
              </div>
              <p style={{ color: '#cbd5e0', fontSize: '0.9rem', lineHeight: '1.8' }}>
                {t('common.footerAbout')}
              </p>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>{t('common.quickLinks')}</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('common.nationalPortal')} <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('common.digitalIndia')} <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('common.myGov')} <ExternalLink size={12} />
                </a>
                <a href="#" style={{ color: '#cbd5e0', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {t('common.rtiOnline')} <ExternalLink size={12} />
                </a>
              </nav>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>{t('common.helpSupport')}</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <span onClick={() => handleViewChange('home')} style={{ color: '#cbd5e0', cursor: 'pointer' }}>{t('common.aboutPlatform')}</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>{t('common.privacyPolicy')}</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>{t('common.termsConditions')}</span>
                <span style={{ color: '#cbd5e0', cursor: 'pointer' }}>{t('common.helpDesk')}</span>
              </nav>
            </div>
            <div>
              <h4 style={{ color: 'white', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 800 }}>{t('common.contactUs')}</h4>
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
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>{t('common.ministry')}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{t('common.electronics')}</div>
              </div>
              <div style={{ borderLeft: '3px solid white', paddingLeft: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>{t('common.poweredBy')}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{t('common.nic')}</div>
              </div>
              <div style={{ borderLeft: '3px solid var(--gov-green)', paddingLeft: '1rem', textAlign: 'left' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a0aec0' }}>{t('common.govOf')}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white' }}>{t('common.india')}</div>
              </div>
            </div>
            <p>{t('common.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
