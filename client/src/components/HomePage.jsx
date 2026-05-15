import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  Search,
  Users,
  BrainCircuit,
  Zap,
  Activity,
  ArrowRight,
  Award,
  Shield,
  FileText,
  Clock,
  HelpCircle,
  PhoneCall,
  LayoutDashboard
} from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage = ({ onReportGrievance, onTrackStatus, stats, isDeptAuthenticated, isAuthenticated }) => {
  const { t } = useTranslation();

  const metrics = [
    { label: "ACTIVE REPORTS", value: stats?.totalComplaints || '5,240', icon: <Activity className="w-8 h-8" />, color: 'text-gov-navy' },
    { label: "RESOLVED CASES", value: stats?.resolvedComplaints || '4,892', icon: <CheckCircle2 className="w-8 h-8" />, color: 'text-gov-green' },
    { label: "AI ACCURACY", value: `${stats?.aiAccuracy || '98.4'}%`, icon: <BrainCircuit className="w-8 h-8" />, color: 'text-gov-saffron' }
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with REAL Live Image */}
      <section className="relative h-[85vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/home.jpg" 
            alt="Government Service Center" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gov-navy/70 mix-blend-multiply"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 bg-gov-saffron/20 text-gov-saffron px-4 py-2 rounded-full mb-8 border border-gov-saffron/30">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Official Government Portal</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif text-white leading-tight mb-6">
                {t('home.heroTitle')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed">
                {t('home.heroSub')}
              </p>
              
              <div className="flex flex-wrap gap-6">
                <button 
                  onClick={onReportGrievance} 
                  className="bg-gov-navy hover:bg-gov-navy-deep text-white px-10 py-4 rounded-md font-bold text-lg flex items-center gap-3 transition-all shadow-xl border border-gov-navy-deep"
                >
                  {t('home.reportBtn')}
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                  onClick={onTrackStatus} 
                  className="bg-white hover:bg-gray-100 text-gov-navy px-10 py-4 rounded-md font-bold text-lg transition-all shadow-xl border border-gray-200"
                >
                  {t('home.trackBtn')}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section with Government Report Style */}
      <section className="relative z-20 -mt-16 pb-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-lg shadow-2xl border-t-4 border-gov-navy flex items-center gap-6"
              >
                <div className={`p-4 bg-gray-50 rounded-lg ${m.color}`}>
                  {m.icon}
                </div>
                <div>
                  <div className="text-4xl font-bold text-gov-navy">{m.value}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">{m.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section with Realistic Imagery */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4 text-center mb-16">
          <h2 className="text-4xl font-serif text-gov-navy mb-4">Our Services</h2>
          <div className="w-24 h-1 bg-gov-saffron mx-auto mb-6"></div>
          <p className="text-gray-600 max-w-2xl mx-auto">Providing a comprehensive digital interface for all your public service grievances.</p>
        </div>

        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { 
                title: "Complaint Registration", 
                desc: "Register your grievances with geo-tagged images for faster identification.",
                img: "/road.jpeg",
                icon: <FileText className="w-6 h-6" />
              },
              { 
                title: "AI Assistance", 
                desc: "Intelligent sorting and categorization of complaints using computer vision.",
                img: "/water.webp",
                icon: <BrainCircuit className="w-6 h-6" />
              },
              { 
                title: "Complaint Tracking", 
                desc: "Transparent, real-time tracking of your complaint's progress.",
                img: "/high.jpeg",
                icon: <Search className="w-6 h-6" />
              },
              { 
                title: "Department Support", 
                desc: "Direct coordination with relevant government departments.",
                img: "/home.jpg",
                icon: <Users className="w-6 h-6" />
              },
              { 
                title: "Citizen Helpdesk", 
                desc: "24/7 dedicated support for grievance related queries.",
                img: "/road.jpeg",
                icon: <HelpCircle className="w-6 h-6" />
              },
              { 
                title: "Official Analytics", 
                desc: "Data-driven insights for improved administrative performance.",
                img: "/water.webp",
                icon: <LayoutDashboard className="w-6 h-6" />
              }
            ].map((s, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -10 }}
                className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col"
              >
                <div className="h-48 overflow-hidden relative">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover transition-transform hover:scale-110" />
                  <div className="absolute bottom-4 left-4 bg-gov-navy text-white p-3 rounded-lg shadow-lg">
                    {s.icon}
                  </div>
                </div>
                <div className="p-8 flex-grow">
                  <h3 className="text-xl font-bold text-gov-navy mb-3">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section with Government Building Imagery */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2 relative"
            >
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
                <img 
                  src="/high.jpeg" 
                  alt="Government Administration Building" 
                  className="w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-gov-saffron rounded-2xl -z-0 opacity-20"></div>
              <div className="absolute -top-10 -left-10 w-32 h-32 border-4 border-gov-navy rounded-2xl -z-0 opacity-10"></div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="inline-block bg-gov-navy text-white px-4 py-1 rounded text-sm font-bold uppercase tracking-widest mb-6">About the Portal</div>
              <h2 className="text-4xl md:text-5xl font-serif text-gov-navy mb-8 leading-tight">Digital Governance for a New India</h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                This portal is a flagship initiative to integrate advanced Artificial Intelligence with public grievance management. Our mission is to ensure that every citizen's voice is heard and every complaint is addressed with scientific precision and accountability.
              </p>
              
              <div className="space-y-6 mb-10">
                {[
                  "Automated categorization using Deep Learning",
                  "Verified geo-tagging for site accuracy",
                  "Direct linkage with Departmental Heads",
                  "Public transparency through open metrics"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="bg-gov-green/10 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-gov-green" />
                    </div>
                    <span className="font-bold text-gov-navy">{item}</span>
                  </div>
                ))}
              </div>

              <button className="text-gov-navy font-bold flex items-center gap-2 group">
                Learn more about our mission 
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer / Contact Style Section */}
      <section className="bg-gov-navy py-16 text-white border-t-4 border-gov-saffron">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-16 invert brightness-0" />
                <div>
                  <h3 className="text-2xl font-serif font-bold">Jansahayak Portal</h3>
                  <p className="text-gov-saffron text-xs font-bold uppercase tracking-tighter">Government of India initiative</p>
                </div>
              </div>
              <p className="text-gray-400 max-w-md leading-relaxed mb-8">
                Official AI-driven platform for managing public grievances and ensuring effective administrative response across all departments.
              </p>
              <div className="flex gap-6">
                <PhoneCall className="w-6 h-6 text-gov-saffron" />
                <div>
                  <div className="text-sm text-gray-400">Citizen Helpline</div>
                  <div className="text-xl font-bold">1800-111-222</div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-widest">Important Links</h4>
              <ul className="space-y-4 text-gray-400">
                <li><a href="#" className="hover:text-gov-saffron transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gov-saffron transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-gov-saffron transition-colors">Digital India</a></li>
                <li><a href="#" className="hover:text-gov-saffron transition-colors">MyGov Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-6 text-white uppercase tracking-widest">Department Access</h4>
              <button 
                onClick={() => window.location.href='/dept/auth'}
                className="bg-gov-saffron hover:bg-orange-500 text-gov-navy px-6 py-3 rounded font-bold transition-all w-full mb-4"
              >
                Officer Login
              </button>
              <p className="text-xs text-gray-500 text-center">Protected portal for authorized personnel only.</p>
            </div>
          </div>
          <div className="border-t border-white/10 mt-16 pt-8 text-center text-gray-500 text-sm">
            © 2026 National Informatics Centre (NIC). All Rights Reserved.
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
