import { createHash } from "node:crypto";

import type {
  FOCGroupDefinition,
  VOCParseResult,
  VOCParserInput,
  VOCRegistry,
} from "./VOCRegistry.js";

const DEFAULT_AUTHORITY = "Kopano-Labs/Introduction-to-MCP";
const DEFAULT_INDEX_PATH = "poc-vs-foc/INDEX.md";
const DEFAULT_CLASSIFICATION_PATH = "poc-vs-foc/FOC_CLASSIFICATION_INDEX.md";
const DEFAULT_MANIFEST_PATH = "poc-vs-foc/VOC_MANIFEST.md";

export class VOCRegistryParser {
  parse(input: VOCParserInput): VOCParseResult {
    const manifestMarkdown = input.manifestMarkdown ?? "";
    const combined = `${input.indexMarkdown}\n${manifestMarkdown}`;

    if (!/Proof\s+of\s+Concept/i.test(combined)) {
      throw new Error("VOC source does not expose the POC / Proof of Concept branch.");
    }

    const groups = this.parseFOCGroups(input.classificationMarkdown);
    if (groups.length === 0) {
      throw new Error("VOC source does not expose any parseable FOC-G## groups.");
    }

    const authorityOrigin = input.authorityOrigin ?? DEFAULT_AUTHORITY;
    const source: VOCRegistry["source"] = {
      authorityOrigin,
      sourceRef: input.sourceRef,
      indexPath: input.indexPath ?? DEFAULT_INDEX_PATH,
      classificationPath: input.classificationPath ?? DEFAULT_CLASSIFICATION_PATH,
    };

    if (input.manifestMarkdown !== undefined) {
      source.manifestPath = input.manifestPath ?? DEFAULT_MANIFEST_PATH;
    }

    const registry: VOCRegistry = {
      parentFramework: "VOC",
      poc: {
        id: "POC",
        label: "Proof of Concept",
        groupCount: this.parsePOCGroupCount(manifestMarkdown),
      },
      foc: {
        id: "FOC",
        labels: this.parseFOCLabels(combined),
        emergent: /emergent,?\s+not\s+predefined/i.test(input.classificationMarkdown),
        severeBreachCode: this.parseSevereBreachCode(input.classificationMarkdown),
        groups,
      },
      source,
    };

    return {
      registry,
      receipt: {
        parser: "VOCRegistryParser",
        sourceAuthority: authorityOrigin,
        sourceRef: input.sourceRef,
        sourceHashes: {
          indexSha256: this.sha256(input.indexMarkdown),
          classificationSha256: this.sha256(input.classificationMarkdown),
          manifestSha256:
            input.manifestMarkdown === undefined ? null : this.sha256(input.manifestMarkdown),
        },
        pocParsed: true,
        focGroupsParsed: groups.length,
        promotionStatus: "evidence-only",
      },
    };
  }

  matchFOCGroups(signal: string, registry: VOCRegistry): FOCGroupDefinition[] {
    const normalizedSignal = this.normalize(signal);

    return registry.foc.groups.filter((group) => {
      const candidates = [group.groupId, group.designation, group.detectionMechanism]
        .map((value) => this.normalize(value))
        .filter((value) => value.length > 0);

      return candidates.some((candidate) => normalizedSignal.includes(candidate));
    });
  }

  private parseFOCGroups(markdown: string): FOCGroupDefinition[] {
    const groups: FOCGroupDefinition[] = [];

    for (const rawLine of markdown.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line.startsWith("|")) {
        continue;
      }

      const cells = line
        .split("|")
        .slice(1, -1)
        .map((cell) => this.cleanMarkdown(cell));

      if (cells.length < 4) {
        continue;
      }

      const [groupId, designation, detectionMechanism, defensiveLoop] = cells;
      if (
        groupId === undefined ||
        designation === undefined ||
        detectionMechanism === undefined ||
        defensiveLoop === undefined ||
        !/^FOC-G\d+$/i.test(groupId)
      ) {
        continue;
      }

      groups.push({
        groupId: groupId.toUpperCase(),
        designation,
        detectionMechanism,
        defensiveLoop,
      });
    }

    return groups;
  }

  private parsePOCGroupCount(manifestMarkdown: string): number | null {
    const match = manifestMarkdown.match(/\(\s*(\d+)\s+group\s*\)/i);
    if (match?.[1] === undefined) {
      return null;
    }

    return Number.parseInt(match[1], 10);
  }

  private parseFOCLabels(source: string): string[] {
    const labels = new Set<string>();
    const normalized = source.replace(/\s+/g, " ");

    if (/Failure of Concept/i.test(normalized) || /Failure of\s*\/\s*Freedom of Concept/i.test(normalized)) {
      labels.add("Failure of Concept");
    }

    if (/Freedom of Concept/i.test(normalized)) {
      labels.add("Freedom of Concept");
    }

    return [...labels];
  }

  private parseSevereBreachCode(markdown: string): string | null {
    const match = markdown.match(/`(FOC_[A-Z0-9_]+)`/);
    return match?.[1] ?? null;
  }

  private cleanMarkdown(value: string): string {
    return value
      .trim()
      .replace(/\*\*/g, "")
      .replace(/`/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalize(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  private sha256(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
  }
}
