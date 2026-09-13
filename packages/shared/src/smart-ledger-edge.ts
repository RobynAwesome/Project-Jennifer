/**
 * FEP-POC-003 Smart Ledger edge envelope.
 *
 * Storage law (unchanged):
 * POSTGRESQL = authoritative relational / constitutional record
 * MONGODB    = mutable adaptive projection
 * SQLITE     = offline edge continuity (local observation, not global authority)
 *
 * Live Secure Enclave / Android Keystore proof is a separate hardware receipt.
 */

export const SMART_LEDGER_ENVELOPE_VERSION = 1 as const;

export type SmartLedgerPlatform = "apple" | "android" | "ci-double";

export type SmartLedgerQueueState =
  | "pending"
  | "retrying"
  | "reconciling"
  | "admitted"
  | "conflict"
  | "rejected";

export interface OfflineReceiptEnvelope {
  envelopeVersion: typeof SMART_LEDGER_ENVELOPE_VERSION;
  receiptId: string;
  previousReceiptHash: string | null;
  contentHash: string;
  sequenceNumber: number;
  idempotencyKey: string;
  actorIdentity: string;
  seat: string;
  sessionId: string;
  deviceIdPseudonymous: string;
  platform: SmartLedgerPlatform;
  runtimeVersion: string;
  createdAt: string;
  claimType: string;
  pkaVerdict: string;
  pkaDisposition: string;
  evidenceRefs: readonly string[];
  supersedesReceiptId?: string;
  revertsReceiptId?: string;
  signatureAlgorithm: "hmac-sha256-ci-double";
  signature: string;
  publicKeyId: string;
  payloadCiphertext: string;
  kmecObservationRef: string;
  pkaReceiptRef: string;
  queueState: SmartLedgerQueueState;
}

export class SmartLedgerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SmartLedgerError";
  }
}

export function canonicalEnvelopePayload(
  envelope: Omit<OfflineReceiptEnvelope, "contentHash" | "signature">,
): string {
  return JSON.stringify({
    envelopeVersion: envelope.envelopeVersion,
    receiptId: envelope.receiptId,
    previousReceiptHash: envelope.previousReceiptHash,
    sequenceNumber: envelope.sequenceNumber,
    idempotencyKey: envelope.idempotencyKey,
    actorIdentity: envelope.actorIdentity,
    seat: envelope.seat,
    sessionId: envelope.sessionId,
    deviceIdPseudonymous: envelope.deviceIdPseudonymous,
    platform: envelope.platform,
    runtimeVersion: envelope.runtimeVersion,
    createdAt: envelope.createdAt,
    claimType: envelope.claimType,
    pkaVerdict: envelope.pkaVerdict,
    pkaDisposition: envelope.pkaDisposition,
    evidenceRefs: envelope.evidenceRefs,
    supersedesReceiptId: envelope.supersedesReceiptId ?? null,
    revertsReceiptId: envelope.revertsReceiptId ?? null,
    signatureAlgorithm: envelope.signatureAlgorithm,
    publicKeyId: envelope.publicKeyId,
    payloadCiphertext: envelope.payloadCiphertext,
    kmecObservationRef: envelope.kmecObservationRef,
    pkaReceiptRef: envelope.pkaReceiptRef,
    queueState: envelope.queueState,
  });
}
