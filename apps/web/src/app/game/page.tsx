import dynamic from "next/dynamic";

/**
 * /game route – hosts the Jennifer City Phaser game.
 *
 * `ssr: false` prevents Next.js from evaluating the Phaser bundle on the
 * server. All game code runs exclusively in the browser.
 */
const PhaserCanvas = dynamic(
  () => import("@/components/phaser/PhaserCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-jennifer-dark">
        <div className="text-center font-mono">
          <div className="mb-4 text-4xl font-bold text-jennifer-primary">J</div>
          <p className="text-sm text-gray-500">Loading Jennifer City…</p>
        </div>
      </div>
    ),
  }
);

export default function GamePage() {
  return (
    <main className="bg-jennifer-dark">
      <PhaserCanvas />
    </main>
  );
}
