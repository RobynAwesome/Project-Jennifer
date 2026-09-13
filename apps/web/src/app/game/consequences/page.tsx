"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import ConsequenceTrace from "@/components/game/ConsequenceTrace";
import { ContinuityBridge } from "@/game/bridge/ContinuityBridge";
import { readLocalContinuity } from "@/game/continuity/session-store";
import { CONSEQUENCE_REVEAL_DEMO } from "@/lib/consequence-reveal-demo";
import type { ConsequenceRevealReceipt } from "@jennifer/shared";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Player-facing consequence journal.
 * Prefers current-player continuity reveals; falls back to labelled demo fixture.
 */
export default function ConsequenceJournalPage() {
  const [receipt, setReceipt] = useState<ConsequenceRevealReceipt | null>(null);
  const [sourceMode, setSourceMode] = useState<"authoritative" | "local" | "demo">(
    "demo",
  );
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const local = readLocalContinuity();
      const sid = local?.sessionId;
      if (!sid) {
        if (!cancelled) {
          setReceipt(CONSEQUENCE_REVEAL_DEMO);
          setSourceMode("demo");
        }
        return;
      }
      setSessionId(sid);
      const bridge = new ContinuityBridge();
      const loaded = await bridge.loadReveals(sid);
      const preferred =
        loaded.receipts.find((entry) => entry.revealId === local?.episodeRevealId) ??
        loaded.receipts[loaded.receipts.length - 1];
      if (!cancelled) {
        if (preferred) {
          setReceipt(preferred);
          // Love-loop continuity is local / continuity-store — never claim
          // governed journal authority from the in-memory mirror alone.
          setSourceMode("local");
        } else {
          setReceipt(CONSEQUENCE_REVEAL_DEMO);
          setSourceMode("demo");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const source =
    sourceMode === "demo"
      ? {
          mode: "demo" as const,
          label: "Non-authoritative POC fixture — no current-player continuity found",
        }
      : sourceMode === "authoritative"
        ? {
            mode: "authoritative" as const,
            label: `Current player reveal · session ${sessionId?.slice(0, 8) ?? "…"}`,
          }
        : {
            mode: "local" as const,
            label: `Local continuity reveal · session ${sessionId?.slice(0, 8) ?? "…"}`,
          };

  return (
    <main
      className="min-h-screen city-grid px-3 py-5 text-gray-100 sm:px-6 sm:py-8"
      data-consequence-journal="love-loop"
      data-consequence-data-source={sourceMode}
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
            love loop · causal legibility
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
            When your Third Signal choice matures, Jennifer shows the receipted
            chain that was already there — not an explanation invented after the
            fact. Demo fixtures stay labelled until your session has a reveal.
          </p>
        </section>

        {receipt ? (
          <ConsequenceTrace receipt={receipt} source={source} />
        ) : (
          <p className="font-mono text-sm text-gray-500">Loading reveal…</p>
        )}
      </div>
    </main>
  );
}
