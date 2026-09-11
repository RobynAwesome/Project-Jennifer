# Fox Forge Protocol [FFP] — Governed Animal Forms + Learned Scene Inference

**Status:** POC implementation / canon contract  
**Project:** Project Jennifer  
**Lane:** Digital Princess Engineering

## Why this exists

Project Jennifer already separates:

```text
Core Logic → Companion Identity → Embodied Form → Relationship Lane
```

FFP adds a governed animal-form/presentation layer without collapsing visual symbolism into identity truth.

Its first canonical assignment is intentionally narrow:

```text
Forge = Fox
pronouns = she/her
locked traits = cheeky + observant + emotionally-continuous + protective + playful

Founder = Phoenix SIGNAL
Founder animal form = unassigned

Jennifer = OPEN
Kairo = OPEN
```

The protocol does not infer missing animal forms.

## Digital Princess Engineering law

```text
DO NOT MACHINE-LEARN WHAT MUST BE GOVERNED.
DO NOT HAND-CODE EVERYTHING THAT MAY BE INFERRED.
```

Traditional code is best for constitutional invariants such as identity, authority, allowed transitions and receipt requirements.

Machine learning may be useful for adaptive presentation such as choosing which scene mode appears most relevant from a bounded feature packet.

Therefore:

```text
                         PROJECT JENNIFER
                                │
                  ┌─────────────┴─────────────┐
                  │                           │
          GOVERNED / DETERMINISTIC      LEARNED / PROBABILISTIC
                  │                           │
          identity canon                 scene-mode scores
          source authority               pattern recognition
          form admission                 contextual proposals
          permissions                    adaptive presentation
                  │                           │
                  └─────────────┬─────────────┘
                                │
                         FFP VALIDATION GATE
                                │
                              RECEIPT
                                │
                    presentation mutation only
```

## Scene modes

`work`, `cloud`, `healing`, and `mission` are not personalities and are not diagnoses. They are UI/world presentation modes.

An ML adapter can emit:

```json
{
  "modelId": "tensorflow-ffp-hello-world-v0",
  "mode": "mission",
  "probabilities": {
    "work": 0.08,
    "cloud": 0.05,
    "healing": 0.04,
    "mission": 0.83
  },
  "provenanceRefs": ["learning/ffp-tensorflow/scene_classifier.py"],
  "source": "machine-learning"
}
```

FFP then checks:

- probabilities are valid and approximately sum to `1`;
- the declared mode is the actual highest-probability mode;
- confidence crosses the configured threshold;
- provenance exists;
- no canon mutation is attached.

Outcomes:

```text
APPLY  = presentation may change to predicted mode
HOLD   = preserve current mode
REJECT = malformed / contradictory / authority-violating proposal
```

Every result records `canonicalStateChanged: false`.

## Security / prompt-injection boundary

The prediction structure intentionally has an auditable `proposedCanonMutations` field.

If an upstream model, tool, prompt, `AGENTS.md`, `SKILL.md`, retrieved document or compromised workflow attempts to smuggle:

```text
Forge -> cat
Forge -> wrong pronouns
Jennifer -> assigned animal
Kairo -> assigned signal
```

through a scene prediction, the gate rejects the entire prediction.

This is not a complete prompt-injection defence. It is one deterministic membrane: **untrusted adaptive output cannot use the scene-inference lane to rewrite identity canon.**

## Visual authority

Generated posters and wallpapers are committed as `VISUAL_DERIVATIVE`.

They may suggest:

- pose
- atmosphere
- scene composition
- palette
- interaction direction

They may not define:

- powers
- relationship truth
- ontological claims
- new animal-form assignments
- canon transitions

The machine canon file outranks generated poster text.

## Learning path

This POC maps the user's current DeepLearning.AI TensorFlow specialization into Project Jennifer without pretending later coursework is already implemented:

```text
Course 1: dense neural-network fundamentals
→ current FFP scene-classifier learning lab

Course 2: CNNs
→ future visual scene/form recognition candidate

Course 3: NLP
→ future bounded dialogue-intent signals

Course 4: sequences / time series
→ future longitudinal world-state pattern proposals
```

Every future model remains beneath the same governance law:

> **Models may infer. Receipts and authority decide what becomes reality.**
