import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BGFutsal App Uncaught Error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('bgfutsal_league_data_v1');
      localStorage.removeItem('bgfutsal_sheet_url_v1');
      localStorage.removeItem('bgfutsal_last_sync_v1');
    } catch {
      // Ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <h1 className="text-lg font-bold text-white">BGFutsal League Portal</h1>
            </div>
            <p className="text-sm text-slate-300">
              An unexpected display issue occurred while initializing the interface.
            </p>
            {this.state.error && (
              <pre className="text-xs font-mono bg-slate-950/80 text-rose-300 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-40 border border-rose-900/40">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                Reset Cache & Reload
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-sm rounded-lg transition-colors cursor-pointer"
              >
                Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
