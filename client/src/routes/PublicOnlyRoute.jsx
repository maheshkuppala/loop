import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LooopRouteLoader from '../components/common/LooopRouteLoader';

export const PublicOnlyRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const redirectUrl = searchParams.get('redirect');

  if (isLoading) {
    return <LooopRouteLoader message="Checking authentication..." />;
  }

  if (isAuthenticated && user) {
    const userRole = (user.role || '').toUpperCase();
    let destUrl = redirectUrl;

    if (!destUrl) {
      try {
        destUrl = sessionStorage.getItem('looop_auth_redirect');
      } catch (e) {}
    }

    if (destUrl && destUrl !== '/login' && destUrl !== '/register') {
      return <Navigate to={destUrl} replace />;
    }

    if (userRole === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
