import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, Users, Sparkles, ArrowRight, CheckCircle2, CloudRain, Trash2 } from 'lucide-react';

export const CommunityImpactSection = ({ impact, userStats }) => {
  // Real MongoDB data from impactService
  const totalItemsReused = impact?.totalItemsReused ?? 0;
  const itemsSharedCount = impact?.itemsShared ?? (userStats?.itemsShared || 0);
  const completedHandovers = impact?.completedReuseTransactions ?? 0;
  const co2Avoided = impact?.environmentalMetrics?.co2eAvoided;
  const wasteAvoided = impact?.environmentalMetrics?.wasteAvoided;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}
      className="impact-community-split"
    >
      {/* Left: Your Environmental Impact Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-slate-200)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Leaf size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                  Your Impact
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                  Personal contribution to circular sharing
                </span>
              </div>
            </div>

            <Link
              to="/customer/impact"
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-primary-700)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '3px'
              }}
            >
              <span>Full Report</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* 4 Impact Stat Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px'
            }}
          >
            {/* Stat 1: Items Reused */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-100)'
              }}
            >
              <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Items Reused
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-slate-900)', marginTop: '2px' }}>
                {totalItemsReused}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <Recycle size={11} />
                <span>Reused Locally</span>
              </div>
            </div>

            {/* Stat 2: Items Shared */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-100)'
              }}
            >
              <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Items Shared
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                {itemsSharedCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)' }}>
                Given or lent
              </div>
            </div>

            {/* Stat 3: Completed Handovers */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-100)'
              }}
            >
              <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                Completed
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#d97706', marginTop: '2px' }}>
                {completedHandovers}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)' }}>
                Handovers verified
              </div>
            </div>

            {/* Stat 4: Estimated CO2e or Waste Avoided */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-100)'
              }}
            >
              <div style={{ fontSize: '0.725rem', color: 'var(--color-slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
                {co2Avoided !== null && co2Avoided !== undefined ? 'Est. CO₂e Saved' : 'Est. Waste Saved'}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0d9488', marginTop: '2px' }}>
                {co2Avoided !== null && co2Avoided !== undefined
                  ? `${co2Avoided} kg`
                  : wasteAvoided !== null && wasteAvoided !== undefined
                  ? `${wasteAvoided} kg`
                  : '—'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-slate-500)' }}>
                {co2Avoided !== null || wasteAvoided !== null ? 'Averted emissions' : 'Factor unconfigured'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.725rem', color: 'var(--color-slate-400)' }}>
            Calculations are derived strictly from completed handovers.
          </span>
          <Link
            to="/customer/impact"
            style={{
              fontSize: '0.78rem',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>View your impact</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Right: Community Activity Live Pulse */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--color-slate-200)',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
                Community Circulation
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-400)' }}>
                Real neighborhood reuse momentum
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0'
              }}
            >
              <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: '#166534', display: 'block' }}>
                  Every completed handover protects local resources
                </strong>
                <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                  Textbooks, tools, electronics, and clothing stay out of municipal disposal.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-slate-200)'
              }}
            >
              <Sparkles size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', display: 'block' }}>
                  Transparent, verifiable reporting
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                  Environmental figures are traceable to approved methodology factors without arbitrary marketing math.
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#f8fafc',
                border: '1px solid var(--color-slate-200)'
              }}
            >
              <Recycle size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--color-slate-800)', display: 'block' }}>
                  Zero-waste peer network
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)' }}>
                  Non-commercial peer sharing makes high-utility products accessible to everyone.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-slate-100)', display: 'flex', justifyContent: 'flex-end' }}>
          <Link
            to="/customer/share"
            style={{
              fontSize: '0.8rem',
              color: 'var(--color-primary-700)',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>Add an item to the circle</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CommunityImpactSection;
