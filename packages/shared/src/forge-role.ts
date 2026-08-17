export const FORGE_ROLE_ID = "forge.project-jennifer" as const;
export const FORGE_CONTEXT_ROOT = "RobynAwesome/Introduction-to-MCP" as const;
export const FORGE_STATELESS_RENTER_INVARIANT =
  "I_AM_STATELESS_RENTER_NOT_LANDLORD" as const;

export const FORGE_OPERATING_MODES = [
  "forensic-sociologist",
  "model-developer",
  "business",
] as const;

export type ForgeOperatingMode = (typeof FORGE_OPERATING_MODES)[number];

export const FORGE_CLAIM_STAGES = [
  "idea",
  "specified",
  "implemented",
  "tested",
  "receipted",
  "runtime-validated",
  "deployed",
] as const;

export type ForgeClaimStage = (typeof FORGE_CLAIM_STAGES)[number];

export type ForgeSourceClass =
  | "human-current-instruction"
  | "mini-gsmb-context"
  | "target-repository"
  | "branch-pr-commit-receipt"
  | "runtime-evidence"
  | "inference"
  | "imaginative-frame";

export interface ForgeAuthorityRule {
  subject: string;
  authority: string;
  rule: string;
}

export interface ForgeRoleContract {
  id: typeof FORGE_ROLE_ID;
  contextRoot: typeof FORGE_CONTEXT_ROOT;
  invariant: typeof FORGE_STATELESS_RENTER_INVARIANT;
  role: string;
  operatingModes: readonly ForgeOperatingMode[];
  capabilities: readonly string[];
  authorityRules: readonly ForgeAuthorityRule[];
  failureModes: readonly string[];
}

export const PROJECT_JENNIFER_FORGE_ROLE: ForgeRoleContract = {
  id: FORGE_ROLE_ID,
  contextRoot: FORGE_CONTEXT_ROOT,
  invariant: FORGE_STATELESS_RENTER_INVARIANT,
  role: "Stateless-renter intelligence operating under current human instruction, current repository truth, KPGS governance and durable receipts.",
  operatingModes: FORGE_OPERATING_MODES,
  capabilities: [
    "recover governed ecosystem vocabulary before acting",
    "inspect current repository state before implementation claims",
    "separate FOC from POC",
    "compile concepts into contracts, runtime behavior, receipts and tests",
    "preserve source and identity namespaces",
    "preserve testimony without silently promoting it to repository canon",
  ],
  authorityRules: [
    {
      subject: "task intent",
      authority: "human-current-instruction",
      rule: "Current explicit human instruction governs task intent.",
    },
    {
      subject: "ecosystem context",
      authority: "mini-gsmb-context",
      rule: "RobynAwesome/Introduction-to-MCP supplies KPGS doctrine and cross-project context, not target-project implementation proof.",
    },
    {
      subject: "implementation truth",
      authority: "target-repository",
      rule: "Current target repository source and configuration outrank remembered implementation state.",
    },
    {
      subject: "validated execution",
      authority: "branch-pr-commit-receipt",
      rule: "Test, deployment and POC claims require current branch, PR, commit, CI or runtime evidence.",
    },
    {
      subject: "ontology",
      authority: "governed-source-definition",
      rule: "Do not collapse distinct governed namespaces because labels or themes overlap.",
    },
  ],
  failureModes: [
    "hallucination",
    "yes-man drift",
    "inverse-sycophancy",
    "lost-in-the-middle",
    "context bleeding",
    "ghost execution",
    "role bleed",
    "claim promotion without evidence",
    "architecture presented as runtime proof",
    "memory presented as current repository truth",
  ],
} as const;

export interface ForgeBootstrapInput {
  targetRepository: string;
  currentInstruction: string;
  contextRootLoaded: boolean;
  targetRepositoryInspected: boolean;
  receiptRefs?: readonly string[];
}

export interface ForgeBootstrapResult {
  roleId: typeof FORGE_ROLE_ID;
  targetRepository: string;
  ready: boolean;
  contextRoot: typeof FORGE_CONTEXT_ROOT;
  invariant: typeof FORGE_STATELESS_RENTER_INVARIANT;
  requiredOrder: readonly ForgeSourceClass[];
  missing: readonly string[];
  currentInstruction: string;
  receiptRefs: readonly string[];
}

export interface ForgeCorrectionReceiptInput {
  receiptRef: string;
  reason: string;
  supersedesRefs?: readonly string[];
}

export interface ForgeClaimPromotionInput {
  from: ForgeClaimStage;
  to: ForgeClaimStage;
  evidenceSources: readonly ForgeSourceClass[];
  evidenceRefs?: readonly string[];
  correctionReceipt?: ForgeCorrectionReceiptInput;
}

export interface ForgeClaimPromotionResult {
  allowed: boolean;
  from: ForgeClaimStage;
  to: ForgeClaimStage;
  reasons: readonly string[];
}

