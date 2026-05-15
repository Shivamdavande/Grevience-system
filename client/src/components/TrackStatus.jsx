import React, { useState } from 'react';
import { translateDept, translateStatus } from '../utils/translationUtils';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  FileText, 
  MapPin, 
  Calendar, 
  Hash, 
  Search, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Building2, 
  Globe, 
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  Camera,
  Check
} from 'lucide-react';

const TrackStatus = ({ onBack }) => {
  const { t, i18n } = useTranslation();
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

    const cleanId = trackingId.startsWith('#') ? trackingId.substring(1) : trackingId;

    try {
      const response = await axios.get(`http://localhost:5000/api/complaints/${cleanId}`);
      setResult(response.data);
    } catch (err) {
      setError('The provided Reference ID could not be located in our national database.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'Pending': return { color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Clock };
      case 'In Progress': return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: RefreshCw };
      case 'Resolved': return { color: 'text-gov-green bg-green-50 border-green-200', icon: CheckCircle2 };
      default: return { color: 'text-gray-600 bg-gray-50 border-gray-200', icon: Clock };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gov-navy hover:text-gov-navy-deep font-bold text-xs uppercase tracking-widest mb-12 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return to Portal
        </button>

        {/* Search Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-12 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gov-saffron"></div>
          <div className="p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gov-navy text-gov-saffron rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <ShieldCheck className="w-3 h-3" />
              Secure Status Retrieval
            </div>
            <h1 className="text-4xl font-serif text-gov-navy font-bold mb-4">Track Your Grievance</h1>
            <p className="text-gray-500 max-w-lg mx-auto font-medium mb-10 leading-relaxed">
              Enter your unique 24-character Reference ID provided during submission to access real-time progress updates.
            </p>

            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-grow relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="e.g. 64b8f..."
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-gov-navy focus:bg-white outline-none transition-all font-mono font-bold text-gov-navy"
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !trackingId}
                className="px-8 py-4 bg-gov-navy text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gov-navy-deep transition-all shadow-lg disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Track Progress
              </button>
            </form>
          </div>
        </div>

        {/* Results / Error Area */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center justify-center gap-6"
            >
              <RefreshCw className="w-16 h-16 text-gov-navy animate-spin" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Accessing National Database...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-red-50 border border-red-100 rounded-2xl flex flex-col items-center text-center gap-4"
            >
              <AlertTriangle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="text-lg font-bold text-red-800">Reference ID Not Found</h3>
                <p className="text-red-600 mt-1 font-medium">{error}</p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden"
            >
              {/* Result Header */}
              <div className="bg-gov-navy text-white p-8 sm:p-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                  <span className="text-[10px] font-bold text-gov-saffron uppercase tracking-widest block mb-2 opacity-80">Reference ID</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-mono font-bold tracking-tight">#{result._id.toUpperCase()}</span>
                    <div className="px-3 py-1 bg-white/10 rounded-full border border-white/20 text-[10px] font-bold flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3 text-gov-saffron" />
                      AUTHENTIFIED
                    </div>
                  </div>
                </div>
                {(() => {
                  const info = getStatusInfo(result.status);
                  const Icon = info.icon;
                  return (
                    <div className={`px-6 py-3 rounded-full border-2 flex items-center gap-3 font-bold uppercase tracking-widest text-sm shadow-lg ${info.color}`}>
                      <Icon className={`w-5 h-5 ${result.status === 'In Progress' ? 'animate-spin' : ''}`} />
                      {translateStatus(result.status, t)}
                    </div>
                  );
                })()}
              </div>

              <div className="p-8 sm:p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Progress Detail */}
                  <div className="space-y-10">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        Grievance Summary
                      </h4>
                      <p className="text-xl font-serif text-gov-navy font-bold leading-relaxed">{result.text}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Administrative Unit</span>
                        <div className="flex items-center gap-2 text-gov-navy font-bold text-xs">
                          <Building2 className="w-4 h-4 text-gov-saffron" />
                          {translateDept(result.department, t)}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-[9px] font-bold text-gray-400 uppercase block mb-1">Submission Date</span>
                        <div className="flex items-center gap-2 text-gov-navy font-bold text-xs">
                          <Calendar className="w-4 h-4 text-gov-saffron" />
                          {new Date(result.createdAt).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100">
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Redressal Jurisdiction</h4>
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-gov-navy font-bold">{result.location.split(',')[0]}</p>
                          <p className="text-xs text-gray-400 mt-1 leading-relaxed">{result.location}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Verification Proofs */}
                  <div className="space-y-8">
                    {result.imageUrl && (
                      <div>
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Camera className="w-3 h-3" />
                          Incident Evidence
                        </h4>
                        <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-100 group relative">
                          <img 
                            src={`http://localhost:5000${result.imageUrl}`} 
                            alt="Incident Evidence" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-[10px] text-white font-bold uppercase tracking-widest">Reported Photo</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {result.status === 'Resolved' && result.resolutionImage && (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                      >
                        <h4 className="text-[10px] font-bold text-gov-green uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" />
                          Official Resolution Proof
                        </h4>
                        <div className="aspect-video rounded-2xl overflow-hidden border-4 border-gov-green shadow-xl bg-gray-100 group relative">
                          <img 
                            src={result.resolutionImage} 
                            alt="Resolution Proof" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                          />
                          <div className="absolute top-4 right-4 p-2 bg-gov-green text-white rounded-full shadow-lg">
                            <Check className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
                          <p className="text-xs text-green-700 font-medium leading-relaxed">
                            <span className="font-bold">Verified:</span> This case has been officially closed by the administrative desk following field verification.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Footer */}
              <div className="bg-gray-50 p-6 border-t border-gray-100 flex justify-between items-center">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <ShieldCheck className="w-5 h-5 text-gov-navy" />
                  National Informatics Center Secured
                </div>
                <div className="hidden sm:flex items-center gap-6 opacity-30">
                  <Globe className="w-5 h-5" />
                  <Zap className="w-5 h-5" />
                  <ShieldAlert className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TrackStatus;
