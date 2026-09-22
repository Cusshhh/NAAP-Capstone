import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
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
    console.error("Unhandled React Render Error caught by ErrorBoundary:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto text-red-600">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#193153]">Something went wrong</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                An unexpected error occurred while rendering this view. Our team has logged the details.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-slate-700 max-h-32 overflow-y-auto border border-slate-200">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-[#193153] hover:bg-[#12243e] text-white font-bold flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
