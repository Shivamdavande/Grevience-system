import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Fingerprint, 
  Smartphone, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  ShieldAlert,
  Zap,
  Lock,
  Loader2,
  Shield,
  KeyRound,
  CheckCircle2
} from 'lucide-react';

const AadharLogin = ({ onLogin }) => {
  const { t } = useTranslation();
  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Aadhar, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [phoneHint, setPhoneHint] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (aadhar.length !== 12) {
      setError('Aadhar must be exactly 12 digits');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/auth/send-otp', { aadhar });
      setPhoneHint(response.data.phone);
      setStep(2);
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please verify your Aadhar.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setIsVerifying(true);
    
    try {
      // Simulate verification delay for immersion
      await new Promise(r => setTimeout(r, 1500));
      const response = await axios.post('http://localhost:5000/api/auth/verify-otp', { aadhar, otp });
      onLogin(response.data.token, aadhar);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
      setIsVerifying(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gov-navy text-gov-saffron rounded-xl shadow-lg shadow-gov-navy/20">
                <Fingerprint className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-gov-navy">Aadhar Authentication</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">National Identity Verification</p>
              </div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <Lock className="w-3 h-3" />
                  Your 12-Digit Aadhar Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    maxLength="12"
                    value={aadhar}
                    onChange={(e) => setAadhar(e.target.value.replace(/\D/g, ''))}
                    placeholder="0000 0000 0000"
                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-gov-navy focus:bg-white outline-none transition-all font-mono font-bold text-lg tracking-[0.2em] text-gov-navy placeholder:text-gray-200"
                  />
                  <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-all ${aadhar.length === 12 ? 'opacity-100 scale-100' : 'opacity-20 scale-90'}`}>
                    <ShieldCheck className={`w-6 h-6 ${aadhar.length === 12 ? 'text-gov-green' : 'text-gray-400'}`} />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || aadhar.length !== 12}
                className="w-full py-4 bg-gov-navy text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gov-navy-deep transition-all shadow-xl shadow-gov-navy/20 disabled:opacity-50 disabled:shadow-none"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 text-gov-saffron" />}
                Generate OTP
              </button>
            </form>

            <div className="flex justify-center gap-6 opacity-30 mt-8">
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-gov-navy">
                <Shield className="w-3 h-3" /> UIDAI SECURED
              </div>
              <div className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-widest text-gov-navy">
                <Lock className="w-3 h-3" /> SSL ENCRYPTED
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="step2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gov-saffron text-gov-navy rounded-xl shadow-lg shadow-gov-saffron/20">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold text-gov-navy">Verify OTP</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-2">
                  <KeyRound className="w-3 h-3" />
                  Sent to XXXXXX{phoneHint?.slice(-4)}
                </p>
              </div>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="0 0 0 0 0 0"
                    className="w-full max-w-[280px] px-2 py-4 bg-white border-b-4 border-gov-saffron text-center font-mono font-bold text-4xl tracking-[0.4em] text-gov-navy outline-none focus:bg-gray-50 transition-all"
                    autoFocus
                  />
                </div>
                <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Enter 6-Digit Passcode</p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-xs font-bold">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              )}

              {isVerifying ? (
                <div className="py-8 flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-gov-saffron animate-spin" />
                  <p className="text-[10px] font-bold text-gov-navy uppercase tracking-[0.3em] animate-pulse">Establishing Secure Session</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-4 bg-gov-green text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-green-700 transition-all shadow-xl shadow-green-200 disabled:opacity-50"
                  >
                    {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirm Identity
                  </button>

                  <div className="text-center space-y-4">
                    {timer > 0 ? (
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Resend available in <span className="text-gov-navy">{timer}s</span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-[10px] font-bold text-gov-navy uppercase tracking-widest underline decoration-gov-saffron decoration-2 underline-offset-4"
                      >
                        Request New OTP
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="block w-full text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gov-navy transition-colors"
                    >
                      Use Different Aadhar
                    </button>
                  </div>
                </div>
              )}
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AadharLogin;

export default AadharLogin;