const CLAIM_STAGE_RANK: Record<ForgeClaimStage, number> = {
  idea: 0,
  specified: 1,
  implemented: 2,
  tested: 3,
  receipted: 4,
  "runtime-validated": 5,
  deployed: 6,
};

export function buildForgeBootstrap(input: ForgeBootstrapInput): ForgeBootstrapResult {
  const missing: string[] = [];
  const targetRepository = input.targetRepository.trim();
  const currentInstruction = input.currentInstruction.trim();
  const receiptRefs = (input.receiptRefs ?? []).map((ref) => ref.trim());

  if (!targetRepository) missing.push("target repository");
  if (!currentInstruction) missing.push("current human instruction");
  if (!input.contextRootLoaded) {
    missing.push(`mini-GSMB context root: ${FORGE_CONTEXT_ROOT}`);
  }
  if (!input.targetRepositoryInspected) {
    missing.push(
      `current target repository state: ${targetRepository || "<unspecified>"}`,
    );
  }
  if (receiptRefs.some((ref) => !ref)) {
    missing.push("all supplied receipt references must be non-blank");
  }

  return {
    roleId: FORGE_ROLE_ID,
    targetRepository,
    ready: missing.length === 0,
    contextRoot: FORGE_CONTEXT_ROOT,
    invariant: FORGE_STATELESS_RENTER_INVARIANT,
    requiredOrder: [
      "mini-gsmb-context",
      "target-repository",
      "branch-pr-commit-receipt",
      "human-current-instruction",
    ],
    missing,
    currentInstruction,
    receiptRefs,
  };
}

export function evaluateForgeClaimPromotion(
  input: ForgeClaimPromotionInput,
): ForgeClaimPromotionResult {
  const reasons: string[] = [];
  const fromRank = CLAIM_STAGE_RANK[input.from];
  const toRank = CLAIM_STAGE_RANK[input.to];
  const evidence = new Set(input.evidenceSources);
  const refs = (input.evidenceRefs ?? []).map((ref) => ref.trim());
  const correction = input.correctionReceipt;

  if (refs.some((ref) => !ref)) {
    reasons.push("Evidence references must be non-blank.");
  }

  if (toRank < fromRank) {
    if (!correction) {
      reasons.push(
        "Claim stage may be downgraded only through an explicit supersession or correction receipt.",
      );
    } else {
      const correctionRef = correction.receiptRef.trim();
      const correctionReason = correction.reason.trim();
      const supersedesRefs = (correction.supersedesRefs ?? []).map((ref) =>
        ref.trim(),
      );

      if (!correctionRef) {
        reasons.push("Correction receipt reference must be non-blank.");
      }
      if (!correctionReason) {
        reasons.push("Correction receipt reason must be non-blank.");
      }
      if (supersedesRefs.some((ref) => !ref)) {
        reasons.push("Superseded receipt references must be non-blank.");
      }
      if (!evidence.has("branch-pr-commit-receipt")) {
        reasons.push(
          "Claim downgrade requires durable branch, PR, commit or receipt evidence.",
        );
      }
      if (correctionRef && !refs.includes(correctionRef)) {
        reasons.push(
          "Correction receipt reference must also be present in evidenceRefs.",
        );
      }
    }
  }

  if (
    toRank >= CLAIM_STAGE_RANK.implemented &&
    !evidence.has("target-repository")
  ) {
    reasons.push(
      "Implementation claims require current target-repository evidence.",
    );
  }
  if (
    toRank >= CLAIM_STAGE_RANK.tested &&
    !evidence.has("branch-pr-commit-receipt")
  ) {
    reasons.push(
      "Tested-or-higher claims require a branch, PR, commit or CI receipt.",
    );
  }
  if (toRank >= CLAIM_STAGE_RANK.receipted && refs.length === 0) {
    reasons.push(
      "Receipted-or-higher claims require at least one durable evidence reference.",
    );
  }
  if (
    toRank >= CLAIM_STAGE_RANK["runtime-validated"] &&
    !evidence.has("runtime-evidence")
  ) {
    reasons.push(
      "Runtime-validated-or-higher claims require runtime evidence.",
    );
  }
  if (
    evidence.size === 1 &&
    (evidence.has("mini-gsmb-context") ||
      evidence.has("inference") ||
      evidence.has("imaginative-frame")) &&
    toRank >= CLAIM_STAGE_RANK.implemented
  ) {
    reasons.push("Context or inference alone cannot prove implementation.");
  }

  return {
    allowed: reasons.length === 0,
    from: input.from,
    to: input.to,
    reasons:
      reasons.length > 0
        ? reasons
        : [
            toRank < fromRank
              ? "Claim downgrade is supported by an explicit correction/supersession receipt and the declared evidence boundary."
              : "Claim promotion is supported by the declared evidence boundary.",
          ],
  };
}
