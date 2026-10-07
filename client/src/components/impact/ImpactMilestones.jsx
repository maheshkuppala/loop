import React from 'react';
import { Award, CheckCircle2, Lock, Sparkles, HeartHandshake, ShieldCheck, Globe } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export const ImpactMilestones = ({ milestones = [] }) => {
  const iconMap = {
    Sparkles: Sparkles,
    HeartHandshake: HeartHandshake,
    Award: Award,
    ShieldCheck: ShieldCheck,
    Globe: Globe
  };

  return (
    <Card style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={20} color="var(--color-primary-600)" />
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-slate-900)', margin: 0 }}>
              Sustainability Milestones
            </h2>
          </div>
          <p style={{ color: 'var(--color-slate-500)', fontSize: '0.8rem', margin: '2px 0 0 0' }}>
            Earned exclusively through verified completed reuse transactions
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem'
        }}
      >
        {milestones.map((m) => {
          const IconComponent = iconMap[m.icon] || Award;
          const progressPct = Math.min(100, Math.round((m.current / m.target) * 100));

          return (
            <div
              key={m.id}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: m.achieved ? '1.5px solid #a7f3d0' : '1px solid var(--color-slate-200)',
                backgroundColor: m.achieved ? '#f0fdf4' : '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '1rem',
                boxShadow: m.achieved ? '0 4px 12px rgba(16, 185, 129, 0.08)' : 'none'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: m.achieved ? '#d1fae5' : '#f1f5f9',
                      color: m.achieved ? '#059669' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                  {m.achieved ? (
                    <Badge variant="success" size="sm">
                      Achieved
                    </Badge>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={12} />
                      <span>{m.current} / {m.target}</span>
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--color-slate-900)' }}>
                  {m.title}
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--color-slate-600)', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                  {m.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-slate-500)', marginBottom: '4px' }}>
                  <span>Progress</span>
                  <span>{progressPct}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: m.achieved ? '#bbf7d0' : 'var(--color-slate-100)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      width: `${progressPct}%`,
                      height: '100%',
                      backgroundColor: m.achieved ? '#059669' : 'var(--color-primary-600)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ImpactMilestones;
