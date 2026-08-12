# Project Companions — Asset Manifest

**Intake receipt:** 2026-08-12  
**Source upload commit:** `21b48637be6e9d1b9998170509e332fd4adaee10`  
**Classification branch:** `forge/new-asset-intake-2026-08-11`

This manifest separates **verified display assets** from **unclassified founder-uploaded source art**. A filename is not canon. Canon comes from identity/edition/form/gameplay receipts and explicit source-controlled classification.

---

## Verified system visuals

These three PNGs were visually inspected, decode as PNG, are 1408 × 768 RGB images, and the repository byte sizes match the founder-provided source copies. Stable aliases below point to the same Git blobs; no image recompression is introduced.

| Stable path | Role | Git blob SHA | Bytes | Source-copy SHA-256 |
|---|---|---:|---:|---|
| `system/digital-hippocampus-core.png` | Digital Hippocampus / core-logic visual; system object, not a collectible identity | `98ea843a6fb4805534c1764e74904dec3cde0ea9` | 1,358,656 | `fece81fd26185b6d8ecddbace9ea4f0360425546d184fbd4ce430e2bae0290af` |
| `system/companion-selector-human-forms.png` | Human-form selector concept for the six base expressions | `6beb9484db1a2cbccc2cce112283db184d6a644b` | 1,585,880 | `d11243151300124abfc418c99c08aab64ac5c5f6a4ffbd7bb6e0107a301f07e9` |
| `system/companion-selector-abstract-forms.png` | Abstract/mechanism-form selector concept for the six base expressions | `054561ef3f3add79a0f2b50ccfb4eb37bdb2c93f` | 1,626,808 | `8be5f2d5f0c073ce5a9633965e4a067e53f36ba28097a2c83f1abe949716a5fb` |

### Canonical classification

```text
Digital Hippocampus Core
  class: system_visual
  collectible_identity: false
  canon_state: canon-candidate system architecture

Companion Selector — Human Forms
  class: companion_system_visual
  edition: none
  rarity: none
  form: human-expression concept
  canon_state: canon-candidate UI / visual language

Companion Selector — Abstract Forms
  class: companion_system_visual
  edition: none
  rarity: none
  form: abstract-expression concept
  canon_state: canon-candidate UI / visual language
```

The names rendered inside exploratory art — Kael, Eira, Luna, Aris, Torin and Aura — are **not promoted to immutable character canon solely because they appear inside the image**. The important canonical layer here is the six-expression / three-base-logic selection mechanism.

---

## Unclassified founder-uploaded companion source art

The following real PNG payloads landed in the same intake and remain source candidates until their exact identity / edition / rarity / form mapping is confirmed:

- `file_00000000163881f4b54f532559d6e902.png`
- `file_000000001d9c81f4875208e313244a1b.png`
- `file_000000001eb481f78bbe03c377dec91e.png`
- `file_000000004558820a9a6a998c08e74c60.png`
- `file_000000004de081f9b89ce87866d2919a.png`
- `file_00000000761082439e73c228b30aa1d5.png`
- `file_00000000a8c481f491bf86efb3d2d1ae.png`
- `file_00000000b8308246837a4461dde95954.png`
- `file_00000000cc7c81f6930287dc62a1e2b8.png`
- `file_00000000d8e48243a0e66b7cc32b669f.png`
- `file_00000000dbec820cbebfb2f494a7bf4b.png`
- `file_00000000e8e48243ab7327c477ae11e8.png`
- `file_00000000ebe4820ab5d6c745398f2368.png`
- `file_00000000ecbc81f4a66b24365537f17d.png`

The phone/browser screenshots from the same folder remain **reference/source evidence**, not canonical presentation assets. They should not replace clean source renders in the public README.

---

## Legacy broken-pointer quarantine

Legacy files under `limited-edition/` that are only tens of bytes remain non-image pointer artifacts and must not be embedded as if they are HD art. The new real PNG intake clears the binary-intake blocker for newly uploaded files; it does **not** retroactively validate those old placeholders.

---

## Companion economy law

```text
IDENTITY ≠ EDITION ≠ RARITY ≠ FORM ≠ MECHANISM ≠ ALIGNMENT

COMMON → EPIC → RARE → LEGENDARY     = progression / history
STANDARD ↔ LIMITED EDITION            = acquisition / authored release
```

Limited Edition artwork is mapped only after the source image is positively identified. No opaque filename is silently assigned to Vanta, Nyra, SolveK, Lyrae or Kopa.

---

## Next intake gate

- [x] real PNG binaries present
- [x] stable aliases created for the three verified system visuals
- [x] dimensions / byte sizes recorded
- [x] source-copy SHA-256 values recorded for the three verified system visuals
- [ ] map every opaque PNG to its character / edition / form
- [ ] create stable aliases for Vanta / Nyra / SolveK / Lyrae / Kopa once positively identified
- [ ] restore positively mapped Limited Edition portraits to the root README at large individual display sizes
- [ ] visually inspect the final GitHub README render

**Law:** classify first, display second, monetize only after the acquisition and gameplay rules have separate receipts.
