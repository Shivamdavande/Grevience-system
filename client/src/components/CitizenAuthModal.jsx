import React, { useState } from 'react';
import axios from 'axios';
import { ShieldCheck, ArrowRight, CheckCircle2, AlertCircle, X, Shield, Phone, Key } from 'lucide-react';
import { API_URL } from '../config';

const CitizenAuthModal = ({ onClose, onLogin }) => {
  const [step, setStep] = useState(1);
  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Format Aadhar number as XXXX XXXX XXXX for display
  const formatAadhar = (val) => {
    return val.replace(/\D/g, '').match(/.{1,4}/g)?.join(' ') || val.replace(/\D/g, '');
  };

  const handleAadharChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '');
    if (rawVal.length <= 12) {
      setAadhar(rawVal);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (aadhar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // POST to backend. The backend will verify if it's in users.json and print OTP to terminal
      const response = await axios.post(`${API_URL}/api/auth/send-otp`, { aadhar });
      if (response.data.message) {
        setStep(2);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your Aadhaar number.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { aadhar, otp });
      if (response.data.token) {
        // Successful dummy login
        onLogin(aadhar);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gov-navy/60 backdrop-blur-sm transition-all duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative border border-white/20 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gov-navy p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gov-saffron/20 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          
          <div className="bg-white/10 w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 backdrop-blur-md border border-white/20">
            <ShieldCheck className="w-8 h-8 text-gov-saffron" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white mb-1">Citizen Login</h2>
          <p className="text-gray-300 text-sm font-medium tracking-wide">Secure National Portal Access</p>
        </div>

        {/* Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-3 border border-red-100 animate-[pulse_1s_ease-in-out]">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gov-navy uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-gov-saffron" /> Aadhaar Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formatAadhar(aadhar)}
                    onChange={handleAadharChange}
                    placeholder="XXXX XXXX XXXX"
                    className="w-full pl-4 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all font-mono text-lg tracking-widest text-center"
                    maxLength={14} // 12 digits + 2 spaces
                  />
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                  Use the test Aadhaar numbers from the server data (e.g. 123456789012)
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || aadhar.length !== 12}
                className="w-full bg-gov-navy text-white py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gov-navy-deep transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gov-navy/20"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <>Send OTP <ArrowRight className="w-5 h-5 text-gov-saffron" /></>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-50 text-gov-green rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <p className="text-sm text-gray-600 font-medium">
                  OTP sent successfully. Please check the backend terminal output for the simulated SMS.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gov-navy uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
                  <Key className="w-4 h-4 text-gov-saffron" /> Enter 6-Digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gov-navy focus:border-gov-navy outline-none transition-all font-mono text-3xl tracking-[1em] text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-gov-saffron text-gov-navy py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-gov-saffron/20"
              >
                {loading ? (
                  <span className="w-6 h-6 border-2 border-gov-navy/20 border-t-gov-navy rounded-full animate-spin"></span>
                ) : (
                  <>Verify & Login</>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm font-bold text-gray-500 hover:text-gov-navy transition-colors uppercase tracking-widest"
              >
                Change Aadhaar Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CitizenAuthModal;
