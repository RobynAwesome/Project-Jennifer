import Link from "next/link";

export const dynamic = "force-dynamic";

type RelationshipLookupPageProps = {
  searchParams?: {
    relationshipId?: string | string[];
  };
};

export default function RelationshipLookupPage({
  searchParams,
}: RelationshipLookupPageProps) {
  const rawRelationshipId = searchParams?.relationshipId;
  const relationshipId = Array.isArray(rawRelationshipId)
    ? rawRelationshipId[0]?.trim()
    : rawRelationshipId?.trim();

  return (
    <main className="min-h-screen city-grid px-4 py-10 text-gray-100 sm:px-6">
      <div className="mx-auto max-w-2xl rounded-xl border border-jennifer-primary/40 bg-black/50 p-6 backdrop-blur">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-jennifer-primary">
          Persistence Evidence Gateway
        </p>
        <h1 className="mt-2 text-2xl font-bold">Open a governed relationship</h1>
        <p className="mt-3 text-sm leading-6 text-gray-400">
          Enter a canonical relationship ID. Jennifer will read the current
          authoritative snapshot and adaptive projection through the governed API;
          this page does not use fixture relationship state.
        </p>

        <form method="get" className="mt-6 space-y-3">
          <label
            htmlFor="relationshipId"
            className="block font-mono text-xs uppercase tracking-wider text-gray-400"
          >
            Relationship ID
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="relationshipId"
              name="relationshipId"
              defaultValue={relationshipId}
              required
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-white/15 bg-black/60 px-3 py-2 font-mono text-sm text-white outline-none focus:border-jennifer-primary"
              placeholder="relationship UUID / canonical ID"
            />
            <button
              type="submit"
              className="rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-4 py-2 font-mono text-sm font-semibold text-jennifer-primary hover:bg-jennifer-primary/30"
            >
              Resolve
            </button>
          </div>
        </form>

        {relationshipId ? (
          <div className="mt-5 rounded-lg border border-jennifer-primary/30 bg-jennifer-primary/10 p-4">
            <p className="break-all font-mono text-xs text-gray-300">
              {relationshipId}
            </p>
            <Link
              href={`/relationships/${encodeURIComponent(relationshipId)}`}
              className="mt-3 inline-block font-mono text-sm font-semibold text-jennifer-primary underline decoration-jennifer-primary/40 underline-offset-4"
            >
              Open persisted evidence →
            </Link>
          </div>
        ) : null}

        <Link
          href="/"
          className="mt-6 inline-block font-mono text-xs text-gray-500 hover:text-gray-300"
        >
          ← Jennifer City
        </Link>
      </div>
    </main>
  );
}
