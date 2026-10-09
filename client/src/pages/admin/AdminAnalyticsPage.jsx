import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Repeat,
  AlertTriangle,
  Calendar,
  Layers,
  Leaf,
  Award,
  RefreshCw,
  Clock,
  MessageSquare,
  FileText,
  HelpCircle,
  FolderTree,
  CheckCircle
} from 'lucide-react';
import adminService from '../../services/adminService';
import { LineTrendChart, BarDistributionChart } from '../../components/admin/SimpleChart';
import AdminStatCard from '../../components/admin/AdminStatCard';
import Spinner from '../../components/common/Spinner';

export const AdminAnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async (selectedRange) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await adminService.getAnalytics(selectedRange);
      if (res?.success && res.data) {
        setAnalytics(res.data);
      } else {
        setError('Failed to load analytics data from database.');
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.message || 'Unable to generate PostgreSQL analytics aggregation.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, fetchAnalytics]);

  const overview = analytics?.overview || {};
  const growth = analytics?.growth || {};
  const sharing = analytics?.sharing || {};
  const request = analytics?.request || {};
  const transaction = analytics?.transaction || {};
  const points = analytics?.points || {};
  const category = analytics?.category || {};
  const community = analytics?.community || {};
  const impact = analytics?.impact || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Date Range Controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Analytics & Environmental Impact
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Authoritative PostgreSQL aggregation of community circulation, category velocity, and environmental metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => fetchAnalytics(range)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-sm)',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <div style={{ display: 'flex', backgroundColor: '#1e293b', padding: '2px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
            {[
              { label: '7 Days', val: '7d' },
              { label: '30 Days', val: '30d' },
              { label: '90 Days', val: '90d' },
              { label: '12 Months', val: '12m' },
              { label: 'All Time', val: 'all' }
            ].map((tab) => (
              <button
                key={tab.val}
                type="button"
                onClick={() => setRange(tab.val)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: range === tab.val ? 'var(--color-primary-600)' : 'transparent',
                  color: range === tab.val ? '#ffffff' : '#94a3b8',
                  fontSize: '0.8rem',
                  fontWeight: range === tab.val ? 600 : 500,
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1: Key Performance Overview Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <AdminStatCard
              title="Total Users"
              value={overview.totalUsers || 0}
              icon={Users}
              color="blue"
            />
            <AdminStatCard
              title="Active Listings"
              value={overview.activeItems || 0}
              icon={Package}
              color="sky"
            />
            <AdminStatCard
              title="Requests Generated"
              value={overview.totalRequests || 0}
              icon={TrendingUp}
              color="amber"
            />
            <AdminStatCard
              title="Completed Handovers"
              value={overview.completedTransactions || 0}
              icon={Repeat}
              color="emerald"
            />
            <AdminStatCard
              title="Points in Circulation"
              value={overview.pointsInCirculation || 0}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Section 2: Platform Growth & Item Sharing Velocity */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* User Registration Velocity */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users size={18} color="var(--color-primary-400)" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    User Growth Velocity
                  </h2>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>+{growth.newUsersInRange || 0} new in range</span>
              </div>
              <LineTrendChart
                data={growth.trend || []}
                title="User Growth"
                color="var(--color-primary-400)"
                emptyMessage="No user registrations in this timeframe."
              />
            </div>

            {/* Item Listing Publication Trend */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={18} color="#38bdf8" />
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                    Listings Published Trend
                  </h2>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{overview.totalItems || 0} total listings</span>
              </div>
              <LineTrendChart
                data={sharing.trend || []}
                title="Item Publications"
                color="#38bdf8"
                emptyMessage="No items published during this timeframe."
              />
            </div>
          </div>

          {/* Section 3: Requests & Transactions Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Request Breakdown by Type */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Requests by Type
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
                  {request.completionRate || 0}% Completion Rate
                </span>
              </div>
              <BarDistributionChart
                items={(request.byType || []).map((r) => ({
                  label: r.type,
                  count: r.count
                }))}
                color="#fbbf24"
                emptyMessage="No request records found."
              />
            </div>

            {/* Sharing Preference Breakdown */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 1rem 0' }}>
                Item Sharing Models
              </h2>
              <BarDistributionChart
                items={(sharing.sharingTypeBreakdown || []).map((s) => ({
                  label: String(s.sharing_type || s.sharingType).replace(/_/g, ' '),
                  count: s.count
                }))}
                color="#34d399"
                emptyMessage="No item sharing type breakdown available."
              />
            </div>
          </div>

          {/* Section 4: Points Engine & Category Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {/* Points Engine Circulation */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Award size={18} color="#c084fc" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Points Ledger Velocity
                </h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Points Awarded (Range)</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', margin: '2px 0 0 0' }}>
                    +{points.pointsEarnedInRange || 0} pts
                  </p>
                </div>
                <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Points Spent (Range)</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171', margin: '2px 0 0 0' }}>
                    -{points.pointsSpentInRange || 0} pts
                  </p>
                </div>
              </div>
            </div>

            {/* Top Categories Distribution */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <FolderTree size={18} color="#38bdf8" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Top Categories by Item Volume
                </h2>
              </div>
              <BarDistributionChart
                items={(category.topCategoriesByItems || []).map((c) => ({
                  label: c.name,
                  count: c.item_count || c.itemCount || 0
                }))}
                color="#38bdf8"
                emptyMessage="No category item distribution records found."
              />
            </div>
          </div>

          {/* Section 5: Community & Governance Metrics */}
          <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 1rem 0' }}>
              Community Engagement & Moderation Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reviews Submitted</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', margin: '2px 0 0 0' }}>
                  {community.reviewsSubmitted || 0}
                </p>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Average Community Rating</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24', margin: '2px 0 0 0' }}>
                  ★ {community.averageRating || '0.0'}
                </p>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reports Logged (Range)</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171', margin: '2px 0 0 0' }}>
                  {community.reportsCreatedInRange || 0}
                </p>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Reports Resolved</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399', margin: '2px 0 0 0' }}>
                  {community.reportsResolvedInRange || 0}
                </p>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Conversations</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', margin: '2px 0 0 0' }}>
                  {community.totalConversations || 0}
                </p>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '12px', borderRadius: 'var(--radius-xs)' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Messages Sent</span>
                <p style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc', margin: '2px 0 0 0' }}>
                  {community.totalMessages || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Section 6: LOOOP Environmental Impact Section */}
          <div
            style={{
              backgroundColor: '#1e293b',
              padding: '1.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', margin: 0 }}>
                    LOOOP Environmental & Circular Impact
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Calculated directly from verified completed transactions and PostgreSQL impact event records
                  </span>
                </div>
              </div>

              <span style={{ fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                {impact.activeFactorsCount || 0} Active Impact Factors
              </span>
            </div>

            {impact.hasImpactData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Completed Handovers (Items Reused)
                  </span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399', margin: '4px 0 0 0', display: 'block' }}>
                    {impact.completedTransactionsAsItemsReused || 0}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Verified platform items circulated</span>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Est. CO₂e Emissions Avoided
                  </span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8', margin: '4px 0 0 0', display: 'block' }}>
                    {impact.estimatedCo2eAvoidedKg || 0} kg
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Greenhouse gas savings</span>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Est. Landfill Waste Diverted
                  </span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24', margin: '4px 0 0 0', display: 'block' }}>
                    {impact.estimatedWasteAvoidedKg || 0} kg
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Solid waste diverted</span>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', fontWeight: 600 }}>
                    Est. Water Conserved
                  </span>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#c084fc', margin: '4px 0 0 0', display: 'block' }}>
                    {impact.estimatedWaterSavedLiters || 0} L
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Freshwater saved</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: 'rgba(15, 23, 42, 0.6)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px dashed #334155',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Leaf size={32} color="#64748b" />
                <span style={{ color: '#cbd5e1', fontWeight: 600, fontSize: '0.95rem' }}>
                  No impact event records found.
                </span>
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, maxWidth: '480px' }}>
                  {impact.message || 'Environmental impact metrics will automatically accumulate as circular sharing handovers occur on the platform.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
