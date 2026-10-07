import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Send
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { signInWithGoogle } from '../../config/firebase';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Auth Modes: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password');

  // Password Login State (Starts CLEAN without pre-filled test credentials)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Login State
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  // Google Login State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation & Error states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Auto pre-fill email if passed in URL query param (e.g. from Register email check)
  useEffect(() => {
    const paramEmail = searchParams.get('email');
    if (paramEmail) {
      setEmail(paramEmail);
      setOtpEmail(paramEmail);
    }
  }, [location.search]);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (otpSent && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, otpCountdown]);

  const handleAuthSuccess = (userData, authToken, welcomeName) => {
    login(userData, authToken);
    addToast({
      title: 'Welcome Back!',
      message: `Signed in successfully as ${welcomeName || userData.name || userData.email}.`,
      variant: 'success'
    });

    if (redirectUrl) {
      navigate(redirectUrl);
    } else if (userData.role === 'ADMIN' || userData.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  // Password Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit Password Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await authService.login({
        email: email.trim(),
        password
      });

      if (response && response.token && response.user) {
        handleAuthSuccess(response.user, response.token, response.user.name);
      } else {
        throw new Error('Invalid response from authentication server.');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password. Please try again.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    setServerError('');
    setIsGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser) return;

      const result = await authService.googleLogin({
        email: googleUser.email,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL,
        uid: googleUser.uid
      });

      if (result && result.token && result.user) {
        handleAuthSuccess(result.user, result.token, googleUser.displayName);
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      const isDomainIssue = err.message?.includes('Authorized Domains') || err.message?.includes('unauthorized-domain');
      if (isDomainIssue) {
        setServerError('Firebase requires adding your domain to Authorized Domains in Firebase Console.');
      } else {
        setServerError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setServerError('');
    const targetEmail = (otpEmail || email).trim();

    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setServerError('Please enter a valid email address to receive OTP.');
      return;
    }

    setIsSendingOtp(true);
    try {
      await authService.sendOtp(targetEmail);
      setOtpSent(true);
      setOtpCountdown(60);
      addToast({
        title: 'Verification Code Dispatched',
        message: `A 6-digit OTP code has been sent to ${targetEmail} via Brevo Email.`,
        variant: 'info'
      });
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setServerError(err.message || 'Failed to dispatch verification code via Brevo.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP digit changes
  const handleOtpDigitChange = (index, value) => {
    const val = value.slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = val;
    setOtpDigits(newDigits);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newDigits = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtpDigits(newDigits);
      otpInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  // Submit OTP Verification
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const targetEmail = (otpEmail || email).trim();
    const code = otpDigits.join('');

    if (code.length < 6) {
      setServerError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setServerError('');

    try {
      const res = await authService.verifyOtp(targetEmail, code);
      if (res && res.token && res.user) {
        handleAuthSuccess(res.user, res.token, res.user.name);
      }
    } catch (err) {
      setServerError(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#064e3b',
        backgroundImage: 'radial-gradient(circle at 50% 10%, #065f46 0%, #022c22 60%, #011c16 100%)',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Navigation Top Header */}
      <header
        style={{
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto'
        }}
      >
        <LooopLogo size="md" showTagline={false} linkTo="/" />

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.85rem',
            color: '#a7f3d0',
            textDecoration: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Responsive Card Container */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem 1rem 3rem 1rem'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.25rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            color: '#0f172a',
            position: 'relative'
          }}
        >
          {/* Card Brand Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.65rem',
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: '6px',
                letterSpacing: '-0.025em'
              }}
            >
              Sign in to LOOOP
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Share, reuse, and connect with your local community.
            </p>
          </div>

          {/* 1. Google Verification (Primary Featured Action) */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                padding: '2px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                boxShadow: '0 4px 14px rgba(66, 133, 244, 0.22)'
              }}
            >
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                style={{
                  width: '100%',
                  padding: '13px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Verifying with Google...' : 'Continue with Google Verification'}</span>
              </button>
            </div>
            <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.75rem', color: '#059669', fontWeight: 700 }}>
              ✓ Instant 1-Click Google Verification
            </div>
          </div>

          {/* Mode Selector Tabs: Password vs OTP */}
          <div
            style={{
              display: 'flex',
              padding: '4px',
              borderRadius: '12px',
              backgroundColor: '#f1f5f9',
              marginBottom: '1.5rem',
              border: '1px solid #e2e8f0'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setServerError('');
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'password' ? '#ffffff' : 'transparent',
                color: authMode === 'password' ? '#047857' : '#64748b',
                boxShadow: authMode === 'password' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <KeyRound size={15} />
              <span>Password Sign-In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('otp');
                setServerError('');
                if (email) setOtpEmail(email);
              }}
              style={{
                flex: 1,
                padding: '9px 12px',
                fontSize: '0.85rem',
                fontWeight: 700,
                borderRadius: '9px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: authMode === 'otp' ? '#ffffff' : 'transparent',
                color: authMode === 'otp' ? '#047857' : '#64748b',
                boxShadow: authMode === 'otp' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Mail size={15} />
              <span>Email OTP Code</span>
            </button>
          </div>

          {/* Server Error Alert */}
          {serverError && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '1.25rem'
              }}
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{serverError}</span>
            </div>
          )}

          {/* MODE 1: PASSWORD LOGIN */}
          {authMode === 'password' && (
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Email Address Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label
                  htmlFor="login-email"
                  style={{
                    fontSize: '0.825rem',
                    fontWeight: 600,
                    color: errors.email ? '#ef4444' : '#334155'
                  }}
                >
                  Email Address
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.email ? '#ef4444' : '#94a3b8',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Mail size={17} />
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: '' });
                    }}
                    placeholder="Enter your email"
                    autoComplete="email"
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 38px',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.15s ease'
                    }}
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                    {errors.email}
                  </span>
                )}
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label
                    htmlFor="login-password"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: errors.password ? '#ef4444' : '#334155'
                    }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    style={{
                      fontSize: '0.78rem',
                      color: '#047857',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      color: errors.password ? '#ef4444' : '#94a3b8',
                      pointerEvents: 'none',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Lock size={17} />
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 38px',
                      fontSize: '0.9rem',
                      borderRadius: '12px',
                      border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                      outline: 'none',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      transition: 'all 0.15s ease'
                    }}
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
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                {errors.password && (
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                    {errors.password}
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <div style={{ marginTop: '0.5rem' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  style={{ width: '100%', borderRadius: '12px' }}
                  iconRight={!isSubmitting ? ArrowRight : undefined}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </form>
          )}

          {/* MODE 2: EMAIL OTP LOGIN */}
          {authMode === 'otp' && (
            <div>
              {!otpSent ? (
                <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <label htmlFor="otp-email" style={{ fontSize: '0.825rem', fontWeight: 600, color: '#334155' }}>
                      Email Address for OTP
                    </label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span
                        style={{
                          position: 'absolute',
                          left: '12px',
                          color: '#94a3b8',
                          pointerEvents: 'none',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <Mail size={17} />
                      </span>
                      <input
                        id="otp-email"
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        style={{
                          width: '100%',
                          padding: '11px 14px 11px 38px',
                          fontSize: '0.9rem',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          outline: 'none',
                          color: '#0f172a'
                        }}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSendingOtp}
                    disabled={isSendingOtp}
                    style={{ width: '100%', borderRadius: '12px' }}
                    iconRight={!isSendingOtp ? Send : undefined}
                  >
                    {isSendingOtp ? 'Dispatching OTP code...' : 'Send OTP Code via Brevo'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ textAlign: 'center', marginBottom: '0.25rem' }}>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#475569', fontWeight: 600 }}>
                      Enter 6-digit code sent via Brevo Email to:
                    </p>
                    <div
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '3px 12px',
                        backgroundColor: '#f1f5f9',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        color: '#0f172a'
                      }}
                    >
                      {otpEmail}
                    </div>
                  </div>

                  {/* 6 Digit OTP Box Inputs */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        onPaste={idx === 0 ? handleOtpPaste : undefined}
                        style={{
                          width: '42px',
                          height: '50px',
                          textAlign: 'center',
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          border: '2px solid #cbd5e1',
                          outline: 'none',
                          color: '#047857',
                          backgroundColor: '#ffffff'
                        }}
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isVerifyingOtp}
                    disabled={isVerifyingOtp || otpDigits.join('').length < 6}
                    style={{ width: '100%', borderRadius: '12px' }}
                    iconRight={ArrowRight}
                  >
                    {isVerifyingOtp ? 'Verifying Code...' : 'Verify Code & Sign In'}
                  </Button>

                  <div style={{ textAlign: 'center', fontSize: '0.825rem', color: '#64748b' }}>
                    <span>Didn't receive code? </span>
                    {otpCountdown > 0 ? (
                      <span style={{ fontWeight: 600, color: '#047857' }}>Resend in {otpCountdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#047857',
                          fontWeight: 700,
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        {isSendingOtp ? 'Sending...' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer Navigation Link: Register */}
          <div
            style={{
              marginTop: '1.75rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: '#64748b'
            }}
          >
            <span>Don't have an account? </span>
            <Link
              to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
              style={{
                color: '#047857',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
