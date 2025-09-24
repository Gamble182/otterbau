"use client";

import { Component, ReactNode, ErrorInfo } from "react";
import { Card } from "@/components/ui/Card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  private handleFullReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="max-w-2xl mx-auto mt-8">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-[var(--coral-red)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                Oops! Ein Fehler ist aufgetreten
              </h2>
              <p className="text-[var(--text-secondary)]">
                Es tut uns leid, aber etwas ist schiefgelaufen. Versuche es bitte erneut.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left text-sm">
                <summary className="cursor-pointer text-[var(--text-tertiary)] mb-2">
                  Fehlerdetails anzeigen
                </summary>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-lg space-y-2">
                  <div>
                    <strong className="text-[var(--coral-red)]">Error:</strong>
                    <pre className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong className="text-[var(--coral-red)]">Stack:</strong>
                      <pre className="text-xs text-[var(--text-secondary)] mt-1 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Komponente neu laden
              </button>
              <button
                onClick={this.handleFullReload}
                className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-xl font-medium hover:bg-[var(--bg-tertiary)] transition-colors border border-[var(--border-subtle)]"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook-based wrapper for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// Lightweight error boundary for charts
export function ChartErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="h-full flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[var(--coral-red)]/10 to-[var(--deep-red)]/10 border border-[var(--coral-red)]/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-[var(--coral-red)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-[var(--text-secondary)] font-medium">
                Chart konnte nicht geladen werden
              </p>
              <p className="text-[var(--text-tertiary)] text-sm mt-1">
                Daten werden möglicherweise noch geladen
              </p>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}