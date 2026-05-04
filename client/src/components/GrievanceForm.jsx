import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, MapPin, AlertTriangle, Loader2 } from 'lucide-react';

const GrievanceForm = () => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [result, setResult] = useState(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Using OpenStreetMap's free reverse geocoding
        const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const address = res.data.display_name;
        setLocation(address);
      } catch (err) {
        console.error("Reverse geocoding failed", err);
        setLocation(`${latitude}, ${longitude}`);
      } finally {
        setDetectingLocation(false);
      }
    }, (err) => {
      console.error(err);
      alert("Unable to retrieve your location");
      setDetectingLocation(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/complaints', {
        text,
        location: location || 'Location not provided'
      });
      setResult(response.data);
      setText('');
      setLocation('');
    } catch (error) {
      console.error("Submission failed", error);
      alert("Error submitting grievance. Check if backend and database are running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {!result ? (
        <motion.div 
          className="glass" 
          style={{ padding: '2.5rem' }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Describe the Issue</label>
              <textarea 
                className="input-field" 
                style={{ height: '150px', resize: 'none' }}
                placeholder="Example: There is a huge pothole near the central park entrance that is causing traffic jams..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Location (Optional)</label>
              <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    style={{ paddingLeft: '3rem', marginBottom: 0 }}
                    placeholder="Street name, landmark..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  className="glass"
                  onClick={handleDetectLocation}
                  disabled={detectingLocation}
                  style={{ whiteSpace: 'nowrap', padding: '0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {detectingLocation ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                  Detect
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', padding: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Processing with AI...
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Grievance
                </>
              )}
            </button>
          </form>
        </motion.div>
      ) : (
        <motion.div 
          className="glass" 
          style={{ padding: '2.5rem', textAlign: 'center', border: '2px solid var(--success)' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div style={{ color: 'var(--success)', marginBottom: '1.5rem' }}>
            <CheckCircle size={64} style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '2rem' }}>Submitted Successfully!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Our AI has processed your report.</p>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', textAlign: 'left', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Category:</span>
              <span style={{ fontWeight: 600, color: '#818cf8' }}>{result.category}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>AI Priority Score:</span>
              <span style={{ 
                fontWeight: 600, 
                color: result.priority === 'High' ? 'var(--danger)' : result.priority === 'Medium' ? 'var(--warning)' : 'var(--success)'
              }}>
                {result.priority}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Tracking ID:</span>
              <span style={{ fontFamily: 'monospace' }}>#{result._id.slice(-6).toUpperCase()}</span>
            </div>
          </div>

          <button className="glass" onClick={() => setResult(null)} style={{ padding: '0.75rem 2rem' }}>
            Report Another Issue
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default GrievanceForm;
