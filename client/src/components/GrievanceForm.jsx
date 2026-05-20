import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { translateDept } from '../utils/translationUtils';
import axios from 'axios';
import { API_URL } from '../config';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  MapPin,
  Camera,
  X,
  CheckCircle2,
  UploadCloud,
  ShieldCheck,
  RefreshCw,
  Building2,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  Info,
  Check,
  Search,
  Globe,
  Shield,
  Mic,
  MicOff
} from 'lucide-react';
import MapPicker from './MapPicker';

const GrievanceForm = ({ userAadhar, onSuccess, onBack }) => {
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState(1);
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
  const [reporterName, setReporterName] = useState('');
  const [reporterEmail, setReporterEmail] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [ward, setWard] = useState(null);
  const [zone, setZone] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [isManualInput, setIsManualInput] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const prevLangRef = useRef(i18n.language);

  // Dynamically translate text if language changes
  useEffect(() => {
    const translateExistingText = async () => {
      if (text && prevLangRef.current !== i18n.language) {
        try {
          const transRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${prevLangRef.current}&tl=${i18n.language}&dt=t&q=${encodeURIComponent(text)}`);
          if (transRes.data && transRes.data[0] && transRes.data[0][0]) {
            setText(transRes.data.map(chunk => chunk[0]).join(''));
          }
        } catch (e) {
          console.error("Auto translation failed on lang change", e);
        }
        prevLangRef.current = i18n.language;
      }
    };
    translateExistingText();
  }, [i18n.language, text]);


  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentTranscript += transcript + ' ';
          }
        }
        if (currentTranscript) {
          setText(prev => prev + currentTranscript);
        }
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(t('form.speechNotSupported') || "Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      // Map i18n languages to SpeechRecognition locales
      let langCode = 'en-IN';
      if (i18n.language === 'hi') langCode = 'hi-IN';
      else if (i18n.language === 'mr') langCode = 'mr-IN';
      else if (i18n.language === 'bn') langCode = 'bn-IN';
      else if (i18n.language === 'ta') langCode = 'ta-IN';
      else if (i18n.language === 'te') langCode = 'te-IN';
      
      recognitionRef.current.lang = langCode;
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const fetchExactLocation = () => {
    if (!navigator.geolocation) return;
    setFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lon: longitude });
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`);
          if (res.data.display_name) {
            setLocation(res.data.display_name);
            const addr = res.data.address || {};
            setWard(addr.suburb || addr.neighbourhood || addr.residential || "Unknown Area");
            setZone(addr.city || addr.county || "Bhopal");
          }
        } catch (err) {
          console.error(err);
        } finally {
          setFetchingLocation(false);
        }
      },
      () => setFetchingLocation(false),
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
          
          // Auto-pick the first result's ward/zone immediately
          const first = res.data[0];
          
          const { area, city } = extractWardZone(first);
          setWard(area);
          setZone(city);
          console.log(`Auto-synced: ${area}, ${city}`);
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
      const response = await axios.post(`${API_URL}/api/analyze-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let desc = response.data.description;
      if (desc && i18n.language && i18n.language !== 'en') {
        try {
          const transRes = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${i18n.language}&dt=t&q=${encodeURIComponent(desc)}`);
          if (transRes.data && transRes.data[0] && transRes.data[0][0]) {
            desc = transRes.data[0][0][0];
          }
        } catch (e) {
          console.error("Translation failed", e);
        }
      }
      if (desc) setText(prev => prev ? prev + ' ' + desc : desc);

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
      console.error(err);
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('text', text);
      formData.append('location', location || 'Location not provided');
      if (coords.lat) formData.append('lat', coords.lat);
      if (coords.lon) formData.append('lon', coords.lon);
      formData.append('department', selectedDept);
      formData.append('userEmail', userAadhar || 'anonymous');

      if (image) formData.append('image', image);
      if (ward) formData.append('ward', ward);
      if (zone) formData.append('zone', zone);

      const response = await axios.post(`${API_URL}/api/complaints`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white max-w-xl w-full p-12 text-center rounded-xl shadow-2xl border-t-8 border-gov-green"
        >
          <div className="bg-gov-green/10 w-24 h-24 rounded-full flex items-center justify-center text-gov-green mx-auto mb-8">
            <Check size={48} strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-serif text-gov-navy mb-4">{t('form.successTitle', 'Grievance Registered')}</h2>
          <p className="text-gray-600 mb-10 leading-relaxed">
            {t('form.successDesc', 'Your grievance has been successfully submitted to the')} **{translateDept(selectedDept, t)}**. {t('form.successDesc2', 'Our AI engine is currently processing the assignment.')}
          </p>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-10">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">{t('form.trackingId', 'Reference Tracking ID')}</p>
            <p className="text-3xl font-bold text-gov-navy tracking-wider">#{result._id.slice(-8).toUpperCase()}</p>
          </div>
          <button
            onClick={() => onSuccess ? onSuccess() : window.location.reload()}
            className="w-full bg-gov-navy hover:bg-gov-navy-deep text-white py-4 rounded-md font-bold text-lg transition-all shadow-lg"
          >
            {t('form.goDashboard', 'Go to Dashboard')}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gov-navy text-white px-6 py-2 rounded-full mb-6 shadow-lg">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">{t('form.systemName', 'Public Grievance System')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif text-gov-navy mb-4">{t('form.lodgeComplaint', 'Lodge Your Complaint')}</h2>
          <p className="text-gray-600 font-medium">{t('form.lodgeSub', 'Please provide accurate details for effective redressal.')}</p>
        </div>

        {/* Professional Step Indicator */}
        <div className="flex justify-between items-center mb-16 px-4 md:px-20 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 -translate-y-1/2 hidden md:block"></div>
          {[
            { id: 1, label: t('form.stepIncident', 'Incident'), icon: Camera },
            { id: 2, label: t('form.stepLocation', 'Location'), icon: MapPin }
          ].map((s) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all border-4 ${step >= s.id ? 'bg-gov-navy border-gov-navy text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                <s.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold mt-3 uppercase tracking-widest ${step >= s.id ? 'text-gov-navy' : 'text-gray-400'}`}>{s.label}</span>
            </div>
          ))}
        </div>

        <motion.div
          layout
          className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-serif text-gov-navy mb-8 border-b pb-4 flex items-center gap-3">
                    <Camera className="text-gov-saffron" />
                    {t('form.incidentDetails', 'Incident Details')}
                  </h3>

                  <div className="space-y-8">
                    {!imagePreview ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all"
                      >
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="font-bold text-gov-navy">{t('form.uploadPhoto', 'Click to capture or upload photo')}</p>
                        <p className="text-xs text-gray-400 mt-2">{t('form.maxSize', 'Maximum file size: 10MB (JPEG, PNG)')}</p>
                      </div>
                    ) : (
                      <div className="relative rounded-xl overflow-hidden shadow-lg h-80">
                        <img src={imagePreview} className="w-full h-full object-cover" alt="Incident" />
                        <button
                          onClick={() => { setImage(null); setImagePreview(null); }}
                          className="absolute top-4 right-4 bg-white/90 p-2 rounded-full text-red-500 shadow-md hover:bg-white"
                        >
                          <X className="w-6 h-6" />
                        </button>
                        {analyzingImage && (
                          <div className="absolute inset-0 bg-gov-navy/80 flex flex-col items-center justify-center text-white backdrop-blur-sm">
                            <RefreshCw className="w-12 h-12 animate-spin text-gov-saffron mb-4" />
                            <p className="font-bold tracking-widest text-sm uppercase">{t('form.analyzing', 'AI Analyzing Incident...')}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleImageChange} />

                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest">{t('form.problemDesc', 'Problem Description')}</label>
                        <button
                          type="button"
                          onClick={toggleListening}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            isListening 
                              ? 'bg-red-100 text-red-600 animate-pulse border border-red-200' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 shadow-sm'
                          }`}
                        >
                          {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-gov-saffron animate-bounce" />}
                          {isListening ? 'Stop Listening' : 'Speak to Write'}
                        </button>
                      </div>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('form.problemPlaceholder', 'Describe the issue in detail...')}
                        className="w-full p-6 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20 min-h-[150px] text-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-12 pt-8 border-t">
                    <button
                      onClick={nextStep}
                      disabled={!image && !text}
                      className="bg-gov-navy hover:bg-gov-navy-deep text-white px-10 py-4 rounded-md font-bold flex items-center gap-3 transition-all disabled:opacity-50 shadow-lg"
                    >
                      {t('form.nextLocation', 'Next: Location')}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h3 className="text-2xl font-serif text-gov-navy mb-8 border-b pb-4 flex items-center gap-3">
                    <MapPin className="text-gov-saffron" />
                    {t('form.locationDetails', 'Location Details')}
                  </h3>

                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="relative flex-grow">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gov-saffron w-5 h-5" />
                        <input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder={t('form.locationPlaceholder', 'Search or enter location address...')}
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gov-navy/20 font-bold"
                        />
                      </div>
                      <button
                        onClick={() => setShowMap(!showMap)}
                        className={`p-4 rounded-lg border-2 transition-all ${showMap ? 'bg-gov-navy border-gov-navy text-white' : 'border-gray-200 text-gov-navy hover:bg-gray-50'}`}
                      >
                        <Globe className="w-6 h-6" />
                      </button>
                    </div>

                    {showMap && (
                      <div className="h-96 rounded-xl overflow-hidden border border-gray-200 shadow-inner">
                        <MapPicker onLocationSelect={(lat, lon, address, area, city) => { setCoords({ lat, lon }); setLocation(address); setWard(area); setZone(city); }} initialCoords={coords.lat ? [coords.lat, coords.lon] : null} />
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t('form.targetDept', 'Target Department')}</label>
                        <div className="relative">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gov-saffron w-5 h-5 z-10" />
                          <select
                            value={selectedDept}
                            onChange={(e) => setSelectedDept(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-lg appearance-none font-bold text-gov-navy focus:outline-none focus:ring-2 focus:ring-gov-navy/20"
                          >
                            {['Municipal Corporation', 'Road Department', 'Sewage Department', 'Waste Department', 'Water Department', 'Electric Department'].map(d => <option key={d} value={d}>{translateDept(d, t)}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="bg-gov-saffron/10 p-5 rounded-lg border border-gov-saffron/20 flex gap-4">
                        <Info className="w-6 h-6 text-gov-saffron shrink-0" />
                        <p className="text-sm text-gov-navy leading-relaxed font-medium">{t('form.aiDeptMsg', 'AI has automatically identified the most suitable department for this grievance.')}</p>
                      </div>
                    </div>

                    {coords.lat && !geocoding && (
                      <div className="mt-8 p-5 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                           <p className="text-xs text-gov-green font-bold flex items-center gap-2 m-0 uppercase tracking-widest">
                              <ShieldCheck className="w-4 h-4" /> {t('form.locationSynced', 'LOCATION SYNCED')}
                           </p>
                           <span className="text-[10px] font-bold text-gov-green opacity-80">{coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                          <div className="bg-gov-navy text-white p-2 rounded-md flex">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-gray-500 m-0 uppercase tracking-widest">{t('form.routingTo', 'Routing to Office')}</p>
                            <input 
                              type="text" 
                              value={ward || ''} 
                              onChange={(e) => setWard(e.target.value)}
                              className="text-sm font-bold text-gov-navy border-none bg-transparent w-full outline-none p-0 focus:ring-0"
                              placeholder={t('form.wardPlaceholder', 'Enter Ward/Area')}
                            />
                          </div>
                          <button onClick={() => setIsManualInput(true)} className="p-2 hover:bg-gray-100 rounded-md transition-all">
                            <RefreshCw className="w-4 h-4 text-gov-navy opacity-50" />
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-3 italic font-bold">
                          * {t('form.assignedTo', 'This complaint will be assigned to the')} <strong className="text-gov-navy">{ward || 'local'}</strong> {t('form.deptOffice', 'department office.')}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between mt-12 pt-8 border-t">
                    <button onClick={prevStep} className="flex items-center gap-2 font-bold text-gov-navy hover:text-gov-navy-deep">
                      <ArrowLeft className="w-5 h-5" /> {t('form.back', 'Back')}
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (!image && !text)}
                      className="bg-gov-navy hover:bg-gov-navy-deep text-white px-12 py-4 rounded-md font-bold text-lg flex items-center gap-4 transition-all disabled:opacity-50 shadow-2xl"
                    >
                      {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className="w-6 h-6" />}
                      {loading ? t('form.registering', "Registering...") : t('form.submitBtn', "Submit Grievance")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GrievanceForm;
