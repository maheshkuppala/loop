import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export const AdminPortalPlaceholder = () => {
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
              backgroundColor: 'var(--color-warning-bg)',
              color: '#b45309'
            }}
          >
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Admin Portal</h2>
              <Badge variant="warning">Admin Role Boundary</Badge>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-500)' }}>
              Isolated Administration Workspace
            </p>
          </div>
        </div>

        <p style={{ color: 'var(--color-slate-600)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          Per the master specification, the Admin Portal is logically separated from the customer experience
          and requires verified <code>ADMIN</code> role authorization on the backend.
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
            Features Scheduled for Upcoming Admin Phases:
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <Lock size={16} color="var(--color-slate-500)" />
              <span>Role-Based Access Control (RBAC) Admin Authentication</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>User & Account Moderation (Block, Unblock, Suspend)</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Listing Governance & Content Removal</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>User Reports & Dispute Resolution Desk</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-slate-700)' }}>
              <CheckCircle2 size={16} color="var(--color-primary-600)" />
              <span>Platform Activity Metrics, Audit Logs & Analytics</span>
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

export default AdminPortalPlaceholder;
