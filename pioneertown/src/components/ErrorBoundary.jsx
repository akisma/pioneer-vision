import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Optional: Send error to logging service
    if (window.analytics) {
      window.analytics.track('MIDI App Error', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-900 text-white">
          <AlertTriangle size={64} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-4 text-center max-w-md">
            The MIDI controller interface encountered an error. This is usually caused by 
            high-frequency MIDI data overwhelming the browser.
          </p>
          <button
            onClick={this.handleReset}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg font-semibold transition-colors"
          >
            Reset Interface
          </button>
          
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 w-full max-w-2xl">
              <summary className="cursor-pointer text-gray-400 hover:text-white">
                Show Error Details (Development)
              </summary>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg text-sm overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error.toString()}
                </div>
                <div className="mb-2">
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs text-gray-300">{this.state.error.stack}</pre>
                </div>
                <div>
                  <strong>Component Stack:</strong>
                  <pre className="mt-1 text-xs text-gray-300">{this.state.errorInfo?.componentStack}</pre>
                </div>
              </div>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
