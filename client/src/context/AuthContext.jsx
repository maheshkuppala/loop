import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authStatus, setAuthStatus] = useState('AUTH_LOADING'); // 'AUTH_LOADING' | 'AUTHENTICATED' | 'UNAUTHENTICATED'

  useEffect(() => {
    let isMounted = true;

    const initializeAuthSession = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('looop_token') : null;
        const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('looop_user') : null;

        if (!storedToken) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            setAuthStatus('UNAUTHENTICATED');
          }
          return;
        }

        let parsedUser = null;
        if (storedUserRaw) {
          try {
            parsedUser = JSON.parse(storedUserRaw);
          } catch (e) {
            parsedUser = null;
          }
        }

        if (isMounted) {
          setToken(storedToken);
          setUser(parsedUser);
        }

        // Validate token with backend /api/auth/me
        try {
          const res = await authService.getCurrentUser();
          if (res && (res.user || res.id || res._id)) {
            const freshUser = res.user || res;
            if (isMounted) {
              setUser(freshUser);
              setToken(storedToken);
              setAuthStatus('AUTHENTICATED');
              localStorage.setItem('looop_user', JSON.stringify(freshUser));
            }
          } else if (parsedUser) {
            if (isMounted) {
              setAuthStatus('AUTHENTICATED');
            }
          } else {
            if (isMounted) {
              setAuthStatus('UNAUTHENTICATED');
            }
          }
        } catch (apiErr) {
          console.warn('[AuthContext] Session validation notice:', apiErr?.message);
          // If stored token exists or is a demo session, remain authenticated
          if (parsedUser || storedToken.startsWith('looop_demo') || storedToken.startsWith('mock_token')) {
            if (isMounted) setAuthStatus('AUTHENTICATED');
          } else {
            if (isMounted) {
              setUser(null);
              setToken(null);
              setAuthStatus('UNAUTHENTICATED');
            }
          }
        }
      } catch (err) {
        console.error('[AuthContext] Failed to parse auth session:', err);
        if (isMounted) setAuthStatus('UNAUTHENTICATED');
      }
    };

    initializeAuthSession();

    const handleSessionExpired = () => {
      const currentToken = localStorage.getItem('looop_token') || '';
      if (!currentToken.startsWith('looop_demo') && !currentToken.startsWith('mock_token')) {
        setUser(null);
        setToken(null);
        setAuthStatus('UNAUTHENTICATED');
      }
    };

    window.addEventListener('looop:session_expired', handleSessionExpired);
    return () => {
      isMounted = false;
      window.removeEventListener('looop:session_expired', handleSessionExpired);
    };
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    setAuthStatus('AUTHENTICATED');
    if (typeof window !== 'undefined') {
      localStorage.setItem('looop_token', authToken);
      localStorage.setItem('looop_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthStatus('UNAUTHENTICATED');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('looop_token');
      localStorage.removeItem('looop_user');
      try {
        sessionStorage.removeItem('looop_auth_redirect');
      } catch (e) {}
    }
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    authStatus,
    isAuthenticated: authStatus === 'AUTHENTICATED' || (!!token && authStatus !== 'UNAUTHENTICATED'),
    isLoading: authStatus === 'AUTH_LOADING',
    login,
    register: login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
