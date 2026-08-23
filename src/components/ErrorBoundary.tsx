import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Heart } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('LoveFable ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-rose-50 via-pink-50 to-white flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-pink-100 p-8 text-center space-y-5">
            <div className="w-16 h-16 mx-auto bg-rose-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-rose-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-800 font-quicksand">
                Something went wrong
              </h2>
              <p className="text-sm text-slate-500">
                LoveFable encountered an unexpected error. Your saved stories and bookmarks are safe.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left">
                <p className="text-[11px] font-mono text-slate-500 break-all line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Heart className="w-3 h-3 text-pink-400 fill-pink-400" />
              <span>LoveFable AI</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
