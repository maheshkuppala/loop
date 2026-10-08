import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const AuthPromptModal = ({
  isOpen,
  onClose,
  title = 'Sign In or Create Account',
  actionTitle = 'Account Required',
  actionDescription = 'To continue, please sign in to your LOOOP account or create a free account.',
  redirectPath = window.location.pathname + window.location.search
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleRegister = () => {
    onClose();
    navigate(`/register?redirect=${encodeURIComponent(redirectPath)}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
    >
      <div style={{ textAlign: 'center', padding: '1rem 0.5rem' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-50)',
            color: 'var(--color-primary-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto'
          }}
        >
          <User size={28} />
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--color-slate-900)', marginBottom: '0.5rem' }}>
          {actionTitle}
        </h3>

        <p style={{ color: 'var(--color-slate-600)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '2rem', maxWidth: '420px', margin: '0 auto 2rem auto' }}>
          {actionDescription}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', maxWidth: '340px', margin: '0 auto' }}>
          <Button
            variant="primary"
            size="lg"
            style={{ width: '100%' }}
            iconRight={ArrowRight}
            onClick={handleLogin}
          >
            Log In to LOOOP
          </Button>

          <Button
            variant="outline"
            size="lg"
            style={{ width: '100%' }}
            iconLeft={UserPlus}
            onClick={handleRegister}
          >
            Create a Free Account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            style={{ width: '100%', marginTop: '4px' }}
            onClick={onClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AuthPromptModal;
