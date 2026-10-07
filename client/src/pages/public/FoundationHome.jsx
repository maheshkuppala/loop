import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Activity,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Code2,
  Send,
  Eye
} from 'lucide-react';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

export const FoundationHome = () => {
  const [healthData, setHealthData] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthError, setHealthError] = useState(null);

  // Echo test state
  const [echoInput, setEchoInput] = useState('Hello from Looop MERN Client!');
  const [echoResponse, setEchoResponse] = useState(null);
  const [echoLoading, setEchoLoading] = useState(false);

  // Demo modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Component showcase test input
  const [demoInput, setDemoInput] = useState('');
  const [demoInputError, setDemoInputError] = useState('');

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    try {
      const res = await api.checkHealth();
      setHealthData(res.data);
    } catch (err) {
      setHealthError(err.message || 'Unable to connect to backend server');
      setHealthData(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleEchoTest = async (e) => {
    e.preventDefault();
    if (!echoInput.trim()) return;

    setEchoLoading(true);
    try {
      const res = await api.echoTest({ message: echoInput, sentAt: new Date().toISOString() });
      setEchoResponse(res.data);
    } catch (err) {
      setEchoResponse({ error: err.message });
    } finally {
      setEchoLoading(false);
    }
  };

  const handleDemoInputChange = (e) => {
    const val = e.target.value;
    setDemoInput(val);
    if (val.length > 0 && val.length < 3) {
      setDemoInputError('Title must be at least 3 characters');
    } else {
      setDemoInputError('');
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '2.5rem' }}>
      {/* Hero Presentation */}
      <section
        style={{
          textAlign: 'center',
          maxWidth: '820px',
          margin: '0 auto 3.5rem auto',
          padding: '2rem 1rem'
        }}
      >
        {/* Status Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-primary-800)',
            fontSize: '0.825rem',
            fontWeight: 600,
            marginBottom: '1.25rem'
          }}
        >
          <Sparkles size={15} color="var(--color-primary-600)" />
          <span>Phase 1: MERN Stack Foundation Established</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '1rem',
            lineHeight: 1.15
          }}
        >
          Share. Reuse.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-500), var(--color-accent-600))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Connect.
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--color-slate-600)',
            lineHeight: 1.6,
            marginBottom: '2rem'
          }}
        >
          Give unused items a second life by connecting them with people who need them.
          A modern community platform built on <strong>MongoDB</strong>, <strong>Express</strong>,{' '}
          <strong>React</strong>, and <strong>Node.js</strong>.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="lg"
            iconLeft={Activity}
            onClick={fetchHealth}
            loading={loadingHealth}
          >
            Refresh Health Check
          </Button>
          <Button
            variant="secondary"
            size="lg"
            iconLeft={Eye}
            onClick={() => setIsModalOpen(true)}
          >
            Preview UI Modal
          </Button>
        </div>
      </section>

      {/* Grid: Live Connection Diagnostics & Reusable UI Showcase */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '2rem',
          marginBottom: '3.5rem'
        }}
      >
        {/* Card 1: Live Backend & Database Health Diagnostic */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-600)'
                }}
              >
                <Server size={20} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Backend & DB Health</h3>
            </div>
            {healthData && (
              <Badge variant={healthData.status === 'healthy' ? 'success' : 'warning'}>
                {healthData.status}
              </Badge>
            )}
            {healthError && <Badge variant="danger">Disconnected</Badge>}
          </div>

          {healthError && (
            <Alert variant="danger" title="Connection Error" style={{ marginBottom: '1.25rem' }}>
              {healthError}
            </Alert>
          )}

          {healthData && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                backgroundColor: 'var(--color-slate-50)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-slate-200)',
                marginBottom: '1.25rem',
                fontSize: '0.9rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Service</span>
                <span style={{ fontWeight: 600 }}>{healthData.service}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Database Status</span>
                <span
                  style={{
                    fontWeight: 600,
                    color: healthData.database?.isConnected ? 'var(--color-success)' : 'var(--color-danger)'
                  }}
                >
                  {healthData.database?.stateName?.toUpperCase()} ({healthData.database?.name || 'looop'})
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Database Host</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
                  {healthData.database?.host || 'Atlas Cluster'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Uptime</span>
                <span style={{ fontWeight: 600 }}>{healthData.uptime}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-slate-500)' }}>Environment</span>
                <span style={{ fontWeight: 600 }}>{healthData.environment}</span>
              </div>
            </div>
          )}

          {/* Interactive Echo POST Test */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Test REST POST Endpoint
            </h4>
            <form onSubmit={handleEchoTest} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                value={echoInput}
                onChange={(e) => setEchoInput(e.target.value)}
                className="input-field"
                placeholder="Send test payload..."
                style={{ flex: 1 }}
              />
              <Button type="submit" variant="primary" loading={echoLoading} iconLeft={Send}>
                Send
              </Button>
            </form>
            {echoResponse && (
              <pre
                style={{
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-slate-900)',
                  color: '#e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  overflowX: 'auto'
                }}
              >
                {JSON.stringify(echoResponse, null, 2)}
              </pre>
            )}
          </div>
        </Card>

        {/* Card 2: Reusable UI Component Showcase */}
        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '1.25rem'
            }}
          >
            <div
              style={{
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-accent-50)',
                color: 'var(--color-accent-600)'
              }}
            >
              <Code2 size={20} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Reusable UI Foundation</h3>
          </div>

          {/* Buttons showcase */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-500)', marginBottom: '0.5rem' }}>
              Buttons & States
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Button variant="primary" size="sm">Primary</Button>
              <Button variant="secondary" size="sm">Secondary</Button>
              <Button variant="outline" size="sm">Outline</Button>
              <Button variant="danger" size="sm">Danger</Button>
              <Button variant="primary" size="sm" loading>Loading</Button>
            </div>
          </div>

          {/* Badges showcase */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-500)', marginBottom: '0.5rem' }}>
              Badges
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <Badge variant="success">Available</Badge>
              <Badge variant="warning">Reserved</Badge>
              <Badge variant="danger">Expired</Badge>
              <Badge variant="info">Wanted</Badge>
              <Badge variant="neutral">Books</Badge>
            </div>
          </div>

          {/* Input component showcase */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-slate-500)', marginBottom: '0.5rem' }}>
              Form Input Validation
            </div>
            <Input
              label="Item Title Preview"
              placeholder="e.g. Casio FX-991ES Calculator"
              value={demoInput}
              onChange={handleDemoInputChange}
              error={demoInputError}
              helperText="Try typing fewer than 3 characters to test real-time validation error state."
            />
          </div>
        </Card>
      </div>

      {/* 3 Portal Architecture Overview */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Three-Portal Architecture
          </h2>
          <p style={{ color: 'var(--color-slate-600)', maxWidth: '640px', margin: '0 auto' }}>
            The application foundation is logically partitioned into three discrete access areas:
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem'
          }}
        >
          {/* Public Portal */}
          <Card interactive style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Badge variant="info">Portal 1</Badge>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Public Portal</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', flex: 1, marginBottom: '1rem' }}>
              For visitors and newcomers: landing experience, item discovery, educational mission, registration, and login.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-primary-700)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Phase 1 Active (Home)</span>
              <ArrowRight size={15} />
            </div>
          </Card>

          {/* Customer Portal */}
          <Card interactive style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Badge variant="success">Portal 2</Badge>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Customer Portal</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', flex: 1, marginBottom: '1rem' }}>
              For authenticated members: personalized dashboard, item sharing (Give Away, Borrow, Exchange), wanted-item matching, real-time chat, and handover completion.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Scaffolded for Auth Phase</span>
              <ArrowRight size={15} />
            </div>
          </Card>

          {/* Admin Portal */}
          <Card interactive style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Badge variant="warning">Portal 3</Badge>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Admin Portal</h3>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', flex: 1, marginBottom: '1rem' }}>
              For platform administrators: role-gated moderation, user management, item removal, dispute & report resolution, categories, and audit metrics.
            </p>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-slate-500)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>Scaffolded for Admin Phase</span>
              <ArrowRight size={15} />
            </div>
          </Card>
        </div>
      </section>

      {/* Interactive Modal Demo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Looop Reusable Modal Component"
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Got it
            </Button>
          </>
        }
      >
        <div style={{ lineHeight: 1.6 }}>
          <p style={{ marginBottom: '1rem' }}>
            This modal component is built using clean semantic HTML and accessibility best practices:
          </p>
          <ul style={{ paddingLeft: '1.25rem', color: 'var(--color-slate-600)', fontSize: '0.925rem' }}>
            <li>Accessible backdrop with smooth blur filter</li>
            <li>Listens to <code>Escape</code> key to close gracefully</li>
            <li>Prevents body scrolling when open</li>
            <li>Fully reusable across item detail dialogs, request modals, and confirmation steps</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default FoundationHome;
