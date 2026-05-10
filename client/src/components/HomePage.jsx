import React from 'react';
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

const HomePage = ({ onReportGrievance, onTrackStatus, stats }) => {
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
            <span className="hero-badge">Official Government Service</span>
            <h1 className="hero-title">Smart Grievance Redressal System</h1>
            <p className="hero-subtitle">
              Report public issues easily with AI-powered classification and faster resolution. 
              Bridging the gap between citizens and administration through technology.
            </p>
            <div className="hero-actions">
              <button onClick={onReportGrievance} className="btn-gov-primary lg">
                Report a Grievance <FileText size={20} />
              </button>
              <button onClick={onTrackStatus} className="btn-gov-secondary lg">
                Track Status <Search size={20} />
              </button>
            </div>
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
            <h2 className="section-title">How the Platform Works</h2>
            <p className="section-description">
              Our system leverages Artificial Intelligence to streamline the process of reporting and resolving public grievances.
            </p>
          </div>
          <div className="about-grid">
            <div className="about-item">
              <div className="about-icon-wrapper">
                <Camera size={32} />
              </div>
              <h3>Citizen Upload</h3>
              <p>Users upload images of civic issues like potholes, garbage, or water leaks via the platform.</p>
            </div>
            <div className="about-item">
              <div className="about-icon-wrapper">
                <Cpu size={32} />
              </div>
              <h3>AI Detection</h3>
              <p>Our AI automatically detects, categorizes, and validates the issue from the uploaded image.</p>
            </div>
            <div className="about-item">
              <div className="about-icon-wrapper">
                <ArrowRightLeft size={32} />
              </div>
              <h3>Smart Routing</h3>
              <p>The system automatically forwards the complaint to the relevant department for resolution.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section section-padding bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Platform Features</h2>
            <p className="section-description">Advanced tools designed for efficient public service delivery.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <ShieldCheck className="feature-icon" size={40} />
              <h4>AI Issue Detection</h4>
              <p>Automated verification of grievances using computer vision to prevent spam and ensure accuracy.</p>
            </div>
            <div className="feature-card">
              <ArrowRightLeft className="feature-icon" size={40} />
              <h4>Automatic Routing</h4>
              <p>Intelligent department assignment based on issue category and geographical location.</p>
            </div>
            <div className="feature-card">
              <Clock className="feature-icon" size={40} />
              <h4>Real-time Tracking</h4>
              <p>Keep citizens informed with live updates on the status of their reported issues.</p>
            </div>
            <div className="feature-card">
              <Camera className="feature-icon" size={40} />
              <h4>Easy Image Upload</h4>
              <p>Simple interface for citizens to capture and submit visual evidence of civic problems.</p>
            </div>
            <div className="feature-card">
              <BarChart3 className="feature-icon" size={40} />
              <h4>Transparent Updates</h4>
              <p>Detailed logs of administrative actions taken on every grievance submitted.</p>
            </div>
            <div className="feature-card">
              <AlertCircle className="feature-icon" size={40} />
              <h4>Urgent Escalation</h4>
              <p>Priority handling for critical issues affecting public safety or health.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (Step-by-Step) */}
      <section className="steps-section section-padding">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Step-by-Step Resolution</h2>
            <p className="section-description">A transparent 5-step process from reporting to resolution.</p>
          </div>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">01</div>
              <div className="step-content">
                <h5>Upload Image</h5>
                <p>Capture and upload a clear photo of the civic issue.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">02</div>
              <div className="step-content">
                <h5>AI Analysis</h5>
                <p>System validates image and extracts details.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">03</div>
              <div className="step-content">
                <h5>Categorized</h5>
                <p>Issue is classified (e.g., Road, Sanitation).</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">04</div>
              <div className="step-content">
                <h5>Department Action</h5>
                <p>Sent to the relevant department for fix.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step-item">
              <div className="step-number">05</div>
              <div className="step-content">
                <h5>Track Resolution</h5>
                <p>Receive notification once issue is resolved.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Impact Section */}
      <section className="impact-section section-padding bg-light">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Common Issues We Resolve</h2>
            <p className="section-description">Addressing everyday civic challenges through technology.</p>
          </div>
          <div className="impact-gallery">
            <div className="gallery-item">
              <img src="/road.jpeg" alt="Road Damage" />
              <div className="gallery-overlay">
                <span>Road Infrastructure</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/high.jpeg" alt="Garbage Issue" />
              <div className="gallery-overlay">
                <span>Waste Management</span>
              </div>
            </div>
            <div className="gallery-item">
              <img src="/water.webp" alt="Water Leakage" />
              <div className="gallery-overlay">
                <span>Public Utilities</span>
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
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card">
              <Cpu className="stat-icon" size={48} />
              <div className="stat-value">{displayStats.aiAccuracy}%</div>
              <div className="stat-label">AI Accuracy</div>
            </div>
            <div className="stat-card">
              <Clock className="stat-icon" size={48} />
              <div className="stat-value">{displayStats.uptime}</div>
              <div className="stat-label">Availability</div>
            </div>
            <div className="stat-card">
              <Users className="stat-icon" size={48} />
              <div className="stat-value">{(displayStats.activeCitizens || 0).toLocaleString()}</div>
              <div className="stat-label">Active Citizens</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section section-padding">
        <div className="container text-center">
          <h2 className="cta-title">Help improve your city. Report issues today.</h2>
          <p className="cta-subtitle">Join thousands of citizens in making our community better and safer.</p>
          <button onClick={onReportGrievance} className="btn-gov-primary lg">
            Submit a Complaint <ArrowRightLeft size={20} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
