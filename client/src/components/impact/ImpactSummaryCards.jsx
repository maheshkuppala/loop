import React from 'react';
import {
  Repeat,
  Share2,
  PackageCheck,
  CheckCircle2,
  CloudRain,
  Trash2,
  Droplets,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ImpactSummaryCards = ({ data, onOpenMethodology }) => {
  const {
    totalItemsReused = 0,
    itemsShared = 0,
    itemsReceived = 0,
    completedReuseTransactions = 0,
    environmentalMetrics = {}
  } = data || {};

  const { co2eAvoided, wasteAvoided, waterSaved } = environmentalMetrics;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Real Activity Count Cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Completed Reuse Activity
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
              100% verified handovers recorded in MongoDB
            </span>
          </div>
          <Badge variant="primary">Verified Activity</Badge>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Card 1: Total Items Reused */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Repeat size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                Active in Loop
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {totalItemsReused}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-700)', marginTop: '4px' }}>
                Items Reused
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Total products kept in active circulation
              </div>
            </div>
          </Card>

          {/* Card 2: Items Shared */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Share2 size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', backgroundColor: '#f0f9ff', padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                Given / Lent
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {itemsShared}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-700)', marginTop: '4px' }}>
                Items You Shared
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Provided to neighbors in your area
              </div>
            </div>
          </Card>

          {/* Card 3: Items Received */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fdf2f8',
                  color: '#db2777',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <PackageCheck size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#db2777', backgroundColor: '#fdf2f8', padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                Received
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {itemsReceived}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-700)', marginTop: '4px' }}>
                Items Received
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Borrowed or accepted locally
              </div>
            </div>
          </Card>

          {/* Card 4: Completed Transactions */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={22} />
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706', backgroundColor: '#fffbeb', padding: '3px 8px', borderRadius: 'var(--radius-xs)' }}>
                Lifecycle
              </span>
            </div>
            <div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--color-slate-900)', lineHeight: 1 }}>
                {completedReuseTransactions}
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-700)', marginTop: '4px' }}>
                Completed Handovers
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                Full circular reuse lifecycles finished
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 2. Estimated Environmental Conversion Metrics */}
      <div>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Estimated Environmental Contribution
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-slate-500)' }}>
              Deterministic calculations based strictly on configured, documented impact factors
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenMethodology}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-primary-700)',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: 'var(--radius-xs)'
            }}
          >
            <HelpCircle size={15} />
            <span>Methodology & Sources</span>
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}
        >
          {/* Metric 1: CO2e Avoided */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#f0fdfa',
                  color: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CloudRain size={20} />
              </div>
              <Badge variant={co2eAvoided !== null ? 'success' : 'neutral'}>
                {co2eAvoided !== null ? 'Configured Factor' : 'Estimate Unavailable'}
              </Badge>
            </div>

            <div>
              {co2eAvoided !== null ? (
                <>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0d9488', lineHeight: 1 }}>
                    {co2eAvoided.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>kg</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '4px' }}>
                    Estimated CO₂e Avoided
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Emissions deferred by reusing existing items
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} color="var(--color-slate-400)" />
                    <span>Environmental estimate unavailable</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    No verified factor is currently configured for your item categories. LOOOP never fabricates arbitrary numbers.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Metric 2: Waste Avoided */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={20} />
              </div>
              <Badge variant={wasteAvoided !== null ? 'success' : 'neutral'}>
                {wasteAvoided !== null ? 'Configured Factor' : 'Estimate Unavailable'}
              </Badge>
            </div>

            <div>
              {wasteAvoided !== null ? (
                <>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#059669', lineHeight: 1 }}>
                    {wasteAvoided.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>kg</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '4px' }}>
                    Estimated Waste Avoided
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Solid material diverted from local disposal
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} color="var(--color-slate-400)" />
                    <span>Environmental estimate unavailable</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Awaiting verified waste diversion factors for your item categories.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Metric 3: Water Saved */}
          <Card
            style={{
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Droplets size={20} />
              </div>
              <Badge variant={waterSaved !== null ? 'success' : 'neutral'}>
                {waterSaved !== null ? 'Configured Factor' : 'Estimate Unavailable'}
              </Badge>
            </div>

            <div>
              {waterSaved !== null ? (
                <>
                  <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#3b82f6', lineHeight: 1 }}>
                    {waterSaved.toLocaleString()} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>L</span>
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-slate-800)', marginTop: '4px' }}>
                    Estimated Water Saved
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', marginTop: '2px' }}>
                    Freshwater consumption prevented in production
                  </div>
                </>
              ) : (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-slate-700)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertCircle size={16} color="var(--color-slate-400)" />
                    <span>Environmental estimate unavailable</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-slate-500)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                    Water footprint factor applies to qualifying categories (e.g. textiles/apparel).
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImpactSummaryCards;
