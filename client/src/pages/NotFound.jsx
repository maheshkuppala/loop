import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export const NotFound = () => {
  return (
    <div className="container" style={{ paddingTop: '4rem', paddingBottom: '4rem', maxWidth: '600px', textAlign: 'center' }}>
      <Card style={{ padding: '3rem 2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem auto'
          }}
        >
          <AlertCircle size={36} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          404 - Page Not Found
        </h1>
        <p style={{ color: 'var(--color-slate-600)', marginBottom: '2rem' }}>
          The page you are looking for does not exist or has moved outside the loop.
        </p>
        <Link to="/">
          <Button variant="primary" iconLeft={ArrowLeft}>
            Back to Home
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
