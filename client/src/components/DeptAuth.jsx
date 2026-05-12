import React, { useState } from 'react';
import { User, Mail, Shield, Building2, BadgeCheck, Phone, Lock, MapPin, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDept } from '../utils/translationUtils';

const DeptAuth = ({ onLogin }) => {
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    employeeId: '',
    department: 'Municipal Corporation',
    designation: '',
    mobile: '',
    password: '',
    officeLocation: '',
    emailOrId: '', // For login
    ward: '',
    zone: ''
  });

  const departments = [
    'Municipal Corporation',
    'Road Department',
    'Sewage Department',
    'Waste Department',
    'Water Department',
    'Electric Department',
    'Public Works Department'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? '/api/dept/login' : '/api/dept/register';
    const body = isLogin 
      ? { emailOrId: formData.emailOrId, password: formData.password }
      : formData;

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');

      onLogin(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dept-auth-container" style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
    }}>
      <div className={`auth-card ${isLogin ? 'login-mode' : 'register-mode'}`} style={{
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderRadius: '24px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: isLogin ? '450px' : '800px',
        padding: '2.5rem',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            background: 'var(--gov-navy)',
            color: 'white',
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.3)'
          }}>
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--gov-navy)', margin: 0 }}>
            {isLogin ? t('auth.loginToDashboard') : t('auth.officerRegistration')}
          </h2>
          <p style={{ color: 'var(--gov-text-muted)', marginTop: '0.5rem', fontWeight: 500 }}>
            {isLogin ? t('auth.accessDashboard') : t('auth.joinNetwork')}
          </p>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textAlign: 'center',
            border: '1px solid #fecaca'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-grid">
          {isLogin ? (
            <>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.emailOrId')}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input
                    type="text"
                    name="emailOrId"
                    required
                    value={formData.emailOrId}
                    onChange={handleChange}
                    placeholder={t('auth.enterEmailOrId')}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem 0.75rem 2.75rem',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      outline: 'none',
                      fontSize: '1rem'
                    }}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Registration Fields */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.fullName')}</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Ghanshyam Dhote" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.emailAddress')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="officer@gov.in" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.employeeId')}</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="employeeId" required value={formData.employeeId} onChange={handleChange} placeholder="EMP123456" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('admin.dept')}</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <select name="department" value={formData.department} onChange={handleChange}
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', appearance: 'none', background: 'white' }}>
                    {departments.map(dept => <option key={dept} value={dept}>{translateDept(dept, t)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.designation')}</label>
                <div style={{ position: 'relative' }}>
                  <BadgeCheck size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="designation" required value={formData.designation} onChange={handleChange} placeholder="Executive Engineer" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.mobileNumber')}</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="tel" name="mobile" required value={formData.mobile} onChange={handleChange} placeholder="+91 9876543210" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.officeLocation')}</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="officeLocation" required value={formData.officeLocation} onChange={handleChange} placeholder="Zonal Office, Sector 5" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              
              {/* Ward and Zone for ALL departments for regional isolation */}
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>Ward Name/Number</label>
                <div style={{ position: 'relative' }}>
                  <Building2 size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="ward" required={formData.department !== 'Public Works Department'} value={formData.ward} onChange={handleChange} placeholder="e.g. Ward 12 or Kokta" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>Zone / Area</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
                  <input type="text" name="zone" value={formData.zone} onChange={handleChange} placeholder="e.g. East Zone or Anandnagar" 
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }} />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, color: 'var(--gov-navy)', marginBottom: '0.5rem' }}>{t('auth.password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--gov-text-muted)' }} />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem 0.75rem 2.75rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  outline: 'none',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div className="auth-submit-section" style={{ marginTop: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                background: 'var(--gov-navy)',
                color: 'white',
                border: 'none',
                borderRadius: '14px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {loading ? t('auth.authenticating') : (isLogin ? t('auth.loginToDashboard') : t('auth.completeRegistration'))}
              {!loading && <ArrowRight size={18} />}
            </button>

            <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
              <p style={{ color: 'var(--gov-text-muted)', fontSize: '0.875rem', fontWeight: 600 }}>
                {isLogin ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--gov-navy)',
                    fontWeight: 800,
                    marginLeft: '0.5rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isLogin ? t('auth.registerNow') : t('auth.loginInstead')}
                </button>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeptAuth;
