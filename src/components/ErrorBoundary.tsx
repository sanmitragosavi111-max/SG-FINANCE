import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    console.error('SG FINANCE application error:', error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A1628] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-white/15 bg-[#102038] p-8">
            <p className="text-xs tracking-[0.18em] text-[#D4AF5A] font-medium mb-3">
              SG FINANCE
            </p>
            <h1 className="font-display text-2xl font-semibold mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              An unexpected display issue occurred. Please reload the page to continue browsing SG FINANCE.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 text-sm font-medium bg-[#B89347] text-[#070E1A] hover:bg-[#D4AF5A] transition-colors cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
