---
name: kpgs-tool-script-runtime
description: Execute tools only through a parsed SKILL.md and its declared script entrypoint, under a purpose-bound KPGS lease. Use when an AI workflow needs shell, API, app, browser, deployment, repository, or provider tools without exposing those tools as unstructured model capabilities.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; runtime reference implementation lives in RobynAwesome/kpgs-morning-engine-core--kmec-.
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: skill-script-tool-execution
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  portable: true
  tags: tools, scripts, skills, parser, kpgs, mmao
---

# KPGS Skill-Script Tool Runtime

## Core law

```text
AI INTENT
→ WORKFLOW NODE
→ REQUIRED SKILL.md
→ PARSE SKILL
→ DECLARED SCRIPT ENTRYPOINT
→ SCRIPT COMPILES BOUNDED TOOL PLAN
→ EXECUTOR RUNS PLAN
→ CONSEQUENCE
→ RECEIPT
```

A renter does **not** receive a raw bag of tools and decide ad hoc how to call them.

The model may reason about the workflow, but tool execution is mediated by a script whose existence and tool permissions are declared by the selected skill.

## Why

Direct tool exposure collapses several different responsibilities into one inference step:

```text
understand task
+ choose workflow
+ choose tool
+ construct parameters
+ decide authority
+ execute side effect
```

KPGS separates those responsibilities so each can be parsed, validated and receipted.

## Skill contract

A tool-bearing skill should declare a simple portable discovery surface:

```yaml
---
name: example-tool-skill
description: ...
allowed-tools:
  - shell:example
  - api:example
script-entrypoints:
  - package.module:ScriptClass
---
```

The runtime may use richer provider-native metadata, but these fields provide the minimum KPGS tool membrane.

## Execution gate

Before a plan is executable, all of these must be true:

```text
purpose-bound lease is active
AND skill is demanded by the lease
AND workflow admits the skill-script execution channel
AND SKILL.md declares the script entrypoint
AND SKILL.md declares the requested tool
AND script compiles exact arguments
AND executor is separately authorized
```

If any condition fails: **BLOCK WITH RECEIPT**.

## Tool classes

Tool identifiers are capability names, not executable strings by themselves.

Examples:

```text
shell:xcodebuild
shell:xcrun
shell:gcloud
api:app-store-connect
api:github
app:transporter
app:xcode-distribute
provider:xcode-cloud
browser:deployment-console
```

A provider adapter maps the capability name to a concrete executor.

## Secret law

Scripts do not accept raw secrets in model-generated arguments.

```text
script plan
→ names required secret lane / credential class
→ executor resolves authorized credential externally
→ secret never enters skill prompt or receipt body
```

## Consequence law

The tool result must remain distinct from success of the whole workflow.

```text
TOOL EXIT 0
≠
DEPLOYMENT VALIDATED
```

A post-tool observation/validation node must inspect provider state, artifact identity, health, processing state, or other evidence demanded by the workflow.

## Runtime reference

Reference implementation:

```text
RobynAwesome/kpgs-morning-engine-core--kmec-
src/kmec/tool_scripts.py
```

The runtime creates a `ToolInvocationPlan` and a `ToolExecutionReceipt`. The plan binds:

```yaml
skill_name:
script_entrypoint:
execution_channel:
tool:
arguments: []
purpose:
lease_id:
renter_id:
exact_runtime_id:
source_id:
```

## Final checks

- [ ] The workflow selected a skill before selecting a tool.
- [ ] The skill declares its script entrypoint.
- [ ] The skill declares the requested tool class.
- [ ] The active lease demands the skill.
- [ ] Raw direct tool calls are blocked for this lane.
- [ ] Secrets remain in executor credential lanes.
- [ ] Tool consequence receives a receipt.
- [ ] Workflow validation remains separate from tool exit status.
