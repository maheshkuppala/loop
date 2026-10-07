import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Scaffolded for token hydration in the upcoming authentication phase
    try {
      const storedToken = localStorage.getItem('looop_token');
      const storedUser = localStorage.getItem('looop_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (err) {
      console.error('Failed to parse stored auth session:', err);
    } finally {
      setIsLoading(false);
    }

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('looop:session_expired', handleSessionExpired);
    return () => window.removeEventListener('looop:session_expired', handleSessionExpired);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('looop_token', authToken);
    localStorage.setItem('looop_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('looop_token');
    localStorage.removeItem('looop_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token,
    isLoading,
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
