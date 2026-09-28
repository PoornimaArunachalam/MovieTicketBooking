// frontend/src/pages/Auth.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

/* ── tiny floating orb particle ── */
function Particle({ style }) {
  return <div className="auth-particle" style={style} />;
}

/* ── generates random particles once ── */
function useParticles(count = 18) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 6 + 3,
      x: Math.random() * 100,
      y: Math.random() * 100,
      dur: Math.random() * 14 + 10,
      delay: Math.random() * 8,
      opacity: Math.random() * 0.4 + 0.1,
    }))
  );
  return particles.current;
}

/* ─────────────── LOGIN ─────────────── */
export function Login() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login }      = useAuth();
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const particles      = useParticles();

  const handle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      addToast(`Welcome back, ${data.user.name.split(' ')[0]}! 🎬`, 'success');
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* animated background orbs */}
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      {/* floating particles */}
      {particles.map(p => (
        <Particle key={p.id} style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, top: `${p.y}%`,
          opacity: p.opacity,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      <div className="auth-card">
        {/* logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <span>🎬</span>
          </div>
          <span className="auth-logo-text">Cine<span className="text-gradient">Pulse</span></span>
        </div>

        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-sub">Sign in to your account and book your next adventure</p>

        <form onSubmit={handle} className="auth-form">
          {/* Email */}
          <div className={`auth-field ${focused === 'email' ? 'auth-field--active' : ''} ${form.email ? 'auth-field--filled' : ''}`}>
            <label className="auth-field-label">Email Address</label>
            <div className="auth-field-wrap">
              <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input
                className="auth-input"
                type="email"
                placeholder="you@example.com"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>
          </div>

          {/* Password */}
          <div className={`auth-field ${focused === 'password' ? 'auth-field--active' : ''} ${form.password ? 'auth-field--filled' : ''}`}>
            <label className="auth-field-label">Password</label>
            <div className="auth-field-wrap">
              <svg className="auth-field-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                className="auth-input"
                type={showPw ? 'text' : 'password'}
                placeholder="Enter your password"
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
              <button type="button" className="auth-pw-toggle" onClick={() => setShowPw(v => !v)} tabIndex={-1}>
                {showPw ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>New to CinePulse?</span></div>

        <Link to="/register" className="auth-alt-btn">
          Create a free account →
        </Link>
      </div>
    </div>
  );
}

/* ─────────────── REGISTER ─────────────── */
export function Register() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPw, setShowPw]   = useState(false);
  const [showCf, setShowCf]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { register }   = useAuth();
  const { addToast }   = useToast();
  const navigate       = useNavigate();
  const particles      = useParticles(14);

  const handle = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { addToast('Passwords do not match', 'error'); return; }
    if (form.password.length < 6) { addToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      addToast('Account created! Please sign in.', 'success');
      navigate('/login');
    } catch (err) {
      addToast(err.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: 'name',     label: 'Full Name',        type: 'text',     placeholder: 'John Doe',          icon: 'user'  },
    { key: 'email',    label: 'Email Address',     type: 'email',    placeholder: 'you@example.com',   icon: 'mail'  },
    { key: 'phone',    label: 'Phone Number',      type: 'tel',      placeholder: '9876543210',        icon: 'phone' },
    { key: 'password', label: 'Password',          type: 'password', placeholder: 'Min 6 characters',  icon: 'lock'  },
    { key: 'confirm',  label: 'Confirm Password',  type: 'password', placeholder: 'Re-enter password', icon: 'lock'  },
  ];

  const icons = {
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    phone: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
      </svg>
    ),
    lock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      {particles.map(p => (
        <Particle key={p.id} style={{
          width: p.size, height: p.size,
          left: `${p.x}%`, top: `${p.y}%`,
          opacity: p.opacity,
          animationDuration: `${p.dur}s`,
          animationDelay: `${p.delay}s`,
        }} />
      ))}

      <div className="auth-card auth-card--register">
        <div className="auth-logo">
          <div className="auth-logo-icon"><span>🎬</span></div>
          <span className="auth-logo-text">Cine<span className="text-gradient">Pulse</span></span>
        </div>

        <h1 className="auth-title">Create Account</h1>
        <p className="auth-sub">Join millions of movie lovers today</p>

        <form onSubmit={handle} className="auth-form">
          {fields.map(f => {
            const isPwField  = f.key === 'password';
            const isCfField  = f.key === 'confirm';
            const showToggle = isPwField || isCfField;
            const isVisible  = isPwField ? showPw : isCfField ? showCf : false;
            const inputType  = showToggle ? (isVisible ? 'text' : 'password') : f.type;

            return (
              <div
                key={f.key}
                className={`auth-field ${focused === f.key ? 'auth-field--active' : ''} ${form[f.key] ? 'auth-field--filled' : ''}`}
              >
                <label className="auth-field-label">{f.label}</label>
                <div className="auth-field-wrap">
                  <span className="auth-field-icon">{icons[f.icon]}</span>
                  <input
                    className="auth-input"
                    type={inputType}
                    placeholder={f.placeholder}
                    required={f.key !== 'phone'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    onFocus={() => setFocused(f.key)}
                    onBlur={() => setFocused(null)}
                  />
                  {showToggle && (
                    <button
                      type="button"
                      className="auth-pw-toggle"
                      onClick={() => isPwField ? setShowPw(v => !v) : setShowCf(v => !v)}
                      tabIndex={-1}
                    >
                      {isVisible ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="auth-spinner" />
            ) : (
              <>
                <span>Create Account</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>
        <Link to="/login" className="auth-alt-btn">Sign in instead →</Link>
      </div>
    </div>
  );
}
