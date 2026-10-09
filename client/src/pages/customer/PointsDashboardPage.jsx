import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Gift,
  Clock,
  CheckCircle2,
  Package,
  Layers,
  Info
} from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';

export const PointsDashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    pointsBalance: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    historyCount: 0,
    history: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPointsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/points');
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load points data:', err);
      setError(err.response?.data?.message || 'Unable to load points history.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPointsData();
  }, [fetchPointsData]);

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', paddingBottom: '4rem' }} className="points-dashboard-page">
      {/* 1. Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 'clamp(1.6rem, 2.5vw, 2.1rem)',
              fontWeight: 900,
              color: 'var(--color-slate-900)',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Award size={28} color="#059669" />
            <span>My LOOOP Points</span>
          </h1>
          <p style={{ color: 'var(--color-slate-600)', fontSize: '0.95rem', margin: 0 }}>
            Earn points every time you complete a circular reuse or borrow transaction in your community.
          </p>
        </div>

        <Button variant="outline" size="sm" iconLeft={RefreshCw} onClick={fetchPointsData} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* 2. Main Balance Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
          borderRadius: '24px',
          padding: '2.25rem 2rem',
          color: '#ffffff',
          boxShadow: '0 12px 30px -8px rgba(5, 150, 105, 0.4)',
          marginBottom: '2rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', zIndex: 2, position: 'relative' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0', marginBottom: '8px' }}>
              CURRENT BALANCE
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, lineHeight: 1, letterSpacing: '-0.03em' }}>
                {loading ? '...' : data.pointsBalance}
              </span>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ecfdf5', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                POINTS
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#d1fae5', marginTop: '12px', margin: 0 }}>
              Points are credited automatically when your reuse and borrow transactions complete.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              padding: '1rem 1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#a7f3d0' }}>
                Total Earned
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
                +{data.totalEarned}
              </div>
            </div>
            <div style={{ width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}></div>
            <div>
              <div style={{ fontSize: '0.725rem', fontWeight: 700, textTransform: 'uppercase', color: '#a7f3d0' }}>
                Total Redeemed
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '2px' }}>
                -{data.totalRedeemed}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Points Rules Banner */}
      <Card style={{ padding: '1.25rem', border: '1px solid var(--color-slate-200)', marginBottom: '2rem', backgroundColor: '#f8fafc' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#059669" />
          <span>How Points Work on LOOOP</span>
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', fontSize: '0.85rem', color: 'var(--color-slate-600)' }}>
          <div>
            <strong style={{ color: 'var(--color-slate-800)' }}>1. Receive/Reuse Items:</strong> Earn admin-configured points (e.g., +100 pts) when you complete receiving a giveaway or free item.
          </div>
          <div>
            <strong style={{ color: 'var(--color-slate-800)' }}>2. Borrow Items:</strong> Earn points (e.g., +50 pts) for completing a borrow transaction and returning it safely.
          </div>
          <div>
            <strong style={{ color: 'var(--color-slate-800)' }}>3. Verified Completion:</strong> Points are released only after the transaction is fully confirmed as COMPLETED.
          </div>
        </div>
      </Card>

      {/* 4. Points Ledger / Transaction History */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
            Points History & Audit Ledger
          </h2>
          <span style={{ fontSize: '0.825rem', color: 'var(--color-slate-500)' }}>
            {data.historyCount} transaction{data.historyCount === 1 ? '' : 's'} recorded
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Spinner size="lg" />
            <div style={{ marginTop: '10px', color: 'var(--color-slate-500)', fontSize: '0.9rem' }}>Loading ledger...</div>
          </div>
        ) : error ? (
          <Card style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <p style={{ color: '#991b1b', margin: 0 }}>{error}</p>
          </Card>
        ) : data.history.length === 0 ? (
          <EmptyState
            icon={Gift}
            title="No points history yet"
            description="Complete your first item reuse or borrow request to start earning LOOOP points!"
            actionLabel="Browse Products to Reuse"
            onAction={() => navigate('/browse')}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {data.history.map((entry) => {
              const isPositive = entry.amount > 0;
              return (
                <Card
                  key={entry.id || entry._id}
                  style={{
                    padding: '1.15rem 1.35rem',
                    border: '1px solid var(--color-slate-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        backgroundColor: isPositive ? '#ecfdf5' : '#fef2f2',
                        color: isPositive ? '#059669' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: '0 0 2px 0' }}>
                        {entry.reason}
                      </h4>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-slate-500)' }}>
                        {formatDate(entry.createdAt)} • Type: <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{entry.type?.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        color: isPositive ? '#059669' : '#dc2626'
                      }}
                    >
                      {isPositive ? `+${entry.amount}` : entry.amount} PTS
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)', marginTop: '2px' }}>
                      Balance after: {entry.balanceAfter} pts
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsDashboardPage;
