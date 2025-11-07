import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console
    console.error('[ErrorBoundary] Caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffeaea',
          color: '#d63031',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ marginTop: 0 }}>Something went wrong</h2>
          <p>The application encountered an error. Please check the browser console for details.</p>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '20px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Error Details (Development Mode)
              </summary>
              <pre style={{
                backgroundColor: '#f8f9fa',
                padding: '10px',
                borderRadius: '4px',
                overflow: 'auto',
                marginTop: '10px',
                fontSize: '12px',
                color: '#495057'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#d63031',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
