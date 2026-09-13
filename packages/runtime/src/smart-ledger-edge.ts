import { createHmac, createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import {
  SmartLedgerError,
  canonicalEnvelopePayload,
  type OfflineReceiptEnvelope,
  type SmartLedgerPlatform,
  type SmartLedgerQueueState,
} from "@jennifer/shared";

export interface PlatformKeyAdapter {
  platform: SmartLedgerPlatform;
  publicKeyId: string;
  encrypt(plaintext: string): string;
  decrypt(ciphertext: string): string;
  sign(contentHash: string): string;
  verify(contentHash: string, signature: string): boolean;
  /** Private material must never appear on an envelope or log. */
  exportPrivateMaterial(): never;
}

export interface ReconciliationReceipt {
  receiptId: string;
  outcome: "admitted" | "duplicate" | "conflict" | "rejected";
  postgresEventId?: string;
  mongoProjectionId?: string;
  reasons: readonly string[];
  hardwareProof: "ci-double-only";
}

/**
 * CI test-double for Apple/Android adapters.
 * Does not claim Secure Enclave or Android Keystore.
 */
export class CiPlatformKeyAdapter implements PlatformKeyAdapter {
  readonly publicKeyId: string;

  constructor(
    readonly platform: SmartLedgerPlatform,
    private readonly hmacSecret: Buffer,
    private readonly aesKey: Buffer,
  ) {
    this.publicKeyId = `ci-double:${platform}:v1`;
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv("aes-256-gcm", this.aesKey, iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, encrypted]).toString("base64");
  }

  decrypt(ciphertext: string): string {
    const raw = Buffer.from(ciphertext, "base64");
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const data = raw.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", this.aesKey, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  }

  sign(contentHash: string): string {
    return createHmac("sha256", this.hmacSecret).update(contentHash).digest("hex");
  }

  verify(contentHash: string, signature: string): boolean {
    return this.sign(contentHash) === signature;
  }

  exportPrivateMaterial(): never {
    throw new SmartLedgerError(
      "Private platform keys are not exportable into model, telemetry, or Smart Ledger payloads",
    );
  }
}

export class SmartLedgerEdgeRuntime {
  private sqlite: OfflineReceiptEnvelope[] = [];
  private readonly postgres = new Map<string, { eventId: string; envelope: OfflineReceiptEnvelope }>();
  private mongo: OfflineReceiptEnvelope[] = [];

  constructor(private readonly adapter: PlatformKeyAdapter) {}

  writeOffline(input: {
    receiptId: string;
    idempotencyKey: string;
    actorIdentity: string;
    sessionId: string;
    claimType: string;
    pkaVerdict: string;
    pkaDisposition: string;
    evidenceRefs: readonly string[];
    kmecObservationRef: string;
    pkaReceiptRef: string;
    plaintextPayload: string;
  }): OfflineReceiptEnvelope {
    const previous = this.sqlite.at(-1) ?? null;
    const ciphertext = this.adapter.encrypt(input.plaintextPayload);
    const draft: Omit<OfflineReceiptEnvelope, "contentHash" | "signature"> = {
      envelopeVersion: 1,
      receiptId: input.receiptId,
      previousReceiptHash: previous?.contentHash ?? null,
      sequenceNumber: (previous?.sequenceNumber ?? 0) + 1,
      idempotencyKey: input.idempotencyKey,
      actorIdentity: input.actorIdentity,
      seat: "edge",
      sessionId: input.sessionId,
      deviceIdPseudonymous: `device:${this.adapter.platform}`,
      platform: this.adapter.platform,
      runtimeVersion: "fep-poc-003-ci",
      createdAt: "2026-09-13T16:00:00.000Z",
      claimType: input.claimType,
      pkaVerdict: input.pkaVerdict,
      pkaDisposition: input.pkaDisposition,
      evidenceRefs: input.evidenceRefs,
      signatureAlgorithm: "hmac-sha256-ci-double",
      publicKeyId: this.adapter.publicKeyId,
      payloadCiphertext: ciphertext,
      kmecObservationRef: input.kmecObservationRef,
      pkaReceiptRef: input.pkaReceiptRef,
      queueState: "pending",
    };
    const contentHash = sha256(canonicalEnvelopePayload(draft));
    const envelope: OfflineReceiptEnvelope = {
      ...draft,
      contentHash,
      signature: this.adapter.sign(contentHash),
    };
    this.sqlite.push(envelope);
    return envelope;
  }

  serializeEdge(): string {
    return JSON.stringify(this.sqlite);
  }

  restoreEdge(serialized: string): void {
    this.sqlite = JSON.parse(serialized) as OfflineReceiptEnvelope[];
  }

  reconcile(): ReconciliationReceipt[] {
    const outcomes: ReconciliationReceipt[] = [];
    for (const envelope of this.sqlite) {
      if (envelope.queueState === "admitted") {
        outcomes.push({
          receiptId: envelope.receiptId,
          outcome: "duplicate",
          reasons: ["already admitted"],
          hardwareProof: "ci-double-only",
        });
        continue;
      }

      const reasons: string[] = [];
      if (!this.verifyChain(envelope)) {
        reasons.push("hash chain break or tamper");
      }
      if (!this.adapter.verify(envelope.contentHash, envelope.signature)) {
        reasons.push("signature invalid");
      }
      try {
        this.adapter.decrypt(envelope.payloadCiphertext);
      } catch {
        reasons.push("ciphertext not decryptable");
      }
      if (!envelope.kmecObservationRef || !envelope.pkaReceiptRef) {
        reasons.push("missing KMEC observation or PKA receipt");
      }

      const existing = this.postgres.get(envelope.idempotencyKey);
      if (existing && reasons.length === 0) {
        this.setQueue(envelope.receiptId, "admitted");
        outcomes.push({
          receiptId: envelope.receiptId,
          outcome: "duplicate",
          postgresEventId: existing.eventId,
          reasons: ["idempotency key already admitted"],
          hardwareProof: "ci-double-only",
        });
        continue;
      }

      if (reasons.length > 0) {
        this.setQueue(envelope.receiptId, "conflict");
        const conflict: OfflineReceiptEnvelope = {
          ...envelope,
          receiptId: `${envelope.receiptId}:conflict`,
          sequenceNumber: envelope.sequenceNumber + 0.1,
          queueState: "conflict",
          previousReceiptHash: envelope.contentHash,
        };
        this.sqlite.push({
          ...conflict,
          contentHash: sha256(canonicalEnvelopePayload(conflict)),
          signature: this.adapter.sign(sha256(canonicalEnvelopePayload(conflict))),
        });
        outcomes.push({
          receiptId: envelope.receiptId,
          outcome: "conflict",
          reasons,
          hardwareProof: "ci-double-only",
        });
        continue;
      }

      const eventId = `pg:${envelope.receiptId}`;
      this.postgres.set(envelope.idempotencyKey, { eventId, envelope });
      this.mongo = [...this.postgres.values()].map((row) => row.envelope);
      this.setQueue(envelope.receiptId, "admitted");
      outcomes.push({
        receiptId: envelope.receiptId,
        outcome: "admitted",
        postgresEventId: eventId,
        mongoProjectionId: `mongo:${envelope.receiptId}`,
        reasons: ["admitted after chain + signature + PKA/KMEC refs"],
        hardwareProof: "ci-double-only",
      });
    }
    return outcomes;
  }

  rebuildMongoFromPostgres(): OfflineReceiptEnvelope[] {
    this.mongo = [...this.postgres.values()].map((row) => row.envelope);
    return [...this.mongo];
  }

  postgresCount(): number {
    return this.postgres.size;
  }

  queueStates(): SmartLedgerQueueState[] {
    return this.sqlite.map((row) => row.queueState);
  }

  private verifyChain(envelope: OfflineReceiptEnvelope): boolean {
    const index = this.sqlite.findIndex((row) => row.receiptId === envelope.receiptId);
    if (index < 0) return false;
    if (index === 0) return envelope.previousReceiptHash === null;
    return envelope.previousReceiptHash === this.sqlite[index - 1]?.contentHash;
  }

  private setQueue(receiptId: string, state: SmartLedgerQueueState): void {
    this.sqlite = this.sqlite.map((row) =>
      row.receiptId === receiptId ? { ...row, queueState: state } : row,
    );
  }
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function createCiAdapters(seed = "jennifer-fep-poc-003"): {
  apple: CiPlatformKeyAdapter;
  android: CiPlatformKeyAdapter;
} {
  const hmac = createHash("sha256").update(`${seed}:hmac`).digest();
  const aes = createHash("sha256").update(`${seed}:aes`).digest();
  return {
    apple: new CiPlatformKeyAdapter("apple", hmac, aes),
    android: new CiPlatformKeyAdapter("android", hmac, aes),
  };
}
