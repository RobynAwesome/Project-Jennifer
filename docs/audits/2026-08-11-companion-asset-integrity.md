# Project Jennifer Companion Asset Integrity Audit — 2026-08-11

## Why this audit exists

The original public README showed broken companion images. The failure was not a Markdown styling problem; the repository asset layer mixed missing paths, valid source binaries and malformed pointer payloads.

This audit separates **declared asset paths** from **verified image binaries** so the public page does not pretend missing or malformed files are valid art.

---

## Pass 1 — verified failures

### Missing declared assets

Previous companion documentation declared paths such as:

```text
assets/Project Companions/generic/companion-ecosystem-generic-lineup.webp
assets/Project Companions/heroes/kopa-dark-form-02.webp
assets/Project Companions/heroes/kopa-light-form-03.webp
assets/Project Companions/exclusive/vanta-exclusive.webp
assets/Project Companions/exclusive/nyra-exclusive.webp
assets/Project Companions/exclusive/solvek-exclusive.webp
```

Repository-path validation returned `404` for sampled generic, hero and exclusive files. Those paths must not be embedded in the root README until real binaries exist.

### Malformed Limited Edition files

Files previously stored under `assets/Project Companions/limited-edition/` included:

```text
_probe.webp
kopa-male-light-mature.webp
kopa-female-dark-chibi-dark-poster.webp
```

Their payloads were verified as local filesystem path strings / pointer text rather than decodable WebP image bytes.

```text
LOCAL FILE / TOOL REFERENCE
        ↓
TEXT OR POINTER STORED IN REPO
        ↓
.webp EXTENSION
        ↓
README ASSUMES IMAGE
        ↓
BROKEN RENDER
```

File extension is not evidence of file type.

---

## Pass 2 — founder-supplied source binaries were already present

A second audit, performed after the founder clarified that the current uploads are **Project Jennifer assets**, found valid full PNG payloads already committed in the repository under opaque numeric/raw upload names.

Three Digital Hippocampus / companion-selection sources were identified by existing Git blobs and normalized without re-encoding the image data:

```text
1785966335054.png
→ source/digital-hippocampus-substrate-001.png

1785966441671.png
→ source/digital-hippocampus-companion-selection-embodied-historical-001.png

1785966533656.png
→ source/digital-hippocampus-companion-selection-core-logic-001.png
```

Their dimensions and SHA-256 fingerprints are recorded in [`assets/Project Companions/source-manifest.json`](../../assets/Project%20Companions/source-manifest.json).

This changes the diagnosis from **“all companion assets are missing”** to a more precise state:

```text
VALID SOURCE BINARIES EXIST FOR PART OF THE DESIGN LINEAGE
+
SOME DECLARED HD LIMITED-EDITION PATHS ARE STILL MISSING
+
SOME LEGACY .webp PATHS WERE POINTER PAYLOADS
```

Those states must remain separate.

---

## Pointer quarantine repair

Verified pointer payloads were moved out of the renderable `limited-edition/` namespace and renamed according to what they actually are:

```text
assets/Project Companions/quarantine/legacy-path-pointer/
  _probe.pointer.txt
  kopa-male-light-mature.pointer.txt
  kopa-female-dark-chibi-dark-poster.pointer.txt
```

They remain forensic evidence of the failure mode. They are no longer permitted to masquerade as image assets through a `.webp` extension.

---

## Historical identity lineage

The founder-supplied In-Depth Companion Matrix and one admitted embodied-selection image visibly use **Eira** for the female Memory Architect.

Current executable Project Jennifer companion canon uses **Fira**.

Governance decision:

```text
EIRA = preserved historical design-source label
FIRA = current runtime identity
```

The historical source is not edited to manufacture retroactive consistency. A future identity change requires a governed identity receipt rather than silent history rewrite.

---

## Required binary intake gate

Every public image asset should pass all of these checks before a README references it:

```text
[ ] repository path exists
[ ] payload is real binary image data
[ ] magic bytes match declared format
[ ] image decodes successfully
[ ] dimensions are non-zero and appropriate
[ ] checksum recorded where provenance matters
[ ] README path resolves on the target branch
[ ] generated text inside image is not treated as source truth
```

For WebP specifically, a quick integrity check should confirm a RIFF/WebP header rather than a local path string or text payload pretending to be an image.

---

## Public README decision after Pass 2

The root README may now display the admitted Digital Hippocampus source assets because they have stable repository paths and source-manifest records.

It must **not** imply that this closes the broader Limited Edition asset gate.

The target remains high-resolution individual character presentation — not thumbnail collages — once the exact founder-approved Limited Edition binaries pass intake.

---

## Issue #25 boundary

Issue #25 remains open.

This repair satisfies part of the general intake infrastructure but does **not** prove that all acceptance assets named by the issue — including the intended Vanta, Nyra, SolveK, Lyrae and Kopa HD Limited Edition/rarity art — have been imported and visually verified.

Do not close the issue merely because some valid source binaries were recovered and renamed.

---

## Governance rule

> **An image is not present because a Markdown path names it. An image is present when the repository contains a decodable binary at that path and the public render resolves it.**

And the second-pass addition:

> **An image can be present without being discoverable. Stable naming, provenance and authority classification are part of governed asset intake.**
