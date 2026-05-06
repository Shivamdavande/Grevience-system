import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, Filter, RefreshCw, MapPin, ShieldAlert, AlertTriangle, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeRole, setActiveRole] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState('All');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals for photo upload
  const [resolutionModal, setResolutionModal] = useState({ open: false, complaintId: null });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [viewImageModal, setViewImageModal] = useState({ open: false, image: null, title: '', isAi: false, aiConfidence: 0 });

  // AI Detection & Comparison state
  const [aiDetection, setAiDetection] = useState({ checked: false, loading: false, isAi: false, confidence: 0 });
  const [similarity, setSimilarity] = useState({ checked: false, loading: false, score: 0, isMatch: true });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resStats] = await Promise.all([
        axios.get('http://127.0.0.1:5000/api/complaints'),
        axios.get('http://127.0.0.1:5000/api/stats')
      ]);
      setComplaints(resComplaints.data);
      setStats(resStats.data);
    } catch (error) {
      console.error("Error fetching dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (id, status, imageBase64 = null) => {
    try {
      const payload = { status };
      if (imageBase64) payload.resolutionImage = imageBase64;
      await axios.patch(`http://127.0.0.1:5000/api/complaints/${id}`, payload);
      fetchData();
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleStatusChange = (e, id) => {
    const newStatus = e.target.value;
    if (newStatus === 'Resolved') {
      setResolutionModal({ open: true, complaintId: id });
      setSimilarity({ checked: false, loading: false, score: 0, isMatch: true });
    } else {
      updateStatus(id, newStatus);
    }
  };

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAiDetection({ checked: false, loading: true, isAi: false, confidence: 0 });
    setSimilarity({ checked: false, loading: true, score: 0, isMatch: true });

    // Preview logic
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setPhotoPreview(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('complaintId', resolutionModal.complaintId);

    // Send to AI detection & Comparison
    try {
      const [aiRes, simRes] = await Promise.all([
        axios.post('http://127.0.0.1:5000/api/detect-ai-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }),
        axios.post('http://127.0.0.1:5000/api/compare-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      ]);
      setAiDetection({ checked: true, loading: false, isAi: aiRes.data.is_ai_generated, confidence: aiRes.data.confidence });
      setSimilarity({ checked: true, loading: false, score: simRes.data.similarity_score, isMatch: simRes.data.is_match });
    } catch (err) {
      console.error("AI service calls failed", err);
      setAiDetection({ checked: true, loading: false, isAi: false, confidence: 0 });
      setSimilarity({ checked: true, loading: false, score: 0, isMatch: false });
    }
  };

  const submitResolution = async () => {
    if (!photoPreview) {
      alert("Please capture or upload a photo first.");
      return;
    }
    
    try {
      const payload = { 
        status: 'Resolved', 
        resolutionImage: photoPreview,
        isAiGenerated: aiDetection.isAi,
        aiDetectionConfidence: aiDetection.confidence,
        similarityScore: similarity.score,
        isMatch: similarity.isMatch
      };
      await axios.patch(`http://127.0.0.1:5000/api/complaints/${resolutionModal.complaintId}`, payload);
      fetchData();
    } catch (error) {
      console.error("Update failed", error);
    }
    
    setResolutionModal({ open: false, complaintId: null });
    setPhotoPreview(null);
    setAiDetection({ checked: false, loading: false, isAi: false, confidence: 0 });
    setSimilarity({ checked: false, loading: false, score: 0, isMatch: true });
  };

  if (loading && !stats) return <div style={{ textAlign: 'center', padding: '5rem' }}>Loading Dashboard...</div>;

  const pieData = {
    labels: stats?.categories?.map(c => c._id) || [],
    datasets: [{
      data: stats?.categories?.map(c => c.count) || [],
      backgroundColor: ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#94a3b8'],
      borderWidth: 0,
    }]
  };

  const DEPARTMENTS = [
    'Municipal Corporation',
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
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '2rem' }}>Select Admin Role</h2>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {DEPARTMENTS.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveRole(dept)}
              className={dept === 'Municipal Corporation' ? 'btn-primary' : 'glass'}
              style={{ padding: '1rem', fontSize: '1.1rem', width: '100%' }}
            >
              {dept} {dept === 'Municipal Corporation' && '(Master View)'}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div style={{ borderLeft: '4px solid var(--primary)', paddingLeft: '1rem' }}>
          <h2 style={{ margin: 0 }}>{activeRole} Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Managing {filteredComplaints.length} grievances</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {activeRole === 'Municipal Corporation' && (
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="glass"
              style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }}
            >
              <option value="All" style={{ background: '#1e1e2d', color: 'white' }}>All Departments</option>
              {DEPARTMENTS.filter(d => d !== 'Municipal Corporation').map(dept => (
                <option key={dept} value={dept} style={{ background: '#1e1e2d', color: 'white' }}>{dept}</option>
              ))}
            </select>
          )}
          <button className="glass" onClick={() => setActiveRole(null)} style={{ padding: '0.5rem 1rem' }}>
            Change Role
          </button>
        </div>
      </div>
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--warning)' }}>
            <Clock size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pending</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'Pending').length}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--primary)' }}>
            <RefreshCw size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>In Progress</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'In Progress').length}</h3>
          </div>
        </div>
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '12px', color: 'var(--success)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Resolved</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{filteredComplaints.filter(c => c.status === 'Resolved').length}</h3>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Table */}
        <div className="glass" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>Recent Complaints</h3>
            <button onClick={fetchData} className="glass" style={{ padding: '0.5rem' }}><RefreshCw size={16} /></button>
          </div>
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
                            className="glass"
                            style={{ fontSize: '0.8rem', padding: '0.3rem', width: 'fit-content' }}
                            onClick={() => setViewImageModal({ open: true, image: c.resolutionImage, title: 'Resolution Proof', isAi: c.isAiGenerated, aiConfidence: c.aiDetectionConfidence })}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Issue Categories</h3>
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center' }}>
              <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8' } } } }} />
            </div>
          </div>

          <div className="glass" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <AlertCircle size={32} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
            <h4>AI Insight</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {stats?.categories[0]?._id || 'Road Issues'} is currently the most reported category. Recommend assigning more resources to this department.
            </p>
          </div>
        </div>
      </div>

      {/* Resolution Photo Modal */}
      {resolutionModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="glass" style={{ padding: '2rem', maxWidth: '450px', width: '90%', textAlign: 'center' }}>
            <h3>Upload Live Photo</h3>
            <p style={{ color: 'var(--text-muted)' }}>You must provide photographic proof to resolve this issue.</p>

            {photoPreview ? (
              <div style={{ margin: '1rem 0' }}>
                <img src={photoPreview} alt="Proof preview" style={{ width: '100%', maxHeight: '250px', objectFit: 'cover', borderRadius: '8px' }} />
                
                {(aiDetection.loading || similarity.loading) && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                      <span>AI is analyzing your submission...</span>
                    </div>
                  </div>
                )}

                {aiDetection.checked && aiDetection.isAi && (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ 
                      marginTop: '1rem', 
                      padding: '1.5rem', 
                      background: 'rgba(239, 68, 68, 0.2)', 
                      borderRadius: '12px', 
                      border: '3px solid var(--danger)',
                      boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                      animation: 'pulse-red 2s infinite'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--danger)', marginBottom: '0.75rem' }}>
                      <AlertTriangle size={32} />
                      <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>CRITICAL SECURITY ALERT!</h3>
                    </div>
                    <p style={{ color: 'var(--danger)', fontSize: '1.2rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', lineHeight: '1.4' }}>
                      🛑 DHAYAN SE: Tum AI generated image upload kar rahe ho! <br/>
                      Yeh cheating hai aur is se tumhari JOB TURANT JAA SAKTI HAI! 🚨
                    </p>
                    <p style={{ color: 'white', fontSize: '1rem', marginTop: '0.75rem', fontWeight: 600 }}>
                      AI Detection Confidence: <span style={{ color: 'var(--danger)' }}>{aiDetection.confidence}%</span>
                    </p>
                    <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                      Our neural network has flagged this image as synthetic. Please provide a REAL live photo.
                    </div>
                  </motion.div>
                )}

                {similarity.checked && !similarity.isMatch && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', border: '1px solid var(--warning)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '0.5rem' }}>
                      <AlertCircle size={24} />
                      <h4 style={{ margin: 0 }}>Low Similarity Detected!</h4>
                    </div>
                    <p style={{ color: 'var(--warning)', fontSize: '0.9rem', fontWeight: 600 }}>
                      This image only matches the original problem by {similarity.score}%.
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.4rem' }}>
                      Please make sure you are uploading a photo of the EXACT same location/problem.
                    </p>
                  </div>
                )}

                {aiDetection.checked && !aiDetection.isAi && similarity.checked && similarity.isMatch && (
                  <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--success)' }}>
                    <CheckCircle2 size={18} />
                    <span>Authentic image & location verified. ({similarity.score}% match)</span>
                  </div>
                )}

                {(aiDetection.isAi || !similarity.isMatch) && aiDetection.checked && similarity.checked && (
                   <label className="btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block', marginTop: '1rem', fontSize: '0.8rem' }}>
                      Re-upload Correct Photo
                      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoCapture} />
                   </label>
                )}
              </div>
            ) : (
              <div style={{ margin: '2rem 0' }}>
                <label className="btn-primary" style={{ cursor: 'pointer', padding: '1rem', display: 'inline-block' }}>
                  Capture / Upload Photo
                  <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoCapture} />
                </label>
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

      {/* View Image Modal */}
      {viewImageModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }} onClick={() => setViewImageModal({ open: false, image: null, title: '', isAi: false, aiConfidence: 0 })}>
          <div className="glass" style={{ padding: '1rem', maxWidth: '600px', width: '90%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3>{viewImageModal.title}</h3>
            <div style={{ position: 'relative' }}>
              <img src={viewImageModal.image} alt={viewImageModal.title} style={{ width: '100%', borderRadius: '8px', marginTop: '1rem', maxHeight: '70vh', objectFit: 'contain' }} />
              {viewImageModal.isAi && (
                <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)' }}>
                  <ShieldAlert size={20} />
                  <span style={{ fontWeight: 700 }}>AI Generated Image ({viewImageModal.aiConfidence}%)</span>
                </div>
              )}
            </div>
            <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={() => setViewImageModal({ open: false, image: null, title: '', isAi: false, aiConfidence: 0 })}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
