import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ShieldCheck, Lock, RefreshCw, Fingerprint, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

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
      setMessage(`OTP has been sent to your registered mobile number ending in ${res.data.phone.slice(-4)}`);
      setStep(2);
      setTimeLeft(60);
    } catch (err) {
      setError(err.response?.data?.error || 'Authentication service is currently unavailable. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    
    if (otp.length !== 6) {
      setError('The OTP must be a 6-digit numeric code.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/verify-otp`, { aadhar, otp });
      // On success, trigger login
      onLogin(res.data.token, aadhar);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '480px', margin: '0 auto' }}>
      <div className="gov-card" style={{ padding: '3rem 2.5rem', borderTop: '5px solid var(--gov-navy)' }}>
        
        {/* Verification Icon Section */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '70px', 
            height: '70px', 
            background: 'var(--gov-bg)', 
            color: 'var(--gov-navy)', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem',
            border: '2px solid var(--gov-border)'
          }}>
            {step === 1 ? <Fingerprint size={32} /> : <ShieldCheck size={32} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--gov-navy)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {step === 1 ? 'Citizen Authentication' : 'Verify Identity'}
          </h2>
          <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.95rem' }}>
            {step === 1 ? 'Verify your identity via Secure Aadhar Gateway' : 'Enter the 6-digit code sent to your mobile'}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2.5rem' }}>
          <div style={{ height: '4px', flex: 1, background: 'var(--gov-navy)', borderRadius: '2px' }}></div>
          <div style={{ height: '4px', flex: 1, background: step === 2 ? 'var(--gov-navy)' : 'var(--gov-border)', borderRadius: '2px', transition: 'all 0.3s' }}></div>
        </div>

        {/* Alerts */}
        {error && (
          <div style={{ 
            display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#b91c1c', background: '#fef2f2', 
            padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontSize: '0.85rem', borderLeft: '4px solid #ef4444' 
          }}>
            <AlertCircle size={18} flexShrink={0} />
            <p style={{ fontWeight: 500 }}>{error}</p>
          </div>
        )}

        {message && (
          <div style={{ 
            display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#166534', background: '#f0fdf4', 
            padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', fontSize: '0.85rem', borderLeft: '4px solid #22c55e' 
          }}>
            <CheckCircle2 size={18} flexShrink={0} />
            <p style={{ fontWeight: 500 }}>{message}</p>
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                Aadhar Number 
                <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>12 DIGITS REQUIRED</span>
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                  <Fingerprint size={18} />
                </div>
                <input 
                  type="text" 
                  className="form-input"
                  style={{ paddingLeft: '3rem', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '0.1em' }}
                  placeholder="XXXX XXXX XXXX" 
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-gov-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1.1rem' }}
              disabled={loading}
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <>SEND SECURE OTP <ChevronRight size={20} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
             <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Authentication OTP</label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
                  <Lock size={18} />
                </div>
                <input 
                  type="text" 
                  className="form-input"
                  style={{ paddingLeft: '3rem', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '0.5em', textAlign: 'center' }}
                  placeholder="000000" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="btn-gov-primary" 
              style={{ width: '100%', justifyContent: 'center', padding: '1.1rem', background: 'var(--gov-green)' }}
              disabled={loading}
            >
              {loading ? <RefreshCw className="animate-spin" size={20} /> : <>VERIFY & PROCEED <ChevronRight size={20} /></>}
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
              <button 
                type="button" 
                onClick={() => { setStep(1); setOtp(''); setError(''); setMessage(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--gov-text-muted)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.85rem', fontWeight: 600 }}
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
                  color: timeLeft > 0 ? 'var(--gov-text-muted)' : 'var(--gov-navy)', 
                  cursor: timeLeft > 0 ? 'not-allowed' : 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.25rem',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div style={{ 
        marginTop: '2rem', 
        padding: '1.5rem', 
        background: 'rgba(0, 51, 102, 0.05)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px dashed var(--gov-border)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--gov-navy)', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Security Note</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gov-text-muted)', lineHeight: '1.5' }}>
          This is a secure government portal. Your Aadhar details are never stored on our servers and are only used for one-time verification.
        </p>
        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--gov-border)', fontSize: '0.75rem', opacity: 0.6 }}>
          Testing Mode: Use Aadhar <code style={{ background: '#e2e8f0', padding: '0.2rem 0.4rem', borderRadius: '3px' }}>123456789012</code>
        </div>
      </div>
    </div>
  );
};

export default AadharLogin;
