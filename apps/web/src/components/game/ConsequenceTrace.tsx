import type {
  ConsequenceRevealBelief,
  ConsequenceRevealEvidenceGroups,
  ConsequenceRevealInterpretationSnapshot,
  ConsequenceRevealReceipt,
  ConsequenceRevealState,
} from "@jennifer/shared";

export type ConsequenceTraceSource =
  | {
      mode: "demo";
      label: string;
    }
  | {
      mode: "authoritative";
      label: string;
    };

export type ConsequenceTraceProps = {
  receipt: ConsequenceRevealReceipt;
  source: ConsequenceTraceSource;
};

const STATE_COPY: Record<
  ConsequenceRevealState,
  { title: string; explanation: string }
> = {
  LATENT: {
    title: "Something is still unresolved",
    explanation:
      "Jennifer is preserving the consequence receipt, but the effect and cause are not player-visible yet.",
  },
  EFFECT_VISIBLE: {
    title: "You can feel the consequence",
    explanation:
      "The effect is visible now. Its causal receipt is still intentionally withheld until the reveal condition matures.",
  },
  CAUSE_PARTIAL: {
    title: "Part of the cause is visible",
    explanation:
      "You can inspect the actor-observed event evidence, but Jennifer is not exposing the complete causal chain yet.",
  },
  CAUSE_REVEALED: {
    title: "The causal chain is inspectable",
    explanation:
      "The original event evidence, governed rule and maturity evidence are now available without converting the NPC interpretation into objective truth.",
  },
  REVISED: {
    title: "The interpretation changed with new evidence",
    explanation:
      "Jennifer preserved the original interpretation and appended a later revision instead of rewriting history.",
  },
};

const EVIDENCE_GROUP_COPY: Array<{
  key: keyof ConsequenceRevealEvidenceGroups;
  title: string;
  explanation: string;
}> = [
  {
    key: "event",
    title: "What the NPC actually observed",
    explanation: "Receipted event evidence that entered this actor's view.",
  },
  {
    key: "policy",
    title: "What rule allowed the consequence",
    explanation: "Governed rule evidence attached before the consequence was admitted.",
  },
  {
    key: "maturity",
    title: "Why the consequence appeared now",
    explanation: "Evidence that the delayed consequence reached its reveal condition.",
  },
  {
    key: "revision",
    title: "What changed later",
    explanation: "New actor-observed evidence appended after the original interpretation.",
  },
];

