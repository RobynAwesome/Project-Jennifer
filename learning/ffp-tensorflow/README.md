# FFP TensorFlow Learning Lab

This folder turns the current DeepLearning.AI TensorFlow lesson into a Project Jennifer exercise.

## What you are practising

The first-course neural-network idea:

```text
examples + labels -> neural network -> learned decision boundary
```

instead of manually writing a growing `if / elif / else` tree.

The toy model sees five normalized features:

1. `task_focus`
2. `creative_exploration`
3. `recovery_need`
4. `mission_urgency`
5. `relational_warmth`

and learns one of four **presentation** labels:

```text
work | cloud | healing | mission
```

## Run

With TensorFlow + NumPy installed:

```bash
python learning/ffp-tensorflow/scene_classifier.py
```

Optional feature override:

```bash
FFP_FEATURES='[0.72,0.30,0.12,0.82,0.60]' \
python learning/ffp-tensorflow/scene_classifier.py
```

## Crucial boundary

This is a learning lab, not a psychology model and not a canon engine.

Its output must be treated as:

```text
NON-CANONICAL MODEL PROPOSAL
```

and sent through `FoxForgeProtocolEngine.evaluateScenePrediction()` before Project Jennifer changes presentation state.

It is **forbidden** from deciding:

- Forge's animal form or pronouns;
- the founder's animal form;
- Jennifer/Kairo animal forms;
- relationship truth;
- source authority;
- canon promotion.

That separation is the Digital Princess Engineering lesson:

> **learn patterns where uncertainty is useful; hard-code constitutional boundaries where drift is unacceptable.**
