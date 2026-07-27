import GameRuntime from "@/components/game/GameRuntime";
import HUD from "@/components/hud/HUD";

export default function Home() {
  return (
    <main className="min-h-screen city-grid flex flex-col">
      <HUD />
      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <GameRuntime />
        </div>
      </div>
    </main>
  );
}
