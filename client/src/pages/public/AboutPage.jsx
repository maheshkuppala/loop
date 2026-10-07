import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Heart, ShieldCheck, Sparkles, Leaf, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

export const AboutPage = () => {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '880px' }}>
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Our Mission & Values</Badge>
        <h1 style={{ fontSize: 'clamp(2.25rem, 4vw, 3.25rem)', fontWeight: 800, marginBottom: '1rem' }}>
          Keeping Useful Things in the Loop
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '1.15rem', lineHeight: 1.6 }}>
          Looop was born out of a simple realization: millions of perfectly good items sit idle in drawers, cupboards, and dorm rooms while nearby students and neighbors are spending money to buy the exact same thing new.
        </p>
      </div>

      {/* The Core Formula */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--color-slate-200)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '3rem'
        }}
      >
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-primary-700)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
          The Looop Philosophy
        </div>
        <div style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', fontWeight: 800, color: 'var(--color-slate-900)', lineHeight: 1.5 }}>
          Own → Don't Need → Share → Someone Needs It → Reuse → Keep It in the Loop
        </div>
      </div>

      {/* Three Pillars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3.5rem' }}>
        <Card>
          <Leaf size={24} color="var(--color-primary-600)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Circularity</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6 }}>
            Extending product lifecycles reduces waste, curbs carbon emissions from manufacturing, and fosters a sustainable mindset.
          </p>
        </Card>

        <Card>
          <Users size={24} color="var(--color-info)" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Community</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6 }}>
            Non-monetary sharing builds authentic neighborhood relationships, helping college students, young professionals, and families support one another.
          </p>
        </Card>

        <Card>
          <ShieldCheck size={24} color="#b45309" style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>High Trust</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6 }}>
            Our community trust score, transparent review records, and strict moderation ensure a respectful, dependable environment for all members.
          </p>
        </Card>
      </div>

      {/* Why no selling */}
      <div style={{ backgroundColor: 'var(--color-slate-50)', border: '1px solid var(--color-slate-200)', borderRadius: 'var(--radius-lg)', padding: '2rem', marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Why Looop does NOT include selling or payments
        </h3>
        <p style={{ color: 'var(--color-slate-600)', lineHeight: 1.7, fontSize: '0.95rem' }}>
          When money enters community platforms, conversations devolve into aggressive price haggling, commercial resellers flood listings, and the warmth of genuine community cooperation disappears.
          By keeping Looop strictly centered on <strong>Give Away</strong>, <strong>Borrow & Lend</strong>, and <strong>Exchange</strong>, we preserve a clutter-free, high-trust environment where the joy of helping is the sole currency.
        </p>
      </div>

      {/* Team CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link to="/browse">
          <Button variant="primary" size="lg">
            Explore Community Listings
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
