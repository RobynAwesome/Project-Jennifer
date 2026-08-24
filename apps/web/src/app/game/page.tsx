import dynamic from "next/dynamic";
import Link from "next/link";

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
    <main className="relative bg-jennifer-dark">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex justify-end p-3 sm:p-4">
        <Link
          href="/game/consequences"
          className="pointer-events-auto rounded-full border border-jennifer-primary/40 bg-black/75 px-3 py-2 font-mono text-[11px] font-semibold text-jennifer-primary shadow-lg shadow-black/30 backdrop-blur transition-colors hover:bg-jennifer-primary/10 focus:outline-none focus:ring-2 focus:ring-jennifer-primary/70"
          data-consequence-journal-entry="true"
        >
          Consequence journal →
        </Link>
      </div>
      <PhaserCanvas />
    </main>
  );
}
