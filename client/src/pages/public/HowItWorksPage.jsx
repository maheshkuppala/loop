import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Gift,
  Clock,
  Repeat,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  HelpCircle,
  Users,
  Search,
  MessageSquare
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import AuthPromptModal from '../../components/common/AuthPromptModal';
import { useAuth } from '../../context/AuthContext';

export const HowItWorksPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isLoggedIn = !!(user && (isAuthenticated || user.id || user.email));

  const handleShareClick = () => {
    if (isLoggedIn) {
      navigate('/share');
    } else {
      setShowAuthModal(true);
    }
  };
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem', maxWidth: '960px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <Badge variant="success" style={{ marginBottom: '0.75rem' }}>Step-by-Step Guide</Badge>
        <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
          How Looop Works
        </h1>
        <p style={{ color: 'var(--color-slate-600)', fontSize: '1.15rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
          Looop is a neighborhood circular platform. Learn how giving away, borrowing, and exchanging items works safely and smoothly.
        </p>
      </div>

      {/* The 3 Sharing Pillars */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
          The Three Sharing Methods
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          <Card style={{ borderLeft: '5px solid var(--color-primary-500)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Gift size={20} color="var(--color-primary-600)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Give Away (Free)</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              You permanently transfer ownership of an item you no longer use. It’s a gift to someone who needs it, with zero payment involved.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-800)', fontWeight: 600 }}>
              ✓ Great for completed textbooks, decluttering, outgrown apparel.
            </div>
          </Card>

          <Card style={{ borderLeft: '5px solid var(--color-info)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Clock size={20} color="var(--color-info)" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Borrow & Lend</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              You lend an item temporarily for a set duration (e.g. 3 days for a power tool, 1 month for exam calculator).
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-info)', fontWeight: 600 }}>
              ✓ Both parties agree on return date; trust score guarantees care.
            </div>
          </Card>

          <Card style={{ borderLeft: '5px solid var(--color-warning)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
              <Repeat size={20} color="#b45309" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Item Exchange</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', lineHeight: 1.6, marginBottom: '1rem' }}>
              A barter transaction between two members. You offer an item and request an equivalent item in return.
            </p>
            <div style={{ fontSize: '0.85rem', color: '#78350f', fontWeight: 600 }}>
              ✓ Great for board games, musical accessories, gadgets.
            </div>
          </Card>
        </div>
      </div>

      {/* Step by Step Handover */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '1.5rem', textAlign: 'center' }}>
          Safe Handover Protocol
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              step: '1. Request Submission',
              desc: 'Interested users submit a polite request describing why they need the item or what they want to exchange.'
            },
            {
              step: '2. Owner Review & Acceptance',
              desc: 'The owner inspects the requester’s profile, trust score, and reviews before choosing to Accept or Decline.'
            },
            {
              step: '3. Private Chat Coordination',
              desc: 'Once accepted, a private chat unlocks to discuss public meeting spots (cafes, campus, metro station).'
            },
            {
              step: '4. In-Person Handover & Inspection',
              desc: 'Both parties meet in a public location. The receiver checks the item condition before accepting.'
            },
            {
              step: '5. Confirmation & Trust Rating',
              desc: 'Both users tap "Confirm Handover" on Looop and leave a 1-5 star review, strengthening community trust.'
            }
          ].map((s, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid var(--color-slate-200)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem 1.5rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  flexShrink: 0
                }}
              >
                {idx + 1}
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--color-slate-900)', marginBottom: '4px' }}>
                  {s.step}
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', margin: 0, lineHeight: 1.6 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div style={{ textAlign: 'center', backgroundColor: 'var(--color-primary-50)', padding: '3rem 2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-primary-200)' }}>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-primary-900)', marginBottom: '0.75rem' }}>
          Ready to try it out?
        </h3>
        <p style={{ color: 'var(--color-primary-800)', marginBottom: '1.5rem', fontSize: '1rem' }}>
          Browse existing items or share your first item with the community.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/browse">
            <Button variant="primary" size="lg">Explore Items</Button>
          </Link>
          <Button variant="secondary" size="lg" onClick={handleShareClick}>
            Share an Item
          </Button>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title="Sign In or Create Account"
        actionTitle="Account Required to Share"
        actionDescription="To share an unused item with your community on LOOOP, please sign in or create a free account."
        redirectPath="/share"
      />
    </div>
  );
};

export default HowItWorksPage;
