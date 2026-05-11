import { useTranslation } from 'react-i18next';
import { 
  Camera, 
  Cpu, 
  ArrowRightLeft, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  AlertCircle,
  FileText,
  Search,
  Users
} from 'lucide-react';

const HomePage = ({ onReportGrievance, onTrackStatus, stats, isDeptAuthenticated, isAuthenticated }) => {
  const { t } = useTranslation();
  const displayStats = stats || {
    totalComplaints: 0,
    resolvedComplaints: 0,
    aiAccuracy: 0,
    uptime: '100%',
    activeCitizens: 0
  };

  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">{t('home.heroBadge')}</span>
            <h1 className="hero-title">{t('home.heroTitle')}</h1>
            <p className="hero-subtitle">
              {t('home.heroSub')}
            </p>
            {!isDeptAuthenticated && !isAuthenticated && (
              <div className="hero-actions">
                <button onClick={onReportGrievance} className="btn-gov-primary lg">
                  {t('home.reportBtn')} <FileText size={20} />
                </button>
                <button onClick={onTrackStatus} className="btn-gov-secondary lg">
                  {t('home.trackBtn')} <Search size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="hero-visual">
            <img 
              src="/home.jpg" 
              alt="Smart Grievance Redressal" 
              className="hero-img"
            />
          </div>
        </div>
      </section>

      {/* About the Platform */}
      <section className="about-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t('home.howItWorks')}</h2>
            <p className="section-description">
              {t('home.howItWorksSub')}
            </p>
          </div>
          <div className="about-grid">
            <div className="about-item">
              <div className="about-icon-wrapper">
                <Camera size={32} />
              </div>
              <h3>{t('home.citizenUpload')}</h3>
              <p>{t('home.citizenUploadSub')}</p>
            </div>
            <div className="about-item">
              <div className="about-icon-wrapper">
                <Cpu size={32} />
              </div>
              <h3>{t('home.aiDetection')}</h3>
              <p>{t('home.aiDetectionSub')}</p>
            </div>
            <div className="about-item">
              <div className="about-icon-wrapper">
                <ArrowRightLeft size={32} />
              </div>
              <h3>{t('home.smartRouting')}</h3>
              <p>{t('home.smartRoutingSub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section section-padding bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t('home.featuresTitle')}</h2>
            <p className="section-description">{t('home.featuresSub')}</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <ShieldCheck className="feature-icon" size={40} />
              <h4>{t('home.aiDetection')}</h4>
              <p>{t('home.aiDetectionSub')}</p>
            </div>
            <div className="feature-card">
              <ArrowRightLeft className="feature-icon" size={40} />
              <h4>{t('home.smartRouting')}</h4>
              <p>{t('home.smartRoutingSub')}</p>
            </div>
            <div className="feature-card">
              <Clock className="feature-icon" size={40} />
              <h4>{t('home.realTimeTracking')}</h4>
              <p>{t('home.realTimeTrackingSub')}</p>
            </div>
            <div className="feature-card">
              <Camera className="feature-icon" size={40} />
              <h4>{t('home.easyUpload')}</h4>
              <p>{t('home.easyUploadSub')}</p>
            </div>
            <div className="feature-card">
              <BarChart3 className="feature-icon" size={40} />
              <h4>{t('home.transparentUpdates')}</h4>
              <p>{t('home.transparentUpdatesSub')}</p>
            </div>
            <div className="feature-card">
              <AlertCircle className="feature-icon" size={40} />
              <h4>{t('home.urgentEscalation')}</h4>
              <p>{t('home.urgentEscalationSub')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step) */}
      <section className="steps-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t('home.stepsTitle')}</h2>
            <p className="section-description">{t('home.stepsSub')}</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-content">
                <h5>{t('home.step1')}</h5>
                <p>{t('home.step1Sub')}</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">02</div>
              <div className="step-content">
                <h5>{t('home.step2')}</h5>
                <p>{t('home.step2Sub')}</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">03</div>
              <div className="step-content">
                <h5>{t('home.step3')}</h5>
                <p>{t('home.step3Sub')}</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">04</div>
              <div className="step-content">
                <h5>{t('home.step4')}</h5>
                <p>{t('home.step4Sub')}</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">05</div>
              <div className="step-content">
                <h5>{t('home.step5')}</h5>
                <p>{t('home.step5Sub')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Impact Section */}
      <section className="impact-section section-padding bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">{t('home.commonIssues')}</h2>
            <p className="section-description">{t('home.commonIssuesSub')}</p>
          </div>
          <div className="impact-gallery">
            <div className="gallery-item">
              <img src="/road.jpeg" alt="Road Damage" />
              <div className="gallery-overlay">
                <span>{t('home.roadInfra')}</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/high.jpeg" alt="Garbage Issue" />
              <div className="gallery-overlay">
                <span>{t('home.wasteManagement')}</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/water.webp" alt="Water Leakage" />
              <div className="gallery-overlay">
                <span>{t('home.publicUtilities')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section section-padding">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <CheckCircle2 className="stat-icon" size={48} />
              <div className="stat-value">{displayStats.totalComplaints}</div>
              <div className="stat-label">{t('home.statsActive')}</div>
            </div>
            <div className="stat-card">
              <Cpu className="stat-icon" size={48} />
              <div className="stat-value">{displayStats.aiAccuracy}%</div>
              <div className="stat-label">{t('home.aiAccuracy')}</div>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" size={48} />
              <div className="stat-value">{displayStats.uptime}</div>
              <div className="stat-label">{t('home.availability')}</div>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" size={48} />
              <div className="stat-value">{(displayStats.activeCitizens || 0).toLocaleString()}</div>
              <div className="stat-label">{t('home.statsCities')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      {!isDeptAuthenticated && !isAuthenticated && (
        <section className="cta-section section-padding">
          <div className="container text-center">
            <h2 className="cta-title">{t('home.ctaTitle')}</h2>
            <p className="cta-subtitle">{t('home.ctaSub')}</p>
            <button onClick={onReportGrievance} className="btn-gov-primary lg">
              {t('home.ctaBtn')} <ArrowRightLeft size={20} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
