import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Package,
  Repeat,
  AlertTriangle,
  MapPin,
  Calendar,
  Layers,
  Leaf,
  Recycle,
  CloudRain,
  Trash2,
  Droplets,
  Award
} from 'lucide-react';
import adminService from '../../services/adminService';
import impactService from '../../services/impactService';
import { LineTrendChart, BarDistributionChart } from '../../components/admin/SimpleChart';
import Spinner from '../../components/common/Spinner';

export const AdminAnalyticsPage = () => {
  const [range, setRange] = useState('30d');
  const [data, setData] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [impactTrends, setImpactTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async (selectedRange) => {
    try {
      setIsLoading(true);
      setError('');
      const [res, impRes, impTrendsRes] = await Promise.all([
        adminService.getAnalytics(selectedRange),
        impactService.getAdminImpactSummary().catch(() => null),
        impactService.getAdminImpactTrends({ range: selectedRange }).catch(() => null)
      ]);

      if (res?.success) {
        setData(res.data);
      }
      if (impRes?.success) {
        setImpactData(impRes.summary);
      }
      if (impTrendsRes?.success) {
        setImpactTrends(impTrendsRes.trends || []);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Unable to load real analytics aggregation from database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const totals = data?.totals || {};
  const trends = data?.trends || {};
  const distributions = data?.distributions || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Range Selector */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px 0' }}>
            Circulation & Platform Analytics
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Authoritative MongoDB aggregation of community circulation velocity, category demand, and transaction volumes.
          </p>
        </div>

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

      {error && (
        <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', color: '#f87171', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <div style={{ minHeight: '40vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spinner size="lg" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              backgroundColor: '#1e293b',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid #334155'
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>All-Time Users</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>{totals.users || 0}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Circulating Goods</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>{totals.items || 0}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Wanted Requests</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>{totals.wanted || 0}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Completed Exchanges</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }}>{totals.transactions || 0}</span>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Total Reports</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f87171' }}>{totals.reports || 0}</span>
            </div>
          </div>

          {/* Time Series Trends Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* User Registration Velocity */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Users size={18} color="var(--color-primary-400)" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  User Registration Trend
                </h2>
              </div>
              <LineTrendChart
                data={trends.users || []}
                title="User Growth"
                color="var(--color-primary-400)"
                emptyMessage="No new user registrations during this time period."
              />
            </div>

            {/* Items Published Velocity */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Package size={18} color="#38bdf8" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Listings Published Trend
                </h2>
              </div>
              <LineTrendChart
                data={trends.items || []}
                title="Item Publications"
                color="#38bdf8"
                emptyMessage="No listings created during this time period."
              />
            </div>

            {/* Transactions Completed */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <Repeat size={18} color="#34d399" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Completed Exchanges Velocity
                </h2>
              </div>
              <LineTrendChart
                data={trends.transactions || []}
                title="Exchanges Completed"
                color="#34d399"
                emptyMessage="No handovers completed in this time range."
              />
            </div>

            {/* Requests Generated */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <TrendingUp size={18} color="#fbbf24" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Exchange Requests Volume
                </h2>
              </div>
              <LineTrendChart
                data={trends.requests || []}
                title="Exchange Requests"
                color="#fbbf24"
                emptyMessage="No requests submitted in this time range."
              />
            </div>
          </div>

          {/* Categorical & Distribution Breakdowns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Items by Category */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 1rem 0' }}>
                Item Distribution by Category
              </h2>
              <BarDistributionChart
                items={(distributions.itemsByCategory || []).map((c) => ({
                  label: c.category,
                  count: c.count
                }))}
                color="var(--color-primary-400)"
              />
            </div>

            {/* Sharing Model Breakdown */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 1rem 0' }}>
                Sharing Preferences
              </h2>
              <BarDistributionChart
                items={(distributions.sharingTypes || []).map((s) => ({
                  label: s.type.replace(/_/g, ' '),
                  count: s.count
                }))}
                color="#34d399"
              />
            </div>

            {/* Top Active Localities (Privacy-Safe City Level Only) */}
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                <MapPin size={18} color="#f472b6" />
                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                  Active Regional Hubs (City-Level)
                </h2>
              </div>
              <BarDistributionChart
                items={(distributions.topCities || []).map((c) => ({
                  label: c.city,
                  count: c.count
                }))}
                color="#f472b6"
                emptyMessage="No locality distribution recorded yet."
              />
            </div>
          </div>

          {/* Environmental & Circular Economy Sustainability Analytics */}
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
                    Circular Economy & Environmental Sustainability
                  </h2>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Authoritative MongoDB aggregation from qualifying completed reuse transactions
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Methodology v1.0</span>
                <span style={{ fontSize: '0.75rem', color: '#34d399', backgroundColor: 'rgba(52, 211, 153, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.3)' }}>
                  {impactData?.activeFactorsCount || 0} Active Factors
                </span>
              </div>
            </div>

            {/* Circular Statistics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Items Reused</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34d399' }}>{impactData?.totalItemsReused || 0}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Circulated products</span>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Completed Handovers</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc' }}>{impactData?.totalCompletedTransactions || 0}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>Verified transactions</span>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Est. CO₂e Avoided</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38bdf8' }}>
                  {impactData?.environmentalMetrics?.co2eAvoided !== null ? `${impactData?.environmentalMetrics?.co2eAvoided} kg` : 'Unavailable'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {impactData?.environmentalMetrics?.co2eAvoided !== null ? 'Emissions averted' : 'Factor unconfigured'}
                </span>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Est. Waste Diverted</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24' }}>
                  {impactData?.environmentalMetrics?.wasteAvoided !== null ? `${impactData?.environmentalMetrics?.wasteAvoided} kg` : 'Unavailable'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {impactData?.environmentalMetrics?.wasteAvoided !== null ? 'Kept from landfill' : 'Factor unconfigured'}
                </span>
              </div>

              <div style={{ backgroundColor: '#0f172a', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid #334155' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase' }}>Est. Water Saved</span>
                <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#818cf8' }}>
                  {impactData?.environmentalMetrics?.waterSaved !== null ? `${impactData?.environmentalMetrics?.waterSaved.toLocaleString()} L` : 'Unavailable'}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
                  {impactData?.environmentalMetrics?.waterSaved !== null ? 'Freshwater conserved' : 'Factor unconfigured'}
                </span>
              </div>
            </div>

            {/* Reuse Trend Over Time */}
            {impactTrends.length > 0 && (
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
                  Reuse Velocity Trend ({range})
                </h3>
                <LineTrendChart
                  data={impactTrends.map((t) => ({
                    period: t.period || t.label,
                    count: t.itemsReused || 0
                  }))}
                  title="Items Reused"
                  color="#34d399"
                  emptyMessage="No reuse events recorded in this period."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnalyticsPage;
