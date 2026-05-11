import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, Filter, RefreshCw, MapPin, ShieldAlert, AlertTriangle, LayoutDashboard, PlusCircle, Loader2, Camera, X, ArrowRight, Check, BarChart3, TrendingUp } from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const Dashboard = ({ userDepartment }) => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deptTokens, setDeptTokens] = useState([]);

  const [resolutionModal, setResolutionModal] = useState({ open: false, complaintId: null });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [viewImageModal, setViewImageModal] = useState({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 });

  const [aiDetection, setAiDetection] = useState({ checked: false, loading: false, isAi: false, confidence: 0 });
  const [similarity, setSimilarity] = useState({ checked: false, loading: false, score: 0, isMatch: true });
  const [resolutionLocation, setResolutionLocation] = useState({ lat: null, lon: null, fetching: false });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [perfModalOpen, setPerfModalOpen] = useState(false);

  const departments = [
    'Road Department',
    'Sewage Department',
    'Waste Department',
    'Water Department',
    'Electric Department'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resStats, resTokens] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints'),
        axios.get('http://localhost:5000/api/stats'),
        axios.get('http://localhost:5000/api/departments/tokens')
      ]);
      setComplaints(resComplaints.data || []);
      setStats(resStats.data || { categories: [] });
      setDeptTokens(resTokens.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setError("Unable to synchronize with the administration server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userDepartment]);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'Resolved') {
      setResolutionModal({ open: true, complaintId: id });
    } else {
      try {
        await axios.patch(`http://localhost:5000/api/complaints/${id}`, { status: newStatus });
        fetchData();
      } catch (err) { console.error(err); }
    }
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiDetection({ checked: false, loading: true, isAi: false, confidence: 0 });
    setSimilarity({ checked: false, loading: true, score: 0, isMatch: true });
    setResolutionLocation({ lat: null, lon: null, fetching: true });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setResolutionLocation({ lat: position.coords.latitude, lon: position.coords.longitude, fetching: false });
      },
      (err) => {
        console.error("GPS Capture failed", err);
        setResolutionLocation(prev => ({ ...prev, fetching: false }));
        alert("Warning: Location services are required for verification.");
      },
      { enableHighAccuracy: true }
    );

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('complaintId', resolutionModal.complaintId);

    try {
      const [aiRes, compareRes] = await Promise.all([
        axios.post('http://localhost:5000/api/detect-ai-image', formData),
        axios.post('http://localhost:5000/api/compare-images', formData)
      ]);
      setAiDetection({ checked: true, loading: false, isAi: aiRes.data.is_ai_generated, confidence: aiRes.data.confidence });
      setSimilarity({ checked: true, loading: false, score: compareRes.data.similarity_score, isMatch: compareRes.data.is_match });
    } catch (err) {
      console.error("Verification failed", err);
      setAiDetection(prev => ({ ...prev, loading: false }));
      setSimilarity(prev => ({ ...prev, loading: false }));
    }
  };

  const submitResolution = async () => {
    if (!photoPreview) return;
    try {
      const payload = {
        status: 'Resolved',
        resolutionImage: photoPreview,
        isAiGenerated: aiDetection.isAi,
        aiDetectionConfidence: aiDetection.confidence,
        similarityScore: similarity.score,
        isMatch: similarity.isMatch,
        resolutionLat: resolutionLocation.lat,
        resolutionLon: resolutionLocation.lon
      };
      await axios.patch(`http://localhost:5000/api/complaints/${resolutionModal.complaintId}`, payload);
      await fetchData();

      setResolutionModal({ open: false, complaintId: null });
      setPhotoPreview(null);
      setAiDetection({ checked: false, loading: false, isAi: false, confidence: 0 });
      setSimilarity({ checked: false, loading: false, score: 0, isMatch: true });
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to resolve grievance.");
    }
  };

  const filteredComplaints = userDepartment && userDepartment !== 'Municipal Corporation'
    ? complaints.filter(c => {
        const matchesDept = c.department === userDepartment;
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'High' ? c.priority === 'High' : c.status === statusFilter);
        return matchesDept && matchesStatus;
      })
    : complaints.filter(c => {
        const matchesDept = selectedDeptFilter === 'All' || c.department === selectedDeptFilter;
        const matchesStatus = statusFilter === 'All' || (statusFilter === 'High' ? c.priority === 'High' : c.status === statusFilter);
        return matchesDept && matchesStatus;
      });

  const isMunicipalAdmin = !userDepartment || userDepartment === 'Municipal Corporation';

  const getDeptStats = (deptName) => {
    const deptComplaints = complaints.filter(c => c.department === deptName);
    return {
      pending: deptComplaints.filter(c => c.status === 'Pending').length,
      inProgress: deptComplaints.filter(c => c.status === 'In Progress').length,
      resolved: deptComplaints.filter(c => c.status === 'Resolved').length,
      tokens: deptTokens.find(d => d.name === deptName)?.tokens || 0
    };
  };

  const currentDeptTokens = userDepartment 
    ? (deptTokens.find(d => d.name === userDepartment)?.tokens || 0)
    : (deptTokens.reduce((acc, curr) => acc + curr.tokens, 0));

  const getDeptName = (dept) => {
    switch(dept) {
      case 'Municipal Corporation': return t('form.depts.municipal') || 'Municipal';
      case 'Road Department': return t('form.depts.road') || 'Road';
      case 'Sewage Department': return t('form.depts.sewage') || 'Sewage';
      case 'Waste Department': return t('form.depts.waste') || 'Waste';
      case 'Water Department': return t('form.depts.water') || 'Water';
      case 'Electric Department': return t('form.depts.electric') || 'Electric';
      default: return dept;
    }
  };

  if (loading && complaints.length === 0) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--gov-navy)" />
    </div>
  );

  return (
    <div className="admin-view" style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Dynamic Header */}
      <div className="admin-header" style={{ 
        background: 'var(--gov-navy)', 
        padding: '3.5rem 2rem 5rem', 
        color: 'white',
        position: 'relative'
      }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '8px' }}>
                <LayoutDashboard size={20} />
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.8 }}>
                Official Administration Portal
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em' }}>
              {userDepartment ? getDeptName(userDepartment).toUpperCase() : "MASTER CONTROL"} PANEL
            </h1>
            <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', opacity: 0.9, maxWidth: '600px', fontWeight: 500 }}>
              {userDepartment 
                ? `Overseeing ${filteredComplaints.length} grievances within the ${userDepartment} jurisdiction.`
                : `Comprehensive overview of ${complaints.length} civic grievances across all departments.`}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            {isMunicipalAdmin && (
              <button 
                onClick={() => setPerfModalOpen(true)}
                style={{ 
                  background: 'rgba(255,255,255,0.1)', 
                  backdropFilter: 'blur(10px)', 
                  padding: '0.8rem 1.5rem', 
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <BarChart3 size={18} />
                Dept Performance
              </button>
            )}
            <div className="glass-card" style={{ 
              background: 'rgba(255,255,255,0.1)', 
              backdropFilter: 'blur(10px)', 
              padding: '1.25rem 2rem', 
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.8, marginBottom: '0.25rem', textTransform: 'uppercase' }}>Dept Rewards</p>
              <h3 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 900 }}>{currentDeptTokens} <span style={{ fontSize: '0.9rem', opacity: 0.8 }}>Tokens</span></h3>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-3rem', position: 'relative', zIndex: 10, paddingBottom: '4rem' }}>
        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {[
            { label: 'Pending', count: (userDepartment && userDepartment !== 'Municipal Corporation' ? complaints.filter(c => c.department === userDepartment) : complaints).filter(c => c.status === 'Pending').length, icon: Clock, color: '#f59e0b', bg: '#fef3c7', filter: 'Pending' },
            { label: 'In Progress', count: (userDepartment && userDepartment !== 'Municipal Corporation' ? complaints.filter(c => c.department === userDepartment) : complaints).filter(c => c.status === 'In Progress').length, icon: RefreshCw, color: '#3b82f6', bg: '#dbeafe', filter: 'In Progress' },
            { label: 'Resolved', count: (userDepartment && userDepartment !== 'Municipal Corporation' ? complaints.filter(c => c.department === userDepartment) : complaints).filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: '#10b981', bg: '#dcfce7', filter: 'Resolved' },
            { label: 'High Priority', count: (userDepartment && userDepartment !== 'Municipal Corporation' ? complaints.filter(c => c.department === userDepartment) : complaints).filter(c => c.priority === 'High').length, icon: ShieldAlert, color: '#ef4444', bg: '#fee2e2', filter: 'High' }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setStatusFilter(statusFilter === stat.filter ? 'All' : stat.filter)}
              style={{ 
                background: 'white', 
                padding: '1.5rem', 
                borderRadius: '24px', 
                boxShadow: statusFilter === stat.filter ? `0 10px 15px -3px ${stat.color}44` : '0 4px 6px -1px rgba(0,0,0,0.1)', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                cursor: 'pointer',
                border: statusFilter === stat.filter ? `2px solid ${stat.color}` : '2px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{stat.label}</p>
                <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 900, color: 'var(--gov-navy)' }}>{stat.count}</h2>
              </div>
              <div style={{ background: stat.bg, padding: '1rem', borderRadius: '16px' }}>
                <stat.icon color={stat.color} size={28} />
              </div>
            </motion.div>
          ))}
        </div>


        {/* Complaints Table */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--gov-navy)', margin: 0 }}>Active Complaint Queue</h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              {isMunicipalAdmin && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem' }}>
                  <Filter size={16} color="var(--gov-text-muted)" />
                  <select 
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    style={{ 
                      padding: '0.6rem 1rem', 
                      borderRadius: '12px', 
                      border: '1px solid #e2e8f0', 
                      fontSize: '0.85rem', 
                      fontWeight: 700, 
                      color: 'var(--gov-navy)',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="All">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{getDeptName(dept)}</option>
                    ))}
                  </select>
                </div>
              )}
              <button onClick={fetchData} className="btn-gov-secondary" style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '12px' }}>
                <RefreshCw size={16} /> Sync Data
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 0.75rem' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  {['ID / CASE', 'CATEGORY', 'PRIORITY', 'DEPARTMENT', 'STATUS / PROOF'].map(h => (
                    <th key={h} style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--gov-text-muted)', fontWeight: 600 }}>No grievances found in your jurisdiction.</td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <motion.tr 
                      key={c._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ background: '#f8fafc', borderRadius: '16px', overflow: 'hidden' }}
                    >
                      <td style={{ padding: '1.25rem', borderRadius: '16px 0 0 16px' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gov-navy)' }}>#{c._id.slice(-8).toUpperCase()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.text}</div>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '0.4rem 0.8rem', background: '#e2e8f0', borderRadius: '8px' }}>{c.category}</span>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 800, 
                          color: c.priority === 'High' ? '#ef4444' : c.priority === 'Medium' ? '#f59e0b' : '#3b82f6'
                        }}>
                          {c.priority.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600 }}>
                          <Building2 size={14} /> {getDeptName(c.department)}
                        </div>
                      </td>
                      <td style={{ padding: '1.25rem', borderRadius: '0 16px 16px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          {isMunicipalAdmin ? (
                            <div style={{ 
                              padding: '0.6rem 1.25rem', 
                              borderRadius: '14px', 
                              fontSize: '0.75rem', 
                              fontWeight: 900,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.6rem',
                              minWidth: '130px',
                              letterSpacing: '0.02em',
                              background: c.status === 'Resolved' ? '#dcfce7' : c.status === 'In Progress' ? '#dbeafe' : '#fffbeb',
                              color: c.status === 'Resolved' ? '#15803d' : c.status === 'In Progress' ? '#1d4ed8' : '#b45309',
                              border: `1px solid ${c.status === 'Resolved' ? 'rgba(21, 128, 61, 0.2)' : c.status === 'In Progress' ? 'rgba(29, 78, 216, 0.2)' : 'rgba(180, 83, 9, 0.2)'}`
                            }}>
                              {c.status === 'Resolved' && <CheckCircle2 size={14} />}
                              {c.status === 'In Progress' && <RefreshCw size={14} className="animate-spin" />}
                              {c.status === 'Pending' && <Clock size={14} />}
                              {c.status.toUpperCase()}
                            </div>
                          ) : (
                            <select 
                              value={c.status}
                              onChange={(e) => handleStatusChange(c._id, e.target.value)}
                              style={{ 
                                padding: '0.5rem 1rem', 
                                borderRadius: '10px', 
                                border: '1px solid #cbd5e0', 
                                fontSize: '0.8rem', 
                                fontWeight: 700,
                                background: c.status === 'Resolved' ? '#dcfce7' : c.status === 'In Progress' ? '#dbeafe' : 'white',
                                color: c.status === 'Resolved' ? '#166534' : c.status === 'In Progress' ? '#1e40af' : 'inherit',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          )}
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {c.imageUrl && (
                              <button 
                                onClick={() => setViewImageModal({ open: true, image: c.imageUrl, title: 'Original Grievance', isAi: false })}
                                className="btn-gov-secondary" style={{ padding: '0.5rem', borderRadius: '10px' }}
                              >
                                <Camera size={16} />
                              </button>
                            )}
                            {c.resolutionImage && (
                              <button 
                                onClick={() => setViewImageModal({ 
                                  open: true, 
                                  image: c.resolutionImage, 
                                  originalImage: c.imageUrl,
                                  title: 'Resolution Proof', 
                                  isAi: c.isAiGenerated, 
                                  aiConfidence: c.aiDetectionConfidence,
                                  similarity: c.similarityScore,
                                  isMatch: c.isMatch
                                })}
                                className="btn-gov-primary" style={{ padding: '0.5rem', borderRadius: '10px' }}
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Resolution Modal */}
      <AnimatePresence>
        {resolutionModal.open && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyCenter: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="gov-card" style={{ maxWidth: '600px', width: '100%', margin: 'auto', padding: '2.5rem' }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Submit Resolution Proof</h2>
              <p style={{ color: 'var(--gov-text-muted)', marginBottom: '2rem' }}>AI and GPS verification will be performed on the uploaded image.</p>
              
              <div style={{ marginBottom: '2rem' }}>
                {!photoPreview ? (
                  <label style={{ display: 'block', border: '2px dashed #cbd5e0', borderRadius: '20px', padding: '4rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
                    <input type="file" accept="image/*" onChange={handlePhotoCapture} style={{ display: 'none' }} />
                    <Camera size={48} color="#cbd5e0" style={{ marginBottom: '1rem' }} />
                    <p style={{ fontWeight: 700, color: 'var(--gov-navy)' }}>Click to Upload Resolution Image</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>GPS and AI check will follow</p>
                  </label>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden' }}>
                    <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
                    <button onClick={() => setPhotoPreview(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.5rem' }}>
                      <X size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Verification Feedback */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-text-muted)', marginBottom: '0.5rem' }}>AI Integrity</p>
                  {aiDetection.loading ? <Loader2 className="animate-spin" size={16} /> : (
                    aiDetection.checked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: aiDetection.isAi ? '#ef4444' : '#10b981' }}>
                        {aiDetection.isAi ? <ShieldAlert size={16} /> : <BadgeCheck size={16} />}
                        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{aiDetection.isAi ? 'AI DETECTED' : 'AUTHENTIC'}</span>
                      </div>
                    ) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending...</span>
                  )}
                </div>
                <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gov-text-muted)', marginBottom: '0.5rem' }}>Location Match</p>
                  {resolutionLocation.fetching ? <Loader2 className="animate-spin" size={16} /> : (
                    resolutionLocation.lat ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981' }}>
                        <MapPin size={16} />
                        <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>VERIFIED</span>
                      </div>
                    ) : <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Pending...</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setResolutionModal({ open: false, complaintId: null })} className="btn-gov-secondary" style={{ flex: 1 }}>Cancel</button>
                <button 
                  onClick={submitResolution} 
                  disabled={!photoPreview || aiDetection.loading || aiDetection.isAi}
                  className="btn-gov-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Check size={20} /> Confirm Resolution
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Image Modal */}
      <AnimatePresence>
        {viewImageModal.open && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', maxWidth: viewImageModal.originalImage ? '1000px' : '600px', width: '100%' }}>
                <button onClick={() => setViewImageModal({ open: false })} style={{ position: 'absolute', top: '-3rem', right: 0, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={32} />
                </button>
                
                <div style={{ background: 'white', borderRadius: '32px', padding: '2rem' }}>
                  <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 900, color: 'var(--gov-navy)' }}>{viewImageModal.title}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: viewImageModal.originalImage ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                    {viewImageModal.originalImage && (
                      <div>
                        <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Original Grievance</p>
                        <img src={`http://localhost:5000${viewImageModal.originalImage}`} style={{ width: '100%', borderRadius: '16px', height: '400px', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{viewImageModal.originalImage ? 'Resolution Proof' : 'Image Evidence'}</p>
                      <img src={viewImageModal.image.startsWith('data:') ? viewImageModal.image : `http://localhost:5000${viewImageModal.image}`} style={{ width: '100%', borderRadius: '16px', height: '400px', objectFit: 'cover' }} />
                    </div>
                  </div>

                  {viewImageModal.title === 'Resolution Proof' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI Integrity</p>
                        <div style={{ color: viewImageModal.isAi ? '#ef4444' : '#10b981', fontWeight: 800 }}>{viewImageModal.isAi ? 'FAILED' : 'AUTHENTIC'}</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Similarity</p>
                        <div style={{ color: 'var(--gov-navy)', fontWeight: 800 }}>{(viewImageModal.similarity * 100).toFixed(0)}% Match</div>
                      </div>
                      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>GPS Status</p>
                        <div style={{ color: '#10b981', fontWeight: 800 }}>VERIFIED</div>
                      </div>
                    </div>
                  )}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Performance Modal */}
      <AnimatePresence>
        {perfModalOpen && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              style={{ background: '#f8fafc', maxWidth: '1200px', width: '100%', borderRadius: '32px', padding: '3rem', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}
            >
              <button onClick={() => setPerfModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: '#e2e8f0', border: 'none', borderRadius: '50%', padding: '0.5rem', cursor: 'pointer' }}>
                <X size={24} color="var(--gov-navy)" />
              </button>

              <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <TrendingUp size={32} color="var(--gov-navy)" />
                  <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--gov-navy)', margin: 0 }}>Departmental Performance</h2>
                </div>
                <p style={{ color: 'var(--gov-text-muted)', fontWeight: 500 }}>Comprehensive efficiency and reward metrics across all civic departments.</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {departments.map(dept => {
                  const dStats = getDeptStats(dept);
                  return (
                    <motion.div 
                      key={dept} 
                      whileHover={{ y: -5 }}
                      style={{ background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                        <div>
                          <h4 style={{ margin: 0, color: 'var(--gov-navy)', fontWeight: 800, fontSize: '1.1rem' }}>{getDeptName(dept)}</h4>
                          <p style={{ margin: '0.25rem 0 0', fontSize: '0.7rem', color: 'var(--gov-text-muted)', fontWeight: 700 }}>OPERATIONAL STATUS</p>
                        </div>
                        <div style={{ background: '#fef08a', padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <TrendingUp size={14} /> {dStats.tokens} TOKENS
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
                        <div style={{ background: '#fffbeb', padding: '1rem', borderRadius: '16px' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>{dStats.pending}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#92400e' }}>PENDING</div>
                        </div>
                        <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '16px' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#3b82f6' }}>{dStats.inProgress}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#1e40af' }}>IN PROGRESS</div>
                        </div>
                        <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '16px' }}>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{dStats.resolved}</div>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#166534' }}>RESOLVED</div>
                        </div>
                      </div>

                      <div style={{ marginTop: '1.5rem', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            background: '#10b981', 
                            width: `${(dStats.resolved / (dStats.pending + dStats.inProgress + dStats.resolved || 1)) * 100}%`,
                            transition: 'width 1s ease-out'
                          }} 
                        />
                      </div>
                      <p style={{ margin: '0.5rem 0 0', fontSize: '0.65rem', color: 'var(--gov-text-muted)', fontWeight: 700, textAlign: 'right' }}>
                        COMPLETION RATE: {((dStats.resolved / (dStats.pending + dStats.inProgress + dStats.resolved || 1)) * 100).toFixed(0)}%
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Building2 = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>;
const BadgeCheck = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>;

export default Dashboard;