function humanizeToken(value: string): string {
  return value
    .replace(/[._:-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function beliefLabel(belief: ConsequenceRevealBelief | undefined): string {
  if (!belief) return "No collapsed belief";
  return humanizeToken(belief);
}

function percent(value: number): string {
  return `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;
}

function compactEvidenceRef(ref: string): string {
  const pieces = ref.split(":").filter(Boolean);
  if (pieces.length <= 2) return ref;
  return pieces.slice(-2).join(" · ");
}

export default function ConsequenceTrace({
  receipt,
  source,
}: ConsequenceTraceProps) {
  if (source.mode === "authoritative" && !receipt.runtimeAdmission) {
    throw new Error(
      "An authoritative player-facing consequence trace requires runtime admission evidence.",
    );
  }

  const stateCopy = STATE_COPY[receipt.state];
  const firstInterpretation = receipt.interpretationHistory[0];
  const latestInterpretation = receipt.interpretationHistory.at(-1);

  return (
    <article
      className="overflow-hidden rounded-2xl border border-white/10 bg-black/55 shadow-2xl shadow-black/30 backdrop-blur"
      data-consequence-reveal-id={receipt.revealId}
      data-consequence-reveal-state={receipt.state}
      data-consequence-source={source.mode}
      data-consequence-canonical={String(receipt.canonical)}
    >
      <header className="border-b border-white/10 px-4 py-5 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-jennifer-primary/40 bg-jennifer-primary/10 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-jennifer-primary">
                Consequence Journal
              </span>
              <span
                className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  source.mode === "authoritative"
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                    : "border-amber-400/30 bg-amber-400/10 text-amber-100"
                }`}
                data-consequence-authority-badge={source.mode}
              >
                {source.mode === "authoritative" ? "Governed read" : "POC fixture"}
              </span>
            </div>

            <h1 className="mt-4 text-balance text-2xl font-bold text-white sm:text-3xl">
              {stateCopy.title}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-400 sm:text-base">
              {stateCopy.explanation}
            </p>
          </div>

          <div className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-left sm:text-right">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
              State
            </p>
            <p className="mt-1 font-mono text-xs font-semibold text-gray-200">
              {receipt.state}
            </p>
          </div>
        </div>

        {source.mode === "demo" ? (
          <div
            className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-sm leading-5 text-amber-100"
            role="note"
            data-consequence-demo-warning="true"
          >
            <strong>{source.label}.</strong> This trace demonstrates the governed UI
            contract only. It is not live Jennifer world state and does not claim a
            persisted consequence happened to the current player.
          </div>
        ) : (
          <p className="mt-4 font-mono text-xs text-emerald-200">
            {source.label}
          </p>
        )}
      </header>

      <div className="space-y-5 p-4 sm:p-6">
        <section
          className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
          aria-labelledby="consequence-effect-heading"
        >
          <p
            id="consequence-effect-heading"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500"
          >
            Experienced effect
          </p>
          {receipt.effect ? (
            <p className="mt-2 text-lg font-semibold text-white">
              {humanizeToken(receipt.effect)}
            </p>
          ) : (
            <p className="mt-2 text-sm leading-6 text-gray-400">
              The effect is still hidden at this reveal state.
            </p>
          )}
        </section>

        {receipt.interpretationHistory.length > 0 ? (
          <section
            className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
            aria-labelledby="npc-interpretation-heading"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p
                  id="npc-interpretation-heading"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500"
                >
                  NPC interpretation history
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">
                  Belief is not world truth
                </h2>
              </div>
              <p className="font-mono text-xs text-gray-500">
                {receipt.interpretationHistory.length} receipted view
                {receipt.interpretationHistory.length === 1 ? "" : "s"}
              </p>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {receipt.interpretationHistory.map((interpretation, index) => (
                <InterpretationCard
                  key={`${interpretation.sourceReceiptId}-${index}`}
                  interpretation={interpretation}
                  label={index === 0 ? "Original view" : `Revision ${index}`}
                  isLatest={interpretation === latestInterpretation}
                />
              ))}
            </div>

            {receipt.state === "REVISED" && firstInterpretation && latestInterpretation ? (
              <p className="mt-4 rounded-lg border border-jennifer-accent/20 bg-jennifer-accent/10 p-3 text-sm leading-6 text-gray-200">
                The later view did not erase the original. New evidence widened the
                actor&apos;s knowledge from {firstInterpretation.observedFactIds.length} to{" "}
                {latestInterpretation.observedFactIds.length} observed fact
                {latestInterpretation.observedFactIds.length === 1 ? "" : "s"}.
              </p>
            ) : null}
          </section>
        ) : null}

        <section aria-labelledby="causal-evidence-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p
                id="causal-evidence-heading"
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-500"
              >
                Causal receipt
              </p>
              <h2 className="mt-1 text-lg font-semibold text-white">
                What Jennifer can actually show
              </h2>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-gray-600">
              evidence refs · not retrospective prose
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {EVIDENCE_GROUP_COPY.map((group) => {
              const refs = receipt.disclosedEvidence[group.key];
              return (
                <EvidenceGroup
                  key={group.key}
                  title={group.title}
                  explanation={group.explanation}
                  refs={refs}
                  group={group.key}
                />
              );
            })}
          </div>
        </section>

        {receipt.revisions.length > 0 ? (
          <section
            className="rounded-xl border border-jennifer-primary/25 bg-jennifer-primary/[0.06] p-4"
            aria-labelledby="revision-chain-heading"
          >
            <p
              id="revision-chain-heading"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-jennifer-primary"
            >
              Revision chain
            </p>
            <div className="mt-3 space-y-3">
              {receipt.revisions.map((revision, index) => (
                <div
                  key={revision.revisionId}
                  className="rounded-lg border border-white/10 bg-black/20 p-3"
                  data-consequence-revision-id={revision.revisionId}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-white">
                      Revision {index + 1}: {beliefLabel(revision.interpretation.belief)}
                    </p>
                    <p className="font-mono text-[10px] text-gray-500">
                      confidence {percent(revision.interpretation.confidence)}
                    </p>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-gray-400">
                    Added {revision.addedEvidenceRefs.length} new evidence reference
                    {revision.addedEvidenceRefs.length === 1 ? "" : "s"}; prior history
                    remains preserved.
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <footer className="border-t border-white/10 pt-4">
          <dl className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <ReceiptField label="Event" value={receipt.origin.eventId} />
            <ReceiptField label="Actor" value={receipt.origin.actorId} />
            <ReceiptField label="Rule" value={receipt.origin.consequenceRuleId} />
            <ReceiptField
              label="Runtime receipt"
              value={receipt.runtimeAdmission?.memoryReceiptId ?? "not player-visible yet"}
            />
          </dl>
          <p className="mt-4 text-xs leading-5 text-gray-500">
            This journal makes causality inspectable. It does not prove that every
            consequence is fair, fun, or correctly understood by a human player.
          </p>
        </footer>
      </div>
    </article>
  );
}

function InterpretationCard({
  interpretation,
  label,
  isLatest,
}: {
  interpretation: Readonly<ConsequenceRevealInterpretationSnapshot>;
  label: string;
  isLatest: boolean;
}) {
  return (
    <article
      className={`rounded-xl border p-3 ${
        isLatest
          ? "border-jennifer-primary/30 bg-jennifer-primary/[0.07]"
          : "border-white/10 bg-black/20"
      }`}
      data-interpretation-source={interpretation.sourceReceiptId}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-gray-500">
          {label}
        </p>
        {isLatest ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-jennifer-primary">
            latest
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-base font-semibold text-white">
        {beliefLabel(interpretation.belief)}
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-gray-500">Disposition</p>
          <p className="mt-1 font-mono text-gray-200">
            {interpretation.disposition}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Confidence</p>
          <p className="mt-1 font-mono text-gray-200">
            {percent(interpretation.confidence)}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Observed</p>
          <p className="mt-1 font-mono text-gray-200">
            {interpretation.observedFactIds.length}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Still unknown</p>
          <p className="mt-1 font-mono text-gray-200">
            {interpretation.unknownFactIds.length}
          </p>
        </div>
      </div>
    </article>
  );
}

function EvidenceGroup({
  title,
  explanation,
  refs,
  group,
}: {
  title: string;
  explanation: string;
  refs: readonly string[];
  group: keyof ConsequenceRevealEvidenceGroups;
}) {
  return (
    <article
      className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
      data-consequence-evidence-group={group}
      data-evidence-count={refs.length}
    >
      <h3 className="text-sm font-semibold text-gray-100">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-gray-500">{explanation}</p>
      {refs.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {refs.map((ref) => (
            <li
              key={ref}
              className="rounded-lg border border-white/10 bg-black/25 px-3 py-2"
              title={ref}
            >
              <p className="text-xs font-medium text-gray-200">
                {compactEvidenceRef(ref)}
              </p>
              <p className="mt-1 break-all font-mono text-[10px] leading-4 text-gray-600">
                {ref}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-white/10 px-3 py-3 text-xs text-gray-600">
          Not disclosed at this reveal state.
        </p>
      )}
    </article>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-wider text-gray-600">
        {label}
      </dt>
      <dd className="mt-1 break-all font-mono text-[11px] leading-4 text-gray-400">
        {value}
      </dd>
    </div>
  );
}
