# Project Jennifer Rhythm Corpus

Rhythm is Cairo's third canonical vector. It controls **delivery shape** rather than supplying another lore book.

## Purpose

Rhythm answers:

> When and how should the signal move?

The first dataset should be small, original and structured. A target of roughly 100–300 hand-authored examples is enough for the POC.

## Initial pattern vocabulary

- slow approach
- rapid escalation
- pause
- silence
- mirroring cadence
- repetition
- tension
- release
- interruption
- withdrawal
- return
- short response
- long response
- question cadence
- emotional beat
- distance
- proximity

## Example record

```json
{
  "id": "rhythm.tension-release.001",
  "pattern": "tension_release",
  "tempo": 0.42,
  "pause": "medium",
  "escalation": "slow",
  "response_shape": "short-long-short",
  "intent": "increase_curiosity",
  "provenance": "project-jennifer-original",
  "version": "0.1.0"
}
```

## Design rules

1. Rhythm records are Project Jennifer-original; do not populate the corpus by copying song lyrics or copyrighted dialogue.
2. Each record must have an ID, provenance and version.
3. Numeric values are configuration signals, not psychological measurements of the player.
4. Rhythm may shape timing and wording, but KPGS remains the authority boundary.
5. The dataset should be testable without requiring a large model.

## First build target

Create three small buckets first:

```text
approach/
tension_release/
withdraw_return/
```

Ten validated examples per bucket are sufficient for the first executable retrieval test. Expand only after the Third Signal Chamber produces useful receipts.
