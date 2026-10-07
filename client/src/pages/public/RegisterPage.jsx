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
  Sparkles,
  AlertCircle,
  Laptop,
  BookOpen,
  Wrench,
  Headphones,
  Check,
  Circle,
  Key,
  Repeat,
  ShieldAlert,
  Send
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
  const [simulatedCodeHint, setSimulatedCodeHint] = useState('');
  const otpInputRefs = useRef([]);

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

      if (res.demoCode) {
        setSimulatedCodeHint(res.demoCode);
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
      const res = await authService.sendOtp(email.trim());
      setOtpCountdown(60);
      if (res.demoCode) {
        setSimulatedCodeHint(res.demoCode);
      }
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
      setServerError(err.message || 'Google sign-up failed. Please use email registration below.');
    } finally {
      setIsGoogleLoading(false);
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

            {regStep === 'otp' ? (
              /* Step 2: Brevo Email OTP Verification */
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <button
                  type="button"
                  onClick={() => setRegStep('form')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary-700)',
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
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ecfdf5',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto',
                    border: '1px solid #a7f3d0'
                  }}>
                    <ShieldCheck size={32} />
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-slate-900)' }}>
                    Verify Your Email Address
                  </h2>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-slate-600)', marginTop: '6px', lineHeight: 1.5 }}>
                    We have dispatched a 6-digit verification code via <strong>Brevo Email</strong> to:
                  </p>
                  <div style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '4px 14px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    border: '1px solid #cbd5e1'
                  }}>
                    {email}
                  </div>
                </div>

                {serverError && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    fontSize: '0.85rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span>{serverError}</span>
                  </div>
                )}

                <form onSubmit={handleVerifyOtpSubmit}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '1.5rem' }}>
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
                          width: '44px',
                          height: '52px',
                          textAlign: 'center',
                          fontSize: '1.35rem',
                          fontWeight: 800,
                          borderRadius: '10px',
                          border: '2px solid #cbd5e1',
                          backgroundColor: '#ffffff',
                          color: '#0f172a',
                          outline: 'none',
                          transition: 'all 0.2s'
                        }}
                        className="auth-input"
                      />
                    ))}
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting || otpDigits.join('').length < 6}
                    style={{ width: '100%' }}
                    iconRight={ArrowRight}
                  >
                    {isSubmitting ? 'Verifying & Saving Account...' : 'Complete Account Registration'}
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
                      {isSendingOtp ? 'Sending...' : 'Resend Code via Brevo Email'}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Step 1: Account Info Registration Form */
              <div>
                {/* Google Verification (Primary Mandatory Verification) */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    padding: '2px',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #4285F4, #34A853, #FBBC05, #EA4335)',
                    boxShadow: '0 4px 14px rgba(66, 133, 244, 0.25)'
                  }}>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      style={{
                        width: '100%',
                        padding: '14px 20px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: '#ffffff',
                        color: '#0f172a',
                        fontSize: '0.98rem',
                        fontWeight: 800,
                        cursor: isGoogleLoading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Official Google G Logo */}
                      <svg width="22" height="22" viewBox="0 0 24 24">
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
                    ✓ Recommended: Instant 1-Click Google Verification
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      margin: '1.25rem 0 0.5rem 0'
                    }}
                  >
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      Or register with email
                    </span>
                    <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                  </div>
                </div>

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
                  iconRight={!isSubmitting ? Send : undefined}
                >
                  {isSubmitting ? 'Verifying email & sending code...' : 'Send Verification Code via Brevo'}
                </Button>
              </div>
            </form>
          </div>
        )}

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
          padding: '1.5rem',
          animation: 'fadeIn 0.25s ease-out'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            maxWidth: '460px',
            width: '100%',
            padding: '2.25rem 2rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            animation: 'scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto',
              border: '1px solid #fecaca'
            }}>
              <Mail size={32} />
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
              Email Already Owned
            </h3>

            <p style={{ fontSize: '0.925rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              The email address <strong style={{ color: '#0f172a', fontWeight: 700 }}>{email}</strong> is already registered to an existing account in our database. Please log in with your credentials or try registering with a different email.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                variant="primary"
                size="lg"
                style={{ width: '100%' }}
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
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Try a Different Email
              </button>
            </div>
          </div>
        </div>
      )}

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
