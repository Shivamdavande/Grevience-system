import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
<<<<<<< HEAD
import { Pie, Bar } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, Filter, RefreshCw, MapPin, ShieldAlert, AlertTriangle, LayoutDashboard, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
=======
import { Pie } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, RefreshCw, MapPin, ShieldAlert, FileText, ChevronRight, LayoutGrid, Camera, X, Loader2 } from 'lucide-react';
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('activeRole'));
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [stats, setStats] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
<<<<<<< HEAD
  const [deptTokens, setDeptTokens] = useState([]);
=======
  const [error, setError] = useState(null);
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)

  const [resolutionModal, setResolutionModal] = useState({ open: false, complaintId: null });
  const [photoPreview, setPhotoPreview] = useState(null);
<<<<<<< HEAD
  const [viewImageModal, setViewImageModal] = useState({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 });

  // AI Detection & Comparison state
=======
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
  const [aiDetection, setAiDetection] = useState({ checked: false, loading: false, isAi: false, confidence: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
<<<<<<< HEAD
      const [resComplaints, resStats, resTokens] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/complaints'),
        axios.get('http://127.0.0.1:5000/api/stats'),
        axios.get('http://127.0.0.1:5000/api/departments/tokens')
      ]);
      setComplaints(resComplaints.data);
      setStats(resStats.data);
      setDeptTokens(resTokens.data);
