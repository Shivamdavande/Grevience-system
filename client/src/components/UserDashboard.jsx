import React, { useState, useEffect } from 'react';
import { translateDept, translateStatus } from '../utils/translationUtils';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight,
<<<<<<< HEAD
  Trash2
=======
  Award,
  ShieldCheck,
  Globe,
  ArrowRight,
  Shield,
  Search,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown,
  Building2,
  FileText,
  Camera,
  Check
>>>>>>> 9a197fc43654ac859e6ef1720a2723fe5794d616
} from 'lucide-react';

const UserDashboard = ({ userAadhar, onNewGrievance, onLogout }) => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [userTokens, setUserTokens] = useState(0);

  useEffect(() => {
    const fetchUserComplaints = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/complaints/user/${userAadhar}`);
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load your complaints.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserTokens = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/user/${userAadhar}/tokens`);
        setUserTokens(response.data.tokens);
      } catch (err) {
        console.error('Error fetching tokens:', err);
      }
    };

    if (userAadhar) {
      fetchUserComplaints();
      fetchUserTokens();
    }
  }, [userAadhar]);

  const handleDelete = async (id) => {
    if (window.confirm(t('user.confirmDelete') || "Are you sure you want to delete this complaint? This will remove it from all departments as well.")) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/complaints/${id}`);
        setComplaints(complaints.filter(c => c._id !== id));
        if (expandedId === id) setExpandedId(null);
      } catch (err) {
        console.error('Error deleting complaint:', err);
        alert(t('user.deleteError') || "Failed to delete complaint. Please try again.");
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5" />;
      case 'In Progress': return <RefreshCw className="w-5 h-5 animate-spin" />;
      case 'Resolved': return <CheckCircle2 className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Resolved': return 'bg-green-50 text-gov-green border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Citizen Header */}
      <header className="bg-gov-navy text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gov-saffron rounded-lg shadow-inner">
              <ShieldCheck className="w-8 h-8 text-gov-navy" />
            </div>
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight">Citizen Portal</h1>
              <p className="text-[10px] text-gov-saffron uppercase font-bold tracking-widest">Government of India</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 px-4 py-2 bg-white/10 rounded-full border border-white/20">
              <div className="p-1.5 bg-gov-saffron rounded-full">
                <Award className="w-4 h-4 text-gov-navy" />
              </div>
              <div className="text-sm font-bold">
                <span className="text-gov-saffron">{userTokens}</span> Credits
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <Building2 className="w-48 h-48 text-gov-navy" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-serif text-gov-navy font-bold">Welcome back, Citizen</h2>
              <p className="text-gray-500 mt-2 font-medium">Track your reported grievances and help build a better community.</p>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Aadhar Reference</span>
                  <span className="text-sm font-mono font-bold text-gov-navy tracking-widest">XXXX-XXXX-{userAadhar?.slice(-4)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={onNewGrievance}
              className="relative z-10 px-8 py-4 bg-gov-navy text-white rounded-xl font-bold flex items-center gap-3 hover:bg-gov-navy-deep transition-all shadow-xl hover:shadow-gov-navy/20"
            >
              <PlusCircle className="w-6 h-6 text-gov-saffron" />
              File New Grievance
            </button>
          </div>

          {/* Grievances List */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gov-navy uppercase tracking-widest flex items-center gap-3">
                <FileText className="w-5 h-5 text-gov-saffron" />
                Your Submissions
              </h3>
              <span className="text-xs font-bold text-gray-400">{complaints.length} Applications Total</span>
            </div>

<<<<<<< HEAD
            {/* Expanded Section */}
            {expandedId === item._id && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: item.status === 'Resolved' && item.resolutionImage ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '12px' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600 }}>{t('user.originalDesc')}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{item.text}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 600 }}>{t('user.locationLabel')}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{item.location}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontWeight: 600 }}>{t('user.departmentLabel')}</p>
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600 }}>{translateDept(item.department, t)}</p>
                  </div>

                  {item.status === 'Resolved' && item.resolutionImage && (
                    <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <p style={{ color: '#10b981', fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> {t('user.resolutionProof')}
                      </p>
                      <div style={{ width: '100%', height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <img 
                          src={item.resolutionImage.startsWith('data:') ? item.resolutionImage : `http://127.0.0.1:5000${item.resolutionImage}`} 
                          alt="Resolution" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
                        {t('user.resolvedMsg', { dept: translateDept(item.department, t) })}
                      </p>
                    </div>
                  )}

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item._id);
                      }}
                      style={{ 
                        background: 'transparent', 
                        border: '1px solid #ef4444', 
                        color: '#ef4444', 
                        padding: '0.5rem 1rem', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = '#fee2e2';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <Trash2 size={14} /> {t('user.deleteComplaint') || "Delete Complaint"}
                    </button>
                  </div>
=======
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <RefreshCw className="w-12 h-12 text-gov-navy animate-spin" />
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Accessing Records...</p>
              </div>
            ) : complaints.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-gray-300" />
>>>>>>> 9a197fc43654ac859e6ef1720a2723fe5794d616
                </div>
                <h4 className="text-xl font-bold text-gov-navy">No grievances found</h4>
                <p className="text-gray-400 mt-2 max-w-xs mx-auto">You haven't filed any complaints yet. Start by clicking the 'File New Grievance' button.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {complaints.map((complaint) => (
                  <motion.div
                    key={complaint._id}
                    layout
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${expandedId === complaint._id ? 'border-gov-navy ring-4 ring-gov-navy/5 shadow-xl' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}
                  >
                    <div 
                      onClick={() => setExpandedId(expandedId === complaint._id ? null : complaint._id)}
                      className="p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-6">
                        <div className={`p-4 rounded-xl ${complaint.status === 'Resolved' ? 'bg-green-50 text-gov-green' : 'bg-gov-navy/5 text-gov-navy'}`}>
                          {getStatusIcon(complaint.status)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">ID: #{complaint._id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-tighter ${getStatusColor(complaint.status)}`}>
                              {translateStatus(complaint.status, t)}
                            </span>
                          </div>
                          <h4 className="text-lg font-serif font-bold text-gov-navy mt-1 line-clamp-1">{complaint.text}</h4>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5" />
                              {complaint.location.split(',')[0]}
                            </span>
                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-none pt-4 sm:pt-0">
                        <div className="flex -space-x-2">
                          {complaint.imageUrl && <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={`http://localhost:5000${complaint.imageUrl}`} className="w-full h-full object-cover" /></div>}
                          {complaint.resolutionImage && <div className="w-8 h-8 rounded-full border-2 border-white bg-gov-green overflow-hidden flex items-center justify-center text-white"><Check className="w-4 h-4" /></div>}
                        </div>
                        <motion.div animate={{ rotate: expandedId === complaint._id ? 180 : 0 }}>
                          <ChevronDown className="w-6 h-6 text-gray-300" />
                        </motion.div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedId === complaint._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="border-t border-gray-50 bg-gray-50/50"
                        >
                          <div className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                              <div className="space-y-8">
                                <div>
                                  <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Incident Particulars</h5>
                                  <p className="text-gov-navy font-medium leading-relaxed">{complaint.text}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <h6 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Assigned Unit</h6>
                                    <p className="text-xs font-bold text-gov-navy">{translateDept(complaint.department, t)}</p>
                                  </div>
                                  <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                    <h6 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status Reference</h6>
                                    <p className="text-xs font-bold text-gov-navy">{translateStatus(complaint.status, t)}</p>
                                  </div>
                                </div>

                                {complaint.status === 'Resolved' && (
                                  <div className="p-6 bg-green-50 border border-green-100 rounded-2xl flex gap-4">
                                    <div className="p-3 bg-white rounded-xl text-gov-green shadow-sm shrink-0 h-fit">
                                      <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                      <h6 className="text-sm font-bold text-gov-green">Resolution Confirmed</h6>
                                      <p className="text-xs text-green-700 mt-1 leading-relaxed">
                                        The respective department has verified the redressal of your grievance. Thank you for your contribution to the community.
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-6">
                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Verification Media</h5>
                                <div className="grid grid-cols-2 gap-4">
                                  {complaint.imageUrl && (
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-bold text-gray-400 uppercase px-1">Original Evidence</span>
                                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-200">
                                        <img src={`http://localhost:5000${complaint.imageUrl}`} className="w-full h-full object-cover" />
                                      </div>
                                    </div>
                                  )}
                                  {complaint.resolutionImage && (
                                    <div className="space-y-2">
                                      <span className="text-[9px] font-bold text-gov-green uppercase px-1">Resolution Proof</span>
                                      <div className="aspect-video rounded-xl overflow-hidden border-2 border-gov-green shadow-md bg-gray-200">
                                        <img src={complaint.resolutionImage} className="w-full h-full object-cover" />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            Digital India Initiative | © {new Date().getFullYear()} National Administrative Portal
          </p>
          <div className="flex justify-center gap-6 mt-4 opacity-30">
            <Globe className="w-5 h-5" />
            <Shield className="w-5 h-5" />
            <ArrowRight className="w-5 h-5" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserDashboard;
