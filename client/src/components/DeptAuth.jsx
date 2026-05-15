import React, { useState } from 'react';
import { User, Mail, Shield, Building2, BadgeCheck, Phone, Lock, MapPin, ArrowRight, UserPlus, LogIn, ShieldCheck, Globe, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { translateDept } from '../utils/translationUtils';
import { motion, AnimatePresence } from 'framer-motion';

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
    emailOrId: '', 
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
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Side: Professional Imagery (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative">
          <img 
            src="/high.jpeg" 
            alt="Government Administrative Building" 
            className="w-full h-full object-cover"
          />
        <div className="absolute inset-0 bg-gov-navy/80 flex items-center justify-center p-20">
          <div className="text-white max-w-lg">
            <div className="flex items-center gap-4 mb-8">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-20 invert brightness-0" />
              <div>
                <h1 className="text-3xl font-serif font-bold">Jansahayak Portal</h1>
                <p className="text-gov-saffron font-bold text-xs uppercase tracking-widest">Administrative Control Center</p>
              </div>
            </div>
            <h2 className="text-5xl font-serif mb-6 leading-tight">Empowering Governance Through AI</h2>
            <p className="text-xl text-gray-300 leading-relaxed font-light">
              Official gateway for departmental officers to manage, analyze, and resolve public grievances with precision and accountability.
            </p>
            
            <div className="mt-12 grid grid-cols-2 gap-8">
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold text-gov-saffron">98.4%</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60">AI Accuracy</div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="text-3xl font-bold text-gov-saffron">Instant</div>
                <div className="text-xs font-bold uppercase tracking-widest opacity-60">Dept Routing</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-serif text-gov-navy mb-3">
              {isLogin ? 'Officer Login' : 'Officer Registration'}
            </h2>
            <p className="text-gray-500 font-medium">
              {isLogin ? 'Secure access to administrative dashboard.' : 'Join the national grievance redressal network.'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-md mb-6 flex items-center gap-3 border border-red-100 text-sm font-bold"
              >
                <AlertCircle className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="text" 
                      name="fullName" 
                      required 
                      value={formData.fullName} 
                      onChange={handleChange} 
                      placeholder="Full Name" 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                      type="email" 
                      name="email" 
                      required 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="Official Email ID" 
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="text" 
                        name="employeeId" 
                        required 
                        value={formData.employeeId} 
                        onChange={handleChange} 
                        placeholder="Employee ID" 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                      />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input 
                        type="tel" 
                        name="mobile" 
                        required 
                        value={formData.mobile} 
                        onChange={handleChange} 
                        placeholder="Mobile No." 
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
                    <select 
                      name="department" 
                      value={formData.department} 
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md appearance-none outline-none font-bold text-gov-navy"
                    >
                      {departments.map(dept => <option key={dept} value={dept}>{translateDept(dept, t)}</option>)}
                    </select>
                  </div>
                </>
              )}

              {isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="text" 
                    name="emailOrId" 
                    required 
                    value={formData.emailOrId} 
                    onChange={handleChange} 
                    placeholder="Email or Employee ID" 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="password" 
                  name="password" 
                  required 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Password" 
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-md focus:ring-2 focus:ring-gov-navy/20 outline-none transition-all font-medium"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gov-navy hover:bg-gov-navy-deep text-white py-4 rounded-md font-bold text-lg flex items-center justify-center gap-3 shadow-lg transition-all"
            >
              {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : (isLogin ? <LogIn className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />)}
              {loading ? 'Processing...' : (isLogin ? 'Login to Portal' : 'Register Officer')}
            </button>

            <div className="text-center mt-8">
              <p className="text-gray-500 font-medium">
                {isLogin ? 'New officer in the network?' : 'Already registered?'}
                <button 
                  type="button" 
                  onClick={() => setIsLogin(!isLogin)} 
                  className="ml-2 text-gov-navy font-bold hover:underline"
                >
                  {isLogin ? 'Create Account' : 'Login Instead'}
                </button>
              </p>
            </div>
          </form>

          <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100 flex items-start gap-4">
            <Shield className="w-6 h-6 text-gov-navy shrink-0 mt-1" />
            <div>
              <p className="text-xs font-bold text-gov-navy uppercase tracking-widest mb-1">Security Notice</p>
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                This is a restricted government portal. All access attempts are logged and monitored for security purposes. Unauthorized access is a federal offense.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DeptAuth;
