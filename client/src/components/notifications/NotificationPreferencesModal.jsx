import React, { useState, useEffect } from 'react';
import {
  Bell,
  Check,
  ShieldCheck,
  Moon,
  Globe,
  Inbox,
  Repeat,
  MessageSquare,
  Sparkles,
  Package,
  ShieldAlert,
  Leaf,
  X,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import Button from '../common/Button';

export const NotificationPreferencesModal = ({ isOpen, onClose }) => {
  const { preferences, updatePreferences } = useNotification();

  const [saving, setSaving] = useState(false);
  const [browserPermission, setBrowserPermission] = useState('default');

  const [inApp, setInApp] = useState(true);
  const [browser, setBrowser] = useState(false);
  const [categories, setCategories] = useState({
    requests: true,
    transactions: true,
    messages: true,
    matching: true,
    items: true,
    safety: true,
    account: true,
    impact: true,
    system: true
  });
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    start: '22:00',
    end: '07:00',
    timezone: 'Asia/Kolkata'
  });

  // Check browser Notification support & permission
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, [isOpen]);

  // Sync state with preferences from context
  useEffect(() => {
    if (preferences) {
      setInApp(preferences.inApp !== false);
      setBrowser(!!preferences.browser);
      if (preferences.categories) {
        setCategories({
          requests: preferences.categories.requests !== false,
          transactions: preferences.categories.transactions !== false,
          messages: preferences.categories.messages !== false,
          matching: preferences.categories.matching !== false,
          items: preferences.categories.items !== false,
          safety: preferences.categories.safety !== false,
          account: true, // Always true
          impact: preferences.categories.impact !== false,
          system: preferences.categories.system !== false
        });
      }
      if (preferences.quietHours) {
        setQuietHours({
          enabled: !!preferences.quietHours.enabled,
          start: preferences.quietHours.start || '22:00',
          end: preferences.quietHours.end || '07:00',
          timezone: preferences.quietHours.timezone || 'Asia/Kolkata'
        });
      }
    }
  }, [preferences, isOpen]);

  if (!isOpen) return null;

  const handleCategoryToggle = (key) => {
    if (key === 'account') return; // Cannot toggle protected account alerts
    setCategories((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBrowserToggle = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Browser notifications are not supported on this device.');
      return;
    }

    if (Notification.permission === 'granted') {
      setBrowser(!browser);
      return;
    }

    if (Notification.permission === 'denied') {
      setBrowserPermission('denied');
      return;
    }

    // Explicit request upon user interaction
    try {
      const permission = await Notification.requestPermission();
      setBrowserPermission(permission);
      if (permission === 'granted') {
        setBrowser(true);
      } else {
        setBrowser(false);
      }
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePreferences({
        inApp,
        browser,
        categories: {
          ...categories,
          account: true // Enforced security
        },
        quietHours
      });
      onClose();
    } catch (err) {
      // Error handled in context toast
    } finally {
      setSaving(false);
    }
  };

  const categoryConfigs = [
    {
      key: 'requests',
      icon: Inbox,
      title: 'Requests & Offers',
      desc: 'Notifications when someone requests your item, or accepts/declines your request.'
    },
    {
      key: 'transactions',
      icon: Repeat,
      title: 'Transactions & Handovers',
      desc: 'Meeting scheduling, handover confirmations, returns, and completed sharing.'
    },
    {
      key: 'messages',
      icon: MessageSquare,
      title: 'Direct Messages',
      desc: 'Activity and messages from neighbors in active conversations.'
    },
    {
      key: 'matching',
      icon: Sparkles,
      title: 'Wanted Items & Matches',
      desc: 'Smart matches when an item you need is listed, or offers on your wanted items.'
    },
    {
      key: 'items',
      icon: Package,
      title: 'Item Updates',
      desc: 'Availability status updates and changes on items you follow.'
    },
    {
      key: 'safety',
      icon: ShieldAlert,
      title: 'Safety & Moderation',
      desc: 'Updates on reports you submitted or community guidelines alerts.'
    },
    {
      key: 'impact',
      icon: Leaf,
      title: 'Environmental Impact & Milestones',
      desc: 'Genuinely earned sustainability milestones and reuse achievements.'
    },
    {
      key: 'account',
      icon: ShieldCheck,
      title: 'Account & Security Alerts',
      desc: 'Crucial account activity. Mandatory for account security and integrity.',
      protected: true
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-preferences-title"
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15)',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--color-slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h2
                id="notification-preferences-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--color-slate-900)',
                  margin: 0
                }}
              >
                Notification Preferences
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
                Customize how and when you receive updates on LOOOP
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close preferences"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-slate-400)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Channel Controls: In-App & Browser */}
          <div>
            <h3
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-slate-400)',
                letterSpacing: '0.05em',
                margin: '0 0 10px 0'
              }}
            >
              Delivery Channels
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* In-App Notifications */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-100)'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                    In-App Notification Center
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                    Keep track of notifications in the top bar badge and center.
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={inApp}
                    onChange={(e) => setInApp(e.target.checked)}
                    aria-label="Enable in-app notifications"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {/* Browser Desktop Notifications */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-slate-100)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                      Desktop Browser Notifications
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                      Receive instant desktop alerts when offline or in other tabs.
                    </div>
                  </div>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={browser && browserPermission === 'granted'}
                      onChange={handleBrowserToggle}
                      disabled={browserPermission === 'denied'}
                      aria-label="Enable browser notifications"
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>

                {browserPermission === 'denied' && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      marginTop: '4px'
                    }}
                  >
                    <AlertCircle size={14} />
                    <span>
                      Desktop notifications are blocked by your browser settings. Please enable them in your browser URL lock icon.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Per-Category Preferences */}
          <div>
            <h3
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-slate-400)',
                letterSpacing: '0.05em',
                margin: '0 0 10px 0'
              }}
            >
              Categories
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {categoryConfigs.map((cat) => {
                const IconComponent = cat.icon;
                const isEnabled = cat.protected ? true : !!categories[cat.key];

                return (
                  <div
                    key={cat.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      backgroundColor: '#ffffff',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-slate-200)',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: cat.protected ? '#fef2f2' : '#f1f5f9',
                          color: cat.protected ? '#e11d48' : '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <IconComponent size={16} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                            {cat.title}
                          </span>
                          {cat.protected && (
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                backgroundColor: '#fee2e2',
                                color: '#b91c1c',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px'
                              }}
                            >
                              <Lock size={10} />
                              Essential
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '1px' }}>
                          {cat.desc}
                        </div>
                      </div>
                    </div>

                    <label className="toggle-switch" style={{ flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={isEnabled}
                        disabled={cat.protected}
                        onChange={() => handleCategoryToggle(cat.key)}
                        aria-label={`Toggle ${cat.title}`}
                      />
                      <span className={`toggle-slider ${cat.protected ? 'slider-disabled' : ''}`} />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiet Hours */}
          <div>
            <h3
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-slate-400)',
                letterSpacing: '0.05em',
                margin: '0 0 10px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Moon size={14} color="#6366f1" />
              <span>Quiet Hours</span>
            </h3>

            <div
              style={{
                padding: '14px',
                backgroundColor: '#f8fafc',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-100)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-800)' }}>
                    Mute sounds & toasts during quiet hours
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                    Non-urgent notifications will be delivered silently to your notification center.
                  </div>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={quietHours.enabled}
                    onChange={(e) => setQuietHours((prev) => ({ ...prev, enabled: e.target.checked }))}
                    aria-label="Enable quiet hours"
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              {quietHours.enabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid var(--color-slate-200)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                      Start:
                    </label>
                    <input
                      type="time"
                      value={quietHours.start}
                      onChange={(e) => setQuietHours((prev) => ({ ...prev, start: e.target.value }))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-slate-300)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-slate-700)' }}>
                      End:
                    </label>
                    <input
                      type="time"
                      value={quietHours.end}
                      onChange={(e) => setQuietHours((prev) => ({ ...prev, end: e.target.value }))}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-slate-300)',
                        fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                    <Globe size={13} />
                    <span>Timezone: {quietHours.timezone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--color-slate-100)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            backgroundColor: '#ffffff'
          }}
        >
          <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            iconLeft={Check}
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </div>

      <style>{`
        .toggle-switch {
          position: relative;
          display: inline-block;
          width: 44px;
          height: 24px;
        }
        .toggle-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .toggle-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #cbd5e1;
          transition: 0.2s;
          border-radius: 24px;
        }
        .toggle-slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.2s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .toggle-switch input:checked + .toggle-slider {
          background-color: #059669;
        }
        .toggle-switch input:checked + .toggle-slider:before {
          transform: translateX(20px);
        }
        .slider-disabled {
          cursor: not-allowed;
          background-color: #059669 !important;
          opacity: 0.75;
        }
      `}</style>
    </div>
  );
};

export default NotificationPreferencesModal;
