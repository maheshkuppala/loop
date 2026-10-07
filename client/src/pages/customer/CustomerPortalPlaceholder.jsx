import React from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldAlert, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const CustomerPortalPlaceholder = () => {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem', maxWidth: '780px' }}>
      <Link
        to="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--color-primary-700)',
          fontWeight: 600,
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}
      >
        <ArrowLeft size={16} />
        <span>Back to Public Hub</span>
      </Link>

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div
            style={{
              padding: '0.6rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-50)',
              color: 'var(--color-primary-600)'
            }}
          >
            <User size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Customer Portal</h2>
              <Badge variant="info">Phase 1 Architecture Boundary</Badge>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-500)' }}>
              Reserved for Authenticated Members
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Per the step-by-step master specification, fake authentication is not introduced here.
          The routing and architecture boundaries are configured to receive:
        </p>

        <div
          style={{
            backgroundColor: 'var(--color-slate-50)',
            border: '1px solid var(--color-slate-200)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}
        >
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Features Scheduled for Upcoming Customer Phases:
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>JWT-authenticated Customer Registration & Login</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Personalized Member Dashboard & Profile Management</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Item Sharing (Give Away, Borrow, Exchange) & Image Uploads</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Wanted-Item Matching & Request Handover Flow</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Socket.IO Real-Time Messaging & Transaction Reviews</span>
            </li>
          </ul>
        </div>

        <Link to="/">
          <Button variant="primary">Return to Health Diagnostics</Button>
        </Link>
      </Card>
    </div>
  );
};

export default CustomerPortalPlaceholder;
