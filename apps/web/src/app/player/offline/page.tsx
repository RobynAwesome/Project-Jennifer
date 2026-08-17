import Link from "next/link";

export default function PlayerOfflinePage() {
  return (
    <main className="min-h-[100dvh] bg-[#060912] text-white grid place-items-center p-6">
      <section className="w-full max-w-xl rounded-2xl border border-cyan-300/20 bg-slate-950/80 p-6 font-mono shadow-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Kopano Adaptive Player</p>
        <h1 className="mt-3 text-2xl font-bold">Offline shell active</h1>
        <p className="mt-4 text-sm leading-6 text-slate-300">
          The installable player shell is available, but Jennifer will not invent authoritative state while the governed API is unreachable.
        </p>
        <div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-5 text-amber-100">
          Consequential actions remain pending until connectivity returns and the Jennifer authority boundary can validate and receipt them.
        </div>
        <Link href="/player" className="mt-6 inline-flex rounded-lg border border-cyan-300/30 px-4 py-2 text-sm text-cyan-200 hover:bg-cyan-300/10">
          Retry player
        </Link>
      </section>
    </main>
  );
}
