import Link from "next/link";
import { notFound } from "next/navigation";

import {
  JenniferApiReadError,
  readJenniferRelationship,
} from "@/lib/jennifer-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type RelationshipEvidencePageProps = {
  params: {
    relationshipId: string;
  };
};

export default async function RelationshipEvidencePage({
  params,
}: RelationshipEvidencePageProps) {
  let readThrough: Awaited<ReturnType<typeof readJenniferRelationship>>;

  try {
    readThrough = await readJenniferRelationship(params.relationshipId);
  } catch (error) {
    if (error instanceof JenniferApiReadError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { snapshot, persistence, apiStatus } = readThrough;
  const { relationship, projection } = snapshot;
  const activeBoundaries = snapshot.boundaries.filter(
    (boundary) => boundary.status === "active",
  );

  return (
    <main
      className="min-h-screen city-grid px-4 py-8 text-gray-100 sm:px-6"
      data-jennifer-readthrough="persisted"
      data-relationship-id={relationship.id}
      data-relationship-version={relationship.version}
      data-authority={persistence.authority}
      data-authority-database={persistence.database}
      data-projection-mode={persistence.projection.mode}
      data-projection-database={persistence.projection.database}
      data-projection-version={projection?.projectionVersion ?? "absent"}
      data-api-status={apiStatus}
    >
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="rounded-xl border border-jennifer-primary/40 bg-black/50 p-5 backdrop-blur">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-jennifer-primary">
                Governed Relationship Evidence
              </p>
              <h1 className="mt-2 break-all text-2xl font-bold sm:text-3xl">
                {relationship.relationshipType}
              </h1>
              <p className="mt-2 font-mono text-xs text-gray-400">
                {relationship.id}
              </p>
            </div>
            <Link
              href="/"
              className="rounded-md border border-jennifer-primary/50 px-3 py-2 font-mono text-xs text-jennifer-primary transition-colors hover:bg-jennifer-primary/10"
            >
              ← Jennifer City
            </Link>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3" aria-label="Persistence receipt">
          <EvidenceCard
            label="Authority"
            value={persistence.authority}
            detail={`${persistence.mode} · ${persistence.database}`}
          />
          <EvidenceCard
            label="Projection"
            value={persistence.projection.mode}
            detail={`${persistence.projection.database} · ${
              persistence.projection.rebuildable ? "rebuildable" : "disposable"
            }`}
          />
          <EvidenceCard
            label="Canonical version"
            value={`v${relationship.version}`}
            detail={`projection ${
              projection ? `v${projection.projectionVersion}` : "absent"
            }`}
          />
        </section>

        <section className="rounded-xl border border-white/10 bg-black/45 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                Authoritative state
              </p>
              <h2 className="mt-1 text-xl font-semibold">
                {relationship.activeLane} · {relationship.status}
              </h2>
            </div>
            <div className="text-right font-mono text-xs text-gray-400">
              <p>{snapshot.events.length} events</p>
              <p>{snapshot.receipts.length} receipts</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-4 sm:grid-cols-2">
            <EvidenceField label="Created by" value={relationship.createdByActorId} />
            <EvidenceField
              label="Updated"
              value={new Date(relationship.updatedAt).toISOString()}
            />
            <EvidenceField
              label="Latest authoritative event"
              value={snapshot.events.at(-1)?.id ?? "none"}
            />
            <EvidenceField
              label="Latest validation receipt"
              value={snapshot.receipts.at(-1)?.id ?? "none"}
            />
          </dl>

          {activeBoundaries.length > 0 ? (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
                Active boundary evidence
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {activeBoundaries.map((boundary) => (
                  <article
                    key={boundary.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                    data-boundary-type={boundary.boundaryType}
                    data-boundary-value={boundary.boundaryValue}
                  >
                    <p className="font-mono text-xs text-jennifer-primary">
                      {boundary.boundaryType}
                    </p>
                    <p className="mt-1 break-words text-sm text-gray-200">
                      {boundary.boundaryValue}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/45 p-5">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-jennifer-primary">
              Participants
            </h2>
            <div className="mt-4 space-y-3">
              {snapshot.actors.map((actor) => {
                const participant = snapshot.participants.find(
                  (candidate) => candidate.actorId === actor.id,
                );
                return (
                  <article
                    key={actor.id}
                    className="rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <p className="font-semibold">{actor.canonicalName}</p>
                    <p className="mt-1 font-mono text-xs text-gray-400">
                      {actor.actorType} · {participant?.role ?? "participant"}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/45 p-5">
            <h2 className="font-mono text-sm font-semibold uppercase tracking-wider text-jennifer-primary">
              Adaptive projection
            </h2>
            {projection ? (
              <div className="mt-4 space-y-4" data-projection-present="true">
                <p className="text-sm leading-6 text-gray-200">
                  {projection.currentSummary}
                </p>
                <dl className="grid gap-3">
                  <EvidenceField
                    label="Projection version"
                    value={`v${projection.projectionVersion}`}
                  />
                  <EvidenceField
                    label="Last authority event"
                    value={projection.lastAuthoritativeEventId}
                  />
                  <EvidenceField
                    label="Active boundaries"
                    value={String(projection.activeBoundaries.length)}
                  />
                </dl>
              </div>
            ) : (
              <div
                className="mt-4 rounded-lg border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100"
                data-projection-present="false"
              >
                Authoritative PostgreSQL state is available, but no adaptive
                projection is currently attached.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function EvidenceCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-white/10 bg-black/45 p-4">
      <p className="font-mono text-xs uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-2 break-words text-lg font-semibold text-jennifer-primary">
        {value}
      </p>
      <p className="mt-1 font-mono text-xs text-gray-400">{detail}</p>
    </article>
  );
}

function EvidenceField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wider text-gray-500">
        {label}
      </dt>
      <dd className="mt-1 break-all text-sm text-gray-200">{value}</dd>
    </div>
  );
}
