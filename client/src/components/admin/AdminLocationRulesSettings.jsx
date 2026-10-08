import React, { useState, useEffect } from 'react';
import { MapPin, Save, ShieldAlert, Check, RefreshCw, Compass } from 'lucide-react';
import adminService from '../../services/adminService';
import Spinner from '../common/Spinner';

const AdminLocationRulesSettings = () => {
  const [rules, setRules] = useState({
    enableLocationBrowsing: true,
    requireLocation: true,
    useGPS: true,
    manualLocationAllowed: true,
    defaultSearchRadiusKm: 10,
    maxSearchRadiusKm: 50,
    minAcceptableAccuracyMeters: 1000
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await adminService.getLocationRules();
      if (res?.success && (res.rules || res.data)) {
        setRules(res.rules || res.data);
      }
    } catch (err) {
      console.error('Failed to load location rules:', err);
      setStatusMsg({ type: 'error', text: 'Failed to load location governance rules from server.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setStatusMsg(null);
      const res = await adminService.updateLocationRules(rules);
      if (res?.success) {
        setStatusMsg({ type: 'success', text: 'Location governance rules saved to database.' });
        if (res.rules || res.data) {
          setRules(res.rules || res.data);
        }
      }
    } catch (err) {
      console.error('Error updating location rules:', err);
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update location rules.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Compass size={22} color="#10b981" />
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Location Governance & GPS Rules
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>
              Control GPS accuracy tolerances, default discovery radii, and location enforcement policies
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={fetchRules}
          style={{ background: 'none', border: '1px solid #334155', color: '#cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {statusMsg && (
        <div style={{
          padding: '10px 14px',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontSize: '0.85rem',
          backgroundColor: statusMsg.type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
          color: statusMsg.type === 'error' ? '#f87171' : '#34d399',
          border: `1px solid ${statusMsg.type === 'error' ? '#ef4444' : '#10b981'}`
        }}>
          {statusMsg.text}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Radius Parameters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
              Default Discovery Radius (KM)
            </label>
            <input
              type="number"
              min="1"
              max="500"
              value={rules.defaultSearchRadiusKm}
              onChange={(e) => setRules({ ...rules, defaultSearchRadiusKm: parseInt(e.target.value, 10) || 10 })}
              style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
              Maximum Allowed Radius (KM)
            </label>
            <input
              type="number"
              min="5"
              max="1000"
              value={rules.maxSearchRadiusKm}
              onChange={(e) => setRules({ ...rules, maxSearchRadiusKm: parseInt(e.target.value, 10) || 50 })}
              style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
              GPS Accuracy Threshold (Meters)
            </label>
            <input
              type="number"
              min="50"
              max="10000"
              step="50"
              value={rules.minAcceptableAccuracyMeters}
              onChange={(e) => setRules({ ...rules, minAcceptableAccuracyMeters: parseInt(e.target.value, 10) || 1000 })}
              style={{ width: '100%', padding: '8px 12px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '6px', color: '#fff', fontSize: '0.875rem' }}
            />
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              GPS fixes beyond this uncertainty radius trigger a location verification advisory.
            </span>
          </div>
        </div>

        {/* Policy Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.enableLocationBrowsing}
              onChange={(e) => setRules({ ...rules, enableLocationBrowsing: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Enable Nearby Location Browsing</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Filter products by distance to customer</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.useGPS}
              onChange={(e) => setRules({ ...rules, useGPS: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Allow Device GPS Detection</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Use HTML5 Geolocation API with High Accuracy</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.manualLocationAllowed}
              onChange={(e) => setRules({ ...rules, manualLocationAllowed: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Allow Manual Location Selection</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Let customers manually choose city or pincode</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#0f172a', padding: '12px', borderRadius: '6px', border: '1px solid #334155', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rules.requireLocation}
              onChange={(e) => setRules({ ...rules, requireLocation: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#10b981' }}
            />
            <div>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff' }}>Require Location Confirmation</span>
              <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Require verified location before proximity discovery</span>
            </div>
          </label>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '10px 24px',
              backgroundColor: '#10b981',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {saving ? <Spinner size="sm" /> : <Save size={16} />}
            <span>Save Location Rules</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminLocationRulesSettings;
