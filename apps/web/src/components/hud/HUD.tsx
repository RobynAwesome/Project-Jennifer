export default function HUD() {
  return (
    <header className="bg-jennifer-surface border-b border-jennifer-border px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-jennifer-primary to-jennifer-accent flex items-center justify-center text-xs font-bold">
            J
          </div>
          <span className="text-sm font-bold text-white tracking-wide">
            Jennifer Runtime
          </span>
          <span className="text-xs text-gray-500 hidden sm:block">v0.4.0 · APWA POC</span>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-6 text-xs text-gray-400">
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span>Governance Active</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span>GSMB Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>Telemetry</span>
          </div>
        </div>

        {/* Persona badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Persona</span>
          <span className="text-xs bg-jennifer-primary bg-opacity-20 text-jennifer-primary border border-jennifer-primary border-opacity-30 rounded-full px-3 py-1 font-medium">
            Demo Ops
          </span>
        </div>
      </div>
    </header>
  );
}
