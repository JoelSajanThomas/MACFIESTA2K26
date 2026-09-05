import React from "react";
import { RiAlertLine, RiRefreshLine, RiHomeLine, RiTerminalBoxLine } from "react-icons/ri";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In dev mode, keep error logged for debugging
    if (import.meta.env.DEV) {
      console.error("[MacFiesta Error Boundary Caught]:", error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  handleHardReset = () => {
    try {
      sessionStorage.clear();
      // Clear non-critical caches while preserving auth if possible
      localStorage.removeItem("macfiesta-get-cache");
    } catch {
      // ignore
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;
      return (
        <div className="min-h-screen w-full bg-[#05050A] text-white flex items-center justify-center p-4 relative overflow-hidden font-space select-none">
          {/* Ambient Glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-marvel-red/15 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-arc-cyan/15 blur-[120px] pointer-events-none" />

          {/* S.H.I.E.L.D. Tactical Container */}
          <div className="relative z-10 max-w-lg w-full rounded-2xl border border-arc-cyan/30 bg-[#0A0D18]/90 backdrop-blur-xl p-6 sm:p-8 text-center shadow-[0_0_40px_rgba(0,212,255,0.15)] space-y-6">
            {/* Header Icon */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-marvel-red/15 border border-marvel-red/40 flex items-center justify-center shadow-[0_0_20px_rgba(237,29,36,0.3)]">
              <RiAlertLine className="text-3xl sm:text-4xl text-marvel-red animate-pulse" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-arc-cyan/30 bg-arc-cyan/10 text-arc-cyan text-[10px] font-bold tracking-[0.2em] uppercase">
                <span className="w-2 h-2 rounded-full bg-arc-cyan animate-ping" />
                <span>S.H.I.E.L.D. PROTOCOL ENGAGED</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white font-orbitron">
                TELEMETRY ANOMALY
              </h2>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed max-w-sm mx-auto">
                A multiverse disturbance interrupted this view. S.H.I.E.L.D. safety protocols prevented a system crash.
              </p>
            </div>

            {/* Dev Diagnostics (Only in development) */}
            {isDev && this.state.error && (
              <details className="text-left bg-black/60 border border-white/10 rounded-lg p-3 text-[11px] text-white/60 overflow-hidden">
                <summary className="cursor-pointer font-mono text-arc-cyan hover:text-white flex items-center gap-1">
                  <RiTerminalBoxLine /> Diagnostic Trace
                </summary>
                <div className="mt-2 font-mono whitespace-pre-wrap break-all max-h-36 overflow-y-auto text-marvel-red/90 select-text">
                  {this.state.error?.toString()}
                  {this.state.errorInfo?.componentStack}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-arc-cyan hover:bg-[#33ddff] text-black font-black uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,212,255,0.35)] cursor-pointer"
              >
                <RiRefreshLine className="text-sm" />
                <span>Reload Mission</span>
              </button>
              <button
                type="button"
                onClick={this.handleHome}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase text-xs tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <RiHomeLine className="text-sm" />
                <span>Headquarters</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
