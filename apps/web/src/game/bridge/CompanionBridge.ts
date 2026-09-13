import type {
  CompanionDefinition,
  CompanionId,
  CompanionRelationshipLane,
  CompanionRenderMode,
  CompanionValidationReceipt,
} from "@jennifer/shared";
import { readGameApiBaseUrl } from "./WorldBridge";

export type CompanionSelectSourceMode =
  | "authoritative"
  | "local-fallback"
  | "unreachable";

export interface CompanionSelectResult {
  sourceMode: CompanionSelectSourceMode;
  selection?: {
    companionId: CompanionId;
    relationshipLane: CompanionRelationshipLane;
    renderMode: CompanionRenderMode;
  };
  companion?: CompanionDefinition;
  receipt: CompanionValidationReceipt;
  summary: string;
}

/**
 * Browser seam to governed companion selection.
 * Local registry may cache the receipt; authority lives on the API when reachable.
 */
export class CompanionBridge {
  constructor(private readonly apiBaseUrl = readGameApiBaseUrl()) {}

  async select(input: {
    userId: string;
    companionId: CompanionId;
    relationshipLane: CompanionRelationshipLane;
    renderMode: CompanionRenderMode;
    localReceipt: CompanionValidationReceipt;
  }): Promise<CompanionSelectResult> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/companions/select`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            userId: input.userId,
            companionId: input.companionId,
            relationshipLane: input.relationshipLane,
            renderMode: input.renderMode,
          }),
        },
      );
      const body = (await response.json()) as {
        receipt?: CompanionValidationReceipt;
        companion?: CompanionDefinition;
        selection?: CompanionSelectResult["selection"];
        error?: string;
      };

      if (!response.ok || !body.receipt) {
        return {
          sourceMode: "local-fallback",
          receipt: input.localReceipt,
          summary:
            body.error ??
            `Companion API returned ${response.status}; using local validation receipt.`,
        };
      }

      return {
        sourceMode: "authoritative",
        selection: body.selection,
        companion: body.companion,
        receipt: body.receipt,
        summary: `Companion linked through runtime authority (${body.receipt.result}).`,
      };
    } catch {
      return {
        sourceMode: "local-fallback",
        receipt: input.localReceipt,
        summary:
          "Jennifer API unreachable. Local companion receipt stored for continuity.",
      };
    }
  }

  async getActive(userId: string): Promise<{
    sourceMode: CompanionSelectSourceMode;
    companionId?: CompanionId;
    companionName?: string;
    lane?: CompanionRelationshipLane;
    receipt?: CompanionValidationReceipt;
  }> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/runtime/companions/active/${encodeURIComponent(userId)}`,
        { headers: { Accept: "application/json" } },
      );
      if (response.status === 404) {
        return { sourceMode: "authoritative" };
      }
      if (!response.ok) {
        return { sourceMode: "unreachable" };
      }
      const body = (await response.json()) as {
        selection?: {
          companionId: CompanionId;
          relationshipLane: CompanionRelationshipLane;
        };
        companion?: { id: CompanionId; name: string };
      };
      const receiptsRes = await fetch(
        `${this.apiBaseUrl}/api/runtime/companions/receipts/${encodeURIComponent(userId)}`,
        { headers: { Accept: "application/json" } },
      );
      const receiptsBody = receiptsRes.ok
        ? ((await receiptsRes.json()) as {
            receipts?: CompanionValidationReceipt[];
          })
        : { receipts: [] };
      const receipt = receiptsBody.receipts?.[receiptsBody.receipts.length - 1];

      return {
        sourceMode: "authoritative",
        companionId: body.selection?.companionId ?? body.companion?.id,
        companionName: body.companion?.name,
        lane: body.selection?.relationshipLane,
        receipt,
      };
    } catch {
      return { sourceMode: "unreachable" };
    }
  }
}
