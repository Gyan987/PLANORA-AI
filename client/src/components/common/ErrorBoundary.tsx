import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Planora ErrorBoundary caught an unhandled error:', error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="flex min-h-[400px] w-full flex-col items-center justify-center p-8 text-center"
        >
          <div className="rounded-3xl border border-rose-200 bg-rose-50/90 p-8 shadow-soft-lg dark:border-rose-900/60 dark:bg-rose-950/40 max-w-lg w-full">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-soft-md shadow-rose-500/20 mb-4">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Planora AI encountered an unexpected rendering error. Your event planning data is safely saved in local storage.
            </p>

            {this.state.error && (
              <div className="mt-4 rounded-xl bg-slate-900/90 p-3 text-left font-mono text-[11px] text-rose-300 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>

              <a
                href="/"
                className="flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
