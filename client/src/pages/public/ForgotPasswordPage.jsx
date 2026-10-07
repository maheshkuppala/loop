import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Key,
  Repeat,
  Lock,
  RefreshCw,
  Clock
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useToast } from '../../hooks/useToast';

export const ForgotPasswordPage = () => {
  const { addToast } = useToast();

  // Form State
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  // Handle resend countdown timer
  useEffect(() => {
    let timer;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const validateForm = () => {
    const newErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call decoupled authService layer
      await authService.forgotPassword({
        email: email.trim()
      });

      // Generic privacy-preserving success state (prevents account enumeration)
      setIsSuccess(true);
      setResendCountdown(30);
      addToast({
        title: 'Instructions Sent',
        message: 'If an account exists, a reset link has been dispatched.',
        variant: 'info'
      });
    } catch (err) {
      let errorMsg = "We couldn't process your request right now. Please try again.";

      if (err.response?.status === 429) {
        errorMsg = 'Too many reset requests. Please wait a while and try again.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.message && !err.message.includes('404')) {
        errorMsg = err.message;
      } else {
        errorMsg = 'Unable to connect to password recovery server. Please ensure the backend is running.';
      }

      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (resendCountdown > 0 || isSubmitting) return;
    handleSubmit();
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
                <span>Account Recovery</span>
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
                We'll help you get back to your LOOOP community.
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
                Security and trust come first. Enter your verified email address to receive secure instructions and regain access to your shared items and community exchanges.
              </p>
            </div>

            {/* Middle: 3D Floating Security Flow Cards */}
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
              {/* Card 1: One-Time Token */}
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
                  <Key size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    One-Time Secure Link
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#bae6fd' }}>
                    Cryptographically generated reset token
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

              {/* Card 2: Expiry Window */}
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
                  <Lock size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.2 }}>
                    Short-Lived Protection
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#fde68a' }}>
                    Automatic link invalidation after single use
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

              {/* Card 3: Seamless Recovery */}
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
                    Safe Community Return
                  </div>
                  <div style={{ fontSize: '0.725rem', color: '#a7f3d0' }}>
                    Regain access to your items & discussions
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
                  Verified
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
                <span>End-to-End Account Protection</span>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Form or Success Confirmation Card */}
          <div
            style={{
              padding: '3.5rem 3rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
            className="auth-form-pane"
          >
            {!isSuccess ? (
              <>
                {/* Header */}
                <div style={{ marginBottom: '1.75rem' }}>
                  <h1
                    style={{
                      fontSize: '1.85rem',
                      fontWeight: 900,
                      color: 'var(--color-slate-900)',
                      marginBottom: '0.4rem',
                      letterSpacing: '-0.025em'
                    }}
                  >
                    Forgot your password?
                  </h1>
                  <p style={{ color: 'var(--color-slate-600)', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>
                    Enter the email address associated with your LOOOP account and we’ll help you reset your password.
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

                {/* Password Recovery Request Form */}
                <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {/* Email Field */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label
                      htmlFor="forgot-email"
                      style={{
                        fontSize: '0.85rem',
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
                        id="forgot-email"
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
                        style={{
                          width: '100%',
                          padding: '10px 14px 10px 40px',
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

                  {/* Submit Button */}
                  <div style={{ marginTop: '0.25rem' }}>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      style={{ width: '100%' }}
                      iconRight={!isSubmitting ? ArrowRight : undefined}
                    >
                      {isSubmitting ? 'Sending reset link...' : 'Send Reset Link'}
                    </Button>
                  </div>
                </form>

                {/* Bottom Navigation */}
                <div
                  style={{
                    marginTop: '2rem',
                    textAlign: 'center',
                    fontSize: '0.9rem',
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
            ) : (
              /* Success Confirmation State */
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
                  className="success-badge-pulse"
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
                  Check your inbox
                </h1>

                <p
                  style={{
                    color: 'var(--color-slate-600)',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    maxWidth: '380px',
                    marginBottom: '1.5rem'
                  }}
                >
                  If an account exists for <strong style={{ color: 'var(--color-slate-900)' }}>{email}</strong>, we've sent password reset instructions. Please check your inbox and spam folder.
                </p>

                {/* Resend & Action Buttons */}
                <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    style={{ width: '100%' }}
                    onClick={() => (window.location.href = '/login')}
                  >
                    Back to Login
                  </Button>

                  <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', marginTop: '6px' }}>
                    Didn't receive the email?{' '}
                    {resendCountdown > 0 ? (
                      <span style={{ color: 'var(--color-slate-400)', fontWeight: 600 }}>
                        Resend available in {resendCountdown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={isSubmitting}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          color: 'var(--color-primary-600)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Resend link
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsSuccess(false);
                      setServerError('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-slate-500)',
                      fontSize: '0.825rem',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                    className="terms-link"
                  >
                    Try another email address
                  </button>
                </div>
              </div>
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

export default ForgotPasswordPage;
