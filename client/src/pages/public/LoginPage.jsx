import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Laptop,
  BookOpen,
  Wrench,
  Headphones,
  RefreshCw,
  Key
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation & Error states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Client-side field validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call decoupled authService layer
      const response = await authService.login({
        email: email.trim(),
        password
      });

      // If backend responds with token & user
      if (response && response.token && response.user) {
        login(response.user, response.token);
        addToast({
          title: 'Welcome Back',
          message: `Signed in successfully as ${response.user.name || response.user.email}.`,
          variant: 'success'
        });

        // Redirect to requested protected path if available
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (response.user.role === 'ADMIN' || response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Unexpected response from authentication server.');
      }
    } catch (err) {
      // Professional error presentation (no raw stack traces or fake successes)
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to authentication server. Please ensure the backend is running.';

      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    addToast({
      title: 'Password Reset',
      message: 'Password recovery will be activated when the backend email service is connected.',
      variant: 'info'
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Top Simple Brand & Back Navigation */}
      <header
        style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10
        }}
      >
        <LooopLogo size="md" showTagline={true} linkTo="/" />

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.875rem',
            color: 'var(--color-slate-600)',
            textDecoration: 'none',
            fontWeight: 600,
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid var(--color-slate-200)',
            transition: 'all var(--transition-fast)'
          }}
          className="back-home-link"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Authentication Split Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 1.5rem 3rem 1.5rem',
          position: 'relative'
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 40px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}
          className="auth-card-container"
        >
          {/* LEFT SIDE: Brand & 3D Connected Items Composition */}
          <div
            style={{
              padding: '3.5rem 3rem',
              background: 'linear-gradient(145deg, #064e3b 0%, #065f46 60%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
            className="auth-brand-pane"
          >
            {/* Background Decorative Rings */}
            <div
              style={{
                position: 'absolute',
                top: '-60px',
                right: '-60px',
                width: '260px',
                height: '260px',
                borderRadius: '50%',
                border: '40px solid rgba(255, 255, 255, 0.04)',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-80px',
                left: '-80px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                border: '60px solid rgba(255, 255, 255, 0.03)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Brand Copy */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#a7f3d0',
                  marginBottom: '1.25rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Sparkles size={14} />
                <span>The Community Sharing Circle</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.85rem, 3vw, 2.35rem)',
                  fontWeight: 900,
                  lineHeight: 1.2,
                  marginBottom: '1rem',
                  letterSpacing: '-0.025em',
                  color: '#ffffff'
                }}
              >
                Give unused things another purpose.
              </h2>

              <p
                style={{
                  fontSize: '0.975rem',
                  color: '#d1fae5',
                  lineHeight: 1.65,
                  maxWidth: '420px',
                  margin: 0
                }}
              >
                Connect with fellow students, neighbors, and sharers in your local community. Borrow textbooks, share tools, and keep items in the loop.
              </p>
            </div>

            {/* Middle: 3D Floating Everyday Item Cards */}
            <div
              style={{
                margin: '2.5rem 0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 2
              }}
              className="auth-floating-cards"
            >
              {/* Card 1: Study Calculator */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  transform: 'rotate(-1.5deg)',
                  transition: 'transform 0.3s ease'
                }}
                className="floating-perspective-card"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Laptop size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Casio FX-991ES Plus
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a7f3d0' }}>
                    Borrowed for finals · Indiranagar
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600
                  }}
                >
                  Borrow
                </span>
              </div>

              {/* Card 2: Books & Calculus Set */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  transform: 'rotate(1.5deg) translateX(12px)',
                  transition: 'transform 0.3s ease'
                }}
                className="floating-perspective-card"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    color: '#7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    University Physics & Calculus
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#bae6fd' }}>
                    Given away to junior · HSR Layout
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600
                  }}
                >
                  Give Away
                </span>
              </div>

              {/* Card 3: Cordless Tool */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)',
                  transform: 'rotate(-0.8deg)',
                  transition: 'transform 0.3s ease'
                }}
                className="floating-perspective-card"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Wrench size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Bosch Cordless Impact Drill
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#fde68a' }}>
                    Lent for DIY project · JP Nagar
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.7rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600
                  }}
                >
                  Borrow
                </span>
              </div>
            </div>

            {/* Bottom Trust Indicators */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1.25rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.78rem',
                color: '#d1fae5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#6ee7b7" />
                <span>Verified Peer Trust</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="#6ee7b7" />
                <span>4-Digit Handover Codes</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Login Form */}
          <div
            style={{
              padding: '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            className="auth-form-pane"
          >
            {/* Auth Mode Tab Switcher: Log In / Create Account */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#f1f5f9',
                borderRadius: 'var(--radius-lg)',
                padding: '4px',
                marginBottom: '1.75rem',
                border: '1px solid var(--color-slate-200)'
              }}
            >
              <button
                type="button"
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'default',
                  backgroundColor: '#ffffff',
                  color: 'var(--color-primary-700)',
                  boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <span>Log In</span>
              </button>
              <button
                type="button"
                onClick={() => navigate(redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register')}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  color: 'var(--color-slate-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Create Account</span>
              </button>
            </div>

            {/* Redirect Notice Banner */}
            {redirectUrl && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '1.25rem'
                }}
              >
                <Sparkles size={16} color="#059669" style={{ flexShrink: 0 }} />
                <span>
                  {redirectUrl.includes('share')
                    ? 'Account required to share an item. Sign in or create an account to start sharing!'
                    : 'Sign in or create an account to continue.'}
                </span>
              </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h1
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  color: 'var(--color-slate-900)',
                  marginBottom: '0.4rem',
                  letterSpacing: '-0.025em'
                }}
              >
                Welcome back
              </h1>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: 0 }}>
                Sign in to continue to LOOOP.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg)',
                  border: '1px solid var(--color-danger-border)',
                  color: '#991b1b',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '1.5rem'
                }}
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Email Address Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label
                  htmlFor="login-email"
                  style={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: errors.email ? 'var(--color-danger)' : 'var(--color-slate-700)'
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.email ? 'var(--color-danger)' : 'var(--color-slate-400)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Mail size={18} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      fontSize: '0.925rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.email ? '1.5px solid var(--color-danger)' : '1px solid var(--color-slate-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-slate-900)',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="auth-input"
                    aria-invalid={errors.email ? 'true' : 'false'}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <span id="email-error" style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: errors.password ? 'var(--color-danger)' : 'var(--color-slate-700)'
                    }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--color-primary-700)',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'color var(--transition-fast)'
                    }}
                    className="forgot-password-link"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.password ? 'var(--color-danger)' : 'var(--color-slate-400)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Lock size={18} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    style={{
                      width: '100%',
                      padding: '11px 44px 11px 40px',
                      fontSize: '0.925rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.password ? '1.5px solid var(--color-danger)' : '1px solid var(--color-slate-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-slate-900)',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="auth-input"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                    disabled={isSubmitting}
                  />

                  {/* Password Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color var(--transition-fast)'
                    }}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.password && (
                  <span id="password-error" style={{ fontSize: '0.78rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Login Button */}
              <div style={{ marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                  iconRight={!isSubmitting ? ArrowRight : undefined}
                >
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
              </div>
            </form>

            {/* Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.75rem 0',
                color: 'var(--color-slate-400)',
                fontSize: '0.825rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-slate-200)' }} />
              <span style={{ padding: '0 12px' }}>or continue exploring</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-slate-200)' }} />
            </div>

            {/* Guest Browsing CTA */}
            <Link to="/browse" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md" style={{ width: '100%' }}>
                Browse Community Items as Guest
              </Button>
            </Link>

            {/* Create Account Link */}
            <div
              style={{
                marginTop: '2rem',
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--color-slate-600)'
              }}
            >
              <span>Don't have an account? </span>
              <Link
                to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                style={{
                  color: 'var(--color-primary-600)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
                className="create-account-link"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Embedded Component Micro-Interactions */}
      <style>{`
        .auth-input:focus {
          border-color: var(--color-primary-500) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18) !important;
        }
        .password-toggle-btn:hover {
          color: var(--color-slate-700) !important;
        }
        .forgot-password-link:hover {
          color: var(--color-primary-600) !important;
          text-decoration: underline !important;
        }
        .create-account-link:hover {
          color: var(--color-primary-700) !important;
          text-decoration: underline !important;
        }
        .back-home-link:hover {
          border-color: var(--color-primary-300) !important;
          color: var(--color-primary-700) !important;
        }
        .floating-perspective-card:hover {
          transform: translateY(-2px) scale(1.02) !important;
        }
        @media (max-width: 768px) {
          .auth-brand-pane {
            display: none !important;
          }
          .auth-form-pane {
            padding: 2.25rem 1.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
