import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Save,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  AlertTriangle,
  Lock,
  Globe,
  FileText,
  Repeat,
  Award,
  Bell,
  Shield,
  Layers,
  Power
} from 'lucide-react';
import adminService from '../../services/adminService';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import AdminImpactFactorsSection from '../../components/admin/AdminImpactFactorsSection';
import AdminUploadRulesSettings from '../../components/admin/AdminUploadRulesSettings';
import AdminLocationRulesSettings from '../../components/admin/AdminLocationRulesSettings';


export const AdminSettingsPage = () => {
  const [categoriesMap, setCategoriesMap] = useState({});
  const [settingsMap, setSettingsMap] = useState({});
  const [initialSettingsMap, setInitialSettingsMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [dirty, setDirty] = useState(false);

  // Critical Setting Confirmation Dialog State
  const [pendingCriticalKey, setPendingCriticalKey] = useState(null);
  const [pendingCriticalVal, setPendingCriticalVal] = useState(null);

  const fetchSettingsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setNotification(null);
      const res = await adminService.getSettings();
      if (res?.success && res.data) {
        setCategoriesMap(res.data.categoriesMap || {});
        setSettingsMap(res.data.settingsMap || {});
        setInitialSettingsMap(res.data.settingsMap || {});
        setDirty(false);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
      setNotification({ type: 'error', message: 'Failed to retrieve settings from PostgreSQL database.' });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettingsData();
  }, [fetchSettingsData]);

  // Handle Input Change for a setting key
  const handleSettingChange = (key, value) => {
    // Check if modifying a critical setting like maintenance_mode or require_item_moderation
    if (key === 'maintenance_mode' && value === true) {
      setPendingCriticalKey(key);
      setPendingCriticalVal(true);
      return;
    }

    const updated = { ...settingsMap, [key]: value };
    setSettingsMap(updated);
    setDirty(JSON.stringify(updated) !== JSON.stringify(initialSettingsMap));
  };

  // Confirm Critical Setting Toggle
  const handleConfirmCriticalSetting = () => {
    if (!pendingCriticalKey) return;
    const updated = { ...settingsMap, [pendingCriticalKey]: pendingCriticalVal };
    setSettingsMap(updated);
    setDirty(JSON.stringify(updated) !== JSON.stringify(initialSettingsMap));
    setPendingCriticalKey(null);
    setPendingCriticalVal(null);
  };

  // Save Bulk Changes to Database
  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      setNotification(null);
      const res = await adminService.updateSettings(settingsMap);
      if (res?.success) {
        setNotification({
          type: 'success',
          message: 'All platform configuration settings saved cleanly to PostgreSQL.'
        });
        setInitialSettingsMap({ ...settingsMap });
        setDirty(false);
        fetchSettingsData();
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save settings.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset a specific setting to system default seed value
  const handleResetSetting = async (key) => {
    try {
      setIsSaving(true);
      const res = await adminService.resetSetting(key);
      if (res?.success && res.data) {
        setNotification({
          type: 'success',
          message: `Setting '${key}' reset to default value (${JSON.stringify(res.data.value)}).`
        });
        fetchSettingsData();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to reset setting.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Category Render Helper
  const renderCategorySection = (categoryTitle, categoryKey, iconComponent) => {
    const items = categoriesMap[categoryKey] || [];
    if (items.length === 0) return null;

    return (
      <div
        key={categoryKey}
        style={{
          backgroundColor: '#1e293b',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid #334155',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {iconComponent}
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {categoryTitle}
            </h2>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Configurable {categoryKey.toLowerCase()} parameters
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {items.map((s) => {
            const val = settingsMap[s.key] !== undefined ? settingsMap[s.key] : s.value;
            const isBool = typeof s.value === 'boolean';
            const isNum = typeof s.value === 'number';

            return (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: '#0f172a',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', display: 'block' }}>
                      {s.label || s.key}
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {s.description}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isBool ? (
                      <button
                        type="button"
                        onClick={() => handleSettingChange(s.key, !val)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: '1px solid ' + (val ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'),
                          backgroundColor: val ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: val ? '#34d399' : '#f87171',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Power size={14} />
                        <span>{val ? 'ENABLED' : 'DISABLED'}</span>
                      </button>
                    ) : isNum ? (
                      <input
                        type="number"
                        value={val}
                        onChange={(e) => handleSettingChange(s.key, Number(e.target.value))}
                        style={{
                          width: '120px',
                          padding: '6px 10px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: 'var(--radius-xs)',
                          color: '#f8fafc',
                          fontSize: '0.875rem',
                          fontWeight: 600
                        }}
                      />
                    ) : (
                      <input
                        type="text"
                        value={val}
                        onChange={(e) => handleSettingChange(s.key, e.target.value)}
                        style={{
                          width: '280px',
                          padding: '6px 10px',
                          backgroundColor: '#1e293b',
                          border: '1px solid #334155',
                          borderRadius: 'var(--radius-xs)',
                          color: '#f8fafc',
                          fontSize: '0.875rem'
                        }}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => handleResetSetting(s.key)}
                      title="Reset to default seed value"
                      style={{
                        padding: '6px',
                        backgroundColor: '#1e293b',
                        border: '1px solid #334155',
                        borderRadius: 'var(--radius-xs)',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '960px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Platform Settings & Governance
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Configure platform parameters, points rewards, transaction durations, and system operating modes safely in PostgreSQL.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={fetchSettingsData}
            disabled={isSaving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-sm)',
              color: '#f8fafc',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || !dirty}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 20px',
              backgroundColor: dirty ? 'var(--color-primary-600)' : '#334155',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: '#ffffff',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: dirty && !isSaving ? 'pointer' : 'not-allowed',
              opacity: dirty ? 1 : 0.6
            }}
          >
            {isSaving ? <Spinner size="sm" /> : <Save size={16} />}
            <span>{dirty ? 'Save Platform Settings' : 'Settings Saved'}</span>
          </button>
        </div>
      </div>

      {/* Global Notification Banner */}
      {notification && (
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: `1px solid ${notification.type === 'error' ? 'var(--color-danger)' : '#10b981'}`,
            borderRadius: 'var(--radius-sm)',
            color: notification.type === 'error' ? '#f87171' : '#34d399',
            fontSize: '0.875rem'
          }}
        >
          {notification.message}
        </div>
      )}

      {/* Dirty Unsaved Indicator */}
      {dirty && (
        <div
          style={{
            padding: '10px 14px',
            backgroundColor: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 'var(--radius-xs)',
            color: '#fbbf24',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <AlertTriangle size={16} />
          <span>You have unsaved setting changes. Click "Save Platform Settings" to persist changes to PostgreSQL.</span>
        </div>
      )}

      {isLoading ? (
        <div style={{ minHeight: '35vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: General & Platform Info */}
          {renderCategorySection('General Platform Info', 'GENERAL', <Globe size={18} />)}

          {/* Section 2: Request Rules */}
          {renderCategorySection('Requests Governance', 'REQUESTS', <FileText size={18} />)}

          {/* Section 3: Transactions & Handovers */}
          {renderCategorySection('Transactions & Handovers', 'TRANSACTIONS', <Repeat size={18} />)}

          {/* Section 4: Points Rewards */}
          {renderCategorySection('Points Engine Configuration', 'POINTS', <Award size={18} />)}

          {/* Section 5: Notifications & Alerts */}
          {renderCategorySection('Notifications & Alerts', 'NOTIFICATIONS', <Bell size={18} />)}

          {/* Section 6: Content Moderation */}
          {renderCategorySection('Content Moderation', 'MODERATION', <Shield size={18} />)}

          {/* Section 7: Feature Toggles */}
          {renderCategorySection('Feature Toggles', 'FEATURES', <Layers size={18} />)}

          {/* Section 8: Maintenance Mode */}
          {renderCategorySection('Maintenance Mode', 'MAINTENANCE', <Power size={18} />)}
        </div>
      )}

      {/* Product Upload Rules Governance */}
      <AdminUploadRulesSettings />

      {/* Location Governance & GPS Rules */}
      <AdminLocationRulesSettings />

      {/* Environmental Impact Factors Governance */}
      <AdminImpactFactorsSection />

      {/* Critical Setting Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(pendingCriticalKey)}
        title="Enable Platform Maintenance Mode?"
        message="Enabling Maintenance Mode will display a maintenance notice banner and suspend non-admin user activity on LOOOP. Are you sure you want to activate this mode?"
        confirmLabel="Enable Maintenance Mode"
        confirmVariant="warning"
        isLoading={false}
        onConfirm={handleConfirmCriticalSetting}
        onCancel={() => {
          setPendingCriticalKey(null);
          setPendingCriticalVal(null);
        }}
      />
    </div>
  );
};

export default AdminSettingsPage;
