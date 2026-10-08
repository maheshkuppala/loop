import React from 'react';
import { MessageSquare, ShieldAlert } from 'lucide-react';

export const AdminMessagesPage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ padding: '8px', borderRadius: '10px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
            Platform Messages & Chat Moderation
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: 0 }}>
            Inspect neighbor-to-neighbor active conversation threads and trust policy compliance.
          </p>
        </div>
      </div>

      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
        <ShieldAlert size={48} color="#38bdf8" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          End-to-End Encrypted Member Messaging Active
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
          All customer messages are securely routed in real-time. Administrative intervention is triggered upon automated flag or member dispute reports.
        </p>
        <div style={{ display: 'inline-flex', gap: '12px' }}>
          <div style={{ padding: '12px 20px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#34d399', fontWeight: 700, fontSize: '0.85rem' }}>
            Active Conversations: 14 Threads
          </div>
          <div style={{ padding: '12px 20px', borderRadius: '10px', backgroundColor: '#1e293b', color: '#38bdf8', fontWeight: 700, fontSize: '0.85rem' }}>
            Flagged Content: 0 Pending
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMessagesPage;
