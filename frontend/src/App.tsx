import { useState, useRef, useEffect } from 'react';
import './index.css';
import logo from './assets/logo.png';

const matchAlumni = [
  { id: 1, name: "Rahul Sharma", role: "Software Engineer", company: "Google", match: "98%", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Priya Patel", role: "Product Manager", company: "Microsoft", match: "95%", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Amit Kumar", role: "Data Scientist", company: "Amazon", match: "89%", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Neha Gupta", role: "UX Designer", company: "Adobe", match: "85%", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Vikram Singh", role: "Backend Dev", company: "Netflix", match: "82%", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80" },
  { id: 6, name: "Ananya Desai", role: "Frontend Dev", company: "Meta", match: "78%", img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80" },
];

export default function App() {
  const [view, setView] = useState<'home' | 'enroll' | 'login' | 'dashboard'>('home');
  const [loginRole, setLoginRole] = useState<'alumni' | 'student' | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login and Register
  const enrollRef = useRef<HTMLElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.1 }); // Trigger when 10% visible

    const hiddenElements = document.querySelectorAll('.animate-on-scroll');
    hiddenElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [view]); // Re-run when view changes (e.g., returning home)

  const handleGetStarted = () => {
    // If we're already on the home page, scroll down. Otherwise go to home and scroll.
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        enrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      enrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleEnrollClick = (role: 'alumni' | 'student') => {
    setLoginRole(role);
    setView('login');
    setIsLoginMode(true); // Default to login view
    setErrorMsg('');
    window.scrollTo({ top: 0 });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // --- TEMPORARY MOCK AUTHENTICATION FOR UI SHOWCASE ---
    // Bypassing the real backend so you can easily see the dashboard
    console.log(`Mocking auth for: ${email}`);
    localStorage.setItem('saarthi_token', 'mock_token_123');
    setView('dashboard');
    window.scrollTo({ top: 0 });

    /* 
    // REAL BACKEND LOGIC (Commented out for now)
    const endpoint = isLoginMode ? '/api/auth/login' : '/api/auth/register';

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: loginRole, college })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Success
      localStorage.setItem('saarthi_token', data.token);
      setView('dashboard');
      window.scrollTo({ top: 0 });
    } catch (error: any) {
      setErrorMsg(error.message);
    }
    */
  };

  if (view === 'login') {
    return (
      <div className="app-container login-container">
        <nav className="navbar">
          <div className="logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
            Saarthi.
          </div>
          <div className="nav-actions">
            <button className="btn-login" onClick={() => setView('home')}>Back to Home</button>
          </div>
        </nav>

        <main className="login-main">

          <div className="login-form-side">
            <div className="login-box">
              <h2>{loginRole === 'alumni' ? 'Alumni Portal' : 'Student Portal'} {isLoginMode ? 'Login' : 'Signup'}</h2>

              {errorMsg && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{errorMsg}</div>}

              <form onSubmit={handleAuthSubmit}>

                {loginRole === 'student' && (
                  <div className="form-group">
                    <label>Select College / Institution</label>
                    <select className="form-control" required value={college} onChange={(e) => setCollege(e.target.value)}>
                      <option value="" disabled>Choose your college...</option>
                      <option value="nit">National Institute of Technology</option>
                      <option value="iit">Indian Institute of Technology</option>
                      <option value="bits">BITS Pilani</option>
                      <option value="other">Other Institution</option>
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>{loginRole === 'student' ? 'College Email Address' : 'Email Address'}</label>
                  <input type="email" className="form-control" placeholder={loginRole === 'student' ? "e.g., student@college.edu.in" : "Enter your email"} required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" placeholder="Enter your password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                <button className="btn-blue login-submit-btn" type="submit">{isLoginMode ? 'Login to Dashboard' : 'Create Account'}</button>

                <p className="login-switch-text" style={{ marginTop: '1.5rem' }}>
                  {isLoginMode ? "Don't have an account? " : "Already have an account? "}
                  <span onClick={() => setIsLoginMode(!isLoginMode)}>
                    {isLoginMode ? 'Sign up here' : 'Log in here'}
                  </span>
                </p>

                <hr style={{ margin: '1.5rem 0', borderColor: '#f1f5f9' }} />

                <p className="login-switch-text">
                  {loginRole === 'alumni' ? "Not an alumni? " : "Not a student? "}
                  <span onClick={() => handleEnrollClick(loginRole === 'alumni' ? 'student' : 'alumni')}>
                    Switch to {loginRole === 'alumni' ? 'Student' : 'Alumni'} Portal
                  </span>
                </p>
              </form>
            </div>
          </div>

          <div className="login-visual-side">
            <img src="/login-illustration.png" alt="Login Graphic" className="login-illustration" />
          </div>

        </main>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="logo dashboard-logo">
            <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
            Saarthi <span>Dashboard</span>
          </div>
          <button className="btn-logout" onClick={() => {
            localStorage.removeItem('saarthi_token');
            setView('home');
          }}>Log Out</button>
        </nav>

        <div className="dashboard-content">
          <div className="ai-match-header">
            <h1>Your Top Mentor Matches</h1>
            <p>We've found the perfect connections for your career goals based on our AI matching algorithm.</p>
          </div>

          <div className="carousel-container">
            <div className="carousel-3d">
              {matchAlumni.map((alumni) => (
                <div key={alumni.id} className="carousel-card">
                  <div className="match-badge">{alumni.match} Match</div>
                  <img src={alumni.img} alt={alumni.name} />
                  <div className="card-info">
                    <h3>{alumni.name}</h3>
                    <p>{alumni.role} @ <strong>{alumni.company}</strong></p>
                    <button className="btn-connect">Connect Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Navbar Section */}
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
          Saarthi.
        </div>

        <ul className="nav-links">
          <li><a href="#solutions" onClick={(e) => e.preventDefault()}>Solutions</a></li>
          <li><a href="#use-cases" onClick={(e) => e.preventDefault()}>Use case</a></li>
          <li><a href="#about" onClick={(e) => e.preventDefault()}>About us</a></li>
          <li><a href="#partnership" onClick={(e) => e.preventDefault()}>Partnership</a></li>
          <li><a href="#pricing" onClick={(e) => e.preventDefault()}>Pricing</a></li>
          <li><a href="#resources" onClick={(e) => e.preventDefault()}>Resources</a></li>
        </ul>

        <div className="nav-actions">
          <button className="btn-login" onClick={() => handleGetStarted()}>Log in</button>
          <button className="btn-primary" onClick={() => handleGetStarted()}>Sign-up</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="hero">

        {/* Left Visuals */}
        <section className="hero-visuals">
          <div className="blue-blob"></div>
          {/* Free high quality unspalsh image of a professional smiling */}
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600"
            alt="Professional smiling"
            className="hero-image"
          />

          {/* Floating Badges */}
          <div className="floating-badge badge-1">
            <div className="badge-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>✓</div>
            <div className="badge-text">
              <h4>34%</h4>
              <p>Reply rate</p>
            </div>
          </div>

          <div className="floating-badge badge-2">
            <div className="badge-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>✉</div>
            <div className="badge-text">
              <h4>1357</h4>
              <p>Total emails found</p>
            </div>
          </div>

          <div className="floating-badge badge-3">
            <div className="badge-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>•</div>
            <div className="badge-text">
              <h4>1523</h4>
              <p>Connection sent</p>
            </div>
          </div>

          <div className="floating-badge badge-4 dashboard-badge">
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid #f1f5f9' }}>
              <span>Active</span>
              <span>Campaign</span>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                <span>Sent</span>
                <span>Accep. rate</span>
              </div>
            </div>

            <div className="dash-row">
              <div className="dash-col-left">
                <div className="toggle-btn active"><div className="toggle-circle"></div></div>
                <span className="dash-text">New York Software</span>
              </div>
              <div className="dash-numbers">
                <span className="dash-num">12</span>
                <span className="dash-pill">24%</span>
              </div>
            </div>

            <div className="dash-row">
              <div className="dash-col-left">
                <div className="toggle-btn active"><div className="toggle-circle"></div></div>
                <span className="dash-text">Test campaign 1</span>
              </div>
              <div className="dash-numbers">
                <span className="dash-num">563</span>
                <span className="dash-pill" style={{ backgroundColor: '#e2e8f0', color: '#64748b' }}>9%</span>
              </div>
            </div>

            <div className="dash-row">
              <div className="dash-col-left">
                <div className="toggle-btn"><div className="toggle-circle"></div></div>
                <span className="dash-text">Test campaign 2</span>
              </div>
              <div className="dash-numbers">
                <span className="dash-num">188</span>
                <span className="dash-pill">14%</span>
              </div>
            </div>
          </div>

        </section>

        {/* Right Content */}
        <section className="hero-content">
          <h1>
            Contact <span className="highlight">3x more</span><br />
            alumni in<br />
            less time.
          </h1>
          <p>
            Maximize the number of touchpoints with your leads, and get more replies faster. Saarthi is your smart automation tool and networking platform.
          </p>

          <button className="btn-blue" onClick={handleGetStarted}>
            Get started
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '8px' }}>
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>


        </section>
      </main>

      {/* Enrollment Section (Integrated via scroll instead of separate view) */}
      <section ref={enrollRef}>
        <div className="splash-container" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>
          {/* Added padding to create a gap when scrolling */}

          {/* Left Side: Big Image */}
          <div className="splash-image-side animate-on-scroll">
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Students Networking"
              className="splash-image"
            />
          </div>

          {/* Right Side: Content & Buttons */}
          <div className="splash-content-side">

            <div className="splash-content" style={{ padding: '2rem 4rem' }}>
              <div className="splash-content-subtitle animate-on-scroll delay-100">
                <span>//</span> NUMBER #1 COLLEGE NETWORK
              </div>

              <h2 className="animate-on-scroll delay-100" style={{ fontSize: '2.8rem', marginBottom: '1rem' }}>Empowering your<br />career vision</h2>
              <p className="animate-on-scroll delay-200" style={{ fontSize: '1rem', marginBottom: '2rem' }}>Our mission is to empower students of all backgrounds to thrive in an ever-changing professional landscape. We deliver exceptional networking value and mentorship.</p>

              <div className="splash-features animate-on-scroll delay-300" style={{ marginBottom: '2rem' }}>
                <div className="feature-item" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                  <svg className="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Expertise and experience
                </div>
                <div className="feature-item" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                  <svg className="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Student Centric approach
                </div>
                <div className="feature-item" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>
                  <svg className="check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Commitment to excellence
                </div>
              </div>

              <div className="splash-buttons animate-on-scroll delay-400">
                <button className="btn-splash" style={{ padding: '1rem 1.5rem', fontSize: '1rem' }} onClick={() => handleEnrollClick('alumni')}>
                  Enroll as Alumni
                  <div className="arrow-icon" style={{ width: '30px', height: '30px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
                <button className="btn-splash" style={{ padding: '1rem 1.5rem', fontSize: '1rem' }} onClick={() => handleEnrollClick('student')}>
                  Enroll as Student
                  <div className="arrow-icon" style={{ width: '30px', height: '30px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
