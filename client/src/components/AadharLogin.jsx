import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Shield, Lock, RefreshCw } from 'lucide-react';

const AadharLogin = ({ onLogin }) => {
  const [aadhar, setAadhar] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [step, timeLeft]);

  const API_URL = 'http://localhost:5000/api/auth';

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    if (aadhar.length !== 12) {
      setError('Please enter a valid 12-digit Aadhar number.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/send-otp`, { aadhar });
      setMessage(`OTP sent to ${res.data.phone}`);
      setStep(2);
      setTimeLeft(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Is Aadhar registered?');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { aadhar, otp });
      // On success, trigger login
      onLogin(res.data.token);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '400px', margin: '4rem auto', textAlign: 'center' }}>
      <div className="glass" style={{ padding: '2.5rem', borderRadius: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #ec4899)', padding: '1rem', borderRadius: '50%' }}>
            <Shield size={32} color="white" />
          </div>
        </div>
        
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Citizen <span className="gradient-text">Login</span></h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Verify your identity using Aadhar</p>

        {error && <div style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}
        {message && <div style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</div>}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Aadhar Number</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="Enter 12-digit Aadhar" 
                value={aadhar}
                onChange={(e) => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Sending OTP...' : 'Get OTP'} <Send size={18} />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
             <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter OTP</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="6-digit OTP" 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                style={{ width: '100%', boxSizing: 'border-box' }}
              />
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Login'} <Lock size={18} />
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Aadhar
              </button>
              
              <button 
                type="button" 
                onClick={handleSendOtp}
                disabled={timeLeft > 0 || loading}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: timeLeft > 0 ? 'var(--text-muted)' : '#6366f1', 
                  cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  fontWeight: timeLeft > 0 ? 'normal' : 'bold'
                }}
              >
                <RefreshCw size={14} /> {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <p>Testing Aadhar: 123456789012</p>
      </div>
    </div>
  );
};

export default AadharLogin;
