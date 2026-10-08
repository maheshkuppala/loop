import React, { useState, useEffect } from 'react';
import { Coins, Save, PlusCircle, ArrowUpRight, ArrowDownRight, ShieldCheck, History, Award } from 'lucide-react';
import adminService from '../../services/adminService';
import { useToast } from '../../hooks/useToast';
import AdminTable from '../../components/admin/AdminTable';
import AdminPagination from '../../components/admin/AdminPagination';
import Spinner from '../../components/common/Spinner';

export const AdminPointsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    reusePoints: 50,
    borrowPoints: 20,
    returnPoints: 30,
    pointsActive: true
  });

  const [ledger, setLedger] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [ledgerLoading, setLedgerLoading] = useState(false);

  // Manual Award Modal
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [awardForm, setAwardForm] = useState({ userEmail: '', points: 50, reason: 'Community contribution bonus' });
  const [awardLoading, setAwardLoading] = useState(false);

  useEffect(() => {
    fetchPointsSettings();
    fetchLedger();
  }, [page]);

  const fetchPointsSettings = async () => {
    try {
      setLoading(true);
      const res = await adminService.getPointsSettings();
      if (res?.success && res.data) {
        setSettings({
          reusePoints: res.data.reusePoints ?? 50,
          borrowPoints: res.data.borrowPoints ?? 20,
          returnPoints: res.data.returnPoints ?? 30,
          pointsActive: res.data.pointsActive ?? true
        });
      }
    } catch (err) {
      console.warn('Failed to load points settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      setLedgerLoading(true);
      const res = await adminService.getPointsLedger({ page, limit: 15 });
      if (res?.success) {
        setLedger(res.data.history || res.data.ledger || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.warn('Failed to fetch ledger:', err);
    } finally {
      setLedgerLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updatePointsSettings(settings);
      addToast({
        title: 'Points Configuration Updated',
        message: 'Reward rates and rules have been saved successfully.',
        variant: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Save Failed',
        message: err.message || 'Could not update points settings.',
        variant: 'danger'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleManualAward = async (e) => {
    e.preventDefault();
    if (!awardForm.userEmail || !awardForm.points) return;
    try {
      setAwardLoading(true);
      await adminService.awardUserPoints(awardForm);
      addToast({
        title: 'Points Credited',
        message: `${awardForm.points} points awarded to ${awardForm.userEmail}.`,
        variant: 'success'
      });
      setShowAwardModal(false);
      setAwardForm({ userEmail: '', points: 50, reason: 'Community contribution bonus' });
      fetchLedger();
    } catch (err) {
      addToast({
        title: 'Award Failed',
        message: err.message || 'Could not credit points to user.',
        variant: 'danger'
      });
    } finally {
      setAwardLoading(false);
    }
  };

  const columns = [
    {
      header: 'Customer / User',
      accessor: 'user',
      render: (r) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: 700, color: '#f8fafc' }}>{r.user?.name || r.userName || 'Customer'}</span>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.user?.email || r.userEmail || ''}</span>
        </div>
      )
    },
    {
      header: 'Points Delta',
      accessor: 'amount',
      render: (r) => {
        const isPositive = (r.amount || r.points || 0) >= 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 800, color: isPositive ? '#34d399' : '#f87171' }}>
            {isPositive ? <ArrowUpRight size={15} /> : <ArrowDownRight size={15} />}
            <span>{isPositive ? `+${r.amount || r.points}` : r.amount || r.points} pts</span>
          </div>
        );
      }
    },
    {
      header: 'Action / Reason',
      accessor: 'reason',
      render: (r) => (
        <span style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>{r.reason || r.description || r.type}</span>
      )
    },
    {
      header: 'Balance After',
      accessor: 'balanceAfter',
      render: (r) => (
        <span style={{ fontWeight: 700, color: '#e2e8f0' }}>{r.balanceAfter ?? '—'} pts</span>
      )
    },
    {
      header: 'Timestamp',
      accessor: 'createdAt',
      render: (r) => (
        <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
          {new Date(r.createdAt || Date.now()).toLocaleString()}
        </span>
      )
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <Coins size={24} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              Points & Rewards Engine
            </h1>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Configure automatic points crediting for reuse/borrow handovers and inspect live customer ledgers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAwardModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: '10px',
            backgroundColor: '#047857',
            color: '#ffffff',
            border: 'none',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(4, 120, 87, 0.3)'
          }}
        >
          <Award size={18} />
          <span>Manual Credit Points</span>
        </button>
      </div>

      {/* Settings Form Card */}
      <form onSubmit={handleSaveSettings} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} color="#38bdf8" />
          <span>Automated Points Allocation Rates</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Reuse Handover Points (Giveaway)
            </label>
            <input
              type="number"
              value={settings.reusePoints}
              onChange={(e) => setSettings({ ...settings, reusePoints: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', fontWeight: 800, fontSize: '1rem', outline: 'none' }}
            />
            <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Credited to customer upon giveaway confirmation</span>
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Borrow Initial Points
            </label>
            <input
              type="number"
              value={settings.borrowPoints}
              onChange={(e) => setSettings({ ...settings, borrowPoints: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', fontWeight: 800, fontSize: '1rem', outline: 'none' }}
            />
            <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Credited when item is successfully borrowed</span>
          </div>

          <div>
            <label style={{ fontSize: '0.825rem', fontWeight: 700, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
              Item Return Bonus Points
            </label>
            <input
              type="number"
              value={settings.returnPoints}
              onChange={(e) => setSettings({ ...settings, returnPoints: parseInt(e.target.value) || 0 })}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', backgroundColor: '#1e293b', border: '1px solid #334155', color: '#38bdf8', fontWeight: 800, fontSize: '1rem', outline: 'none' }}
            />
            <span style={{ fontSize: '0.725rem', color: '#64748b', marginTop: '4px', display: 'block' }}>Credited when borrowed item is safely returned</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #1e293b', paddingTop: '1.25rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600, color: '#cbd5e1' }}>
            <input
              type="checkbox"
              checked={settings.pointsActive}
              onChange={(e) => setSettings({ ...settings, pointsActive: e.target.checked })}
              style={{ width: '18px', height: '18px', accentColor: '#059669' }}
            />
            <span>Enable Marketplace Points System Automatically</span>
          </label>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Global Points Ledger History Table */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <History size={20} color="#38bdf8" />
          <span>Global Points Ledger & Audit History</span>
        </h2>

        <AdminTable
          columns={columns}
          data={ledger}
          isLoading={ledgerLoading}
          emptyMessage="No point transactions recorded yet."
        />

        <AdminPagination
          page={page}
          totalPages={totalPages}
          total={total}
          limit={15}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      {/* Manual Credit Points Modal */}
      {showAwardModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', width: '100%', maxWidth: '460px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
              Manual Award Points to Customer
            </h3>

            <form onSubmit={handleManualAward} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Customer Email Address</label>
                <input
                  type="email"
                  required
                  value={awardForm.userEmail}
                  onChange={(e) => setAwardForm({ ...awardForm, userEmail: e.target.value })}
                  placeholder="e.g. customer@reusehub.demo"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Points Amount</label>
                <input
                  type="number"
                  required
                  value={awardForm.points}
                  onChange={(e) => setAwardForm({ ...awardForm, points: parseInt(e.target.value) || 0 })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#38bdf8', fontWeight: 800, fontSize: '1rem', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Reason / Note</label>
                <input
                  type="text"
                  required
                  value={awardForm.reason}
                  onChange={(e) => setAwardForm({ ...awardForm, reason: e.target.value })}
                  placeholder="Reason for crediting points"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#ffffff', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAwardModal(false)}
                  style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#334155', border: 'none', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={awardLoading}
                  style={{ padding: '8px 18px', borderRadius: '8px', backgroundColor: '#047857', border: 'none', color: '#ffffff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {awardLoading ? 'Crediting...' : 'Credit Points'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPointsPage;
