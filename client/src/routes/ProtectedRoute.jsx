import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LooopRouteLoader from '../components/common/LooopRouteLoader';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('looop_token') : null;
  const storedUserRaw = typeof window !== 'undefined' ? localStorage.getItem('looop_user') : null;
  
  let effectiveUser = user;
  if (!effectiveUser && storedUserRaw) {
    try {
      effectiveUser = JSON.parse(storedUserRaw);
    } catch (e) {
      effectiveUser = null;
    }
  }

  const isAuth = isAuthenticated || !!storedToken;

  if (isLoading) {
    return <LooopRouteLoader message="Verifying your session..." />;
  }

  if (!isAuth || !effectiveUser) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }

  const userRole = (effectiveUser.role || '').toUpperCase();
  const reqRole = requiredRole ? requiredRole.toUpperCase() : null;

  if (reqRole && userRole !== reqRole && userRole !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
