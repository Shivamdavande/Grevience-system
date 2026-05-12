import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDept } from '../utils/translationUtils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MapPin, Loader2, Camera, X, CheckCircle2, AlertCircle, FileText, UploadCloud, ShieldCheck, RefreshCw, Navigation } from 'lucide-react';
import MapPicker from './MapPicker';

const GrievanceForm = ({ userAadhar, onSuccess }) => {
  const { t } = useTranslation();
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
  const [ward, setWard] = useState(null);
  const [zone, setZone] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

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
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`, {
            headers: { 'User-Agent': 'AIGrievanceSystem/1.0' }
          });
          if (res.data.display_name) {
            const address = res.data.display_name;
            const addr = res.data.address || {};
            setLocation(address);
            
            // Try to extract Area/City
            const area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town || address.split(',')[0];
            const city = addr.city || addr.county || addr.state || "Bhopal";
            
            setWard(area);
            setZone(city);
          }
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

  const extractWardZone = (sug) => {
    const addr = sug.address || {};
    const full = sug.display_name || "";
    
    // 1. Try structured fields
    let area = addr.suburb || addr.neighbourhood || addr.residential || addr.village || addr.town;
    
    // 2. Fallback: Search for "Ward X" or "Zone X" or known key neighborhoods
    if (!area || (!area.toLowerCase().includes('ward') && !area.toLowerCase().includes('zone'))) {
      const wardMatch = full.match(/ward\s*(\d+)/i);
      const zoneMatch = full.match(/zone\s*(\d+)/i);
      if (wardMatch) area = `Ward ${wardMatch[1]}`;
      else if (zoneMatch) area = `Zone ${zoneMatch[1]}`;
      else {
        // Find the best candidate from address parts (excluding city/country)
        const parts = full.split(',').map(p => p.trim());
        const bestPart = parts.find(p => 
          p.toLowerCase().includes('kokta') || 
          p.toLowerCase().includes('nagar') || 
          p.toLowerCase().includes('ward') || 
          p.toLowerCase().includes('sector') ||
          (p.length < 20 && !p.toLowerCase().includes('bhopal') && !p.toLowerCase().includes('india') && !p.toLowerCase().includes('madhya'))
        );
        area = bestPart || parts[0];

        // Specific Ward 85 Mapping
        const lowerFull = full.toLowerCase();
        const ward85Keywords = ['anandnagar', 'kokta', 'patel nagar', 'indus towne', 'raisen road', 'rapadia', 'bansal college', 'chhan', 'bansal institute'];
        if (ward85Keywords.some(key => lowerFull.includes(key))) {
          area = "Ward 85";
        }
      }
    }
    
    const city = addr.city || addr.county || addr.state || "Bhopal";
    return { area, city };
  };

  // Forward geocoding: Address string -> Suggestions & Coordinates
  useEffect(() => {
    if (!isManualInput || !location || location.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setGeocoding(true);
      try {
        // Narrow search to Bhopal if it looks like a local address
        let searchQuery = location;
        if (!location.toLowerCase().includes('bhopal')) searchQuery += ", Bhopal";
        
        const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5`, {
          headers: { 'User-Agent': 'AIGrievanceSystem/1.0' }
        });
        
        if (res.data && res.data.length > 0) {
          setSuggestions(res.data);
          setShowSuggestions(true);
          
          // Auto-pick the first result's coordinates immediately (like Flipkart)
          const first = res.data[0];
          const lat = parseFloat(first.lat);
          const lon = parseFloat(first.lon);
          setCoords({ lat, lon });
          
          const { area, city } = extractWardZone(first);
          setWard(area);
          setZone(city);
          console.log(`Auto-synced: ${area}, ${city} at ${lat}, ${lon}`);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setGeocoding(false);
      }
    }, 500); // Super fast: 500ms debounce

    return () => clearTimeout(timer);
  }, [location, isManualInput]);

  const handleSuggestionClick = (sug) => {
    setLocation(sug.display_name);
    setCoords({ lat: parseFloat(sug.lat), lon: parseFloat(sug.lon) });
    
    const { area, city } = extractWardZone(sug);
    setWard(area);
    setZone(city);
    
    setSuggestions([]);
    setShowSuggestions(false);
    setIsManualInput(false);
  };

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
      if (ward) formData.append('ward', ward);
      if (zone) formData.append('zone', zone);

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
        <h2 style={{ fontSize: '2rem', color: 'var(--gov-navy)', marginBottom: '1rem' }}>{t('form.success')}</h2>
        <p style={{ color: 'var(--gov-text-muted)', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
          {t('form.subTitle')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem', background: 'var(--gov-bg)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gov-border)', maxWidth: '500px', margin: '0 auto 3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>{t('track.results').toUpperCase()} (SHORT)</p>
              <p style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--gov-navy)' }}>#{result._id.slice(-8).toUpperCase()}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>{t('admin.dept').toUpperCase()}</p>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#1e40af' }}>{translateDept(result.department, t).toUpperCase()}</p>
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--gov-border)' }}></div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--gov-text-muted)', marginBottom: '0.25rem' }}>{t('form.fullRefId')}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--gov-text-muted)', background: '#f1f5f9', padding: '0.5rem', borderRadius: '4px', wordBreak: 'break-all' }}>{result._id}</p>
          </div>
        </div>
        <div style={{ marginTop: '3rem' }}>
          <button className="btn-gov-primary" onClick={() => setResult(null)}>{t('form.submit')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="responsive-grid">
      <div className="gov-card">
        <h3 style={{ marginBottom: '2rem', borderBottom: '2px solid var(--gov-bg)', paddingBottom: '1rem', color: 'var(--gov-navy)' }}>{t('form.detailsTitle')}</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('form.upload')}</label>
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
                <p style={{ fontWeight: 700, color: 'var(--gov-text-muted)' }}>{t('form.upload')}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--gov-text-muted)', marginTop: '0.5rem' }}>{t('form.fileTypes')}</p>
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
                    <p style={{ fontWeight: 800, marginTop: '1rem', color: 'var(--gov-navy)', fontSize: '0.9rem' }}>{t('form.analyzing')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">{t('form.description')}</label>
            <textarea 
              className="form-input" 
              style={{ height: '150px', resize: 'none' }}
              placeholder={t('form.description')}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required={!image}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {t('form.location')}
              <button 
                type="button" 
                onClick={fetchExactLocation}
                className="btn-gov-secondary"
                style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                disabled={fetchingLocation}
              >
                {fetchingLocation ? <Loader2 className="animate-spin" size={12} /> : <RefreshCw size={12} />} 
                {fetchingLocation ? t('form.gpsRefreshing') : t('form.gpsRefresh')}
              </button>
            </label>
            <div style={{ position: 'relative' }}>
              <input 
                className="form-input" 
                style={{ paddingLeft: '2.5rem', paddingRight: '3rem' }}
                placeholder={t('form.location')}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setIsManualInput(true);
                }}
                required
              />
              <MapPin size={20} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
              <button 
                type="button"
                onClick={() => setIsManualInput(true)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gov-navy)' }}
              >
                <Navigation size={18} />
              </button>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ 
                  position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000, 
                  background: 'white', borderRadius: '12px', marginTop: '5px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--gov-border)',
                  maxHeight: '250px', overflowY: 'auto'
                }}>
                  {suggestions.map((sug, idx) => (
                    <div 
                      key={idx}
                      onClick={() => handleSuggestionClick(sug)}
                      style={{ 
                        padding: '12px 16px', cursor: 'pointer', borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f1f5f9',
                        fontSize: '0.85rem', color: 'var(--gov-navy)', transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <MapPin size={16} color="var(--gov-text-muted)" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span>{sug.display_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {geocoding && (
              <p style={{ fontSize: '0.7rem', color: 'var(--gov-navy)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Loader2 size={12} className="animate-spin" /> Fetching coordinates for address...
              </p>
            )}

            {coords.lat && !geocoding && (
              <div style={{ marginTop: '0.75rem', padding: '1rem', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                   <p style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                      <ShieldCheck size={16} /> LOCATION SYNCED
                   </p>
                   <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#15803d', opacity: 0.8 }}>{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ background: 'var(--gov-navy)', color: 'white', padding: '0.3rem', borderRadius: '6px', display: 'flex' }}>
                    <MapPin size={12} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--gov-text-muted)', margin: 0, textTransform: 'uppercase' }}>Routing to Office</p>
                    <input 
                      type="text" 
                      value={ward || ''} 
                      onChange={(e) => setWard(e.target.value)}
                      style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gov-navy)', border: 'none', background: 'transparent', width: '100%', outline: 'none', padding: 0 }}
                      placeholder="Enter Ward/Area"
                    />
                  </div>
                  <RefreshCw size={14} color="var(--gov-navy)" style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => setIsManualInput(true)} />
                </div>
                <p style={{ fontSize: '0.65rem', color: 'var(--gov-text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  * This complaint will be assigned to the <strong>{ward || 'local'}</strong> department office.
                </p>
              </div>
            )}

            <button 
              type="button" 
              onClick={() => setShowMap(!showMap)}
              className="btn-gov-secondary"
              style={{ width: '100%', marginTop: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              <MapPin size={16} /> {showMap ? 'Hide Map' : 'Select on Map'}
            </button>

            {showMap && (
              <div style={{ marginTop: '1rem' }}>
                <MapPicker 
                  initialPos={coords.lat && coords.lon ? [coords.lat, coords.lon] : null}
                  onLocationSelect={(data) => {
                    setCoords({ lat: data.lat, lon: data.lon });
                    setLocation(data.address);
                    setIsManualInput(false); // Map selection is NOT manual typing
                    
                    // Extract Ward/Zone from address
                    const parts = data.address.split(',').map(p => p.trim());
                    const w = parts.find(p => p.toLowerCase().includes('ward'));
                    const z = parts.find(p => p.toLowerCase().includes('zone'));
                    if (w) setWard(w);
                    if (z) setZone(z);
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="form-group">
              <label className="form-label">{t('admin.dept')}</label>
              <select 
                className="form-input"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                style={{ fontWeight: 600 }}
              >
                <option value="Municipal Corporation">{t('form.depts.municipal')}</option>
                <option value="Road Department">{t('form.depts.road')}</option>
                <option value="Sewage Department">{t('form.depts.sewage')}</option>
                <option value="Waste Department">{t('form.depts.waste')}</option>
                <option value="Water Department">{t('form.depts.water')}</option>
                <option value="Electric Department">{t('form.depts.electric')}</option>
                <option value="Public Works Department">{t('form.depts.pwd')}</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn-gov-primary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> {t('form.submit')}</>}
          </button>
        </form>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="gov-card">
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '1.5rem', textTransform: 'uppercase' }}>{t('form.geoTagging')}</h4>
          <div style={{ height: '280px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--gov-border)' }}>
            <MapPicker onLocationSelect={handleLocationSelect} />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', marginTop: '1rem' }}>
            {t('form.geoSub')}
          </p>
        </div>

        <div className="ai-feedback-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={20} color="var(--gov-navy)" />
            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0, textTransform: 'uppercase' }}>{t('form.aiVerification')}</h4>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--gov-text-main)', lineHeight: '1.6' }}>
            {t('form.aiVerificationSub')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GrievanceForm;
