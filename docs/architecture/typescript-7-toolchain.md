# TypeScript 7 Toolchain Boundary

**Status:** validated migration candidate  
**Date:** 2026-08-12

Project Jennifer uses the TypeScript 7 native compiler for `tsc` while retaining the TypeScript 6 JavaScript compiler package under the `typescript` dependency name for tooling that still consumes the compiler API or declares a `typescript` peer dependency.

## Package layout

```json
{
  "devDependencies": {
    "@typescript/native": "npm:typescript@^7.0.2",
    "typescript": "npm:@typescript/typescript6@^6.0.2"
  }
}
```

This follows the TypeScript 7 transition pattern documented by the TypeScript team: the native package owns the `tsc` executable while the TypeScript 6 package remains available for JavaScript API compatibility until the native API surface is available to dependent tools.

## Why the split exists

TypeScript 7 is a native Go port and does not expose the legacy JavaScript compiler API in 7.0. Some Project Jennifer dependencies, including framework/build tooling, still resolve the `typescript` package as an API/peer dependency. Replacing that package blindly would turn a compiler upgrade into a dependency break.

Therefore:

```text
@typescript/native
= TypeScript 7 compiler / tsc execution lane

typescript → @typescript/typescript6
= transitional TypeScript 6 API / peer-compatibility lane
```

The compatibility lane is not evidence that Project Jennifer still compiles with TypeScript 6. The migration gate explicitly verified:

```text
pnpm exec tsc --version
→ Version 7.0.2
```

and ran the repository gates with that compiler binary.

## Migration fixes discovered by execution

TypeScript 7 exposed two assumptions that TypeScript 5 previously allowed implicitly:

1. Node ambient globals were not being declared explicitly. `tsconfig.base.json` now declares `types: ["node"]`.
2. The web app imported `globals.css` for side effects without a module declaration. `apps/web/src/styles.d.ts` now declares `*.css`.

These are compatibility repairs produced by the migration tests, not speculative changes.

## Validation receipt

The one-shot migration workflow verified TypeScript 7.0.2 and then passed:

```text
Typecheck               PASS
Lint                    PASS
Test                    PASS
Build                   PASS
Governance validation   PASS
```

The workflow committed the regenerated workspace manifests and `pnpm-lock.yaml` only after all five gates passed. The temporary self-mutating migration workflow was then removed from the branch.

A normal pull-request CI run remains the final repository admission gate before merge.

## Proof boundary

This proves the Project Jennifer repository can compile, test, build and run its governance validation suite with the TypeScript 7 native `tsc` binary under the documented TypeScript 6 API compatibility lane.

It does not claim every upstream dependency has natively migrated its compiler API integration to TypeScript 7.
