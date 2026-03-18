import React from 'react';
import { AlertIcon, RefreshIcon } from './icons';

/**
 * Global ErrorBoundary to catch rendering errors and prevent a blank white screen.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem' }}><AlertIcon size={64} className="text-warning"/></h1>
          <h2>Something went wrong.</h2>
          <p style={{ color: '#64748b', maxWidth: 600, margin: '0 auto 2rem' }}>
            We encountered an unexpected error rendering this page.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '0.5rem 1rem', 
              background: '#2563eb', 
              color: 'white', 
              border: 'none', 
              borderRadius: 4, 
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            <RefreshIcon size={18} className="me-2"/> Reload Page
          </button>
          
          {import.meta.env.MODE === 'development' && this.state.error && (
            <details style={{ whiteSpace: 'pre-wrap', marginTop: '2rem', textAlign: 'left', background: '#f1f5f9', padding: '1rem', borderRadius: 8 }}>
              {this.state.error.toString()}
            </details>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
