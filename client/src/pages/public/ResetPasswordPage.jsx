import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Repeat,
  Check,
  Circle,
  Key,
  ShieldAlert
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Read reset token safely from URL (?token=...)
  const token = searchParams.get('token');

  // Form state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Interaction tracking & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isTokenInvalid, setIsTokenInvalid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    if (!password) {
      newErrors.password = 'Please enter your new password.';
    } else if (!hasMinLength) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!hasUppercase || !hasLowercase || !hasNumber) {
      newErrors.password = 'Password must include uppercase, lowercase, and a number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsTokenInvalid(false);

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setServerError('Password reset link is missing a valid security token.');
      setIsTokenInvalid(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Call decoupled authService layer (POST /api/auth/reset-password)
      const response = await authService.resetPassword({
        token,
        password
      });

      // Genuine backend confirmation required (no fake success bypass)
      if (response && (response.success || response.message || response.status === 'success')) {
        setIsSuccess(true);
        addToast({
          title: 'Password Updated',
          message: 'Your password has been reset successfully. Please sign in.',
          variant: 'success'
        });
      } else {
        throw new Error('Unexpected response from password reset server.');
      }
    } catch (err) {
      let errorMsg = "We couldn't reset your password right now. Please try again.";

      const status = err.response?.status;
      const respMsg = err.response?.data?.message?.toLowerCase() || '';

      if (status === 429) {
        errorMsg = 'Too many attempts. Please wait and try again.';
      } else if (
        status === 400 &&
        (respMsg.includes('expired') || err.message?.toLowerCase().includes('expired'))
      ) {
        errorMsg = 'This password reset link has expired. Please request a new one.';
        setIsTokenInvalid(true);
      } else if (
        status === 400 ||
        status === 404 ||
        respMsg.includes('invalid') ||
        respMsg.includes('token')
      ) {
        errorMsg = 'Your password reset link is invalid or has expired.';
        setIsTokenInvalid(true);
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message && !err.message.includes('404')) {
        errorMsg = err.message;
      } else {
        errorMsg = 'Unable to connect to password reset server. Please ensure the backend is running.';
      }

      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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
          to="/login"
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
          <span>Back to Login</span>
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
            maxWidth: '1080px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(340px, 1fr)',
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            overflow: 'hidden'
          }}
          className="auth-card-container"
        >
          {/* LEFT SIDE: Brand & Subtle 3D Security Visual */}
          <div
            style={{
              padding: '3.5rem 3rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <Repeat size={22} color="#6ee7b7" />
                </div>
                <div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '-0.025em', color: '#ffffff', lineHeight: 1 }}>
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
                  marginBottom: '1rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                <Sparkles size={13} />
                <span>Account Protection</span>
              </div>

              <h2
                style={{
                  fontSize: 'clamp(1.75rem, 2.8vw, 2.2rem)',
                  fontWeight: 900,
                  lineHeight: 1.25,
                  marginBottom: '0.85rem',
                  letterSpacing: '-0.025em',
                  color: '#ffffff'
                }}
              >
                Create a new password and get back to your LOOOP community.
              </h2>

              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#d1fae5',
                  lineHeight: 1.65,
                  maxWidth: '440px',
                  margin: 0
                }}
              >
                Choose a memorable, strong password. Once updated, your access to lending, borrowing, and community exchanges will be instantly restored.
              </p>
            </div>

            {/* Middle: 3D Floating Security Cards */}
            <div
              style={{
                margin: '2rem 0',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                zIndex: 2,
                perspective: '1000px'
              }}
              className="auth-floating-cards"
            >
              {/* Card 1: Encrypted Password */}
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
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(-1.2deg)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-1"
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
                  <Lock size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Secure Password Encryption
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#bae6fd' }}>
                    Hashed with bcrypt on backend servers
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
                  Encrypted
                </span>
              </div>

              {/* Card 2: Instant Access */}
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
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(1.2deg) translateX(12px)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-2"
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
                  <Repeat size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Instant Session Restoration
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#fde68a' }}>
                    Seamless return to your active sharing circles
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
                  Restored
                </span>
              </div>

              {/* Card 3: Single-Use Security */}
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
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.14)',
                  transform: 'rotate(-0.8deg)',
                  transition: 'all 0.3s ease'
                }}
                className="floating-perspective-card float-anim-3"
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
                  <ShieldCheck size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Single-Use Invalidation
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a7f3d0' }}>
                    Previous reset links are permanently retired
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
                  Protected
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
                <span>100% Non-Commercial</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Key size={15} color="#6ee7b7" />
                <span>Community Verified Protection</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Reset Form or Status Card */}
          <div
            style={{
              padding: '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            className="auth-form-pane"
          >
            {/* 1. MISSING TOKEN STATE */}
            {!token ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1rem 0'
                }}
                role="status"
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    color: '#d97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 0 8px rgba(245, 158, 11, 0.05)'
                  }}
                >
                  <ShieldAlert size={34} />
                </div>

                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: 'var(--color-slate-900)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.025em'
                  }}
                >
                  Password reset link is missing
                </h1>

                <p
                  style={{
                    color: 'var(--color-slate-600)',
                    fontSize: '0.925rem',
                    lineHeight: 1.6,
                    maxWidth: '380px',
                    marginBottom: '1.75rem'
                  }}
                >
                  This page requires a valid, one-time security token sent to your email address to reset your account password.
                </p>

                <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={() => navigate('/forgot-password')}
                  >
                    Request a new reset link
                  </Button>

                  <Link
                    to="/login"
                    style={{
                      color: 'var(--color-slate-600)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      textDecoration: 'none',
                      marginTop: '4px'
                    }}
                    className="login-redirect-link"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            ) : isSuccess ? (
              /* 2. SUCCESS STATE (Genuine Backend Confirmation) */
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '1rem 0'
                }}
                role="status"
                aria-live="polite"
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                    color: 'var(--color-primary-600)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: '0 0 0 8px rgba(16, 185, 129, 0.05)'
                  }}
                >
                  <CheckCircle2 size={34} />
                </div>

                <h1
                  style={{
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: 'var(--color-slate-900)',
                    marginBottom: '0.5rem',
                    letterSpacing: '-0.025em'
                  }}
                >
                  Password updated successfully
                </h1>

                <p
                  style={{
                    color: 'var(--color-slate-600)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    maxWidth: '380px',
                    marginBottom: '1.75rem'
                  }}
                >
                  Your LOOOP password has been changed. You can now sign in with your new credentials.
                </p>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  style={{ width: '100%', maxWidth: '320px' }}
                  onClick={() => navigate('/login')}
                  iconRight={ArrowRight}
                >
                  Continue to Login
                </Button>
              </div>
            ) : (
              /* 3. RESET PASSWORD FORM */
              <>
                {/* Heading */}
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
                    Create a new password
                  </h1>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.925rem', margin: 0 }}>
                    Choose a strong password to secure your LOOOP account.
                  </p>
                </div>

                {/* Server Error / Invalid Token Alert */}
                {serverError && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-danger-bg, #fef2f2)',
                      border: '1px solid var(--color-danger-border, #fecaca)',
                      color: '#991b1b',
                      fontSize: '0.875rem',
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
                      {isTokenInvalid && (
                        <div style={{ marginTop: '6px' }}>
                          <Link
                            to="/forgot-password"
                            style={{
                              color: 'var(--color-primary-700)',
                              fontWeight: 700,
                              textDecoration: 'underline',
                              fontSize: '0.825rem'
                            }}
                          >
                            Request a new reset link →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Reset Form */}
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  {/* New Password Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label
                      htmlFor="reset-password"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: errors.password ? 'var(--color-danger)' : 'var(--color-slate-700)'
                      }}
                    >
                      New Password
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
                        id="reset-password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errors.password) {
                            const newErr = { ...errors };
                            delete newErr.password;
                            setErrors(newErr);
                          }
                        }}
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
                        htmlFor="reset-confirm-password"
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: errors.confirmPassword ? 'var(--color-danger)' : 'var(--color-slate-700)'
                        }}
                      >
                        Confirm New Password
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
                        id="reset-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) {
                            const newErr = { ...errors };
                            delete newErr.confirmPassword;
                            setErrors(newErr);
                          }
                        }}
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
                        aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
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
                      <span id="confirm-error" style={{ fontSize: '0.75rem', color: 'var(--color-danger)', fontWeight: 500 }}>
                        {errors.confirmPassword}
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
                      {isSubmitting ? 'Resetting password...' : 'Reset Password'}
                    </Button>
                  </div>
                </form>

                {/* Bottom Navigation */}
                <div
                  style={{
                    marginTop: '1.5rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: 'var(--color-slate-600)'
                  }}
                >
                  <span>Remember your password? </span>
                  <Link
                    to="/login"
                    style={{
                      color: 'var(--color-primary-600)',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                    className="login-redirect-link"
                  >
                    Back to Login
                  </Link>
                </div>
              </>
            )}
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

        @media (prefers-reduced-motion: no-preference) {
          .float-anim-1 { animation: floatAnim1 6s ease-in-out infinite; }
          .float-anim-2 { animation: floatAnim2 7s ease-in-out infinite 0.8s; }
          .float-anim-3 { animation: floatAnim3 6.5s ease-in-out infinite 1.6s; }
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
            padding: 2.25rem 1.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ResetPasswordPage;
