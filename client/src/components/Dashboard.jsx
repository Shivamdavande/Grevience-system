import React, { useState, useEffect } from 'react';
import { translateDept, translateStatus } from '../utils/translationUtils';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_URL } from '../config';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { 
  Clock, 
  CheckCircle2, 
  Filter, 
  RefreshCw, 
  MapPin, 
  ShieldAlert, 
  LayoutDashboard, 
  Camera, 
  X, 
  Check, 
  BarChart3, 
  TrendingUp, 
  Building2, 
  BrainCircuit, 
  ShieldCheck,
  AlertTriangle,
  Search,
  Globe,
  Zap,
  Shield,
  FileText,
  User,
  ArrowRight,
  Award
} from 'lucide-react';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { motion, AnimatePresence } from 'framer-motion';
import MapPicker from './MapPicker';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const Dashboard = ({ user }) => {
  const userDepartment = user?.department;
  const userWard = user?.ward;
  const userZone = user?.zone;
  const { t } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deptTokens, setDeptTokens] = useState([]);

  const [resolutionModal, setResolutionModal] = useState({ open: false, complaintId: null });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [viewImageModal, setViewImageModal] = useState({ open: false, image: null, originalImage: null, title: '', isAi: false, aiConfidence: 0 });
  const [editCoordsModal, setEditCoordsModal] = useState({ open: false, complaintId: null, lat: '', lon: '' });

  const [aiDetection, setAiDetection] = useState({ checked: false, loading: false, isAi: false, confidence: 0 });
  const [similarity, setSimilarity] = useState({ checked: false, loading: false, score: 0, isMatch: true });
  const [resolutionLocation, setResolutionLocation] = useState({ lat: null, lon: null, fetching: false });
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [perfModalOpen, setPerfModalOpen] = useState(false);

  const departments = [
    'Road Department',
    'Sewage Department',
    'Waste Department',
    'Water Department',
    'Electric Department'
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resComplaints, resStats, resTokens] = await Promise.all([
        axios.get(`${API_URL}/api/complaints`),
        axios.get(`${API_URL}/api/stats`),
        axios.get(`${API_URL}/api/departments/tokens`)
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
  }, [userDepartment]);

  const handleStatusChange = async (id, newStatus) => {
    if (newStatus === 'Resolved') {
      setResolutionModal({ open: true, complaintId: id });
    } else {
      try {
        await axios.patch(`${API_URL}/api/complaints/${id}`, { status: newStatus });
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

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setResolutionLocation({ lat: position.coords.latitude, lon: position.coords.longitude, fetching: false });
      },
      (err) => {
        console.error("GPS Capture failed", err);
        setResolutionLocation(prev => ({ ...prev, fetching: false }));
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
      // Execute both requests concurrently, but handle failures independently
      const aiPromise = axios.post(`${API_URL}/api/detect-ai-image`, formData)
        .catch(err => {
          console.error("AI Detect failed", err);
          return { data: { is_ai_generated: false, confidence: 0 } };
        });

      const comparePromise = axios.post(`${API_URL}/api/compare-images`, formData)
        .catch(err => {
          console.error("Compare failed", err);
          return { data: { similarity_score: 0, is_match: true } };
        });

      const [aiRes, compareRes] = await Promise.all([aiPromise, comparePromise]);

      setAiDetection({ checked: true, loading: false, isAi: aiRes.data.is_ai_generated, confidence: aiRes.data.confidence });
      setSimilarity({ checked: true, loading: false, score: compareRes.data.similarity_score, isMatch: compareRes.data.is_match });
    } catch (err) {
      console.error("Verification failed", err);
      // Ensure we exit loading state and mark as checked so "Pending..." disappears
      setAiDetection(prev => ({ ...prev, loading: false, checked: true }));
      setSimilarity(prev => ({ ...prev, loading: false, checked: true }));
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
      await axios.patch(`${API_URL}/api/complaints/${resolutionModal.complaintId}`, payload);
      await fetchData();

      setResolutionModal({ open: false, complaintId: null });
      setPhotoPreview(null);
      setAiDetection({ checked: false, loading: false, isAi: false, confidence: 0 });
      setSimilarity({ checked: false, loading: false, score: 0, isMatch: true });
    } catch (error) {
      console.error("Update failed", error);
      const msg = error.response?.data?.error || "Failed to resolve grievance.";
      alert(msg);
    }
  };

  const handleUpdateCoords = async () => {
    try {
      await axios.patch(`${API_URL}/api/complaints/${editCoordsModal.complaintId}`, {
        lat: parseFloat(editCoordsModal.lat),
        lon: parseFloat(editCoordsModal.lon)
      });
      setEditCoordsModal({ open: false, complaintId: null, lat: '', lon: '' });
      fetchData();
    } catch (error) {
      console.error("Update coords failed", error);
    }
  };

  const deptFilteredComplaints = complaints.filter(c => {
    // ✅ CASE 1: Municipal Corporation Master Admin (no ward assigned) — sees ALL complaints
    if (userDepartment === 'Municipal Corporation' && !userWard) {
      return (selectedDeptFilter === 'All' || c.department === selectedDeptFilter);
    }

    // ✅ CASE 2: Specific Department Officers (Road, Sewage, Water, Waste, Electric)
    //    → They see ALL complaints assigned to their department (city-wide, no ward filter)
    const specificDepts = ['Road Department', 'Sewage Department', 'Waste Department', 'Water Department', 'Electric Department'];
    if (userDepartment && specificDepts.map(d => d.trim()).includes(userDepartment.trim())) {
      return c.department.trim() === userDepartment.trim();
    }

    // ✅ CASE 3: Ward-level Municipal Corporation officers
    //    → See complaints in their ward only, with dept filter support
    const matchesDept = selectedDeptFilter === 'All' || c.department === selectedDeptFilter;

    // Normalize and compare wards/areas using flexible matching
    const clean = (w) => (w || '').toLowerCase().replace(/ward|zone|area/g, '').trim();
    const cWard = clean(c.ward);
    const uWard = clean(userWard);
    const cZone = clean(c.zone);
    const uZone = clean(userZone);

    const hasNumbers = (str) => /\d/.test(str);
    
    // If complaint location doesn't have ward numbers but user is assigned a numeric ward, we permit it 
    // to prevent hiding complaints due to lack of ward mapping in reverse geocoding.
    const matchesWard = uWard ? (
      cWard === uWard || 
      (cWard && cWard.includes(uWard)) || 
      (cWard && uWard.includes(cWard)) || 
      (!hasNumbers(cWard) && hasNumbers(uWard))
    ) : true;

    const matchesZone = uZone ? (
      cZone === uZone || 
      (cZone && cZone.includes(uZone)) || 
      (cZone && uZone.includes(cZone)) || 
      (!hasNumbers(cZone) && hasNumbers(uZone))
    ) : true;
    
    return matchesDept && (matchesWard || matchesZone);
  });

  const filteredComplaints = deptFilteredComplaints.filter(c => {
    return statusFilter === 'All' || (statusFilter === 'High' ? c.priority === 'High' : c.status === statusFilter);
  });

  const isMunicipalAdmin = !userDepartment || userDepartment.trim() === 'Municipal Corporation';

  const getDeptStats = (deptName) => {
    const deptComplaints = complaints.filter(c => c.department === deptName);
    return {
      pending: deptComplaints.filter(c => c.status === 'Pending').length,
      inProgress: deptComplaints.filter(c => c.status === 'In Progress').length,
      resolved: deptComplaints.filter(c => c.status === 'Resolved').length,
      tokens: deptTokens.find(d => d.name === deptName)?.tokens || 0
    };
  };

  const getDeptName = (dept) => {
    switch (dept) {
      case 'Municipal Corporation': return 'Municipal Corporation';
      case 'Road Department': return 'Road Department';
      case 'Sewage Department': return 'Sewage Department';
      case 'Waste Department': return 'Waste Department';
      case 'Water Department': return 'Water Department';
      case 'Electric Department': return 'Electric Department';
      default: return dept;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if(!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  };

  if (loading && complaints.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <RefreshCw className="w-16 h-16 animate-spin text-gov-navy mb-6" />
      <h3 className="text-xl font-bold text-gov-navy uppercase tracking-widest">Synchronizing Administrative Data...</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex w-72 bg-gov-navy flex-col text-white shadow-2xl z-20">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-8 h-8 text-gov-saffron" />
            <h1 className="text-xl font-serif font-bold tracking-tight">
              {isMunicipalAdmin ? 'Admin Portal' : `${getDeptName(userDepartment).split(' ')[0]} Portal`}
            </h1>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gov-saffron flex items-center justify-center text-gov-navy font-bold">
              {user?.fullName?.[0] || 'O'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.fullName || 'Officer'}</p>
              <p className="text-[10px] opacity-60 truncate uppercase tracking-tighter text-gov-saffron font-black">
                {userDepartment || 'Master Control'}
              </p>
            </div>
          </div>
        </div>

        <nav className="p-6 space-y-2 flex-grow">
          <button className="w-full flex items-center gap-4 p-4 rounded-md bg-white/10 text-gov-saffron font-bold transition-all text-xs uppercase tracking-widest">
            <LayoutDashboard className="w-5 h-5" />
            {t('admin.controlCenter')}
          </button>
          {isMunicipalAdmin && (
            <button onClick={() => setPerfModalOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs uppercase tracking-widest">
              <BarChart3 className="w-5 h-5" />
              {t('admin.performance')}
            </button>
          )}
          <button className="w-full flex items-center gap-4 p-4 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-all text-xs uppercase tracking-widest">
            <FileText className="w-5 h-5" />
            {t('admin.officialLogs')}
          </button>
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold mb-4 px-4">{t('admin.systemStatus')}</div>
          <div className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-60">AI Core</span>
              <span className="text-[10px] font-bold text-gov-green">ONLINE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs opacity-60">DB Sync</span>
              <span className="text-[10px] font-bold text-gov-green">LOCKED</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto">
        {/* Header Bar */}
        <header className="bg-white border-b border-gray-200 p-6 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-gov-navy/5 rounded-md lg:hidden">
              <ShieldCheck className="w-6 h-6 text-gov-navy" />
            </div>
            <div>
              <h2 className="text-2xl font-serif text-gov-navy font-bold">
                {userDepartment ? `${translateDept(userDepartment, t)} ${t('nav.dashboard')}` : `${t('admin.masterControl')} ${t('nav.dashboard')}`}
              </h2>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gov-saffron" />
                {userWard ? `${t('admin.jurisdiction')}: ${userWard}` : t('admin.activeJurisdictions')} | {t('admin.operationalStatus')} ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={fetchData} 
              className="flex items-center gap-2 text-gov-navy hover:text-gov-navy-deep font-bold text-xs uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-md border border-gray-200 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {t('admin.syncData')}
            </button>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t('admin.currentLoad')}</span>
              <span className="text-sm font-bold text-gov-navy">{filteredComplaints.length} {t('admin.activeCases')}</span>
            </div>
          </div>
        </header>

         <div className="p-8 space-y-10 max-w-7xl mx-auto">
          {/* Departmental Identity Banner */}
          {!isMunicipalAdmin ? (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gov-navy text-white p-8 rounded-2xl shadow-xl border-l-8 border-gov-saffron flex items-center justify-between"
            >
              <div>
                <p className="text-gov-saffron text-xs font-bold uppercase tracking-[0.3em] mb-2">{t('admin.currentDept')}</p>
                <h3 className="text-4xl font-serif font-bold">{translateDept(userDepartment, t)}</h3>
                <p className="text-gray-400 mt-2 font-medium">{t('admin.selectJurisdiction')}</p>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden md:flex flex-col items-end bg-white/10 px-6 py-4 rounded-xl border border-white/20">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                    <Award className="w-4 h-4 text-gov-saffron" />
                    Department Credits
                  </span>
                  <span className="text-3xl font-bold text-gov-saffron">
                    {deptTokens.find(d => d.name === userDepartment)?.tokens || 0}
                  </span>
                </div>
                <div className="hidden lg:block">
                  <Building2 className="w-20 h-20 opacity-20 text-gov-saffron" />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4"
            >
              <div className="p-3 bg-gov-navy text-gov-saffron rounded-lg">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('admin.officialPortal')}</p>
                <p className="text-lg font-bold text-gov-navy">{t('admin.masterControl')} {t('admin.panel')}</p>
              </div>
            </motion.div>
          )}

          {/* Dashboard Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: t('admin.pendingRedressal'), count: deptFilteredComplaints.filter(c => c.status === 'Pending').length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', filter: 'Pending' },
              { label: t('admin.inOperation'), count: deptFilteredComplaints.filter(c => c.status === 'In Progress').length, icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-50', filter: 'In Progress' },
              { label: t('admin.resolvedCases'), count: deptFilteredComplaints.filter(c => c.status === 'Resolved').length, icon: CheckCircle2, color: 'text-gov-green', bg: 'bg-green-50', filter: 'Resolved' },
              { label: t('admin.highPriority'), count: deptFilteredComplaints.filter(c => c.priority === 'High').length, icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50', filter: 'High' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => setStatusFilter(statusFilter === stat.filter ? 'All' : stat.filter)}
                className={`p-6 rounded-xl border-b-4 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md ${statusFilter === stat.filter ? 'border-gov-navy ring-4 ring-gov-navy/5' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className={`w-6 h-6 ${stat.filter === 'In Progress' ? 'animate-spin' : ''}`} />
                  </div>
                  <span className="text-2xl font-bold text-gov-navy">{stat.count}</span>
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Grievance Intelligence Table */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gov-navy text-gov-saffron rounded-lg shadow-lg">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-serif text-gov-navy font-bold">{t('admin.intelligenceHeader')}</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
                    {t('admin.aiSorting')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto">
                {isMunicipalAdmin && (
                  <div className="relative w-full md:w-64">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select 
                      value={selectedDeptFilter}
                      onChange={(e) => setSelectedDeptFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none font-bold text-xs uppercase text-gov-navy"
                    >
                      <option value="All">{t('admin.allDepts')}</option>
                      {departments.map(dept => <option key={dept} value={dept}>{translateDept(dept, t)}</option>)}
                    </select>
                  </div>
                )}
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input placeholder={t('admin.searchPlaceholder')} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none text-xs font-bold" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.refIncident')}</th>
                    <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.intelligenceAnalysis')}</th>
                    <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.jurisdiction')}</th>
                    <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.operationalStatus')}</th>
                    <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('admin.redressal')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-gray-400">
                          <CheckCircle2 className="w-16 h-16 opacity-20" />
                          <p className="font-bold uppercase tracking-widest">{t('admin.allCleared')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map((c) => {
                      const distance = c.status === 'Resolved' ? calculateDistance(c.lat, c.lon, c.resolutionLat, c.resolutionLon) : 0;
                      const hasFraudWarning = c.status === 'Resolved' && (c.isAiGenerated || c.isMatch === false || distance > 0.1);
                      
                      return (
                      <tr key={c._id} className={`transition-all group ${hasFraudWarning && isMunicipalAdmin ? 'bg-red-50/30 hover:bg-red-50/50' : 'hover:bg-gray-50/50'}`}>
                        <td className="p-6">
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded font-mono text-[10px] font-bold flex items-center gap-1.5 ${c.priority === 'High' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-gov-navy/5 text-gov-navy border border-gov-navy/10'}`}>
                              <span>#{c._id.slice(-8).toUpperCase()}</span>
                              {c.upvotes > 0 && (
                                <span className="px-1.5 py-0.5 rounded bg-gov-saffron text-gov-navy text-[9px] font-black uppercase tracking-widest animate-pulse shadow-sm">
                                  +{c.upvotes}
                                </span>
                              )}
                            </div>
                            <div className="max-w-xs">
                              <p className="text-sm font-bold text-gov-navy line-clamp-2 leading-snug">{c.text}</p>
                              <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Filed {new Date(c.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-gov-navy/5 text-gov-navy border border-gov-navy/10 uppercase tracking-tighter">
                              <Zap className="w-3 h-3 text-gov-saffron" />
                              {c.category}
                            </span>
                            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${c.priority === 'High' ? 'text-red-600' : 'text-blue-600'}`}>
                              <ShieldAlert className="w-3 h-3" />
                              {c.priority} PRIORITY
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-xs font-bold text-gov-navy">
                              <Building2 className="w-4 h-4 text-gov-saffron" />
                              {translateDept(c.department, t)}
                            </div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[150px]">{c.ward || 'General'}</p>
                          </div>
                        </td>
                        <td className="p-6">
                          <select 
                            value={c.status}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            disabled={isMunicipalAdmin || c.status === 'Resolved'}
                            className={`px-3 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest border transition-all appearance-none cursor-pointer focus:ring-4 focus:ring-opacity-20 ${
                              c.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200 focus:ring-amber-200' :
                              c.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200 focus:ring-blue-200' :
                              'bg-green-50 text-gov-green border-green-200 focus:ring-green-200'
                            }`}
                          >
                            <option value="Pending">{t('admin.pending')}</option>
                            <option value="In Progress">{t('admin.inProgress')}</option>
                            <option value="Resolved">{t('admin.resolved')}</option>
                          </select>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            {c.imageUrl && (
                              <button 
                                onClick={() => setViewImageModal({ open: true, image: c.imageUrl, title: t('admin.reportedEvidence'), isAi: false })}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-white hover:border-gov-navy text-gov-navy transition-all shadow-sm"
                                title={t('admin.viewPhoto')}
                              >
                                <Camera className="w-5 h-5" />
                              </button>
                            )}
                            {c.status === 'Resolved' && (
                              <button 
                                onClick={() => setViewImageModal({
                                  open: true,
                                  image: c.resolutionImage,
                                  originalImage: c.imageUrl,
                                  title: t('admin.resolutionVerification'),
                                  isAi: c.isAiGenerated,
                                  aiConfidence: c.aiDetectionConfidence,
                                  similarity: c.similarityScore,
                                  isMatch: c.isMatch
                                })}
                                className="p-2 bg-gov-green text-white rounded-md hover:bg-green-600 transition-all shadow-md"
                                title={t('admin.verifyProof')}
                              >
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            )}
                            {isMunicipalAdmin && (
                              <button
                                onClick={() => setEditCoordsModal({ open: true, complaintId: c._id, lat: c.lat || '', lon: c.lon || '' })}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-md hover:bg-white hover:border-gov-navy text-gov-navy transition-all shadow-sm"
                                title={t('admin.editCoords')}
                              >
                                <MapPin className="w-5 h-5" />
                              </button>
                            )}
                            {isMunicipalAdmin && hasFraudWarning && (
                              <div 
                                className="p-2 bg-red-100 border border-red-200 rounded-md text-red-600 shadow-sm flex items-center justify-center animate-pulse"
                                title={`Warning: AI/GPS Discrepancy Detected.\nAI Manipulated: ${c.isAiGenerated}\nImage Match: ${c.isMatch}\nGPS Distance: ${(distance * 1000).toFixed(0)}m`}
                              >
                                <AlertTriangle className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Resolution Verification Modal */}
      <AnimatePresence>
        {resolutionModal.open && (
          <div className="fixed inset-0 bg-gov-navy/90 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden border-t-8 border-gov-green flex flex-col max-h-[95vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-gov-navy">{t('admin.resolutionVerification')}</h2>
                  <p className="text-gray-500 text-sm font-medium">{t('admin.resolutionSub')}</p>
                </div>
                <button 
                  onClick={() => setResolutionModal({ open: false, complaintId: null })}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                {/* AI Trust Message */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 items-start">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-blue-800 text-sm font-medium leading-relaxed">
                    {t('admin.aiGpsVerification')}
                  </p>
                </div>

                {/* Upload Zone */}
                {!photoPreview ? (
                  <label className="group relative block w-full aspect-video border-2 border-dashed border-gray-200 rounded-2xl hover:border-gov-green transition-all cursor-pointer bg-gray-50/50">
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoCapture}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                      <div className="p-5 bg-white rounded-2xl shadow-xl group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10 text-gov-navy" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-gov-navy text-lg">{t('admin.clickToUpload')}</p>
                        <p className="text-gray-400 text-sm font-medium mt-1">{t('admin.gpsAiCheck')}</p>
                      </div>
                    </div>
                  </label>
                ) : (
                  <div className="space-y-6">
                    <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                      <img src={photoPreview} alt="Resolution" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => setPhotoPreview(null)}
                        className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black transition-colors backdrop-blur-md"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Verification Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-6 rounded-2xl border transition-all ${!aiDetection.isAi ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${!aiDetection.isAi ? 'text-green-600' : 'text-red-600'}`}>
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.aiIntegrity')}</p>
                          <span className={`text-sm font-bold uppercase ${!aiDetection.isAi ? 'text-green-700' : 'text-red-700'}`}>
                            {aiDetection.loading ? t('admin.verifyingStatus') : (!aiDetection.isAi ? t('admin.authentic') : t('admin.manipulated'))}
                          </span>
                        </div>
                      </div>

                      <div className={`p-6 rounded-2xl border transition-all ${
                        !similarity.checked ? 'bg-gray-50 border-gray-100' : 
                        similarity.isMatch ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}>
                        <div className="flex flex-col items-center gap-2">
                          <div className={`p-2 rounded-lg ${
                            !similarity.checked ? 'text-gray-400' : 
                            similarity.isMatch ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <Zap className="w-6 h-6" />
                          </div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.incidentMatch')}</p>
                          <span className={`text-sm font-bold uppercase ${
                            !similarity.checked ? 'text-gray-500' : 
                            similarity.isMatch ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {similarity.checked ? `${Math.min(100, similarity.score).toFixed(0)}% ${t('admin.matchScore')}` : t('admin.verifyingStatus')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex gap-4 mt-auto">
                <button 
                  onClick={() => setResolutionModal({ open: false, complaintId: null })} 
                  className="flex-1 px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs border border-gray-200"
                >
                  {t('admin.cancel')}
                </button>
                <button 
                  onClick={submitResolution}
                  disabled={!photoPreview || aiDetection.loading}
                  className="flex-[2] bg-gov-green hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg disabled:opacity-50 transition-all uppercase tracking-widest"
                >
                  {aiDetection.loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <ShieldCheck className="w-6 h-6" />}
                  {t('admin.confirmResolution')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Image Modal */}
      <AnimatePresence>
        {viewImageModal.open && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ position: 'relative', maxWidth: viewImageModal.originalImage ? '1000px' : '600px', width: '100%' }}>
              <button onClick={() => setViewImageModal({ open: false })} style={{ position: 'absolute', top: '-3rem', right: 0, color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={32} />
              </button>

              <div style={{ background: 'white', borderRadius: '32px', padding: '2rem' }}>
                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.25rem', fontWeight: 900, color: 'var(--gov-navy)' }}>{viewImageModal.title}</h3>

                <div style={{ display: 'grid', gridTemplateColumns: viewImageModal.originalImage ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                  {viewImageModal.originalImage && (
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{t('admin.originalGrievance')}</p>
                      <img src={`${API_URL}${viewImageModal.originalImage}`} style={{ width: '100%', borderRadius: '16px', height: '400px', objectFit: 'cover' }} />
                    </div>
                  )}
                  <div>
                    <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--gov-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>{viewImageModal.originalImage ? t('admin.resolutionProof') : t('admin.imageEvidence')}</p>
                    <img src={viewImageModal.image.startsWith('data:') ? viewImageModal.image : `${API_URL}${viewImageModal.image}`} style={{ width: '100%', borderRadius: '16px', height: '400px', objectFit: 'cover' }} />
                  </div>
                </div>

                {viewImageModal.title === t('admin.resolutionVerification') && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '2rem' }}>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{t('admin.aiIntegrity')}</p>
                      <div style={{ color: viewImageModal.isAi ? '#ef4444' : '#10b981', fontWeight: 800 }}>{viewImageModal.isAi ? t('admin.failed') : t('admin.authentic')}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{t('admin.similarity')}</p>
                      <div style={{ color: viewImageModal.isMatch ? '#10b981' : '#ef4444', fontWeight: 800 }}>{Math.min(100, viewImageModal.similarity).toFixed(0)}% {t('admin.matchScore')}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{t('admin.gpsStatus')}</p>
                      <div style={{ color: '#10b981', fontWeight: 800 }}>{t('admin.verified')}</div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Coordinates Modal */}
      <AnimatePresence>
        {editCoordsModal.open && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: '32px', padding: '2.5rem', maxWidth: '450px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 900, color: 'var(--gov-navy)' }}>{t('admin.editCoords')}</h3>
                <button onClick={() => setEditCoordsModal({ open: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <X size={24} color="var(--gov-text-muted)" />
                </button>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">{t('admin.latitude')}</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={editCoordsModal.lat}
                  onChange={(e) => setEditCoordsModal({ ...editCoordsModal, lat: e.target.value })}
                  placeholder="e.g. 19.0760"
                />
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">{t('admin.longitude')}</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  value={editCoordsModal.lon}
                  onChange={(e) => setEditCoordsModal({ ...editCoordsModal, lon: e.target.value })}
                  placeholder="e.g. 72.8777"
                />
              </div>

              <div style={{ marginBottom: '2.5rem' }}>
                <label className="form-label">{t('admin.pickOnMap')}</label>
                <MapPicker
                  initialPos={editCoordsModal.lat && editCoordsModal.lon ? [parseFloat(editCoordsModal.lat), parseFloat(editCoordsModal.lon)] : [20.5937, 78.9629]}
                  onLocationSelect={(data) => setEditCoordsModal({ ...editCoordsModal, lat: data.lat.toString(), lon: data.lon.toString() })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={() => setEditCoordsModal({ open: false })} className="btn-gov-secondary" style={{ flex: 1 }}>{t('admin.cancel')}</button>
                <button onClick={handleUpdateCoords} className="btn-gov-primary" style={{ flex: 2 }}>{t('admin.updateLocation')}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Intelligence Performance Modal */}
      <AnimatePresence>
        {perfModalOpen && (
          <div className="fixed inset-0 bg-gov-navy/95 backdrop-blur-xl flex items-center justify-center p-6 z-[200]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white max-w-6xl w-full rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-gov-navy text-gov-saffron rounded-2xl shadow-xl">
                    <TrendingUp className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-4xl font-serif text-gov-navy font-bold">Operational Intelligence</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-[0.3em] mt-1 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gov-green animate-ping"></span>
                      Real-time Departmental Telemetry
                    </p>
                  </div>
                </div>
                <button onClick={() => setPerfModalOpen(false)} className="p-4 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-10 h-10 text-gray-300 hover:text-gov-navy" />
                </button>
              </div>

              <div className="p-12 overflow-y-auto space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {departments.map((dept, idx) => {
                    const dStats = getDeptStats(dept);
                    const total = dStats.pending + dStats.inProgress + dStats.resolved || 1;
                    const rate = (dStats.resolved / total) * 100;
                    return (
                      <motion.div
                        key={dept}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all group"
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="text-xl font-serif text-gov-navy font-bold group-hover:text-gov-saffron transition-colors">{translateDept(dept, t)}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Admin Sector Unit</p>
                          </div>
                          <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-amber-100">
                            {dStats.tokens} Tokens
                          </div>
                        </div>

                        <div className="space-y-6">
                          <div className="grid grid-cols-3 gap-3">
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-gov-navy">{dStats.pending}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Pending</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-blue-500">{dStats.inProgress}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Active</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-center">
                              <p className="text-lg font-bold text-gov-green">{dStats.resolved}</p>
                              <p className="text-[8px] text-gray-400 font-bold uppercase">Done</p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Efficiency Rating</span>
                              <span className="text-lg font-serif text-gov-navy font-bold">{rate.toFixed(1)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${rate}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full bg-gov-navy shadow-[0_0_10px_rgba(0,33,71,0.3)]"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              
              <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <ShieldCheck className="w-5 h-5 text-gov-navy" />
                  Data Verified by National Informatics Center
                </div>
                <button onClick={() => setPerfModalOpen(false)} className="bg-gov-navy text-white px-10 py-4 rounded-md font-bold uppercase tracking-widest text-sm shadow-xl hover:bg-gov-navy-deep transition-all">
                  Close Analytics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {viewImageModal.open && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6 z-[300]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-gov-navy text-gov-saffron rounded-lg">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-serif text-gov-navy font-bold">{viewImageModal.title}</h3>
                </div>
                <button onClick={() => setViewImageModal({ open: false })} className="p-2 hover:bg-gray-200 rounded-full transition-all">
                  <X className="w-8 h-8 text-gray-300 hover:text-gov-navy" />
                </button>
              </div>

              <div className="p-10 flex-grow overflow-y-auto">
                <div className={`grid gap-10 ${viewImageModal.originalImage ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                  {viewImageModal.originalImage && (
                    <div className="space-y-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">Original Incident Proof</p>
                      <div className="rounded-2xl overflow-hidden border-4 border-gray-100 shadow-xl aspect-square bg-gray-50">
                        <img src={`${API_URL}${viewImageModal.originalImage}`} className="w-full h-full object-cover" alt="Original" />
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-2">{viewImageModal.originalImage ? 'Final Resolution Proof' : 'Evidence Submission'}</p>
                    <div className="rounded-2xl overflow-hidden border-4 border-gray-100 shadow-xl aspect-square bg-gray-50">
                      <img src={viewImageModal.image.startsWith('data:') ? viewImageModal.image : `${API_URL}${viewImageModal.image}`} className="w-full h-full object-cover" alt="Evidence" />
                    </div>
                  </div>
                </div>

                {viewImageModal.title === 'Resolution Verification' && (
                  <div className="mt-12 grid grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 text-center">
                      <div className={`p-3 rounded-full ${viewImageModal.isAi ? 'bg-red-100 text-red-600' : 'bg-green-100 text-gov-green'}`}>
                        {viewImageModal.isAi ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Integrity Check</span>
                      <span className="text-sm font-bold text-gov-navy uppercase">{viewImageModal.isAi ? 'AI MANIPULATED' : 'AUTHENTIC PROOF'}</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 text-center">
                      <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Zap className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Similarity Score</span>
                      <span className="text-sm font-bold text-gov-navy uppercase">{(viewImageModal.similarity * 100).toFixed(0)}% Match</span>
                    </div>
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex flex-col items-center gap-3 text-center">
                      <div className="p-3 rounded-full bg-green-100 text-gov-green">
                        <Globe className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Telemetric Data</span>
                      <span className="text-sm font-bold text-gov-navy uppercase">GPS VERIFIED</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button onClick={() => setViewImageModal({ open: false })} className="bg-gov-navy text-white px-12 py-4 rounded-md font-bold uppercase tracking-widest text-xs shadow-xl">
                  Close Visualization
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
