import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Loader2, Camera, X, CheckCircle2, AlertCircle, FileText, UploadCloud, ShieldCheck, RefreshCw } from 'lucide-react';
import MapPicker from './MapPicker';

const GrievanceForm = ({ userAadhar, onSuccess }) => {
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedDept, setSelectedDept] = useState('Municipal Corporation');
  const [fetchingLocation, setFetchingLocation] = useState(false);

  const fileInputRef = useRef(null);

  const fetchExactLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        
        // Reverse geocode to get address string
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.data.display_name) setLocation(res.data.display_name);
        } catch (err) {
          setLocation(`Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`);
        }
        setFetchingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to get exact location. Please enable location permissions.");
        setFetchingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchExactLocation();
  }, []);

  const DEPARTMENTS = [
    'Municipal Corporation',
    'Road Department',
    'Sewage Department',
    'Waste Department',
    'Water Department',
    'Electric Department',
    'Public Works Department'
  ];

  const handleLocationSelect = (data) => {
    setLocation(data.address);
    setCoords({ lat: data.lat, lon: data.lon });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    setAnalyzingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:5000/api/analyze-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.description) setText(response.data.description);
      if (response.data.category) {
        const cat = response.data.category.toLowerCase();
        let dept = 'Municipal Corporation';
        if (cat.includes('road')) dept = 'Road Department';
        else if (cat.includes('sewage') || cat.includes('sanitation')) dept = 'Sewage Department';
        else if (cat.includes('waste') || cat.includes('garbage')) dept = 'Waste Department';
        else if (cat.includes('water')) dept = 'Water Department';
        else if (cat.includes('electric') || cat.includes('light')) dept = 'Electric Department';
        setSelectedDept(dept);
      }
    } catch (err) {
      console.error("AI Analysis failed", err);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
    setAnalyzingImage(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      formData.append('department', selectedDept);
      formData.append('userAadhar', userAadhar);
      if (image) formData.append('image', image);

      const response = await axios.post('http://localhost:5000/api/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="gov-card animate-fade-in" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#166534', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
          <CheckCircle2 size={48} />
        </div>
        <h2 style={{ fontSize: '2rem', color: 'var(--gov-navy)', marginBottom: '1rem' }}>Grievance Registered Successfully</h2>
        <p style={{ color: 'var(--gov-text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          Your application has been received and assigned a unique tracking ID. The nodal department has been notified for further action.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', background: 'var(--gov-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gov-border)', maxWidth: '500px', margin: '0 auto 3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>TRACKING ID (SHORT)</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--gov-navy)' }}>#{result._id.slice(-8).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>ASSIGNED DEPT</p>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1e40af' }}>{result.department.toUpperCase()}</p>
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--gov-border)' }}></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>FULL REFERENCE ID (FOR PRECISE TRACKING)</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--gov-text-muted)', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all' }}>{result._id}</p>
          </div>
        </div>
        <div style={{ marginTop: '3rem' }}>
          <button className="btn-gov-primary" onClick={() => setResult(null)}>SUBMIT NEW GRIEVANCE</button>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '3rem' }}>
      <div className="gov-card">
        <h3 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--gov-bg)', paddingBottom: '1rem', color: 'var(--gov-navy)' }}>Grievance Details</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Evidence Upload (Optional)</label>
            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current.click()}
                style={{ 
                  border: '2px dashed var(--gov-border)', borderRadius: 'var(--radius-md)', height: '220px', 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'var(--gov-bg)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--gov-navy)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--gov-border)'}
              >
                <UploadCloud size={48} color="var(--gov-text-muted)" style={{ marginBottom: '1rem' }} />
                <p style={{ fontWeight: 700, color: 'var(--gov-text-muted)' }}>Click to upload or drag image here</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '0.5rem' }}>JPG, PNG up to 5MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageChange} style={{ display: 'none' }} />
              </div>
            ) : (
              <div style={{ position: 'relative', height: '220px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--gov-border)' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={clearImage}
                  type="button"
                  style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <X size={16} />
                </button>
                {analyzingImage && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader2 className="animate-spin" size={32} color="var(--gov-navy)" />
                    <p style={{ fontWeight: 800, marginTop: '1rem', color: 'var(--gov-navy)', fontSize: '0.9rem' }}>AI ANALYZING INCIDENT...</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea 
              className="form-input" 
              style={{ height: '150px', resize: 'none' }}
              placeholder="Describe the issue in detail (e.g., exact nature of problem, nearby landmarks)..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              required={!image}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Incident Location
              <button 
                type="button" 
                onClick={fetchExactLocation}
                className="btn-gov-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />} 
                {fetchingLocation ? 'GETTING GPS...' : 'REFRESH GPS'}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
              <input 
                type="text" 
                className="form-input" 
                style={{ paddingLeft: '3rem' }}
                placeholder="Searching exact location via GPS..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            {coords.lat && (
              <p style={{ fontSize: '0.7rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 800 }}>
                ✓ EXACT COORDINATES CAPTURED: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
              </p>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">Nodal Department</label>
              <select 
                className="form-input"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <button type="submit" className="btn-gov-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> SUBMIT FORM</>}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="gov-card">
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>Precise Geo-Tagging</h4>
          <div style={{ height: '280px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--gov-border)' }}>
            <MapPicker onLocationSelect={handleLocationSelect} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', marginTop: '1rem' }}>
            * Location data helps us dispatch the field team to the exact spot.
          </p>
        </div>

        <div className="ai-feedback-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="var(--gov-navy)" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0, textTransform: 'uppercase' }}>AI Verification System</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-main)', lineHeight: '1.6' }}>
            Once you upload an image, our AI will automatically suggest the <strong>Department</strong> and <strong>Category</strong> of the issue to reduce manual entry errors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrievanceForm;
