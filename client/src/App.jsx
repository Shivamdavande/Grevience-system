import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_URL } from './config';
import { 
  Globe, 
  Building2, 
  Menu, 
  X as CloseIcon, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  User,
  LogOut,
  IndianRupee,
  Activity,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import HomePage from './components/HomePage';
import GrievanceForm from './components/GrievanceForm';
import TrackStatus from './components/TrackStatus';
import Dashboard from './components/Dashboard';
import DeptAuth from './components/DeptAuth';
import AadharLogin from './components/AadharLogin';
import UserDashboard from './components/UserDashboard';
import LanguageSelector from './components/LanguageSelector';
import './index.css';

function App() {
  const { t, i18n } = useTranslation();
  const [view, setView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeptAuthenticated, setIsDeptAuthenticated] = useState(!!localStorage.getItem('deptToken'));
  const [deptUser, setDeptUser] = useState(JSON.parse(localStorage.getItem('deptUser')) || null);
  const [isCitizenAuthenticated, setIsCitizenAuthenticated] = useState(!!localStorage.getItem('citizenToken'));
  const [userAadhar, setUserAadhar] = useState(localStorage.getItem('userAadhar') || '');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/public-stats`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error('Stats fetch error:', err));
  }, []);


  const handleDeptLogin = (token, user) => {
    localStorage.setItem('deptToken', token);
    localStorage.setItem('deptUser', JSON.stringify(user));
    setIsDeptAuthenticated(true);
    setDeptUser(user);
    setView('admin');
  };

  const handleCitizenLogin = (token, aadhar) => {
    localStorage.setItem('citizenToken', token);
    localStorage.setItem('userAadhar', aadhar);
    setIsCitizenAuthenticated(true);
    setUserAadhar(aadhar);
    setView('user-dashboard');
  };

  const handleLogout = () => {
    localStorage.clear();
    setIsDeptAuthenticated(false);
    setDeptUser(null);
    setIsCitizenAuthenticated(false);
    setUserAadhar('');
    setView('home');
  };

  const handleViewChange = (newView) => {
    setView(newView);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-gov-saffron selection:text-gov-navy">

      {/* Main Navigation */}
      <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div 
            onClick={() => handleViewChange('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="p-2 bg-gov-navy text-gov-saffron rounded-xl shadow-lg group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-black text-gov-navy leading-none tracking-tight uppercase">{t('nav.brand')}</h1>
              <p className="text-[9px] font-bold text-gov-saffron uppercase tracking-[0.2em] mt-1">{t('common.nationalPortal', 'National Grievance Portal')}</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <button 
              onClick={() => handleViewChange('home')}
              className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${view === 'home' ? 'text-gov-navy bg-gray-50' : 'text-gray-400 hover:text-gov-navy hover:bg-gray-50'}`}
            >
              {t('nav.home')}
            </button>
            {isCitizenAuthenticated && (
              <button 
                onClick={() => handleViewChange('user-dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${view === 'user-dashboard' ? 'text-gov-navy bg-gray-50' : 'text-gray-400 hover:text-gov-navy hover:bg-gray-50'}`}
              >
                {t('nav.myDashboard', 'My Dashboard')}
              </button>
            )}
            {!isDeptAuthenticated && !isCitizenAuthenticated ? null : isDeptAuthenticated ? (
              <button 
                onClick={() => handleViewChange('admin')}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-widest transition-all ${view === 'admin' ? 'text-gov-navy bg-gray-50' : 'text-gray-400 hover:text-gov-navy hover:bg-gray-50'}`}
              >
                {t('nav.dashboard')}
              </button>
            ) : null}
            <div className="hidden lg:flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
              <LanguageSelector />
              {isDeptAuthenticated || isCitizenAuthenticated ? (
                <button 
                  onClick={handleLogout}
                  className="px-5 py-2.5 bg-gray-50 text-gov-navy border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {t('nav.logout')}
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleViewChange('citizen-auth')}
                    className="px-5 py-2.5 bg-white text-gov-navy border border-gov-navy/20 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <User className="w-4 h-4" /> {t('nav.citizenLogin', 'Citizen Login')}
                  </button>
                  <button 
                    onClick={() => handleViewChange('dept-auth')}
                    className="px-5 py-2.5 bg-gov-navy text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-gov-navy-deep transition-all shadow-lg shadow-gov-navy/20 flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4 text-gov-saffron" /> {t('nav.deptPortal')}
                  </button>
                </div>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gov-navy md:hidden"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="p-6 space-y-4">
                <div className="pb-4 border-b border-gray-100">
                   <LanguageSelector />
                </div>
                <button onClick={() => handleViewChange('home')} className="block w-full text-left py-2 font-bold text-gov-navy uppercase tracking-widest text-sm">Home</button>
                {!isDeptAuthenticated ? null : (
                  <button onClick={() => handleViewChange('admin')} className="block w-full text-left py-2 font-bold text-gov-navy uppercase tracking-widest text-sm">Dashboard</button>
                )}
                <div className="pt-4 border-t border-gray-100">
                  {isDeptAuthenticated ? (
                    <button onClick={handleLogout} className="w-full py-4 bg-gray-50 text-gov-navy rounded-xl font-bold uppercase tracking-widest text-xs">Sign Out</button>
                  ) : (
                    <button onClick={() => handleViewChange('dept-auth')} className="w-full py-4 bg-gov-navy text-white rounded-xl font-bold uppercase tracking-widest text-xs">Department Login</button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <HomePage 
              key="home" 
              onReportGrievance={() => handleViewChange('report')} 
              onTrackStatus={() => handleViewChange('track')}
              onCitizenLogin={() => handleViewChange('citizen-auth')}
              onDeptLogin={() => handleViewChange('dept-auth')}
              stats={stats}
              isAuthenticated={isCitizenAuthenticated}
              isDeptAuthenticated={isDeptAuthenticated}
            />
          )}
          {view === 'report' && (
            <GrievanceForm 
              key="report" 
              userAadhar={userAadhar}
              onSuccess={() => handleViewChange(isCitizenAuthenticated ? 'user-dashboard' : 'home')} 
              onBack={() => handleViewChange('home')} 
            />
          )}
          {view === 'track' && <TrackStatus key="track" onBack={() => handleViewChange('home')} />}
          {view === 'admin' && <Dashboard key="admin" user={deptUser} onLogout={handleLogout} />}
          {view === 'dept-auth' && <DeptAuth key="dept-auth" onLogin={handleDeptLogin} onBack={() => handleViewChange('home')} />}
          {view === 'citizen-auth' && (
            <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 p-6">
              <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-gray-100">
                <AadharLogin onLogin={handleCitizenLogin} />
              </div>
            </div>
          )}
          {view === 'user-dashboard' && (
            <UserDashboard 
              key="user-dashboard" 
              userAadhar={userAadhar} 
              onNewGrievance={() => handleViewChange('report')} 
              onLogout={handleLogout} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Institutional Footer */}
      {view !== 'admin' && view !== 'user-dashboard' && (
      <footer className="bg-gov-navy text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white text-gov-navy rounded-lg">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-black uppercase">Jansahayak</h3>
              </div>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                National multi-modal grievance redressal portal powered by Artificial Intelligence for responsive and transparent governance.
              </p>
              <div className="flex gap-4">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <Activity className="w-5 h-5 text-gov-saffron" />
                </div>
                <div className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <IndianRupee className="w-5 h-5 text-gov-saffron" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">Quick Access</h4>
              <ul className="space-y-4">
                {['Report Incident', 'Track Application', 'Citizen Charter', 'Department List'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm font-bold text-gray-300 hover:text-gov-saffron transition-colors flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /> {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">Connect</h4>
              <ul className="space-y-4">
                <li>
                  <a href="tel:1800-XXX-XXXX" className="text-sm font-bold text-gray-300 hover:text-gov-saffron transition-colors flex items-center gap-3">
                    <Phone className="w-4 h-4" /> 1800-111-XXXX
                  </a>
                </li>
                <li>
                  <a href="mailto:support@jansahayak.gov.in" className="text-sm font-bold text-gray-300 hover:text-gov-saffron transition-colors flex items-center gap-3">
                    <Mail className="w-4 h-4" /> contact@jansahayak.gov.in
                  </a>
                </li>
                <li className="text-sm font-bold text-gray-300 flex items-start gap-3">
                  <MapPin className="w-4 h-4 shrink-0 mt-1" />
                  <span>Administrative Block, Digital India Bhavan, New Delhi, 110001</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 text-white/40">National Links</h4>
              <ul className="space-y-4">
                {['MyGov.in', 'India.gov.in', 'DigitalIndia.gov.in', 'UIDAI.gov.in'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm font-bold text-gray-300 hover:text-gov-saffron transition-colors flex items-center justify-between border-b border-white/5 pb-2">
                      {link} <ExternalLink className="w-3 h-3 opacity-30" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 text-center text-xs text-gray-300 font-medium tracking-wide">
            © 2026 Designed & Developed by <span className="text-gov-saffron font-extrabold">Ghanshyam, Shivam, Shubham and Ajay</span>
          </div>
        </div>
      </footer>
      )}
    </div>
  );
}

export default App;
