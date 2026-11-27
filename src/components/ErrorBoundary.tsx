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
        <div className="min-h-screen bg-[#0B1628] text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full border border-[#B99752]/30 bg-[#101F35] p-8 sm:p-10 space-y-5">
            <div className="flex items-center gap-3">
              <span className="w-6 h-px bg-[#D4BC85]" aria-hidden="true" />
              <p className="text-xs tracking-[0.14em] text-[#D4BC85] font-semibold">
                SG FINANCE
              </p>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl text-white leading-snug">
              Something went wrong.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              An unexpected display issue occurred. Please reload the page to continue browsing SG FINANCE.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 text-sm font-semibold bg-[#B99752] text-[#0B1628] hover:bg-[#D4BC85] transition-colors cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
