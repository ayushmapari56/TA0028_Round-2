import { useState, useRef, useEffect } from 'react';
import './index.css';
const logo = "/saarthi-logo.png";

const matchAlumni = [
  { id: 1, name: "Rahul Sharma", role: "Software Engineer", company: "Google", match: "98%", batch: "Gold", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
  { id: 2, name: "Priya Patel", role: "Product Manager", company: "Microsoft", match: "95%", batch: "Silver", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80" },
  { id: 3, name: "Amit Kumar", role: "Data Scientist", company: "Amazon", match: "89%", batch: "Bronze", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  { id: 4, name: "Neha Gupta", role: "UX Designer", company: "Adobe", match: "88%", batch: null, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80" },
  { id: 5, name: "Vikram Singh", role: "Backend Dev", company: "Netflix", match: "82%", batch: null, img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80" },
];

export default function App() {
  const [view, setView] = useState<'home' | 'enroll' | 'login' | 'login-chooser' | 'dashboard' | 'chat' | 'matching-input'>('home');
  const [loginRole, setLoginRole] = useState<'alumni' | 'student' | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true); // Toggle between Login and Register
  const [isMatching, setIsMatching] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<typeof matchAlumni[0] | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isDigiLockerVerified, setIsDigiLockerVerified] = useState(false);
  const [isVerifyingDigiLocker, setIsVerifyingDigiLocker] = useState(false);
  const [studentSkills, setStudentSkills] = useState('');
  const [studentGoals, setStudentGoals] = useState('');
  const [matchingStep, setMatchingStep] = useState(0);
  const enrollRef = useRef<HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, view]);

  useEffect(() => {
    if (selectedMentor) {
      setMessages([
        { text: `Hello! I saw your profile and your interest in ${selectedMentor.role}. I'd be happy to guide you through the process. How can I help?`, sender: 'received', time: '10:42 AM' }
      ]);
    }
  }, [selectedMentor]);

  useEffect(() => {
    if (view === 'dashboard') {
      setIsMatching(true);
      setMatchingStep(0);

      const s1 = setTimeout(() => setMatchingStep(1), 1000);
      const s2 = setTimeout(() => setMatchingStep(2), 2000);
      const timer = setTimeout(() => setIsMatching(false), 4500);

      return () => {
        clearTimeout(s1);
        clearTimeout(s2);
        clearTimeout(timer);
      };
    }
  }, [view]);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [fullName, setFullName] = useState('');
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

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
    setIsLoginMode(false); // Default to Register/Signup view
    setErrorMsg('');
    window.scrollTo({ top: 0 });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // --- DEMO BYPASS FOR HACKATHON ---
    if (email === 'student@saarthi.com' && password === 'password123' && isLoginMode) {
      localStorage.setItem('saarthi_token', 'demo_token_123');
      setView('dashboard');
      window.scrollTo({ top: 0 });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: loginRole, college, fullName, branch, year, linkedin, isDigiLockerVerified })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      if (isLoginMode) {
        // Normal Login Success
        localStorage.setItem('saarthi_token', data.token);
        setView('dashboard');
        window.scrollTo({ top: 0 });
      } else {
        // Registration Success -> Show OTP Modal
        // Note: The backend doesn't send a token yet, it requires verification
        setShowOtpModal(true);
      }

    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    try {
      const response = await fetch(`http://localhost:5000/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Final Success! OTP matches
      localStorage.setItem('saarthi_token', data.token);
      setShowOtpModal(false);
      setView('dashboard');
      window.scrollTo({ top: 0 });

    } catch (error: any) {
      setOtpError(error.message);
    }
  };

  if (view === 'login-chooser') {
    return (
      <div className="splash-container">

        {/* Left Side: Login Graphic */}
        <div className="splash-image-side" style={{ padding: '2rem' }}>
          <img
            src="/login-security.avif"
            alt="Login Gateway"
            className="splash-image"
            style={{ objectFit: 'contain', backgroundColor: 'var(--color-primary-light)' }}
          />
        </div>

        {/* Right Side: Login Options */}
        <div className="splash-content-side">
          <div className="splash-content">
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: '1.2' }}>Welcome back to Saarthi</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: '2.5rem' }}>Select your portal to continue.</p>

            <div className="splash-buttons">
              <button className="btn-splash btn-demo" onClick={() => {
                setView('matching-input');
                window.scrollTo({ top: 0 });
              }}>
                Judge's Demo Mode (Match AI)
                <div className="arrow-icon" style={{ backgroundColor: '#f59e0b' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
              </button>

              <button className="btn-splash" onClick={() => {
                setLoginRole('alumni');
                setIsLoginMode(true);
                setView('login');
              }}>
                Login as Alumni
                <div className="arrow-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
              <button className="btn-splash" onClick={() => {
                setLoginRole('student');
                setIsLoginMode(true);
                setView('login');
              }}>
                Login as Student
                <div className="arrow-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>

            <p className="login-switch-text" style={{ marginTop: '2.5rem', textAlign: 'left' }}>
              <span onClick={() => setView('home')}>← Back to Homepage</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

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
                {loginRole === 'alumni' && !isLoginMode && (
                  <div className="digilocker-verify-section">
                    <h3>DigiLocker Verification</h3>
                    <p>Verify your identity and alumni status via DigiLocker for a trusted profile badge.</p>
                    {!isDigiLockerVerified ? (
                      <button
                        type="button"
                        className="btn-digilocker"
                        onClick={() => {
                          setIsVerifyingDigiLocker(true);
                          setTimeout(() => {
                            setIsVerifyingDigiLocker(false);
                            setIsDigiLockerVerified(true);
                          }, 2500);
                        }}
                        disabled={isVerifyingDigiLocker}
                      >
                        {isVerifyingDigiLocker ? 'Fetching Documents...' : 'Verify with DigiLocker'}
                        {!isVerifyingDigiLocker && (
                          <img src="https://www.digilocker.gov.in/assets/img/digilocker_logo.png" alt="DigiLocker" className="dl-mini-logo" />
                        )}
                      </button>
                    ) : (
                      <div className="digilocker-success">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        Verified via DigiLocker
                      </div>
                    )}
                    <hr style={{ margin: '1.5rem 0', borderColor: '#e2e8f0' }} />
                  </div>
                )}

                {!isLoginMode && (
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" className="form-control" placeholder="Enter your full name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
                  </div>
                )}

                {/* Additional Fields for Student Sign Up */}
                {loginRole === 'student' && !isLoginMode && (
                  <>
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
                    <div className="form-group">
                      <label>Branch / Major</label>
                      <input type="text" className="form-control" placeholder="e.g., Computer Science, Mechanical" required value={branch} onChange={(e) => setBranch(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label>Current Year of Study</label>
                      <select className="form-control" required value={year} onChange={(e) => setYear(e.target.value)}>
                        <option value="" disabled>Select Year...</option>
                        <option value="1">First Year</option>
                        <option value="2">Second Year</option>
                        <option value="3">Third Year</option>
                        <option value="4">Fourth Year</option>
                        <option value="5">Masters / PhD</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>LinkedIn Profile URL</label>
                      <input type="url" className="form-control" placeholder="https://linkedin.com/in/username" required value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
                    </div>
                  </>
                )}

                <div className="form-group">
                  <label>{loginRole === 'student' ? 'College Email Address' : 'Email Address'}</label>
                  <input type="email" className="form-control" placeholder={loginRole === 'student' ? "e.g., student@college.edu.in" : "Enter your email"} required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" className="form-control" placeholder="Enter your password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>

                {isLoginMode && loginRole === 'student' && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#0369a1' }}>
                    <strong>Demo Mode:</strong> Use <u>student@saarthi.com</u> / <u>password123</u> for instant dashboard access.
                  </div>
                )}

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
            <img src="/login-security.avif" alt="Login Graphic" className="login-illustration" />
          </div>

        </main>

        {/* --- OTP VERIFICATION MODAL OVERLAY --- */}
        {showOtpModal && (
          <div className="modal-overlay" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex',
            justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}>
            <div className="modal-content" style={{
              background: 'white', padding: '3rem', borderRadius: '16px',
              maxWidth: '400px', width: '90%', textAlign: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <div style={{ background: '#e0f2fe', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)' }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                </div>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Check your email</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                We've sent a 6-digit verification code to <strong>{email}</strong>. Please enter it below to verify your account.
              </p>

              {otpError && <div style={{ color: 'white', background: '#ef4444', padding: '0.5rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.9rem' }}>{otpError}</div>}

              <form onSubmit={handleVerifyOtp}>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))} // Numbers only
                  style={{
                    width: '100%', padding: '1rem', fontSize: '2rem',
                    letterSpacing: '0.5rem', textAlign: 'center',
                    border: '2px solid #e2e8f0', borderRadius: '8px',
                    marginBottom: '1.5rem', fontFamily: 'monospace'
                  }}
                  required
                />
                <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', justifyContent: 'center' }}>
                  Verify & Continue
                </button>
              </form>

              <button
                onClick={() => setShowOtpModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', marginTop: '1rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }
  if (view === 'matching-input') {
    return (
      <div className="matching-input-container">
        {/* Animated background elements */}
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2"></div>

        <nav className="dashboard-nav" style={{ width: '100%', zIndex: 100 }}>
          <div className="logo dashboard-logo" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
            Saarthi <span>Matching Engine</span>
          </div>
          <button className="btn-logout" onClick={() => setView('home')}>Cancel</button>
        </nav>

        <div className="matching-form-card">
          <div className="form-header">
            <div className="ai-tag">AI-POWERED MATCHING</div>
            <h2>What should we match today?</h2>
            <p>Enter student details to trigger the high-performance NLP Matching Engine.</p>
          </div>

          <div className="form-body">
            <div className="form-group">
              <label>Technical Skills & Experience</label>
              <textarea
                placeholder="List skills (e.g., Python, AWS, React) and any past experience..."
                value={studentSkills}
                onChange={(e) => setStudentSkills(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Career Objectives & Growth</label>
              <textarea
                placeholder="Describe what you want to achieve (e.g., Get into FAANG, Frontend Dev, Master AI)..."
                value={studentGoals}
                onChange={(e) => setStudentGoals(e.target.value)}
              />
            </div>

            <button className="btn-large" onClick={() => setView('dashboard')}>
              Find Best Mentor Match
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="dashboard-container">
        {isMatching && (
          <div className="matching-overlay">
            <div className="matching-anim">
              <div className="ai-scanner"></div>
              <div className="logo-float">
                <img src={logo} alt="Logo" />
              </div>
              <h2 style={{ fontSize: '2.5rem' }}>Saarthi Core Matching Engine</h2>
              <p style={{ color: '#94a3b8', fontSize: '1.2rem' }}>Vectorizing student profile: <strong>{studentSkills || "Full-stack Dev"}</strong></p>

              <div className="matching-steps">
                <div className={`step-item ${matchingStep >= 0 ? 'active' : ''}`}>
                  <div className="step-icon-spin">⚙</div>
                  Initializing NLP Parsers...
                </div>
                <div className={`step-item ${matchingStep >= 1 ? 'active' : ''}`}>
                  <div className="step-icon-spin">🔍</div>
                  Searching 12,000+ Alumni Graph...
                </div>
                <div className={`step-item ${matchingStep >= 2 ? 'active' : ''}`}>
                  <div className="step-icon-spin">⚡</div>
                  Ranking by Semantic Similarity...
                </div>
              </div>
            </div>
          </div>
        )}

        <nav className="dashboard-nav">
          <div className="logo dashboard-logo">
            <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
            Saarthi <span>Dashboard</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="verified-status">Verified Student ✓</div>
            <button className="btn-chat-nav" onClick={() => {
              setSelectedMentor(matchAlumni[0]);
              setView('chat');
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Messages
            </button>
            <button className="btn-logout" onClick={() => {
              localStorage.removeItem('saarthi_token');
              setView('home');
            }}>Log Out</button>
          </div>
        </nav>

        <div className="dashboard-content">
          <div className="ai-match-header">
            <div className="ai-tag">REAL-TIME MATCHING ACTIVE</div>
            <h1>Your Top Mentor Matches</h1>
            <p>We've found the perfect connections for your career goals based on our AI matching algorithm.</p>
          </div>

          <div className="carousel-container">
            <div className="carousel-3d">
              {matchAlumni.map((alumni, index) => (
                <div key={alumni.id} className="carousel-card" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="match-badge">88 Mentor Score</div>
                  <img src={alumni.img} alt={alumni.name} />
                  <div className="card-info">
                    <div className="match-reason">Matched on {studentSkills.split(',')[0] || "Software Engineering"}</div>
                    {alumni.batch && <div className={`batch-tag tag-${alumni.batch.toLowerCase()}`}>{alumni.batch} Batch</div>}
                    <h3>{alumni.name}</h3>
                    <p>{alumni.role} @ <strong>{alumni.company}</strong></p>

                    <div className="response-time">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      Response within 24 hours
                    </div>

                    <div className="card-skills">
                      {["React", "Node", "AWS"].map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                    <button className="btn-connect" onClick={() => {
                      setSelectedMentor(alumni);
                      setView('chat');
                    }}>Connect Now</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'chat' && selectedMentor) {
    return (
      <div className="dashboard-container">
        <nav className="dashboard-nav">
          <div className="logo dashboard-logo" onClick={() => setView('dashboard')} style={{ cursor: 'pointer' }}>
            <img src={logo} alt="Saarthi Logo" className="nav-logo-img" />
            Saarthi <span>Messaging</span>
          </div>
          <button className="btn-logout" onClick={() => setView('dashboard')}>Back to Matches</button>
        </nav>

        <div className="chat-container">
          <div className="chat-sidebar">
            <div className="sidebar-header">Active Conversations</div>
            <div className="sidebar-item active">
              <img src={selectedMentor.img} alt={selectedMentor.name} />
              <div className="sidebar-info">
                <h4>{selectedMentor.name}</h4>
                <p>Online</p>
              </div>
            </div>
          </div>

          <div className="chat-main">
            <div className="chat-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={selectedMentor.img} alt={selectedMentor.name} />
                <div>
                  <h3>{selectedMentor.name}</h3>
                  <p>{selectedMentor.role} @ {selectedMentor.company}</p>
                </div>
              </div>
              <div className="silver-batch-badge">Silver Batch</div>
            </div>

            <div className="chat-messages">
              <div className="chat-date-divider"><span>Today</span></div>
              {messages.map((msg, i) => (
                <div key={i} className={`msg-${msg.sender}`}>
                  <div className="msg-bubble">{msg.text}</div>
                  <span className="msg-time">{msg.time}</span>
                </div>
              ))}
              {chatInput && (
                <div className="typing-indicator">
                  You are typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={(e) => {
              e.preventDefault();
              if (!chatInput.trim()) return;

              const newMsg = {
                text: chatInput,
                sender: 'sent',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              };
              setMessages(prev => [...prev, newMsg]);
              setChatInput('');

              // Automated response for demo "Wow" factor
              setTimeout(() => {
                setMessages(prev => [...prev, {
                  text: "That sounds interesting! Let's discuss this further. I'm available for a call this weekend.",
                  sender: 'received',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }]);
              }, 1500);
            }}>
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button className="btn-send" type="submit">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </form>
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
          <button className="btn-login" onClick={() => {
            setView('login-chooser');
            window.scrollTo({ top: 0 });
          }}>Log in</button>
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
