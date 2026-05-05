import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, MapPin, AlertTriangle, Loader2, Camera, X } from 'lucide-react';

import MapPicker from './MapPicker';

const GrievanceForm = () => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleLocationSelect = (data) => {
    setLocation(data.address);
    setCoords({ lat: data.lat, lon: data.lon });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Start AI Analysis immediately
      setAnalyzingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        console.log("Starting instant AI analysis for image...");
        const response = await axios.post('http://127.0.0.1:5000/api/analyze-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log("AI Analysis Result:", response.data);
        
        // Auto-fill description from AI
        if (response.data.description) {
            setText(response.data.description);
        }
      } catch (err) {
        console.error("AI Analysis failed in frontend", err);
      } finally {
        setAnalyzingImage(false);
      }
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setAnalyzingImage(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text && !image) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('location', location || 'Location not provided');
      if (coords.lat) formData.append('lat', coords.lat);
      if (coords.lon) formData.append('lon', coords.lon);
      if (image) formData.append('image', image);

      const response = await axios.post('http://127.0.0.1:5000/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      setText('');
      setLocation('');
      setCoords({ lat: null, lon: null });
      setImage(null);
      setImagePreview(null);
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
                style={{ height: '100px', resize: 'none' }}
                placeholder="Example: There is a huge pothole near the central park entrance..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required={!image}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Attach Photo (Optional)</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    {!imagePreview ? (
                        <label className="glass" style={{ 
                            flex: 1, 
                            height: '100px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            cursor: 'pointer',
                            border: '2px dashed var(--border)',
                            gap: '0.5rem'
                        }}>
                            <Camera size={32} style={{ color: 'var(--text-muted)' }} />
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Take Photo or Upload</span>
                            <input type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
                        </label>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden' }}>
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: analyzingImage ? 'blur(2px) grayscale(0.5)' : 'none' }} />
                            {analyzingImage && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 0, 
                                    left: 0, 
                                    right: 0, 
                                    bottom: 0, 
                                    background: 'rgba(0,0,0,0.6)', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    alignItems: 'center',
                                    color: 'white',
                                    gap: '0.5rem'
                                }}>
                                    <Loader2 className="animate-spin" size={24} />
                                    <span style={{ fontSize: '0.8rem' }}>AI is reading photo...</span>
                                </div>
                            )}
                            {!analyzingImage && (
                                <button 
                                    onClick={clearImage}
                                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)', padding: '0.25rem', borderRadius: '50%', color: 'white' }}
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Exact Location</label>
              
              <div style={{ marginBottom: '1rem' }}>
                <MapPicker onLocationSelect={handleLocationSelect} />
              </div>

              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ paddingLeft: '3rem', marginBottom: 0 }}
                  placeholder="Address will appear here..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
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
