import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { Clock, CheckCircle2, AlertCircle, Filter, RefreshCw, MapPin, ShieldAlert, AlertTriangle, LayoutDashboard, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [activeRole, setActiveRole] = useState(() => localStorage.getItem('activeRole'));
  const [filterDepartment, setFilterDepartment] = useState('All');
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
    setSimilarity({ checked: false, loading: true, score: 0, isMatch: true });
    setResolutionLocation({ lat: null, lon: null, fetching: true });

    // Capture GPS coordinates for resolution proof
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setResolutionLocation({ lat: position.coords.latitude, lon: position.coords.longitude, fetching: false });
      },
      (err) => {
        console.error("GPS Capture failed", err);
        setResolutionLocation(prev => ({ ...prev, fetching: false }));
        alert("Warning: Location services are required for verification. Case resolution may be denied by the server.");
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

  const currentViewDept = activeRole === 'Municipal Corporation'
    ? (filterDepartment === 'All' ? 'All Departments' : filterDepartment)
    : activeRole;

  return (
    <div className="animate-fade-in" style={{ padding: '2rem' }}>
      <div className="header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', height: 'auto' }}>
        <div>
          <h2 style={{ fontSize: '2rem', color: 'var(--gov-navy)' }}>{activeRole.toUpperCase()} PANEL</h2>
          <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.95rem' }}>Managing {filteredComplaints.length} public grievances in current jurisdiction.</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {activeRole !== 'Municipal Corporation' && (
            <div className="gov-card" style={{ padding: '0.6rem 1.2rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem', background: '#fff7ed', border: '1px solid #fed7aa', margin: 0 }}>
              <div style={{ background: '#f97316', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
                <PlusCircle size={14} color="white" />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#f97316', fontWeight: 800, textTransform: 'uppercase' }}>Dept Rewards</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--gov-navy)' }}>
                  {deptTokens.find(d => d.name === activeRole)?.tokens || 0} <span style={{ fontSize: '0.7rem' }}>TOKENS</span>
                </p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {activeRole === 'Municipal Corporation' && (
              <select className="form-input" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} style={{ width: '220px', fontWeight: 700 }}>
                <option value="All">All Departments</option>
                {DEPARTMENTS.filter(d => d !== 'Municipal Corporation').map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
            <button onClick={() => setActiveRole(null)} className="btn-gov-secondary" style={{ fontSize: '0.8rem' }}>SWITCH ROLE</button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="gov-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ color: '#f59e0b' }}><Clock size={32} /></div>
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left', fontSize: '0.75rem', color: 'var(--gov-text-muted)' }}>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>ID / CASE</th>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>CATEGORY</th>
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>PRIORITY</th>
                  {activeRole === 'Municipal Corporation' && <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>DEPT</th>}
                  <th style={{ padding: '1.25rem 2rem', fontWeight: 800 }}>STATUS / PROOF</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map(c => (
                  <tr key={c._id} style={{ borderBottom: '1px solid var(--gov-border)' }}>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        {c.imageUrl && (
                          <div
                            onClick={() => setViewImageModal({ open: true, image: `http://localhost:5000${c.imageUrl}`, title: 'Reported Incident' })}
                            style={{ width: '45px', height: '45px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--gov-border)', cursor: 'pointer' }}
                          >
                            <img src={`http://localhost:5000${c.imageUrl}`} alt="Incident" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>#{c._id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)' }}>{c.text.substring(0, 30)}...</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 2rem', fontSize: '0.85rem', fontWeight: 600 }}>{c.category || 'General'}</td>
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: c.priority === 'High' ? '#dc2626' : c.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>{c.priority.toUpperCase()}</span>
                    </td>
                    {activeRole === 'Municipal Corporation' && <td style={{ padding: '1.25rem 2rem', fontSize: '0.8rem', fontWeight: 600 }}>{c.department}</td>}
                    <td style={{ padding: '1.25rem 2rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <select className="form-input" value={c.status} onChange={(e) => handleStatusChange(c._id, e.target.value)} style={{ padding: '0.4rem', fontSize: '0.75rem', fontWeight: 800, width: '130px' }}>
                          <option value="Pending">PENDING</option>
                          <option value="In Progress">IN PROGRESS</option>
                          <option value="Resolved">RESOLVED</option>
                        </select>

                        {c.resolutionImage && (
                          <button
                            className="btn-gov-secondary"
                            style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', width: 'fit-content' }}
                            onClick={() => setViewImageModal({
                              open: true,
                              image: c.resolutionImage,
                              originalImage: c.imageUrl ? `http://localhost:5000${c.imageUrl}` : null,
                              title: 'Resolution Verification',
                              isAi: c.isAiGenerated,
                              aiConfidence: c.aiDetectionConfidence
                            })}
                          >
                            VIEW PROOF
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
              <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>Capture photographic proof of the resolved issue.</p>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                {photoPreview ? (
                  <div style={{ position: 'relative', height: '220px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--gov-border)' }}>
                    <img src={photoPreview} alt="Resolution" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {(aiDetection.loading || similarity.loading || resolutionLocation.fetching) && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" color="var(--gov-navy)" />
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, marginTop: '0.5rem' }}>AI & GPS VERIFYING...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="btn-gov-primary" style={{ width: '100%', cursor: 'pointer', height: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
                    <Camera size={32} />
                    CAPTURE EVIDENCE
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handlePhotoCapture} style={{ display: 'none' }} />
                  </label>
                )}
              </div>

              {aiDetection.checked && (
                <div style={{ marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.8rem', padding: '1rem', background: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>AI Detection:</span>
                    <span style={{ color: aiDetection.isAi ? '#dc2626' : '#10b981', fontWeight: 800 }}>
                      {aiDetection.isAi ? `MANIPULATED (${aiDetection.confidence}%)` : 'AUTHENTIC'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Incident Match:</span>
                    <span style={{ color: similarity.isMatch ? '#10b981' : '#f59e0b', fontWeight: 800 }}>
                      {similarity.isMatch ? `MATCH (${similarity.score}%)` : `LOW MATCH (${similarity.score}%)`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>GPS Verification:</span>
                    <span style={{ color: resolutionLocation.lat ? '#10b981' : '#dc2626', fontWeight: 800 }}>
                      {resolutionLocation.lat ? 'COORDINATES CAPTURED' : 'LOCATION REQUIRED'}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-gov-secondary" style={{ flex: 1 }} onClick={() => { setResolutionModal({ open: false, complaintId: null }); setPhotoPreview(null); setAiDetection({ checked: false, loading: false }); setSimilarity({ checked: false, loading: false }); }}>CANCEL</button>
                <button
                  className="btn-gov-primary"
                  style={{ flex: 1 }}
                  onClick={submitResolution}
                  disabled={!photoPreview || aiDetection.loading || similarity.loading || aiDetection.isAi}
                >
                  RESOLVE CASE
                </button>
              </div>
            </div>
          </div>
        )}

        {viewImageModal.open && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding: '1rem' }} onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })}>
            <div className="gov-card" style={{ padding: '1.5rem', maxWidth: viewImageModal.originalImage ? '900px' : '500px', width: '95%', position: 'relative' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, color: 'var(--gov-navy)' }}>{viewImageModal.title}</h3>
                <button onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })} style={{ background: 'none', border: 'none', color: 'var(--gov-navy)', cursor: 'pointer' }}><X size={24} /></button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: viewImageModal.originalImage ? '1fr 1fr' : '1fr',
                gap: '1.5rem',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                {viewImageModal.originalImage && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>ORIGINAL COMPLAINT</div>
                    <img src={viewImageModal.originalImage} alt="Before" style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--gov-border)' }} />
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#10b981' }}>{viewImageModal.originalImage ? 'RESOLUTION PROOF' : 'IMAGE PREVIEW'}</div>
                  <img src={viewImageModal.image} alt="After" style={{ width: '100%', borderRadius: '4px', border: '1px solid var(--gov-border)' }} />
                </div>
              </div>

              {viewImageModal.isAi && (
                <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#dc2626' }}>
                  <ShieldAlert size={20} />
                  <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>AI GENERATED IMAGE DETECTED ({viewImageModal.aiConfidence}%)</span>
                </div>
              )}

              <button className="btn-gov-primary" style={{ marginTop: '1.5rem', width: '100%' }} onClick={() => setViewImageModal({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 })}>CLOSE</button>
            </div>
          </div>
        )}
      </div>
      );
};

      export default Dashboard;
