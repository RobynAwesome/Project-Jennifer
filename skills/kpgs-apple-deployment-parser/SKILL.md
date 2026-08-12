---
name: kpgs-apple-deployment-parser
description: Parse Apple's Xcode, Xcode Cloud, App Store Connect, TestFlight, build-upload, export, and macOS notarization deployment flows into a KPGS staged DeploymentRecipe, then route tool execution through declared scripts instead of direct model tool calls.
license: MIT
compatibility: Portable Agent Skills SKILL.md package; requires current first-party Apple Developer documentation plus repository/Xcode project evidence.
allowed-tools:
  - shell:xcodebuild
  - shell:xcrun
  - api:app-store-connect
  - app:transporter
  - app:xcode-distribute
  - provider:xcode-cloud
script-entrypoints:
  - kmec.skill_scripts.apple_deployment:AppleDeploymentSkillScript
metadata:
  author: Kholofelo Robyn Rababalela / Kopano Labs
  version: "1.0.0"
  capability: apple-deployment-parser
  authority-origin: Kopano-Labs/Introduction-to-MCP
  runtime-origin: RobynAwesome/kpgs-morning-engine-core--kmec-
  portable: true
  tags: apple, xcode, app-store-connect, testflight, notarization, parser, deployment
---

# KPGS Apple Deployment Parser

## Purpose

Apple distribution is **not** normalized as if it were Google Cloud Run or a generic cloud service deployment.

The workflow is staged around Xcode build products, signing, archive/export artifacts, upload/distribution channels, Apple-side processing, TestFlight/App Review/release, and a distinct notarization path for direct macOS distribution.

```text
PROJECT / WORKSPACE
→ SCHEME
→ BUILD / TEST / ANALYZE AS REQUIRED
→ ARCHIVE
→ SIGN / EXPORT
→ UPLOAD OR DISTRIBUTE
→ APPLE PROCESSING
→ TESTFLIGHT / APP REVIEW / NOTARIZATION
→ RELEASE OR DIRECT DISTRIBUTION
→ OBSERVE
→ RECEIPT
```

## Source authority

Use current first-party Apple Developer documentation for Apple-specific behavior.

The provider docs govern Apple facts such as:

```text
Xcode Cloud workflow actions
archive requirements
xcodebuild archive/export behavior
ExportOptions.plist semantics
App Store Connect upload mechanisms
build processing state
TestFlight/App Store distribution path
macOS notarization workflow
```

KPGS still governs source classification, skill routing, tool permissions, receipts, purpose-bound leases, memory, and promotion.

## Required input

```yaml
platform: ios | macos | tvos | watchos | visionos
target:
project:
workspace:
scheme:
archive_path:
export_path:
export_options_plist:
bundle_id:
version:
build_number:
distribution: testflight | app-store | developer-id | notarized-direct
upload_channel: xcode | transporter | altool | app-store-connect-api | build-uploads
xcode_cloud: true | false
official_apple_sources: []
repository_sources: []
```

Do not guess missing signing identities, bundle IDs, versions, build numbers, export options, credentials, or distribution paths.

## Apple-specific parser topology

### Xcode / Xcode Cloud

Parse separately:

```text
project/workspace identity
scheme identity
build/test/analyze/archive actions
Deployment Preparation / signing intent
custom build scripts/post-actions
archive artifact
artifact retention or download requirements
```

### Export

When current official docs establish the command path, normalize:

```text
xcodebuild -exportArchive
archivePath
exportOptionsPlist
exportPath
```

`ExportOptions.plist` is configuration evidence. It is not generated from guesses.

### App Store Connect / TestFlight

Treat these as multiple states rather than one `deploy=done` event:

```text
artifact produced
→ upload initiated
→ upload accepted/rejected
→ Apple processing
→ processed build exists
→ TestFlight eligibility / assignment
OR
→ App Store version/review path
→ release state
```

A successful upload is **not** the same thing as a processed build, approved review, or released app.

### Build uploads API

If the current App Store Connect API documentation proves the `buildUploads` flow, parse it as a multi-stage API upload:

```text
create build upload
→ reserve upload file(s)
→ perform returned upload operations
→ commit file(s)
→ observe build-upload state
→ observe processed Build resource
```

Do not flatten this into a single HTTP call.

### Direct macOS distribution

When direct Developer ID distribution is selected:

```text
archive
→ export signed artifact
→ package if required
→ notarize
→ observe notarization result
→ staple/prepare distributable when current docs require it
→ distribute
```

This path is distinct from App Store review.

## Tool execution law

This skill does not give the model direct access to Xcode, shell, Transporter, or App Store Connect.

```text
THIS SKILL.md
→ parsed by KPGS Parser Protocol
→ AppleDeploymentSkillScript
→ bounded ToolInvocationPlan
→ authorized executor
→ ToolExecutionReceipt
→ Apple provider-state observation
→ deployment validation receipt
```

The declared script entrypoint is:

```text
kmec.skill_scripts.apple_deployment:AppleDeploymentSkillScript
```

## Secret hygiene

Do not place Apple IDs, app-specific passwords, API private keys, JWT signing keys, certificates, or other secrets in model arguments, SKILL.md, repository receipts, or generated command text.

The script may declare that a credential class is required. The executor resolves it from an authorized secret lane.

## Proof rules

```text
ARCHIVE EXIT 0 != DISTRIBUTED
EXPORT EXIT 0 != UPLOADED
UPLOAD ACCEPTED != PROCESSED BUILD
PROCESSED BUILD != TESTFLIGHT RELEASED
PROCESSED BUILD != APP REVIEW APPROVED
NOTARIZATION SUBMITTED != NOTARIZATION ACCEPTED
```

Each transition requires its own observable evidence when the workflow claims that state.

## Runtime reference

```text
RobynAwesome/kpgs-morning-engine-core--kmec-
  src/kmec/providers/apple_xcode.py
  src/kmec/skill_scripts/apple_deployment.py
  src/kmec/tool_scripts.py
```

## Final checks

- [ ] Apple docs are first-party and current for provider-specific claims.
- [ ] Project/workspace and scheme are explicit.
- [ ] Distribution path is explicit.
- [ ] Signing/export unknowns remain unknown.
- [ ] Apple processing is modeled as a separate state.
- [ ] Direct macOS notarization is not confused with App Store distribution.
- [ ] Tool calls are compiled by the declared script.
- [ ] Secrets stay outside model-generated arguments.
- [ ] Every state promotion is evidence-backed and receipted.
