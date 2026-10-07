import React from 'react';

/**
 * Global Error Boundary to catch uncaught component rendering errors
 * Prevents full-application white-screen crashes and provides safe recovery
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[LOOOP ErrorBoundary] Caught uncaught error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleClearSession = () => {
    try {
      localStorage.removeItem('looop_token');
      localStorage.removeItem('looop_user');
      sessionStorage.clear();
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.state.error?.message || this.state.error?.toString() || 'Unknown runtime error';

      return (
        <div
          style={{
            minHeight: '75vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              padding: '2.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '1.25rem',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                fontSize: '1.85rem'
              }}
            >
              ⚠️
            </div>
            <h2
              style={{
                fontSize: '1.4rem',
                fontWeight: 700,
                color: '#1e293b',
                marginBottom: '0.75rem'
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '0.925rem',
                color: '#64748b',
                lineHeight: 1.5,
                marginBottom: '1.5rem'
              }}
            >
              An unexpected display issue occurred in this section. Your account, items, and transactions are safe.
            </p>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}
            >
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  backgroundColor: '#10b981',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#475569',
                  backgroundColor: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Go to Home
              </button>
              <button
                type="button"
                onClick={this.handleClearSession}
                style={{
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#dc2626',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                Reset Session & Login
              </button>
            </div>

            {/* Expandable Technical Information */}
            <details
              style={{
                textAlign: 'left',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                fontSize: '0.78rem',
                color: '#64748b'
              }}
            >
              <summary style={{ fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                Technical Details
              </summary>
              <div
                style={{
                  marginTop: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  fontFamily: 'monospace',
                  color: '#b91c1c'
                }}
              >
                {errorMessage}
              </div>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
