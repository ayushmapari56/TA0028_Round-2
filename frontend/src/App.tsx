import { useState, useRef } from 'react';
import './index.css';
import logo from './assets/logo.png';

export default function App() {
  const [view, setView] = useState<'home' | 'enroll' | 'login'>('home');
  const [loginRole, setLoginRole] = useState<'alumni' | 'student' | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login and Register
  const enrollRef = useRef<HTMLElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGetStarted = () => {
    setView('enroll');
    window.scrollTo({ top: 0 });
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
      alert(`${isLoginMode ? 'Logged in' : 'Registered'} successfully! Welcome to Saarthi.`);
      // Default behavior: Redirect to a dashboard or refresh state here
    } catch (error: any) {
      setErrorMsg(error.message);
    }
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

  if (view === 'enroll') {
    return (
      <div className="splash-container">
        <div className="splash-bg-blob top-left"></div>
        <div className="splash-bg-blob bottom-right"></div>

        <div className="splash-content">
          <h2>Choose your path</h2>
          <p>Join the Saarthi platform to connect, grow, and succeed alongside top graduates and ambitious students.</p>

          <div className="splash-buttons">
            <button className="btn-splash" onClick={() => handleEnrollClick('alumni')}>
              Enroll as Alumni
              <div className="arrow-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            <button className="btn-splash" onClick={() => handleEnrollClick('student')}>
              Enroll as Student
              <div className="arrow-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <p className="login-switch-text" style={{ marginTop: '2.5rem' }}>
            <span onClick={() => setView('home')}>← Back to Homepage</span>
          </p>
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

    </div>
  );
}
