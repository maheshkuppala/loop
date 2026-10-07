import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  AlertTriangle,
  FolderTree,
  Repeat,
  BarChart3,
  Settings,
  Shield,
  FileText,
  LogOut,
  ArrowLeft,
  Activity,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/common/Avatar';
import adminService from '../services/adminService';

export const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [badgeCounts, setBadgeCounts] = useState({ openReports: 0, pendingRequests: 0 });

  // Fetch real counts for sidebar badges
  useEffect(() => {
    let mounted = true;
    const fetchBadges = async () => {
      try {
        const res = await adminService.getDashboard('30d');
        if (mounted && res?.success && res.data?.metrics) {
          setBadgeCounts({
            openReports: res.data.metrics.openReports || 0,
            pendingRequests: res.data.metrics.pendingRequests || 0
          });
        }
      } catch (err) {
        // non-blocking
      }
    };
    fetchBadges();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', path: '/admin/users', icon: Users },
    { label: 'Items & Wanted', path: '/admin/items', icon: Package },
    { label: 'Requests', path: '/admin/requests', icon: FileText, count: badgeCounts.pendingRequests > 0 ? badgeCounts.pendingRequests : undefined },
    { label: 'Transactions', path: '/admin/transactions', icon: Repeat },
    { label: 'Reports', path: '/admin/reports', icon: AlertTriangle, count: badgeCounts.openReports > 0 ? badgeCounts.openReports : undefined, alert: true },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield }
  ];

  const isActive = (path) => location.pathname === path || (path !== '/admin/dashboard' && location.pathname.startsWith(path));

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  // Determine current page title
  const currentNav = navItems.find((n) => isActive(n.path)) || { label: 'Administration' };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc' }}>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 95
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: '260px',
          backgroundColor: '#090d16',
          borderRight: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transform: sidebarOpen ? 'translateX(0)' : undefined,
          transition: 'transform var(--transition-normal)'
        }}
        className="admin-sidebar"
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-500)',
                boxShadow: '0 0 12px var(--color-primary-500)'
              }}
            />
            <span style={{ fontFamily: 'var(--font-brand)', fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
              Looop
            </span>
            <span
              style={{
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                fontSize: '0.65rem',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: 'var(--radius-xs)',
                textTransform: 'uppercase',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              ADMIN
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="sidebar-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            padding: '16px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            flex: 1,
            overflowY: 'auto'
          }}
        >
          <div
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              paddingLeft: '12px',
              marginBottom: '6px'
            }}
          >
            Platform Management
          </div>

          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: active ? '#1e293b' : 'transparent',
                  color: active ? '#ffffff' : '#94a3b8',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: active ? 600 : 500,
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={17} color={active ? 'var(--color-primary-400)' : '#64748b'} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      backgroundColor: item.alert ? 'var(--color-danger)' : '#334155',
                      color: '#ffffff',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Portal Switcher & Footer */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Link
            to="/customer/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              textDecoration: 'none',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#1e293b',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={14} />
            <span>Switch to Customer Portal</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.8rem',
              color: '#f87171',
              backgroundColor: 'transparent',
              border: 'none',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              textAlign: 'left'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, marginLeft: '260px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="admin-main-wrapper">
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: '#0f172a',
            borderBottom: '1px solid #1e293b',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 90
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="admin-menu-toggle"
              style={{ display: 'none', background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer' }}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: '#64748b' }}>
              <span>Admin</span>
              <ChevronRight size={14} />
              <span style={{ color: '#f8fafc', fontWeight: 600 }}>{currentNav.label}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {/* System Health */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#94a3b8' }}>
              <Activity size={14} color="var(--color-primary-400)" />
              <span className="health-label">System:</span>
              <span style={{ color: '#34d399', fontWeight: 600 }}>Operational</span>
            </div>

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Avatar
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'}
                name={user?.name || 'Administrator'}
                size="sm"
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                  {user?.name || 'Administrator'}
                </span>
                <span style={{ fontSize: '0.675rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  {user?.role || 'ADMIN'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ padding: '28px 24px', flex: 1, backgroundColor: '#0f172a' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .admin-sidebar { transform: translateX(-100%); }
          .admin-main-wrapper { margin-left: 0 !important; }
          .admin-menu-toggle { display: block !important; }
          .sidebar-close-btn { display: block !important; }
          .health-label { display: none; }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
