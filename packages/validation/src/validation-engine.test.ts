import test from "node:test";
import assert from "node:assert/strict";

import {
  ValidationPipeline,
  ValidationFailureError,
  type ValidationPipelineDependencies,
} from "./validation-engine.js";

test("policy-violating decision returns FAILED and blocks downstream action", async () => {
  let downstreamRuns = 0;

  const dependencies: ValidationPipelineDependencies = {
    policyEngine: {
      evaluate: () => ({
        status: "deny",
        reasons: ["Policy denied this action"],
        matchedRuleIds: ["policy-1"],
      }),
    },
    confidenceScorer: {
      score: () => 1,
    },
    realityChecker: {
      crossCheck: () => ({ passed: true, reasons: ["ok"] }),
    },
  };

  const pipeline = new ValidationPipeline(dependencies, {
    throwOnFailed: true,
  });

  await assert.rejects(
    () =>
      pipeline.run(
        {
          id: "decision-1",
          action: "deploy",
        },
        {},
        () => {
          downstreamRuns += 1;
        }
      ),
    (error: unknown) => {
      assert.ok(error instanceof ValidationFailureError);
      assert.equal(error.report.status, "FAILED");
      assert.equal(error.report.failed?.stage, "policy");
      return true;
    }
  );

  assert.equal(downstreamRuns, 0);
});
