---
name: kpgs-deployment-parser
description: Re-engineer official cloud, app, API, PWA, container, and service deployment documentation into a KPGS-normalized DeploymentRecipe with prerequisites, auth, build, deploy, rollback, observability, limits, costs, provenance, and validation receipts. Use when adapting provider deployment docs into KPGS workflows.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; requires access to the target provider documentation and repository deployment artifacts.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: deployment-parser
  portable: true
  tags: deployment, cloud, parser, kpgs, devops
---

# KPGS Deployment Parser

## Overview

Providers document deployment in their own language. KPGS needs the provider truth **without inheriting the provider's architecture as KPGS authority**.

Use this skill to parse an official deployment guide—for example a Google, Microsoft, AWS, Vercel, GitHub, or other provider guide—and transform it into a provider-neutral KPGS `DeploymentRecipe`.

## Input

Collect:

```yaml
provider:
product_or_service:
target_environment:
official_docs: []
repository_artifacts: []
current_runtime:
current_region:
current_domain:
owner_constraints: []
```

Prefer first-party documentation for provider-specific behavior. Community material may supplement troubleshooting but must be labeled separately.

## Parse sequence

```text
OFFICIAL PROVIDER DOCS
→ REPOSITORY DEPLOYMENT STATE
→ KPGS PARSER PROTOCOL
→ DEPLOYMENT RECIPE
→ PRE-FLIGHT VALIDATION
→ BOUNDED DEPLOYMENT
→ OBSERVE REAL RESULT
→ RECEIPT
→ REPAIR / ROLLBACK / PROMOTE
```

## DeploymentRecipe schema

Produce:

```yaml
recipe_id:
provider:
product_or_service:
target:
exact_runtime_or_api_version:
region:

prerequisites: []
authentication:
  mechanism:
  secret_locations: []
  required_permissions: []

build:
  commands: []
  artifacts: []
  environment: {}

deploy:
  commands_or_api_actions: []
  configuration: {}
  expected_outputs: []

network:
  domains: []
  ports: []
  dns_requirements: []

storage:
  authoritative_store:
  adaptive_store:
  offline_store:

observability:
  health_checks: []
  logs: []
  metrics: []

limits:
  quotas: []
  rate_limits: []
  unsupported_features: []

cost:
  known_costs: []
  unknown_costs: []

rollback:
  trigger_conditions: []
  steps: []
  data_recovery: []

provenance:
  provider_sources: []
  repository_sources: []
  observed_at:

validation:
  preflight:
  deployment_result:
  receipt_ids: []
```

## Re-engineering law

Re-engineering means translation plus governance, not copying vendor prose into KPGS.

```text
PROVIDER FACT
+ REPOSITORY REALITY
+ OWNER CONSTRAINT
+ KPGS AUTHORITY
=
GOVERNED DEPLOYMENT RECIPE
```

Examples:

- An official Google deployment document can establish Google-specific commands, APIs, permissions, quotas, and supported runtime behavior.
- KPGS decides how those facts map into receipts, source authority, offline continuity, rollback, memory, and renter boundaries.
- If the repository contradicts the documentation because it targets an older runtime, preserve the mismatch and resolve it explicitly.

## Secret hygiene

Never write raw API keys, private keys, tokens, or passwords into the recipe or repository. Record secret **names/locations** and required permission scopes instead.

## Validation

A successful command is not by itself a successful deployment.

Validate, when applicable:

```text
build exit
+ artifact existence
+ provider deployment state
+ health endpoint
+ domain/DNS resolution
+ critical API call
+ telemetry
+ rollback availability
```

Mark only observed checks as PASS.

## Constraints

- Do not use community documentation to override first-party provider behavior without explicit evidence.
- Do not invent quotas, prices, regions, API versions, or commands.
- Do not publish secrets.
- Do not make irreversible deployment changes without a rollback path when the platform supports one.
- Do not convert a deployment recipe into constitutional KPGS truth outside its deployment scope.
- Preserve exact source URLs/refs and observation timestamps in machine receipts.
