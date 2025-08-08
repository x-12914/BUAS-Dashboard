import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>
              The Phone Monitoring Dashboard encountered an unexpected error. 
              This could be due to a network issue or a problem with the application.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development Mode)</summary>
                <div className="error-stack">
                  <h4>Error:</h4>
                  <pre>{this.state.error.toString()}</pre>
                  
                  <h4>Component Stack:</h4>
                  <pre>{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
            
            <div className="error-actions">
              <button 
                className="error-btn primary"
                onClick={this.handleReload}
              >
                🔄 Reload Page
              </button>
              <button 
                className="error-btn secondary"
                onClick={this.handleReset}
              >
                ↩️ Try Again
              </button>
            </div>
            
            <div className="error-help">
              <p>If this problem persists:</p>
              <ul>
                <li>Check your internet connection</li>
                <li>Ensure the Flask backend server is running on port 5000</li>
                <li>Try refreshing your browser</li>
                <li>Clear your browser cache</li>
              </ul>
            </div>
          </div>
          
          <style jsx>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 2rem;
            }
            
            .error-boundary-content {
              background: white;
              padding: 3rem;
              border-radius: 12px;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
              max-width: 600px;
              width: 100%;
              text-align: center;
            }
            
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            
            .error-boundary-content h2 {
              color: #dc2626;
              margin-bottom: 1rem;
              font-size: 1.75rem;
            }
            
            .error-boundary-content p {
              color: #6b7280;
              margin-bottom: 2rem;
              line-height: 1.6;
            }
            
            .error-details {
              text-align: left;
              margin: 2rem 0;
              padding: 1rem;
              background: #f9fafb;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              color: #374151;
              margin-bottom: 1rem;
            }
            
            .error-stack {
              font-size: 0.875rem;
            }
            
            .error-stack h4 {
              color: #374151;
              margin: 1rem 0 0.5rem 0;
            }
            
            .error-stack pre {
              background: #1f2937;
              color: #f9fafb;
              padding: 1rem;
              border-radius: 6px;
              overflow-x: auto;
              font-size: 0.75rem;
              line-height: 1.4;
            }
            
            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              margin-bottom: 2rem;
              flex-wrap: wrap;
            }
            
            .error-btn {
              padding: 0.75rem 1.5rem;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              min-width: 140px;
            }
            
            .error-btn.primary {
              background: #dc2626;
              color: white;
            }
            
            .error-btn.primary:hover {
              background: #b91c1c;
              transform: translateY(-1px);
            }
            
            .error-btn.secondary {
              background: #f3f4f6;
              color: #374151;
              border: 1px solid #d1d5db;
            }
            
            .error-btn.secondary:hover {
              background: #e5e7eb;
              transform: translateY(-1px);
            }
            
            .error-help {
              text-align: left;
              background: #fef3c7;
              padding: 1.5rem;
              border-radius: 8px;
              border-left: 4px solid #f59e0b;
            }
            
            .error-help p {
              margin: 0 0 1rem 0;
              font-weight: 600;
              color: #92400e;
            }
            
            .error-help ul {
              margin: 0;
              color: #78350f;
              line-height: 1.6;
            }
            
            .error-help li {
              margin-bottom: 0.5rem;
            }
            
            @media (max-width: 768px) {
              .error-boundary {
                padding: 1rem;
              }
              
              .error-boundary-content {
                padding: 2rem 1.5rem;
              }
              
              .error-actions {
                flex-direction: column;
                align-items: stretch;
              }
              
              .error-btn {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