=======
      const [resComplaints, resStats] = await Promise.all([
        axios.get('http://localhost:5000/api/complaints'),
        axios.get('http://localhost:5000/api/stats')
      ]);
      setComplaints(resComplaints.data || []);
      setStats(resStats.data || { categories: [] });
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
    } catch (error) {
      console.error("Error fetching dashboard data", error);
      setError("Unable to synchronize with the administration server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeRole) localStorage.setItem('activeRole', activeRole);
    else localStorage.removeItem('activeRole');
  }, [activeRole]);

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
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('complaintId', resolutionModal.complaintId);

    try {
      const aiRes = await axios.post('http://localhost:5000/api/detect-ai-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiDetection({ checked: true, loading: false, isAi: aiRes.data.is_ai_generated, confidence: aiRes.data.confidence });
    } catch (err) {
      setAiDetection({ checked: true, loading: false, isAi: false, confidence: 0 });
    }
  };

  const submitResolution = async () => {
    if (!photoPreview) return;
    try {
      await axios.patch(`http://localhost:5000/api/complaints/${resolutionModal.complaintId}`, {
        status: 'Resolved',
        resolutionImage: photoPreview,
<<<<<<< HEAD
        isAiGenerated: aiDetection.isAi,
        aiDetectionConfidence: aiDetection.confidence,
        similarityScore: similarity.score,
        isMatch: similarity.isMatch
      };
      await axios.patch(`http://127.0.0.1:5000/api/complaints/${resolutionModal.complaintId}`, payload);
      await fetchData();
      
      // Reset state ONLY on success
      setResolutionModal({ open: false, complaintId: null });
      setPhotoPreview(null);
      setAiDetection({ checked: false, loading: false, isAi: false, confidence: 0 });
      setSimilarity({ checked: false, loading: false, score: 0, isMatch: true });
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to resolve grievance. Please try again. " + (error.response?.data?.error || error.message));
    }
  };

  if (loading && !stats) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Dashboard...</div>;

  const pieData = {
    labels: stats?.categories?.map(c => c._id) || [],
    datasets: [{
      data: stats?.categories?.map(c => c.count) || [],
      backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }]
=======
        isAiGenerated: aiDetection.isAi
      });
      fetchData();
      setResolutionModal({ open: false, complaintId: null });
      setPhotoPreview(null);
    } catch (err) { console.error(err); }
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
  };

  const DEPARTMENTS = [
    'Municipal Corporation',
    'Public Works Department',
    'Road Department',
    'Sewage Department',
    'Waste Department',
    'Water Department',
    'Electric Department'
  ];

  const filteredComplaints = activeRole === 'Municipal Corporation'
    ? (filterDepartment === 'All' ? complaints : complaints.filter(c => c.department === filterDepartment))
    : complaints.filter(c => c.department === activeRole);

  if (!activeRole) {
    return (
      <div className="gov-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '5rem 2rem' }}>
        <h2 style={{ fontSize: '2.25rem', color: 'var(--gov-navy)', marginBottom: '1rem' }}>Administrative Portal</h2>
        <p style={{ color: 'var(--gov-text-muted)', marginBottom: '3.5rem' }}>Select your departmental jurisdiction to access nodal metrics and case resolution tools.</p>
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
          {DEPARTMENTS.map(dept => (
            <button key={dept} onClick={() => setActiveRole(dept)} className="btn-gov-secondary" style={{ height: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
              <ShieldAlert size={32} />
              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{dept.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (loading && complaints.length === 0) return <div style={{ textAlign: 'center', padding: '5rem' }}><Loader2 className="animate-spin" size={48} color="var(--gov-navy)" /></div>;

  const pieData = {
    labels: stats.categories.map(c => c._id),
    datasets: [{
      data: stats.categories.map(c => c.count),
      backgroundColor: ['#003366', '#1a4a7a', '#ff9933', '#138808', '#718096', '#2d3748'],
      borderWidth: 1
    }]
  };

  return (
    <div className="animate-fade-in">
      <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', height: 'auto' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--gov-navy)' }}>{activeRole.toUpperCase()} PANEL</h2>
          <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.95rem' }}>Managing {filteredComplaints.length} public grievances in current jurisdiction.</p>
        </div>
<<<<<<< HEAD
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {activeRole !== 'Municipal Corporation' && (
            <div className="glass" style={{ 
              padding: '0.6rem 1.2rem', 
              borderRadius: '10px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.6rem',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}>
               <div style={{ background: '#eab308', padding: '0.3rem', borderRadius: '50%', display: 'flex' }}>
                <PlusCircle size={14} color="black" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.6rem', color: '#eab308', fontWeight: 'bold' }}>DEPT REWARDS</p>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold', color: '#fef08a' }}>
                  {deptTokens.find(d => d.name === activeRole)?.tokens || 0} Tokens
                </p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
=======
        <div style={{ display: 'flex', gap: '1rem' }}>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
          {activeRole === 'Municipal Corporation' && (
            <select className="form-input" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={{ width: '220px', fontWeight: 700 }}>
              <option value="All">All Departments</option>
              {DEPARTMENTS.filter(d => d !== 'Municipal Corporation').map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          )}
          <button onClick={() => setActiveRole(null)} className="btn-gov-secondary" style={{ fontSize: '0.8rem' }}>SWITCH ROLE</button>
        </div>
      </div>
<<<<<<< HEAD
    </div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
=======

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#f59e0b' }}><Clock size={32} /></div>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)' }}>PENDING</p>
            <h3 style={{ fontSize: '1.75rem' }}>{filteredComplaints.filter(c => c.status === 'Pending').length}</h3>
          </div>
        </div>
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid var(--gov-navy)' }}>
          <div style={{ color: 'var(--gov-navy)' }}><RefreshCw size={32} /></div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)' }}>IN PROGRESS</p>
            <h3 style={{ fontSize: '1.75rem' }}>{filteredComplaints.filter(c => c.status === 'In Progress').length}</h3>
          </div>
        </div>
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#10b981' }}><CheckCircle2 size={32} /></div>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)' }}>RESOLVED</p>
            <h3 style={{ fontSize: '1.75rem' }}>{filteredComplaints.filter(c => c.status === 'Resolved').length}</h3>
          </div>
        </div>
      </div>

      <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
        <div className="gov-card" style={{ padding: 0 }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--gov-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--gov-navy)' }}>Active Grievance Queue</h3>
            <button onClick={fetchData} className="btn-gov-secondary" style={{ padding: '0.4rem' }}><RefreshCw size={16} /></button>
          </div>
<<<<<<< HEAD
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Grievance</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Priority</th>
                {activeRole === 'Municipal Corporation' && <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Assigned Dept</th>}
                <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', maxWidth: '300px' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      {c.imageUrl && (
                        <div
                          onClick={() => setViewImageModal({ open: true, image: `http://127.0.0.1:5000${c.imageUrl}`, title: 'Request Problem Image' })}
                          style={{ width: '50px', height: '50px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--border)', cursor: 'pointer', position: 'relative' }}
                        >
                          <img
                            src={`http://127.0.0.1:5000${c.imageUrl}`}
                            alt="Grievance"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                            <span style={{ color: 'white', fontSize: '0.7rem', fontWeight: 'bold' }}>View</span>
                          </div>
                        </div>
                      )}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.text}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.location}</span>
                          {c.lat && c.lon && (
                            <a
                              href={`https://www.google.com/maps?q=${c.lat},${c.lon}`}
                              target="_blank"
                              rel="noreferrer"
                              style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}
                              title="View exact location on Google Maps"
                            >
                              <MapPin size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      color: c.priority === 'High' ? 'var(--danger)' : c.priority === 'Medium' ? 'var(--warning)' : 'var(--success)',
                      fontWeight: 700
                    }}>
                      {c.priority}
                    </span>
                  </td>
                  {activeRole === 'Municipal Corporation' && (
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {c.department}
                    </td>
                  )}
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {activeRole === 'Municipal Corporation' ? (
                        <span style={{
                          fontWeight: 600,
                          color: c.status === 'Resolved' ? 'var(--success)' : c.status === 'In Progress' ? 'var(--primary)' : 'var(--warning)'
                        }}>
                          {c.status}
                        </span>
                      ) : (
                        <select
                          value={c.status}
                          onChange={(e) => handleStatusChange(e, c._id)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid var(--border)', borderRadius: '4px', padding: '0.3rem' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                      )}

                      {c.resolutionImage && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          <button
                            className="btn-primary"
                            style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem', width: 'fit-content' }}
                            onClick={() => setViewImageModal({ 
                              open: true, 
                              image: c.resolutionImage, 
                              originalImage: c.imageUrl ? `http://127.0.0.1:5000${c.imageUrl}` : null,
                              title: 'Resolution Proof - Before & After', 
                              isAi: c.isAiGenerated, 
                              aiConfidence: c.aiDetectionConfidence 
                            })}
                          >
                            View Proof
                          </button>
                          {c.isAiGenerated && (
                            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: 700 }}>
                              <ShieldAlert size={14} />
                              <span>AI Generated Image</span>
                            </div>
                          )}
                          {!c.isMatch && (
                            <div style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--warning)', fontSize: '0.75rem', fontWeight: 700 }}>
                              <AlertTriangle size={14} />
                              <span>Problem Match: {c.similarityScore}%</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
=======
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>ID / CASE</th>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>CATEGORY</th>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>PRIORITY</th>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>STATUS</th>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--gov-border)' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{c._id.slice(-6).toUpperCase()}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>{c.text.substring(0, 40)}...</div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 600 }}>{c.category || 'General'}</td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: c.priority === 'High' ? '#dc2626' : 'inherit' }}>{c.priority.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <select className="form-input" value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} style={{ padding: '0.4rem', fontSize: '0.75rem', fontWeight: 800, width: '130px' }}>
                        <option value="Pending">PENDING</option>
                        <option value="In Progress">IN PROGRESS</option>
                        <option value="Resolved">RESOLVED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="gov-card">
          <h3 style={{ fontSize: '1.1rem', color: 'var(--gov-navy)', marginBottom: '2rem' }}>Incident Classification</h3>
          <div style={{ height: '300px' }}>
            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { weight: 700, size: 11 } } } } }} />
          </div>
        </div>
      </div>

      {resolutionModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="gov-card" style={{ maxWidth: '450px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ color: 'var(--gov-navy)', marginBottom: '1rem' }}>Resolution Verification</h3>
            <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Capture or upload photographic proof that the issue has been resolved.</p>
            
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              {photoPreview ? (
                <div style={{ position: 'relative', height: '200px', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <img src={photoPreview} alt="Resolution" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {aiDetection.loading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="animate-spin" /></div>}
                </div>
              ) : (
                <label className="btn-gov-primary" style={{ width: '100%', cursor: 'pointer', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Camera size={32} />
                  CAPTURE EVIDENCE
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoCapture} />
                </label>
<<<<<<< HEAD
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
              <button className="glass" onClick={() => { setResolutionModal({ open: false, complaintId: null }); setPhotoPreview(null); setAiDetection({ checked: false, loading: false, isAi: false, confidence: 0 }); }}>Cancel</button>
              <button 
                className="btn-primary" 
                onClick={submitResolution} 
                disabled={!photoPreview || aiDetection.loading || aiDetection.isAi}
              >
                Submit & Resolve
              </button>
            </div>
          </div>
        </div>
      )}

      {viewImageModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }} onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })}>
          <div className="glass" style={{ padding: '1.5rem', maxWidth: viewImageModal.originalImage ? '1000px' : '600px', width: '95%', textAlign: 'center', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{viewImageModal.title}</h3>
              <button onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: viewImageModal.originalImage ? '1fr 1fr' : '1fr', 
              gap: '1.5rem',
              maxHeight: '70vh',
              overflowY: 'auto',
              padding: '0.5rem'
            }}>
              {viewImageModal.originalImage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', fontWeight: 600, color: 'var(--warning)' }}>
                    BEFORE (Complaint)
                  </div>
                  <img src={viewImageModal.originalImage} alt="Original Complaint" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', objectFit: 'contain' }} />
                </div>
=======
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
              )}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '8px', fontWeight: 600, color: 'var(--success)' }}>
                  {viewImageModal.originalImage ? 'AFTER (Resolution)' : 'Image Preview'}
                </div>
                <img src={viewImageModal.image} alt="Resolution Proof" style={{ width: '100%', borderRadius: '12px', border: '1px solid var(--border)', objectFit: 'contain' }} />
              </div>
            </div>

<<<<<<< HEAD
            {viewImageModal.isAi && (
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '12px', border: '2px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--danger)' }}>
                <ShieldAlert size={24} />
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>AI GENERATED IMAGE DETECTED ({viewImageModal.aiConfidence}%)</span>
              </div>
            )}
            
            <button className="btn-primary" style={{ marginTop: '1.5rem', width: '100%', padding: '1rem' }} onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })}>Close Preview</button>
=======
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => setResolutionModal({ open: false, complaintId: null })}>CANCEL</button>
              <button className="btn-gov-primary" style={{ flex: 1 }} onClick={submitResolution} disabled={!photoPreview || aiDetection.loading || aiDetection.isAi}>RESOLVE CASE</button>
            </div>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
