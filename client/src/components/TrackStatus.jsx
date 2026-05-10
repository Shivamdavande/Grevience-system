import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, CheckCircle2, RefreshCw, AlertCircle, FileText, MapPin, Calendar, Hash } from 'lucide-react';

const TrackStatus = () => {
  const [trackingId, setTrackingId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!trackingId) return;

    setLoading(true);
    setError('');
    setResult(null);

    // Clean tracking ID (strip # if present)
    const cleanId = trackingId.startsWith('#') ? trackingId.substring(1) : trackingId;

    try {
      const response = await axios.get(`http://localhost:5000/api/complaints/${cleanId}`);
      setResult(response.data);
    } catch (err) {
      setError('Unable to find any record with the provided Tracking ID. Please double-check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-pending">Pending</span>;
      case 'In Progress': return <span className="badge badge-progress">In Progress</span>;
      case 'Resolved': return <span className="badge badge-resolved">Resolved</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="gov-card" style={{ marginBottom: '3rem', borderTop: '4px solid var(--gov-navy)' }}>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--gov-navy)' }}>Track Your Application</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Hash size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '3.5rem', fontWeight: 600 }}
              placeholder="ENTER TRACKING ID (e.g. 64b81c...)"
              value={trackingId}
              onChange={(e) => setTrackingId(e.target.value.trim())}
              required
            />
          </div>
          <button type="submit" className="btn-gov-primary" disabled={loading}>
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 'TRACK STATUS'}
          </button>
        </form>
        {error && (
          <div style={{ marginTop: '1.5rem', color: '#dc2626', background: '#fef2f2', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', borderLeft: '3px solid #dc2626' }}>
            {error}
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="gov-card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem', borderBottom: '1px solid var(--gov-border)', paddingBottom: '2rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Grievance ID</p>
                <h2 style={{ fontSize: '1.75rem', color: 'var(--gov-navy)', fontWeight: 800 }}>#{result._id.toUpperCase()}</h2>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Current Status</p>
                <div style={{ transform: 'scale(1.2)', transformOrigin: 'right' }}>
                  {getStatusBadge(result.status)}
                </div>
              </div>
            </div>

            <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
              <div>
                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Issue Summary</label>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, lineHeight: '1.6' }}>{result.text}</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  <div>
                    <label className="form-label">Category</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <FileText size={16} color="var(--gov-navy)" />
                      {result.category || 'General'}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Priority</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: result.priority === 'High' ? '#dc2626' : 'inherit' }}>
                      <AlertCircle size={16} />
                      {result.priority || 'Medium'}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Department</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <RefreshCw size={16} color="var(--gov-navy)" />
                      {result.department}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Submitted On</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <Calendar size={16} color="var(--gov-navy)" />
                      {new Date(result.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '2.5rem' }}>
                  <label className="form-label">Incident Location</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--gov-text-muted)' }}>
                    <MapPin size={16} />
                    {result.location}
                  </div>
                </div>
              </div>

              <div>
                <label className="form-label">Incident Evidence</label>
                {result.imageUrl ? (
                  <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gov-border)', background: 'var(--gov-bg)' }}>
                    <img src={`http://localhost:5000${result.imageUrl}`} alt="Incident" style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                  </div>
                ) : (
                  <div style={{ height: '240px', background: 'var(--gov-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-md)', border: '1px dashed var(--gov-border)', color: 'var(--gov-text-muted)', fontSize: '0.9rem' }}>
                    No image evidence provided
                  </div>
                )}
                
                {result.resolutionImage && (
                  <div style={{ marginTop: '2rem' }}>
                    <label className="form-label">Resolution Proof</label>
                    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '2px solid var(--gov-green)', background: 'var(--gov-bg)' }}>
                      <img src={result.resolutionImage} alt="Resolution" style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
<<<<<<< HEAD
          </div>

          {result.status === 'Resolved' && result.resolutionImage && (
            <div style={{ marginTop: '2rem', background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={18} /> RESOLUTION PROOF
              </p>
              <div style={{ width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <img 
                  src={result.resolutionImage.startsWith('data:') ? result.resolutionImage : `http://127.0.0.1:5000${result.resolutionImage}`} 
                  alt="Resolution" 
                  style={{ width: '100%', height: 'auto', maxHeight: '400px', objectFit: 'cover' }}
                />
              </div>
            </div>
          )}
        </motion.div>
      )}
=======
          </motion.div>
        )}
      </AnimatePresence>
>>>>>>> aa26a1f (Updated AI grievance system UI and backend fixes)
    </div>
  );
};

export default TrackStatus;
