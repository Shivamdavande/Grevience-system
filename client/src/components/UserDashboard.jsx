import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle,
  MapPin,
  Calendar,
  ChevronRight
} from 'lucide-react';

const UserDashboard = ({ userAadhar, onReportIssue }) => {
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [userTokens, setUserTokens] = useState(0);

  useEffect(() => {
    const fetchUserComplaints = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/complaints/user/${userAadhar}`);
        setComplaints(response.data);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load your complaints. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserTokens = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:5000/api/user/${userAadhar}/tokens`);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={20} style={{ color: 'var(--warning)' }} />;
      case 'In Progress': return <RefreshCw size={20} style={{ color: 'var(--primary)' }} className="animate-spin" />;
      case 'Resolved': return <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusBadgeStyle = (status) => {
    const base = {
      padding: '0.25rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem'
    };

    switch (status) {
      case 'Pending': return { ...base, backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' };
      case 'In Progress': return { ...base, backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' };
      case 'Resolved': return { ...base, backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' };
      default: return base;
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{t('nav.home')} <span className="gradient-text">{t('nav.dashboard')}</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('user.welcome')}</p>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <motion.div 
            className="glass" 
            style={{ 
              padding: '0.8rem 1.5rem', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              background: 'linear-gradient(135deg, rgba(253, 224, 71, 0.1), rgba(234, 179, 8, 0.1))',
              border: '1px solid rgba(234, 179, 8, 0.2)'
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div style={{ background: '#eab308', padding: '0.4rem', borderRadius: '50%', display: 'flex' }}>
              <PlusCircle size={16} color="black" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: '#eab308', fontWeight: 'bold', textTransform: 'uppercase' }}>{t('user.rewards')}</p>
              <p style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold', color: '#fef08a' }}>{userTokens} {t('user.tokens')}</p>
            </div>
          </motion.div>
          <button 
            className="btn-primary" 
            onClick={onReportIssue}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1.5rem', borderRadius: '12px' }}
          >
            <PlusCircle size={20} /> {t('nav.report')}
          </button>
        </div>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <RefreshCw size={40} className="animate-spin" style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>{t('user.loadingGrievances')}</p>
        </div>
      ) : error ? (
        <div className="glass" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
          <p style={{ color: '#ef4444', fontWeight: '500' }}>{error}</p>
        </div>
      ) : complaints.length === 0 ? (
        <motion.div 
          className="glass" 
          style={{ padding: '4rem', textAlign: 'center' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: 'rgba(255,255,255,0.05)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              <AlertCircle size={40} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('user.noGrievances')}</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('user.noGrievancesSub')}</p>
          <button 
            className="btn-primary" 
            onClick={onReportIssue}
            style={{ padding: '0.8rem 2rem' }}
          >
            {t('nav.report')}
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {complaints.map((item, index) => (
            <motion.div 
              key={item._id}
              className="glass" 
              style={{ 
                padding: '1.5rem', 
                display: 'flex', 
                flexDirection: 'column',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.005, backgroundColor: 'rgba(255, 255, 255, 0.04)' }}
              onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
            >
              <div style={{ display: 'flex', gap: '1.5rem' }}>
              {/* Image Preview if exists */}
              {item.imageUrl && (
                <div style={{ width: '120px', height: '120px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                  <img 
                    src={`http://127.0.0.1:5000${item.imageUrl}`} 
                    alt="Grievance" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={getStatusBadgeStyle(item.status)}>
                      {getStatusIcon(item.status)}
                      {item.status === 'Pending' ? t('admin.pending') : item.status === 'In Progress' ? t('admin.inProgress') : t('admin.resolved')}
                    </div>
                    <span style={{ marginLeft: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      ID: {item._id.substring(0, 8)}...
                    </span>
                  </div>
                  <div style={{ 
                    backgroundColor: item.priority === 'High' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.05)',
                    color: item.priority === 'High' ? '#ef4444' : 'var(--text-muted)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    {item.priority} {t('user.priorityLabel')}
                  </div>
                </div>

                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#fff' }}>{item.category}</h3>
                <p style={{ 
                  margin: '0 0 1rem 0', 
                  color: 'rgba(255,255,255,0.7)', 
                  display: '-webkit-box', 
                  WebkitLineClamp: 2, 
                  WebkitBoxOrient: 'vertical', 
                  overflow: 'hidden',
                  fontSize: '0.95rem',
                  lineHeight: '1.5'
                }}>
                  {item.text}
                </p>

                <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={14} />
                    {item.location.split(',')[0]}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '1rem' }}>
                <ChevronRight 
                  size={24} 
                  style={{ 
                    color: 'rgba(255,255,255,0.2)', 
                    transform: expandedId === item._id ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s'
                  }} 
                />
              </div>
            </div>

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
                    <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 600 }}>{item.department}</p>
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
                        {t('user.resolvedMsg', { dept: item.department })}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
