import React, { useState, useRef, useEffect } from 'react';
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
  AlertCircle,
  Check,
  Circle,
  Send,
  Globe
} from 'lucide-react';
import LooopLogo from '../../components/common/LooopLogo';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { signInWithGoogle } from '../../config/firebase';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // OTP Registration Step State: 'form' | 'otp'
  const [regStep, setRegStep] = useState('form');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpCountdown, setOtpCountdown] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const otpInputRefs = useRef([]);

  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission & Validation States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);

  // OTP Countdown timer
  useEffect(() => {
    let timer;
    if (regStep === 'otp' && otpCountdown > 0) {
      timer = setInterval(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, otpCountdown]);

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

  // Full form validation prior to submission
  const validateForm = () => {
    const newErrors = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      newErrors.name = 'Please enter your full name.';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please create a password.';
    } else if (!hasMinLength) {
      newErrors.password = 'Password must be at least 8 characters long.';
    } else if (!hasUppercase || !hasLowercase || !hasNumber) {
      newErrors.password = 'Include uppercase, lowercase, and a number.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

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
      // 1. Check duplicate email first across database
      const check = await authService.checkEmailExists(email.trim());
      if (check.exists) {
        setIsDuplicateEmail(true);
        setIsSubmitting(false);
        return;
      }

      // 2. Dispatch Brevo Email OTP
      const res = await authService.sendRegisterOtp({
        name: name.trim(),
        email: email.trim(),
        password
      });

      if (!res.success && res.isDuplicate) {
        setIsDuplicateEmail(true);
        return;
      }

      setRegStep('otp');
      setOtpCountdown(60);
      addToast({
        title: 'Verification Code Dispatched',
        message: 'A 6-digit OTP code has been sent to your email address via Brevo.',
        variant: 'info'
      });
      setTimeout(() => otpInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      let errorMsg = "We couldn't dispatch your verification code right now. Please try again.";
      const status = err.response?.status;
      const respMsg = err.response?.data?.message || err.message || '';

      if (
        status === 409 ||
        respMsg.toLowerCase().includes('already exists') ||
        respMsg.toLowerCase().includes('already registered')
      ) {
        setIsDuplicateEmail(true);
        return;
      } else if (respMsg) {
        errorMsg = respMsg;
      }
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setServerError('');
    setIsSendingOtp(true);
    try {
      await authService.sendOtp(email.trim());
      setOtpCountdown(60);
      addToast({
        title: 'Code Resent via Brevo',
        message: 'A new 6-digit verification code has been dispatched to your email.',
        variant: 'info'
      });
    } catch (err) {
      setServerError('Failed to resend verification code. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

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

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setServerError('Please enter the full 6-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      const response = await authService.completeRegisterWithOtp(email.trim(), code);
      if (response && response.token && response.user) {
        register(response.user, response.token);
        addToast({
          title: 'Account Created & Verified!',
          message: `Welcome to LOOOP, ${response.user.name || 'Member'}! Your account details have been securely saved to the database.`,
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
        throw new Error('Verification completed but account creation failed.');
      }
    } catch (err) {
      setServerError(err.message || 'Invalid or expired verification code. Please check and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        register(result.user, result.token);
        addToast({
          title: 'Welcome to LOOOP!',
          message: `Signed in successfully with Google as ${googleUser.displayName || googleUser.email}.`,
          variant: 'success'
        });

        if (redirectUrl) {
          navigate(redirectUrl);
        } else if (result.user.role === 'admin' || result.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error('Google sign-up error:', err);
      setServerError(err.message || 'Google verification failed. Please try again.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSocialAuth = (providerName) => {
    if (providerName === 'Google') {
      handleGoogleSignIn();
      return;
    }
    addToast({
      title: `${providerName} Verification`,
      message: `${providerName} OAuth integration initialized. Recommended: Use Google for 1-click verification.`,
      variant: 'info'
    });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#064e3b',
        backgroundImage: 'radial-gradient(circle at 50% 10%, #065f46 0%, #022c22 60%, #011c16 100%)',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflowX: 'hidden'
      }}
    >
      {/* Navigation Top Header */}
      <header
        style={{
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box'
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
            padding: '7px 14px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(52, 211, 153, 0.25)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Container - 100% Mobile Responsive (Zero Cutoff) */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 1rem 2.5rem 1rem',
          width: '100%',
          boxSizing: 'border-box'
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '440px',
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            color: '#0f172a',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Card Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: '#0f172a',
                marginBottom: '6px',
                letterSpacing: '-0.025em'
              }}
            >
              Create your LOOOP account
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              Join the community and give unused things a second life.
            </p>
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
                gap: '8px',
                marginBottom: '1.25rem',
                boxSizing: 'border-box'
              }}
              role="alert"
            >
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, wordBreak: 'break-word' }}>{serverError}</span>
            </div>
          )}

          {regStep === 'otp' ? (
            /* Step 2: Brevo Email OTP Verification */
            <div>
              <button
                type="button"
                onClick={() => setRegStep('form')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  padding: 0
                }}
              >
                <ArrowLeft size={16} /> Back to account details
              </button>

              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#ecfdf5',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1rem auto',
                  border: '1px solid #a7f3d0'
                }}>
                  <ShieldCheck size={30} />
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a' }}>
                  Verify Your Email Address
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px', lineHeight: 1.5 }}>
                  We have dispatched a 6-digit verification code via <strong>Brevo Email</strong> to:
                </p>
                <div style={{
                  display: 'inline-block',
                  marginTop: '8px',
                  padding: '4px 14px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '20px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  wordBreak: 'break-all'
                }}>
                  {email}
                </div>
              </div>

              <form onSubmit={handleVerifyOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
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
                        backgroundColor: '#ffffff',
                        color: '#047857',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSubmitting}
                  disabled={isSubmitting || otpDigits.join('').length < 6}
                  style={{ width: '100%', borderRadius: '12px' }}
                  iconRight={ArrowRight}
                >
                  {isSubmitting ? 'Verifying Code...' : 'Complete Account Registration'}
                </Button>
              </form>

              <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
                <span>Didn't receive the email code? </span>
                {otpCountdown > 0 ? (
                  <span style={{ fontWeight: 600, color: '#047857' }}>Resend in {otpCountdown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
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
                    {isSendingOtp ? 'Sending...' : 'Resend Code via Brevo'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Step 1: Account Info Registration Form */
            <div>
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', boxSizing: 'border-box' }}>
                {/* Full Name Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                  <label
                    htmlFor="register-name"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: errors.name ? '#ef4444' : '#334155'
                    }}
                  >
                    Full Name
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        color: errors.name ? '#ef4444' : '#94a3b8',
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
                        if (errors.name) setErrors({ ...errors, name: '' });
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px 10px 38px',
                        fontSize: '0.9rem',
                        borderRadius: '12px',
                        border: errors.name ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.name && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                      {errors.name}
                    </span>
                  )}
                </div>

                {/* Email Address Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                  <label
                    htmlFor="register-email"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: errors.email ? '#ef4444' : '#334155'
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
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
                      id="register-email"
                      type="email"
                      autoComplete="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: '' });
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 12px 10px 38px',
                        fontSize: '0.9rem',
                        borderRadius: '12px',
                        border: errors.email ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        outline: 'none'
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

                {/* Password Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                  <label
                    htmlFor="register-password"
                    style={{
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: errors.password ? '#ef4444' : '#334155'
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
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
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 40px 10px 38px',
                        fontSize: '0.9rem',
                        borderRadius: '12px',
                        border: errors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
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

                  {/* Password Strength Bar */}
                  {password && (
                    <div style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: '#64748b' }}>Strength:</span>
                        <span style={{ color: passwordStrength.color, fontWeight: 700 }}>{passwordStrength.label}</span>
                      </div>
                      <div style={{ height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: passwordStrength.width,
                            backgroundColor: passwordStrength.color,
                            transition: 'all 0.3s ease'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {errors.password && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                      {errors.password}
                    </span>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label
                      htmlFor="register-confirm-password"
                      style={{
                        fontSize: '0.825rem',
                        fontWeight: 600,
                        color: errors.confirmPassword ? '#ef4444' : '#334155'
                      }}
                    >
                      Confirm Password
                    </label>
                    {confirmPassword && password === confirmPassword && (
                      <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={12} />
                        <span>Match</span>
                      </span>
                    )}
                  </div>

                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
                    <span
                      style={{
                        position: 'absolute',
                        left: '12px',
                        color: errors.confirmPassword ? '#ef4444' : '#94a3b8',
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
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                      }}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 42px 10px 38px',
                        fontSize: '0.9rem',
                        borderRadius: '12px',
                        border: errors.confirmPassword ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        outline: 'none'
                      }}
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500 }}>
                      {errors.confirmPassword}
                    </span>
                  )}
                </div>

                {/* Terms and Conditions Agreement */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px', width: '100%', boxSizing: 'border-box' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id="register-terms"
                      checked={agreeTerms}
                      onChange={(e) => {
                        setAgreeTerms(e.target.checked);
                        if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
                      }}
                      style={{
                        marginTop: '3px',
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        accentColor: '#047857'
                      }}
                      disabled={isSubmitting}
                    />
                    <label htmlFor="register-terms" style={{ fontSize: '0.78rem', color: '#475569', lineHeight: 1.4, cursor: 'pointer' }}>
                      I agree to the Terms of Service & Privacy Policy, and pledge to keep community sharing courteous.
                    </label>
                  </div>
                  {errors.agreeTerms && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 500, paddingLeft: '24px' }}>
                      {errors.agreeTerms}
                    </span>
                  )}
                </div>

                {/* Create Account Submit Button */}
                <div style={{ marginTop: '0.4rem', width: '100%', boxSizing: 'border-box' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    style={{ width: '100%', borderRadius: '12px' }}
                    iconRight={!isSubmitting ? Send : undefined}
                  >
                    {isSubmitting ? 'Creating account...' : 'Create Account & Send Verification Code'}
                  </Button>
                </div>
              </form>

              {/* BOTTOM SOCIAL CONNECT OPTIONS (Google, Facebook, GitHub) */}
              <div style={{ marginTop: '1.5rem', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Or connect with
                  </span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('Google')}
                    disabled={isGoogleLoading}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('Facebook')}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#1877F2',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <svg width="18" height="18" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </button>

                  {/* GitHub */}
                  <button
                    type="button"
                    onClick={() => handleSocialAuth('GitHub')}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1.5px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#24292f',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    <svg width="18" height="18" fill="#24292f" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </div>

              {/* Already have an account? Log in */}
              <div
                style={{
                  marginTop: '1.25rem',
                  textAlign: 'center',
                  fontSize: '0.875rem',
                  color: '#64748b'
                }}
              >
                <span>Already have an account? </span>
                <Link
                  to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'}
                  style={{
                    color: '#047857',
                    fontWeight: 700,
                    textDecoration: 'none'
                  }}
                >
                  Log in
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Email Already Owned Modal Pop-up */}
      {isDuplicateEmail && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.25rem',
          boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '420px',
            width: '100%',
            padding: '2rem 1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '1px solid #fecaca'
            }}>
              <Mail size={30} />
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
              Email Already Owned
            </h3>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.55, marginBottom: '1.5rem' }}>
              The email address <strong style={{ color: '#0f172a', fontWeight: 700 }}>{email}</strong> is already registered to an account in our database. Please log in with your credentials or try registering with a different email.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%', borderRadius: '12px' }}
                onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
                iconRight={ArrowRight}
              >
                Sign In to Your Account
              </Button>

              <button
                type="button"
                onClick={() => {
                  setIsDuplicateEmail(false);
                  setServerError('');
                }}
                style={{
                  padding: '0.75rem',
                  borderRadius: '12px',
                  border: '1.5px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Try a Different Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
