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
  CheckCircle2,
  Globe2,
  Flame,
  ShieldAlert,
  Send
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { signInWithGoogle } from '../../config/firebase';
import '../../styles/auth3d.css';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useToast();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  // Auth Modes: 'password' | 'google-otp'
  const [authMode, setAuthMode] = useState('password');

  // Password Login State
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
  const [simulatedCodeHint, setSimulatedCodeHint] = useState('');
  const otpInputRefs = useRef([]);

  // Google Login State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Validation & Error states
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // 3D Tilt State
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

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

  // Handle 3D Mouse Parallax
  const handleMouseMove = (e) => {
    if (!cardRef.current || window.innerWidth < 768) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rX = -(mouseY / (rect.height / 2)) * 7;
    const rY = (mouseX / (rect.width / 2)) * 7;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

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

  // 1. Password Form Validation
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
        throw new Error('Invalid response from login service.');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        'Unable to connect to authentication server.';
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Google Login with Firebase
  const handleGoogleSignIn = async () => {
    setServerError('');
    setIsGoogleLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      if (!googleUser) return; // redirect initiated

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
        setServerError('Firebase requires adding "loop-five-azure.vercel.app" to Authorized Domains in Firebase Console (Authentication > Settings > Authorized Domains).');
      } else {
        setServerError(err.message || 'Google sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickGoogleTest = async (testEmail = 'mahesh.google@looop.app', testName = 'Mahesh Naidu') => {
    setServerError('');
    setIsGoogleLoading(true);
    try {
      const result = await authService.googleLogin({
        email: testEmail,
        displayName: testName,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        uid: `goog_${Date.now()}`
      });

      if (result && result.token && result.user) {
        handleAuthSuccess(result.user, result.token, testName);
      }
    } catch (err) {
      setServerError(err.message || 'Quick Google verification failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // 3. Send OTP (Brevo Integration Ready)
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setServerError('');
    if (!otpEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(otpEmail.trim())) {
      setServerError('Please enter a valid email address to receive OTP.');
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await authService.sendOtp(otpEmail.trim());
      setOtpSent(true);
      setOtpCountdown(60);
      if (res.demoCode) {
        setSimulatedCodeHint(res.demoCode);
      }
      addToast({
        title: 'Verification Code Sent',
        message: 'Please check your email inbox for the 6-digit OTP.',
        variant: 'info'
      });
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      setServerError(err.message || 'Failed to dispatch verification code.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP 6-box input changes
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
    const code = otpDigits.join('');
    if (code.length < 6) {
      setServerError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setServerError('');
    try {
      const res = await authService.verifyOtp(otpEmail.trim(), code);
      if (res && res.token && res.user) {
        handleAuthSuccess(res.user, res.token, res.user.name);
      }
    } catch (err) {
      setServerError(err.message || 'Invalid or expired verification code.');
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
        backgroundColor: '#021e17',
        backgroundImage: 'radial-gradient(circle at 50% 10%, #064e3b 0%, #021a14 70%, #01120e 100%)',
        position: 'relative',
        overflowX: 'hidden',
        color: '#f8fafc'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Animated Floating Ambient 3D Orbs */}
      <div
        className="floating-orb-1"
        style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '380px',
          height: '380px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(40px)',
          zIndex: 1
        }}
      />
      <div
        className="floating-orb-2"
        style={{
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(5, 150, 105, 0.22) 0%, rgba(5, 150, 105, 0) 70%)',
          pointerEvents: 'none',
          filter: 'blur(50px)',
          zIndex: 1
        }}
      />

      {/* Top Header */}
      <header
        style={{
          padding: '1.25rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20
        }}
      >
        <LooopLogo size="md" showTagline={true} linkTo="/" />

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.875rem',
            color: '#a7f3d0',
            textDecoration: 'none',
            fontWeight: 600,
            padding: '8px 16px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(6, 95, 70, 0.4)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.2s ease'
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main 3D Container Stage */}
      <main
        className="perspective-stage"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 1.5rem 3.5rem 1.5rem',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* TOP GLOWING WELCOME BANNER */}
        <div
          className="floating-badge welcome-shimmer-border"
          style={{
            padding: '2px',
            borderRadius: '9999px',
            marginBottom: '1.75rem',
            maxWidth: '680px',
            width: '100%',
            boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.4)'
          }}
        >
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '9999px',
              backgroundColor: '#064e3b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              flexWrap: 'wrap'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#34d399'
                }}
                className="glowing-indicator"
              />
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ecfdf5', letterSpacing: '-0.01em' }}>
                LOOOP 3.0 Platform
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.78rem', color: '#a7f3d0' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={13} color="#34d399" /> 100% Circular Goods
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={13} color="#34d399" /> Verified Community
              </span>
            </div>
          </div>
        </div>

        {/* 3D INTERACTIVE CARD CONTAINER */}
        <div
          ref={cardRef}
          className="card-3d"
          style={{
            maxWidth: '1050px',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(16, 185, 129, 0.15)',
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          {/* LEFT SIDE: Brand Showcase & 3D Visual Depth */}
          <div
            style={{
              padding: '3.5rem 3rem',
              background: 'linear-gradient(150deg, #022c22 0%, #064e3b 50%, #065f46 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Geometric 3D Aesthetic Rings */}
            <div
              style={{
                position: 'absolute',
                top: '-80px',
                right: '-80px',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                border: '45px solid rgba(52, 211, 153, 0.08)',
                pointerEvents: 'none'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-100px',
                left: '-100px',
                width: '380px',
                height: '380px',
                borderRadius: '50%',
                border: '60px solid rgba(52, 211, 153, 0.05)',
                pointerEvents: 'none'
              }}
            />

            {/* Top Brand Tag */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 14px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(52, 211, 153, 0.15)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: '#6ee7b7',
                  marginBottom: '1.5rem'
                }}
              >
                <Flame size={14} color="#34d399" />
                <span>Next-Gen Sustainability</span>
              </div>

              <h2
                style={{
                  fontSize: '2.1rem',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.03em',
                  marginBottom: '1rem',
                  color: '#ffffff'
                }}
              >
                Share goods. <br />
                <span style={{ color: '#34d399' }}>Save resources.</span> <br />
                Connect local.
              </h2>

              <p
                style={{
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  color: '#cbd5e1',
                  maxWidth: '380px'
                }}
              >
                Join thousands of verified neighbours lending, borrowing, and giving pre-loved items a second life.
              </p>
            </div>

            {/* Bottom 1-Tap Quick Sign-In Pills */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: '2.5rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#6ee7b7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ShieldCheck size={15} />
                <span>One-Tap Admin Sign-In:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEmail('looop.support@gmail.com');
                    setPassword('Mahesh@Naidu');
                    setErrors({});
                    setServerError('');
                    setAuthMode('password');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(52, 211, 153, 0.4)',
                    color: '#ffffff',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>👑 Mahesh Naidu (Super Admin)</span>
                  <span style={{ color: '#34d399', fontSize: '0.75rem' }}>Fill Credentials →</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@looop.community');
                    setPassword('AdminPassword123!');
                    setErrors({});
                    setServerError('');
                    setAuthMode('password');
                  }}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#e2e8f0',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>🛡️ Platform Governance Admin</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Fill →</span>
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive 3D Login & OTP Panel */}
          <div
            style={{
              padding: '3rem 2.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#ffffff'
            }}
          >
            {/* Top Mode Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                padding: '4px',
                borderRadius: '14px',
                backgroundColor: '#f1f5f9',
                marginBottom: '1.75rem',
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
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: authMode === 'password' ? '#ffffff' : 'transparent',
                  color: authMode === 'password' ? '#065f46' : '#64748b',
                  boxShadow: authMode === 'password' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <KeyRound size={15} />
                <span>Password Login</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('google-otp');
                  setServerError('');
                }}
                style={{
                  flex: 1,
                  padding: '9px 12px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  backgroundColor: authMode === 'google-otp' ? '#ffffff' : 'transparent',
                  color: authMode === 'google-otp' ? '#065f46' : '#64748b',
                  boxShadow: authMode === 'google-otp' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Mail size={15} />
                <span>Google & OTP Login</span>
              </button>
            </div>

            {/* Error Banner */}
            {serverError && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#991b1b',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginBottom: '1.25rem'
                }}
                role="alert"
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{serverError}</span>
              </div>
            )}

            {/* MODE 1: PASSWORD LOGIN */}
            {authMode === 'password' && (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Email Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label
                    htmlFor="login-email"
                    style={{
                      fontSize: '0.85rem',
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
                      <Mail size={18} />
                    </span>
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      placeholder="looop.support@gmail.com"
                      autoComplete="email"
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 40px',
                        fontSize: '0.95rem',
                        borderRadius: '12px',
                        border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        transition: 'all 0.15s ease'
                      }}
                    />
                  </div>
                  {errors.email && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{errors.email}</span>
                  )}
                </div>

                {/* Password Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label
                      htmlFor="login-password"
                      style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: errors.password ? '#ef4444' : '#334155'
                      }}
                    >
                      Password
                    </label>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontSize: '0.8rem',
                        color: '#059669',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      Forgot?
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
                      <Lock size={18} />
                    </span>
                    <input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      style={{
                        width: '100%',
                        padding: '12px 42px 12px 40px',
                        fontSize: '0.95rem',
                        borderRadius: '12px',
                        border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        outline: 'none',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        transition: 'all 0.15s ease'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && (
                    <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>{errors.password}</span>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '13px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 14px rgba(5, 150, 105, 0.35)',
                    transition: 'all 0.15s ease',
                    marginTop: '0.5rem'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE 2: GOOGLE LOGIN & OTP VERIFICATION */}
            {authMode === 'google-otp' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Google Sign In Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  style={{
                    padding: '12px 18px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    fontWeight: 700,
                    cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Official Google G Logo */}
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
                  <span>{isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
                </button>

                {/* Instant Google Verification fallback if domain is not yet whitelisted in Firebase */}
                {serverError?.includes('Authorized Domains') && (
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #86efac',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      textAlign: 'center'
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.82rem', color: '#166534', fontWeight: 600 }}>
                      Domain not yet added in Firebase Console? Test Google account creation now:
                    </p>
                    <button
                      type="button"
                      onClick={() => handleQuickGoogleTest('mahesh.google@looop.app', 'Mahesh Naidu')}
                      style={{
                        padding: '9px 16px',
                        backgroundColor: '#15803d',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)'
                      }}
                    >
                      ⚡ Instant Google Account Test (Persists to Neon DB)
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '0.25rem 0' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>OR EMAIL OTP (BREVO)</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                {/* OTP Step 1: Send Code */}
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
                        Your Email Address
                      </label>
                      <input
                        type="email"
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          fontSize: '0.95rem',
                          borderRadius: '12px',
                          border: '1.5px solid #cbd5e1',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSendingOtp}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#0f766e',
                        color: '#ffffff',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        cursor: isSendingOtp ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      {isSendingOtp ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Generating Code...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send 6-Digit Verification Code</span>
                        </>
                      )}
                    </button>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
                      ⚡ Dispatches via Brevo Transactional Email Service
                    </span>
                  </form>
                ) : (
                  /* OTP Step 2: Verify Code */
                  <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#334155', fontWeight: 600 }}>
                        Code sent to: <span style={{ color: '#059669' }}>{otpEmail}</span>
                      </p>
                      {simulatedCodeHint && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            backgroundColor: '#ecfdf5',
                            border: '1px solid #a7f3d0',
                            fontSize: '0.78rem',
                            color: '#065f46',
                            fontWeight: 700
                          }}
                        >
                          🔑 Test Code: {simulatedCodeHint}
                        </div>
                      )}
                    </div>

                    {/* 6 Digit Input Boxes */}
                    <div
                      onPaste={handleOtpPaste}
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
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="otp-box-input"
                          style={{
                            width: '44px',
                            height: '52px',
                            textAlign: 'center',
                            fontSize: '1.4rem',
                            fontWeight: 800,
                            borderRadius: '10px',
                            border: '2px solid #cbd5e1',
                            outline: 'none',
                            color: '#065f46',
                            transition: 'all 0.15s ease'
                          }}
                        />
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={isVerifyingOtp}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#059669',
                        color: '#ffffff',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: isVerifyingOtp ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        marginTop: '4px'
                      }}
                    >
                      {isVerifyingOtp ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          <span>Verify & Sign In</span>
                        </>
                      )}
                    </button>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        Change Email
                      </button>

                      <button
                        type="button"
                        disabled={otpCountdown > 0}
                        onClick={handleSendOtp}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: otpCountdown > 0 ? '#94a3b8' : '#059669',
                          fontWeight: 600,
                          cursor: otpCountdown > 0 ? 'default' : 'pointer'
                        }}
                      >
                        {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Bottom Register Prompt */}
            <div
              style={{
                marginTop: '2rem',
                textAlign: 'center',
                fontSize: '0.88rem',
                color: '#64748b'
              }}
            >
              <span>Don't have an account? </span>
              <Link
                to={redirectUrl ? `/register?redirect=${encodeURIComponent(redirectUrl)}` : '/register'}
                style={{
                  color: '#059669',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
