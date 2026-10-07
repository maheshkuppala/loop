import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle, ArrowRight, Share2, Search } from 'lucide-react';
import Card from '../common/Card';
import Button from '../common/Button';

export const ImpactEmptyState = () => {
  return (
    <Card
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        borderRadius: 'var(--radius-xl)',
        border: '1px dashed var(--color-slate-300)',
        backgroundColor: '#fafbfc'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#ecfdf5',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem auto'
        }}
      >
        <Recycle size={32} />
      </div>

      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '8px' }}>
        No Completed Reuse Activity Yet
      </h2>

      <p style={{ color: 'var(--color-slate-600)', maxWidth: '520px', margin: '0 auto 2rem auto', fontSize: '0.95rem', lineHeight: 1.6 }}>
        Your environmental impact is calculated exclusively from <strong>real, completed handovers</strong>.
        When you share an unused item with a neighbor or borrow something instead of buying new, your verified contribution will appear here.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <Link to="/browse">
          <Button variant="primary" iconLeft={Search}>
            Explore Available Items
          </Button>
        </Link>
        <Link to="/customer/share">
          <Button variant="outline" iconLeft={Share2}>
            Share an Item
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default ImpactEmptyState;
