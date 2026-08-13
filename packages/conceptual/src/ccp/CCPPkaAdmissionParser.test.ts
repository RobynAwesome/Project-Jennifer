import assert from "node:assert/strict";
import test from "node:test";

import { CCPPkaAdmissionParser } from "./CCPPkaAdmissionParser.js";

const parser = new CCPPkaAdmissionParser();
const hashA = `sha256:${"a".repeat(64)}`;
const hashB = `sha256:${"b".repeat(64)}`;

const acceptedReceipt = {
  receiptId: "ccp-1",
  timestamp: 1,
  framework: "CCP",
  proposalId: "proposal-1",
  evolutionReceiptId: "evolution-1",
  decision: "Accepted" as const,
  canonical: true,
  rationale: "accepted",
};

test("Accepted canonical receipt becomes a deterministic PKA candidate", () => {
  const result = parser.parse({
    callerRepository: "RobynAwesome/Project-Jennifer",
    ccpReceipt: acceptedReceipt,
    ccpReceiptHash: hashA,
    evolutionReceiptHash: hashB,
  });

  assert.equal(result.eligible, true);
  if (result.eligible) {
    assert.equal(result.request.actionId, "ccp-pka:RobynAwesome/Project-Jennifer:ccp-1");
    assert.equal(result.request.evidence.length, 2);
  }
});

test("non-Accepted receipt holds before PKA", () => {
  const result = parser.parse({
    callerRepository: "RobynAwesome/Project-Jennifer",
    ccpReceipt: { ...acceptedReceipt, decision: "Experimental" as const, canonical: false },
    ccpReceiptHash: hashA,
    evolutionReceiptHash: hashB,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.status, "hold");
});

test("missing receipt hash holds before PKA", () => {
  const result = parser.parse({
    callerRepository: "RobynAwesome/Project-Jennifer",
    ccpReceipt: acceptedReceipt,
    ccpReceiptHash: "missing",
    evolutionReceiptHash: hashB,
  });

  assert.equal(result.eligible, false);
});
