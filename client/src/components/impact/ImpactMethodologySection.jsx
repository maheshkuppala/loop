import React from 'react';
import {
  FileText,
  CheckCircle2,
  Shield,
  Layers,
  Cpu,
  BookOpen,
  Info,
  ExternalLink
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ImpactMethodologySection = () => {
  const principles = [
    {
      step: '1',
      title: 'Only Completed Transactions Count',
      desc: 'Listed items, saved items, pending requests, and incomplete handovers are strictly excluded from calculations. Only verified, completed physical exchanges generate impact credit.'
    },
    {
      step: '2',
      title: 'Categorized Product Assessment',
      desc: 'Items are classified by product category (e.g. Books, Electronics, Clothing, Home & Kitchen). Verified lifecycle factors are assigned per category.'
    },
    {
      step: '3',
      title: 'Verified Factor Application',
      desc: 'When an item is handed over, the backend applies the active, documented ImpactFactor for that category (e.g. 1.3 kg CO₂e / book from WRAP UK research).'
    },
    {
      step: '4',
      title: 'Server-Side Deterministic Math',
      desc: 'All calculations are computed deterministically on the backend server. The formula is strictly: Estimated Impact = Qualifying Items × Verified Factor.'
    },
    {
      step: '5',
      title: 'Immutable Event Versioning',
      desc: 'Each completed transaction stores an immutable snapshot of the methodology version and factor value used, ensuring historical records remain reproducible.'
    },
    {
      step: '6',
      title: 'Honest Estimates, Not Absolute Claims',
      desc: 'Environmental figures represent scientifically grounded estimates of avoided emissions or resource extraction, not direct sensor measurements.'
    },
    {
      step: '7',
      title: 'Zero Fabrication Policy',
      desc: 'If a category lacks an approved, defensible factor, the system reports "Unavailable" instead of a misleading zero or arbitrary fabricated number.'
    }
  ];

  return (
    <Card style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              How Your Impact is Calculated
            </h2>
          </div>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Our 7-pillar transparency framework for defensible, audit-grade sustainability reporting
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Badge variant="neutral">Methodology v1.0</Badge>
          <Badge variant="success">Deterministic</Badge>
        </div>
      </div>

      {/* Formula Callout Banner */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: '#f8fafc',
          border: '1px solid var(--color-slate-200)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}
      >
        <div>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-slate-500)' }}>
            Core Calculation Formula
          </span>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-slate-900)', marginTop: '2px', fontFamily: 'monospace' }}>
            Estimated Impact = Qualifying Quantity × Verified Impact Factor
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--color-slate-600)', maxWidth: '340px' }}>
          Avoids double-counting in exchanges and borrow cycles through unique transaction indices.
        </div>
      </div>

      {/* 7 Transparency Principles */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem'
        }}
      >
        {principles.map((p) => (
          <div
            key={p.step}
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-slate-200)',
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-700)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {p.step}
              </span>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--color-slate-800)', margin: 0 }}>
                {p.title}
              </h3>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.5 }}>
              {p.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Methodology Data Sources Citation */}
      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--color-slate-100)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          fontSize: '0.75rem',
          color: 'var(--color-slate-500)'
        }}
      >
        <div>
          <strong>Benchmark Sources:</strong> WRAP UK Circular Economy Research (2023), DEFRA Product Carbon Guidelines, ADEME Electronics LCA, Ellen MacArthur Foundation Textiles Economy.
        </div>
        <div style={{ fontStyle: 'italic' }}>
          LOOOP Platform Governance • Methodology Version 1.0
        </div>
      </div>
    </Card>
  );
};

export default ImpactMethodologySection;
