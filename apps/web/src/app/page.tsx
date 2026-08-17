import Link from "next/link";
import GameRuntime from "@/components/game/GameRuntime";
import HUD from "@/components/hud/HUD";

export default function Home() {
  return (
    <main className="min-h-screen city-grid flex flex-col">
      <HUD />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Jennifer City – playable vertical slice banner */}
          <div className="rounded-xl border border-jennifer-primary/40 bg-jennifer-primary/10 p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-jennifer-primary font-mono">
                ◆ Jennifer City — Vertical Slice
              </h2>
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Top-down exploration · Persona selection · Live governance validation demo
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/relationships"
                className="rounded-md border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-gray-200 hover:border-jennifer-primary/50 hover:text-jennifer-primary font-mono transition-colors"
              >
                ◇ Persistence Evidence
              </Link>
              <Link
                href="/game"
                className="rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-5 py-2 text-sm font-semibold text-jennifer-primary hover:bg-jennifer-primary/30 font-mono transition-colors"
              >
                ▶ Enter the City
              </Link>
            </div>
          </div>

          <GameRuntime />
        </div>
      </div>
    </main>
  );
}
