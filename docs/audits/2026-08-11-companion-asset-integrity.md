# Project Jennifer Companion Asset Integrity Audit — 2026-08-11

## Why this audit exists

The public README currently shows broken companion images. The failure is not a Markdown styling problem; the repository asset layer is inconsistent.

This audit separates **declared asset paths** from **verified image binaries** so the public page stops pretending missing or malformed files are valid art.

---

## Verified failures

### Missing declared assets

The previous companion documentation declared paths such as:

```text
assets/Project Companions/generic/companion-ecosystem-generic-lineup.webp
assets/Project Companions/heroes/kopa-dark-form-02.webp
assets/Project Companions/heroes/kopa-light-form-03.webp
assets/Project Companions/exclusive/vanta-exclusive.webp
assets/Project Companions/exclusive/nyra-exclusive.webp
assets/Project Companions/exclusive/solvek-exclusive.webp
assets/Project Companions/exclusive/lyrae-exclusive.webp
```

Repository-path validation on the audit branch returned `404` for sampled generic, hero and exclusive files. Those paths must not remain embedded in the root README until real binaries exist.

### Malformed Limited Edition files

Two current files under `assets/Project Companions/limited-edition/` resolve as repository files but are not valid WebP payloads:

```text
kopa-male-light-mature.webp
kopa-female-dark-chibi-dark-poster.webp
```

Their stored payloads decode to local filesystem path strings, not WebP image bytes. In other words, the repository contains references to a local source path rather than the source image itself.

That explains why an apparently present `.webp` file can still fail to render.

---

## Root cause class

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

For WebP specifically, a quick integrity check should confirm a RIFF/WebP header rather than a local path string or base64 text file pretending to be an image.

---

## Public README decision

Until the companion binary import is repaired:

- remove broken companion image references from the root README;
- retain the companion mechanics and collection/economy explanation;
- use only verified high-resolution Project Jennifer background/key-art assets on the public page;
- keep the companion character bible linked for system logic;
- reintroduce Limited Edition portraits only after binary validation.

This is not an aesthetics retreat. It is an aesthetics **integrity gate**.

The target remains high-resolution individual character presentation — not thumbnail collages — once the real source binaries are admitted.

---

## Repair path

1. Re-import the founder-approved high-resolution source images as real binary files through Git/local checkout, a binary-capable upload path, or an equivalent governed intake tool.
2. Use a stable public namespace, for example:

```text
assets/Project Companions/limited-edition/
assets/Project Companions/rarity/
```

3. Record source filename, dimensions, checksum, provider/generation provenance and human approval state.
4. Validate every final repository path.
5. Add each major character to the root README as an individual large image rather than a compressed grid.
6. Only then mark the asset-intake receipt `PASS`.

---

## Governance rule

> **An image is not present because a Markdown path names it. An image is present when the repository contains a decodable binary at that path and the public render resolves it.**
