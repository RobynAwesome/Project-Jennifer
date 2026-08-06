import { Router } from "express";
import {
  NCMP_PROTOCOL_ID,
  NCMP_PROTOCOL_NAME,
  NCMP_SELF_DECLARATION,
  NCMP_STATES,
  NCMP_VERSION,
} from "@jennifer/shared";

/**
 * Read-only NCMP discovery endpoint.
 *
 * Mutation endpoints are intentionally deferred until NCMP receipts are backed
 * by governed PostgreSQL persistence. Phase 1 exposes the canonical definition
 * without pretending that an in-memory registry is permanent protocol state.
 */
export const ncmpRouter = Router();

ncmpRouter.get("/", (_req, res) => {
  res.json({
    protocol: {
      id: NCMP_PROTOCOL_ID,
      acronym: "NCMP",
      name: NCMP_PROTOCOL_NAME,
      version: NCMP_VERSION,
      definition:
        "Recognition and governance of a new concept that originated inside Multi-Agent Mobile Orchestration.",
    },
    states: NCMP_STATES,
    selfDeclaration: NCMP_SELF_DECLARATION,
    mutationState: "deferred-until-governed-postgresql-persistence",
  });
});
