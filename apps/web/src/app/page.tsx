import DistrictGrid from "@/components/districts/DistrictGrid";
import HUD from "@/components/hud/HUD";

export default function Home() {
  return (
    <main className="min-h-screen city-grid flex flex-col">
      {/* Top HUD */}
      <HUD />

      {/* Governance City */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-jennifer-primary to-jennifer-accent bg-clip-text text-transparent">
              Project Jennifer
            </h1>
            <p className="mt-2 text-gray-400 text-sm">
              Sovereign Governance Intelligence Runtime · Persistent World Active
            </p>
          </div>

          {/* District Grid */}
          <DistrictGrid />

          {/* System Status */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Governance", status: "Active", color: "text-green-400" },
              { label: "GSMB", status: "Synced", color: "text-blue-400" },
              { label: "Telemetry", status: "Streaming", color: "text-purple-400" },
              { label: "NPC Simulation", status: "Running", color: "text-amber-400" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-jennifer-surface border border-jennifer-border rounded-lg p-4"
              >
                <p className="text-gray-500 text-xs uppercase tracking-wider">
                  {item.label}
                </p>
                <p className={`text-sm font-semibold mt-1 ${item.color}`}>
                  ● {item.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
