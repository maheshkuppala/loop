import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import OfflineBanner from './components/common/OfflineBanner';
import AppRoutes from './routes/AppRoutes';
import LooopAppLoader from './components/common/LooopAppLoader';

export const App = ({ onReady }) => {
  useEffect(() => {
    // Signal that React app has mounted, remove pre-React loader
    if (onReady) onReady();
  }, [onReady]);

  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <BrowserRouter>
            <OfflineBanner />
            <NotificationProvider>
              <LooopAppLoader>
                <AppRoutes />
              </LooopAppLoader>
            </NotificationProvider>
          </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
