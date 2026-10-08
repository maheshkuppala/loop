import React from 'react';
import { Bell, Send, CheckCircle2 } from 'lucide-react';

export const AdminNotificationsPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
          <Bell size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            System Notifications Broadcast Hub
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Manage Brevo email dispatch logs and system notification triggers across the platform.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={18} color="#38bdf8" />
          <span>Automated System Email Triggers (Brevo API)</span>
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Brevo Trigger #1</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>Reuse Request Notification</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Dispatches instant email to product owner when neighbor submits request.</p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Brevo Trigger #2</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', margin: '4px 0' }}>Request Accept / Decline</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Notifies requester immediately when owner approves or declines request.</p>
          </div>

          <div style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#1e293b', border: '1px solid #334155' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase' }}>Brevo Trigger #3</span>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>Points Credit Confirmation</h3>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Notifies customer of points added to balance upon receipt confirmation.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
