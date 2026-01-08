import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A robust Error Boundary component to catch and display runtime errors
 * gracefully instead of showing a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.href = '/';
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-xl">
          <div className="max-w-md w-full text-center space-y-2xl animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-sakura/20 rounded-round flex items-center justify-center mx-auto border-2 border-sakura/30">
              <AlertTriangle className="w-10 h-10 text-rust" />
            </div>

            <div className="space-y-md">
              <h1 className="text-3xl font-serif text-ink-900">Something went wrong</h1>
              <p className="text-ink-500 font-medium leading-relaxed">
                We encountered an unexpected error. Don&apos;t worry, your data is safe in your
                local storage.
              </p>
              {this.state.error && (
                <pre className="mt-lg p-md bg-surface border border-border-subtle rounded-md text-left text-[10px] text-rust font-mono overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-md">
              <Button
                onClick={this.handleReload}
                variant="secondary"
                className="w-full sm:w-auto gap-sm"
              >
                <RefreshCcw className="w-4 h-4" />
                Try Refreshing
              </Button>
              <Button
                onClick={this.handleReset}
                variant="primary"
                className="w-full sm:w-auto gap-sm"
              >
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
