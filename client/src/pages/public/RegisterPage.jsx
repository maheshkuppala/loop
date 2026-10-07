import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User,
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
  Check,
  Circle,
  Key,
  Repeat
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Field interaction tracking (only show blur errors after user touches field)
  const [touched, setTouched] = useState({});

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);

  // Password Requirement Checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const calculatePasswordStrength = () => {
    if (!password) return { score: 0, label: '', color: '#cbd5e1', width: '0%' };

    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUppercase) score += 1;
    if (hasLowercase) score += 1;
    if (hasNumber) score += 1;

    if (score <= 2) {
      return { score: 1, label: 'Weak', color: '#ef4444', width: '33%' };
    }
    if (score === 3) {
      return { score: 2, label: 'Medium', color: '#f59e0b', width: '66%' };
    }
    return { score: 3, label: 'Strong', color: '#10b981', width: '100%' };
  };

  const passwordStrength = calculatePasswordStrength();

  // Field-level validation for onBlur
  const validateField = (fieldName) => {
    const newErrors = { ...errors };

    if (fieldName === 'name') {
      const trimmedName = name.trim();
      if (!trimmedName) {
        newErrors.name = 'Please enter your full name.';
      } else if (trimmedName.length < 2) {
        newErrors.name = 'Full name must be at least 2 characters.';
      } else {
        delete newErrors.name;
      }
    }

    if (fieldName === 'email') {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        newErrors.email = 'Please enter your email address.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
        newErrors.email = 'Please enter a valid email address.';
      } else {
        delete newErrors.email;
      }
    }

    if (fieldName === 'password') {
      if (!password) {
        newErrors.password = 'Please create a password.';
      } else if (!hasMinLength) {
        newErrors.password = 'Password must be at least 8 characters long.';
      } else if (!hasUppercase || !hasLowercase || !hasNumber) {
        newErrors.password = 'Password must include uppercase, lowercase, and a number.';
      } else {
        delete newErrors.password;
      }

      // Re-check confirm password if already filled
      if (confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else if (confirmPassword && password === confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (fieldName === 'confirmPassword') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match.';
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setErrors(newErrors);
  };

  const handleBlur = (fieldName) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  // Full form validation prior to submission
  const validateForm = () => {
    const newErrors = {};

    // Full Name
    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Please enter your full name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    // Email Address
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Password
    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (!hasMinLength) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!hasUppercase || !hasLowercase || !hasNumber) {
      newErrors.password = 'Password must include uppercase, lowercase, and a number.';
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    // Terms Agreement
    if (!agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the Terms of Service to create an account.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsDuplicateEmail(false);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call decoupled authService layer (POST /api/auth/register)
      const response = await authService.register({
        name: name.trim(),
        email: email.trim(),
        password
      });

      if (response && response.token && response.user) {
        register(response.user, response.token);
        addToast({
          title: 'Welcome to LOOOP!',
          message: 'Your account has been created successfully.',
          variant: 'success'
        });
        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (response.user.role === 'admin' || response.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        throw new Error('Unexpected response from registration server.');
      }
    } catch (err) {
      // Professional error presentation
      let errorMsg = "We couldn't create your account right now. Please try again.";

      const status = err.response?.status;
      const respMsg = err.response?.data?.message || '';

      if (
        status === 409 ||
        respMsg.toLowerCase().includes('already exists') ||
        respMsg.toLowerCase().includes('already registered') ||
        err.message?.toLowerCase().includes('already exists')
      ) {
        errorMsg = 'An account with this email already exists. Please login instead.';
        setIsDuplicateEmail(true);
      } else if (respMsg) {
        errorMsg = respMsg;
      } else if (err.message && !err.message.includes('404')) {
        errorMsg = err.message;
      } else {
        errorMsg = 'Unable to connect to registration server. Please ensure the backend is running.';
      }

      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTermsClick = (e) => {
    e.preventDefault();
    addToast({
      title: 'LOOOP Community Guidelines',
      message: 'LOOOP exchanges are 100% non-commercial, peer-verified, and based on mutual community trust.',
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
      {/* Top Header Navigation */}
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
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            border: '1px solid var(--color-slate-200)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
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
          padding: '0.5rem 1.5rem 2.5rem 1.5rem',
          position: 'relative'
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.15fr) minmax(340px, 1fr)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}
          className="auth-card-container"
        >
          {/* LEFT SIDE: Brand & 3D Connected Items Composition */}
          <div
            style={{
              padding: '3rem 2.75rem',
              background: 'linear-gradient(145deg, #064e3b 0%, #065f46 55%, #047857 100%)',
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
                top: '-70px',
                right: '-70px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                border: '45px solid rgba(255, 255, 255, 0.04)',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-90px',
                left: '-90px',
                width: '340px',
                height: '340px',
                borderRadius: '50%',
                border: '65px solid rgba(255, 255, 255, 0.03)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Brand Copy */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              {/* Brand Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Repeat size={20} color="#6ee7b7" />
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#ffffff', lineHeight: 1 }}>
                    LOOOP
                  </div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a7f3d0', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: '2px' }}>
                    Share. Reuse. Connect.
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#a7f3d0',
                  marginBottom: '0.85rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Sparkles size={13} />
                <span>Join the Community Circle</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 2.8vw, 2.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.22,
                  marginBottom: '0.75rem',
                  letterSpacing: '-0.025em',
                  color: '#ffffff'
                }}
              >
                Join a community where unused things find purpose.
              </h2>

              <p
                style={{
                  fontSize: '0.925rem',
                  color: '#d1fae5',
                  lineHeight: 1.6,
                  maxWidth: '440px',
                  margin: 0
                }}
              >
                Connect with neighbors and fellow students. Give away items you've outgrown, borrow tools for quick projects, and keep useful products in the loop.
              </p>
            </div>

            {/* Middle: 3D Floating Everyday Item Cards */}
            <div
              style={{
                margin: '1.75rem 0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 2,
                perspective: '1000px'
              }}
              className="auth-floating-cards"
            >
              {/* Card 1: Books (Give Away) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(-1.2deg)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-1"
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(56, 189, 248, 0.25)',
                    color: '#7dd3fc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <BookOpen size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    University Physics & Calculus Set
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#bae6fd' }}>
                    Given away to junior · HSR Layout
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  Give Away
                </span>
              </div>

              {/* Card 2: Cordless Drill (Borrow) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.14)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(1.2deg) translateX(12px)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-2"
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(245, 158, 11, 0.25)',
                    color: '#fcd34d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Wrench size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Bosch 18V Cordless Impact Drill
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#fde68a' }}>
                    Lent for DIY weekend · JP Nagar
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  Borrow
                </span>
              </div>

              {/* Card 3: Scientific Calculator (Borrow) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(-0.8deg)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-3"
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Laptop size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Casio FX-991ES Plus Calculator
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#a7f3d0' }}>
                    Borrowed for exam week · Indiranagar
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  Borrow
                </span>
              </div>

              {/* Card 4: Noise Cancelling Headphones (Exchange) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.13)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.19)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(0.9deg) translateX(6px)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-4"
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(168, 85, 247, 0.25)',
                    color: '#d8b4fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Headphones size={17} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Sony WH-1000XM4 Headphones
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#e9d5ff' }}>
                    Exchanged for keycap set · Koramangala
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)',
                    fontWeight: 600,
                    flexShrink: 0
                  }}
                >
                  Exchange
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
                paddingTop: '1rem',
                borderTop: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: '0.78rem',
                color: '#d1fae5'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="#6ee7b7" />
                <span>100% Non-Commercial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="#6ee7b7" />
                <span>Verified Handover Codes</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Registration Form */}
          <div
            style={{
              padding: '2.5rem 2.5rem',
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
                marginBottom: '1.5rem',
                border: '1px solid var(--color-slate-200)'
              }}
            >
              <button
                type="button"
                onClick={() => navigate(redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login')}
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
                <span>Log In</span>
              </button>
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
                    ? 'Account required to share an item. Create your account below to get started!'
                    : 'Create a free account or sign in to continue.'}
                </span>
              </div>
            )}

            {/* Header */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: 'var(--color-slate-900)',
                  marginBottom: '0.3rem',
                  letterSpacing: '-0.025em'
                }}
              >
                Create your LOOOP account
              </h1>
              <p style={{ color: 'var(--color-slate-600)', fontSize: '0.9rem', margin: 0 }}>
                Join the community and give unused things another purpose.
              </p>
            </div>

            {/* Server Error Alert */}
            {serverError && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-danger-bg, #fef2f2)',
                  border: '1px solid var(--color-danger-border, #fecaca)',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '1.25rem'
                }}
                role="alert"
                aria-live="polite"
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <span>{serverError}</span>
                  {isDuplicateEmail && (
                    <div style={{ marginTop: '4px' }}>
                      <Link
                        to="/login"
                        style={{
                          color: 'var(--color-primary-700)',
                          fontWeight: 700,
                          textDecoration: 'underline',
                          fontSize: '0.825rem'
                        }}
                      >
                        Click here to log in now →
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
              {/* Full Name Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  htmlFor="register-name"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: errors.name ? 'var(--color-danger)' : 'var(--color-slate-700)'
                  }}
                >
                  Full Name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.name ? 'var(--color-danger)' : 'var(--color-slate-400)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <User size={17} />
                  </span>
                  <input
                    id="register-name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) {
                        const newErr = { ...errors };
                        delete newErr.name;
                        setErrors(newErr);
                      }
                    }}
                    onBlur={() => handleBlur('name')}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.name ? '1.5px solid var(--color-danger)' : '1px solid var(--color-slate-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-slate-900)',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="auth-input"
                    aria-invalid={errors.name ? 'true' : 'false'}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <span id="name-error" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                    {errors.name}
                  </span>
                )}
              </div>

              {/* Email Address Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  htmlFor="register-email"
                  style={{
                    fontSize: '0.825rem',
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
                    <Mail size={17} />
                  </span>
                  <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) {
                        const newErr = { ...errors };
                        delete newErr.email;
                        setErrors(newErr);
                      }
                    }}
                    onBlur={() => handleBlur('email')}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 38px',
                      fontSize: '0.9rem',
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
                  <span id="email-error" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label
                  htmlFor="register-password"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: errors.password ? 'var(--color-danger)' : 'var(--color-slate-700)'
                  }}
                >
                  Password
                </label>
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
                    <Lock size={17} />
                  </span>
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) {
                        const newErr = { ...errors };
                        delete newErr.password;
                        setErrors(newErr);
                      }
                    }}
                    onBlur={() => handleBlur('password')}
                    style={{
                      width: '100%',
                      padding: '9px 42px 9px 38px',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.password ? '1.5px solid var(--color-danger)' : '1px solid var(--color-slate-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-slate-900)',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="auth-input"
                    aria-invalid={errors.password ? 'true' : 'false'}
                    aria-describedby="password-rules"
                    disabled={isSubmitting}
                  />
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
                      padding: '5px',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color var(--transition-fast)'
                    }}
                    className="password-toggle-btn"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div style={{ marginTop: '2px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-slate-500)', fontWeight: 500 }}>
                        Password Strength
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--color-slate-200)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: passwordStrength.width,
                          height: '100%',
                          backgroundColor: passwordStrength.color,
                          transition: 'width 0.25s ease, background-color 0.25s ease'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Live Password Requirements Checklist */}
                <div
                  id="password-rules"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '3px 8px',
                    marginTop: '4px',
                    fontSize: '0.71rem',
                    color: 'var(--color-slate-500)'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasMinLength ? '#059669' : 'var(--color-slate-500)' }}>
                    {hasMinLength ? <Check size={12} strokeWidth={3} /> : <Circle size={9} />}
                    <span>8+ characters</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasUppercase ? '#059669' : 'var(--color-slate-500)' }}>
                    {hasUppercase ? <Check size={12} strokeWidth={3} /> : <Circle size={9} />}
                    <span>Uppercase letter</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasLowercase ? '#059669' : 'var(--color-slate-500)' }}>
                    {hasLowercase ? <Check size={12} strokeWidth={3} /> : <Circle size={9} />}
                    <span>Lowercase letter</span>
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: hasNumber ? '#059669' : 'var(--color-slate-500)' }}>
                    {hasNumber ? <Check size={12} strokeWidth={3} /> : <Circle size={9} />}
                    <span>At least one number</span>
                  </span>
                </div>

                {errors.password && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500, marginTop: '2px' }}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Confirm Password Field */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label
                    htmlFor="register-confirm-password"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-slate-700)'
                    }}
                  >
                    Confirm Password
                  </label>
                  {confirmPassword && password === confirmPassword && (
                    <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <CheckCircle2 size={12} />
                      <span>Passwords match</span>
                    </span>
                  )}
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-slate-400)',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Lock size={17} />
                  </span>
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) {
                        const newErr = { ...errors };
                        delete newErr.confirmPassword;
                        setErrors(newErr);
                      }
                    }}
                    onBlur={() => handleBlur('confirmPassword')}
                    style={{
                      width: '100%',
                      padding: '9px 42px 9px 38px',
                      fontSize: '0.9rem',
                      borderRadius: 'var(--radius-md)',
                      border: errors.confirmPassword ? '1.5px solid var(--color-danger)' : '1px solid var(--color-slate-300)',
                      backgroundColor: '#ffffff',
                      color: 'var(--color-slate-900)',
                      outline: 'none',
                      transition: 'all var(--transition-fast)'
                    }}
                    className="auth-input"
                    aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                    aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-slate-400)',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '5px',
                      borderRadius: 'var(--radius-xs)',
                      transition: 'color var(--transition-fast)'
                    }}
                    className="password-toggle-btn"
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <span id="confirm-password-error" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                    {errors.confirmPassword}
                  </span>
                )}
              </div>

              {/* Terms and Conditions Agreement */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="register-terms"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) {
                        const newErr = { ...errors };
                        delete newErr.agreeTerms;
                        setErrors(newErr);
                      }
                    }}
                    style={{
                      marginTop: '3px',
                      cursor: 'pointer',
                      width: '16px',
                      height: '16px',
                      accentColor: 'var(--color-primary-600)'
                    }}
                    disabled={isSubmitting}
                  />
                  <label htmlFor="register-terms" style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', lineHeight: 1.45, cursor: 'pointer' }}>
                    I agree to the{' '}
                    <a href="#terms" onClick={handleTermsClick} style={{ color: 'var(--color-primary-700)', fontWeight: 600, textDecoration: 'none' }} className="terms-link">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#privacy" onClick={handleTermsClick} style={{ color: 'var(--color-primary-700)', fontWeight: 600, textDecoration: 'none' }} className="terms-link">
                      Privacy Policy
                    </a>
                    , and pledge to keep community sharing courteous and non-commercial.
                  </label>
                </div>
                {errors.agreeTerms && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500, paddingLeft: '24px' }}>
                    {errors.agreeTerms}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '0.4rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{ width: '100%' }}
                  iconRight={!isSubmitting ? ArrowRight : undefined}
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </Button>
              </div>
            </form>

            {/* Bottom: Already have an account? Login */}
            <div
              style={{
                marginTop: '1.25rem',
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--color-slate-600)'
              }}
            >
              <span>Already have an account? </span>
              <Link
                to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                style={{
                  color: 'var(--color-primary-600)',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
                className="login-redirect-link"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Embedded Component Micro-Interactions & 3D Floating Keyframes */}
      <style>{`
        .auth-input:focus {
          border-color: var(--color-primary-500) !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.18) !important;
        }
        .password-toggle-btn:hover {
          color: var(--color-slate-700) !important;
        }
        .terms-link:hover {
          color: var(--color-primary-600) !important;
          text-decoration: underline !important;
        }
        .login-redirect-link:hover {
          color: var(--color-primary-700) !important;
          text-decoration: underline !important;
        }
        .back-home-link:hover {
          border-color: var(--color-primary-300) !important;
          color: var(--color-primary-700) !important;
        }
        .floating-perspective-card:hover {
          transform: translateY(-3px) scale(1.02) !important;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.2) !important;
        }

        /* Subtle 3D floating keyframes for brand items */
        @keyframes floatAnim1 {
          0%, 100% { transform: translateY(0px) rotate(-1.2deg); }
          50% { transform: translateY(-6px) rotate(-0.5deg); }
        }
        @keyframes floatAnim2 {
          0%, 100% { transform: translateY(0px) translateX(12px) rotate(1.2deg); }
          50% { transform: translateY(-7px) translateX(14px) rotate(2deg); }
        }
        @keyframes floatAnim3 {
          0%, 100% { transform: translateY(0px) rotate(-0.8deg); }
          50% { transform: translateY(-5px) rotate(0.1deg); }
        }
        @keyframes floatAnim4 {
          0%, 100% { transform: translateY(0px) translateX(6px) rotate(0.9deg); }
          50% { transform: translateY(-8px) translateX(8px) rotate(1.8deg); }
        }

        @media (prefers-reduced-motion: no-preference) {
          .float-anim-1 { animation: floatAnim1 6s ease-in-out infinite; }
          .float-anim-2 { animation: floatAnim2 7s ease-in-out infinite 0.8s; }
          .float-anim-3 { animation: floatAnim3 6.5s ease-in-out infinite 1.6s; }
          .float-anim-4 { animation: floatAnim4 7.5s ease-in-out infinite 2.4s; }
        }

        @media (max-width: 900px) {
          .auth-card-container {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
          }
          .auth-brand-pane {
            display: none !important;
          }
          .auth-form-pane {
            padding: 2rem 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;
