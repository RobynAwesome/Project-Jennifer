import { createHash } from "node:crypto";

export type CDPContextSourceKind =
  | "current-turn"
  | "prior-context-window"
  | "governed-memory"
  | "repository"
  | "human-declared"
  | "external-retrieval";

export type CDPContextAuthority =
  | "current-human"
  | "governed-memory"
  | "repository-evidence"
  | "historical-context"
  | "external-evidence"
  | "unknown";

export type CDPContextSignalClass =
  | "FACT"
  | "FEELING"
  | "FANTASY"
  | "PERFORMANCE"
  | "INFERENCE"
  | "UNKNOWN"
  | "PERSONALITY"
  | "PREFERENCE"
  | "BOUNDARY";

export interface CDPContextFragmentInput {
  sourceId: string;
  sourceKind: CDPContextSourceKind;
  authority: CDPContextAuthority;
  privacyLane: string;
  text: string;
  sourceRef?: string;
  observedAt?: string;
}

export interface CDPContextSignal {
  signalId: string;
  sourceId: string;
  sourceKind: CDPContextSourceKind;
  authority: CDPContextAuthority;
  privacyLane: string;
  classification: CDPContextSignalClass;
  text: string;
  currentAuthorityEligible: boolean;
  historical: boolean;
  sourceRef?: string;
}

export interface CDPContextParseReceipt {
  parser: "CDPContextParser";
  statelessRenter: true;
  sourceHashes: Record<string, string>;
  sourceRefs: string[];
  counts: Record<CDPContextSignalClass, number>;
  priorWindowSignals: number;
  unresolvedSignals: number;
  promotionStatus: "evidence-only";
}

export interface CDPContextParseResult {
  signals: CDPContextSignal[];
  receipt: CDPContextParseReceipt;
}

const CLASSES: CDPContextSignalClass[] = [
  "FACT",
  "FEELING",
  "FANTASY",
  "PERFORMANCE",
  "INFERENCE",
  "UNKNOWN",
  "PERSONALITY",
  "PREFERENCE",
  "BOUNDARY",
];

const MARKER = /^(FACT|FEELING|FANTASY|PERFORMANCE|INFERENCE|UNKNOWN|PERSONALITY|PREFERENCE|BOUNDARY)\s*:\s*(.+)$/i;

/**
 * Parses only context explicitly supplied to the runtime. It does not claim
 * access to hidden/off-screen context windows or provider memory.
 */
export class CDPContextParser {
  parse(fragments: CDPContextFragmentInput[]): CDPContextParseResult {
    if (fragments.length === 0) throw new Error("CDP context parser requires at least one supplied context fragment.");

    const signals: CDPContextSignal[] = [];
    const sourceHashes: Record<string, string> = {};
    const sourceRefs = new Set<string>();

    for (const fragment of fragments) {
      if (!fragment.sourceId.trim()) throw new Error("CDP context fragment sourceId is required.");
      sourceHashes[fragment.sourceId] = this.sha256(fragment.text);
      if (fragment.sourceRef) sourceRefs.add(fragment.sourceRef);

      const lines = fragment.text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const [index, line] of lines.entries()) {
        const match = line.match(MARKER);
        const classification = (match?.[1]?.toUpperCase() ?? "UNKNOWN") as CDPContextSignalClass;
        const text = match?.[2]?.trim() ?? line;
        const historical = fragment.sourceKind === "prior-context-window" || fragment.authority === "historical-context";
        const currentAuthorityEligible = this.isCurrentAuthorityEligible(fragment, classification, historical);

        signals.push({
          signalId: `${fragment.sourceId}:${index + 1}`,
          sourceId: fragment.sourceId,
          sourceKind: fragment.sourceKind,
          authority: fragment.authority,
          privacyLane: fragment.privacyLane,
          classification,
          text,
          currentAuthorityEligible,
          historical,
          ...(fragment.sourceRef ? { sourceRef: fragment.sourceRef } : {}),
        });
      }
    }

    const counts = Object.fromEntries(CLASSES.map((classification) => [classification, 0])) as Record<CDPContextSignalClass, number>;
    for (const signal of signals) counts[signal.classification] += 1;

    return {
      signals,
      receipt: {
        parser: "CDPContextParser",
        statelessRenter: true,
        sourceHashes,
        sourceRefs: [...sourceRefs],
        counts,
        priorWindowSignals: signals.filter((signal) => signal.historical).length,
        unresolvedSignals: signals.filter((signal) => signal.classification === "UNKNOWN").length,
        promotionStatus: "evidence-only",
      },
    };
  }

  private isCurrentAuthorityEligible(
    fragment: CDPContextFragmentInput,
    classification: CDPContextSignalClass,
    historical: boolean,
  ): boolean {
    if (historical) return false;
    if (classification === "UNKNOWN" || classification === "FANTASY" || classification === "PERFORMANCE") return false;
    return fragment.authority === "current-human" || fragment.sourceKind === "current-turn" || fragment.sourceKind === "human-declared";
  }

  private sha256(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
  }
}
