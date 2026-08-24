import Link from "next/link";

import ConsequenceTrace from "@/components/game/ConsequenceTrace";
import { CONSEQUENCE_REVEAL_DEMO } from "@/lib/consequence-reveal-demo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Player-facing POC for delayed-consequence causal legibility.
 *
 * The route deliberately uses a labelled demo fixture until a governed,
 * persisted reveal read-path exists. That keeps the UI testable without
 * pretending fixture state belongs to the current player.
 */
export default function ConsequenceJournalPage() {
  return (
    <main
      className="min-h-screen city-grid px-3 py-5 text-gray-100 sm:px-6 sm:py-8"
      data-consequence-journal="poc"
      data-consequence-data-source="demo"
    >
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        <nav
          className="flex flex-wrap items-center justify-between gap-3"
          aria-label="Consequence journal navigation"
        >
          <Link
            href="/game"
            className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-gray-300 transition-colors hover:border-jennifer-primary/40 hover:text-jennifer-primary"
          >
            ← Back to Jennifer City
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-600">
            #75 · causal legibility POC
          </span>
        </nav>

        <section className="rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-jennifer-primary">
            Jennifer Consequence Journal
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Consequences can stay hidden without becoming arbitrary.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
            This journal is the player-safe side of the divergence engine. When a
            cause becomes revealable, Jennifer shows the receipted chain that was
            already there instead of inventing an explanation after the fact.
          </p>
        </section>

        <ConsequenceTrace
          receipt={CONSEQUENCE_REVEAL_DEMO}
          source={{
            mode: "demo",
            label: "Non-authoritative POC fixture",
          }}
        />
      </div>
    </main>
  );
}
