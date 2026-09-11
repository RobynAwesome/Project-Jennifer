import type {
  ConsequenceRevealReceipt,
  ConsequenceRevealState,
} from "@jennifer/shared";
import type { EpistemicDivergenceReceipt } from "@jennifer/npc";

import {
  NPCConsequenceRevealEngine,
  type ConsequenceRevealSource,
} from "./npc-consequence-reveal.js";
import type { IConsequenceRevealJournal } from "./consequence-reveal-journal.js";

/**
 * Persistence membrane for player-safe consequence reveals.
 *
 * The reveal engine still derives state exclusively from governed epistemic
 * and runtime receipts. This service only appends that redacted projection to
 * the reveal journal so a later player read can recover it by revealId.
 */
export class PersistedNPCConsequenceRevealService {
  constructor(
    private readonly engine: NPCConsequenceRevealEngine,
    private readonly journal: IConsequenceRevealJournal,
  ) {}

  async create(source: ConsequenceRevealSource): Promise<ConsequenceRevealReceipt> {
    const receipt = this.engine.create(source);
    await this.journal.append(receipt);
    return receipt;
  }

  async advance(
    revealId: string,
    source: ConsequenceRevealSource,
    nextState: Exclude<ConsequenceRevealState, "REVISED" | "LATENT">,
  ): Promise<ConsequenceRevealReceipt> {
    const current = await this.requireLatest(revealId);
    const receipt = await this.engine.advance(current, source, nextState);
    await this.journal.append(receipt);
    return receipt;
  }

  async inspect(revealId: string): Promise<ConsequenceRevealReceipt> {
    const current = await this.requireLatest(revealId);
    return this.engine.inspect(current);
  }

  async revise(
    revealId: string,
    source: ConsequenceRevealSource,
    revisedEpistemicReceipt: EpistemicDivergenceReceipt,
  ): Promise<ConsequenceRevealReceipt> {
    const current = await this.requireLatest(revealId);
    const receipt = await this.engine.revise(
      current,
      source,
      revisedEpistemicReceipt,
    );
    await this.journal.append(receipt);
    return receipt;
  }

  async read(revealId: string): Promise<ConsequenceRevealReceipt | undefined> {
    return (await this.journal.getLatest(revealId))?.receipt;
  }

  private async requireLatest(revealId: string): Promise<ConsequenceRevealReceipt> {
    const current = await this.read(revealId);
    if (!current) {
      throw new Error(`Consequence reveal not found: ${revealId}`);
    }
    return current;
  }
}
