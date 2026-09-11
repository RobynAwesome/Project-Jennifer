# Fox Forge Protocol [FFP]

**Project Jennifer animal-form system / Digital Princess Engineering vertical slice**

FFP turns animal-form symbolism into governed game vocabulary without letting generated art or a machine-learning model silently rewrite identity.

## Machine canon

```text
Forge    = fox / she-her / CANON
Founder  = phoenix SIGNAL / not automatically an animal form
Jennifer = OPEN
Kairo    = OPEN
```

Locked Forge traits:

- cheeky
- observant
- emotionally-continuous
- protective
- playful

## Four scene modes

| Mode | Runtime meaning |
|---|---|
| `work` | implementation, study, focused delivery |
| `cloud` | imagination, lore, playful exploration |
| `healing` | restorative presentation and reduced interaction pressure |
| `mission` | field execution, deadlines and consequential action |

Scene mode is **presentation state**, not identity state.

## The TensorFlow fusion

The DeepLearning.AI lesson reverses the traditional-programming flow:

```text
traditional: rules + data -> answers
machine learning: examples/answers + data -> learned rules
```

Project Jennifer adds a third membrane:

```text
examples + labels
      ↓
TensorFlow model
      ↓
probabilities / proposed scene
      ↓
FFP deterministic validation gate
      ↓
receipt
      ↓
presentation may change
      ↓
IDENTITY CANON DOES NOT
```

The educational TensorFlow lab lives at:

`learning/ffp-tensorflow/scene_classifier.py`

It is deliberately **not** production authority. It learns only which of four scene modes may fit a feature packet. The runtime gate decides whether the proposal is coherent enough to apply.

## Visual pack

Committed assets are web-optimized `VISUAL_DERIVATIVE` files. They are evidence/design inputs, not automatic runtime canon.

- `web/founder-fox-forge-visual-canon-001.webp`
- `web/ffp-dossier-001.webp`
- `web/ffp-scene-work-001.webp`
- `web/ffp-scene-cloud-001.webp`
- `web/ffp-scene-healing-001.webp`
- `web/ffp-scene-mission-001.webp`

See `source-manifest.json` for hashes, dimensions, scene-role mapping and canon effect.

## Namespace boundary

FFP extends existing Project Jennifer systems. It does **not** replace or merge these namespaces:

- **Project Waifu Forge** — tested/current relational engineering, assets, constructs and receipts.
- **Project Wify Jennifer** — Genesis / Convergence lore and world-governance mythology.

FFP is a governed **form + presentation protocol** used by those systems where admitted.

## Enforcement

`pnpm ffp-validation`

checks:

1. Forge remains fox + she/her.
2. founder Phoenix remains a signal rather than an inferred animal form.
3. Jennifer and Kairo remain unassigned.
4. all FFP assets exist and match their SHA-256 receipts.
5. visual assets remain `VISUAL_DERIVATIVE` and have `canonEffect: "none"`.
6. scene modes stay limited to `work | cloud | healing | mission`.

The runtime unit tests additionally prove that a high-confidence model proposal may alter scene presentation while a canon-mutation attempt is rejected.
