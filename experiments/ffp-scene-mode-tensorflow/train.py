"""FFP scene-mode classifier learning experiment.

This file intentionally demonstrates the TensorFlow lesson:
    labeled examples + numeric features -> learned pattern

The model is advisory only. Its output must pass the deterministic FFP gate in
packages/shared/src/fox-forge-protocol.ts before presentation can change.
It has zero authority to mutate identity, relationship truth, canon or world history.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import tensorflow as tf

MODES = ["work", "cloud", "healing", "mission"]
FEATURES = [
    "task_focus",
    "imagination",
    "restorative_context",
    "field_execution",
]

# Tiny synthetic teaching dataset. These are examples, not production telemetry.
X = np.array(
    [
        [0.95, 0.10, 0.10, 0.30],
        [0.90, 0.20, 0.15, 0.45],
        [0.20, 0.95, 0.35, 0.10],
        [0.25, 0.90, 0.45, 0.15],
        [0.15, 0.25, 0.95, 0.05],
        [0.20, 0.30, 0.90, 0.10],
        [0.55, 0.15, 0.05, 0.95],
        [0.60, 0.10, 0.10, 0.90],
    ],
    dtype=np.float32,
)

y = np.array([0, 0, 1, 1, 2, 2, 3, 3], dtype=np.int32)

model = tf.keras.Sequential(
    [
        tf.keras.layers.Input(shape=(len(FEATURES),)),
        tf.keras.layers.Dense(12, activation="relu"),
        tf.keras.layers.Dense(len(MODES), activation="softmax"),
    ]
)

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(X, y, epochs=120, verbose=0)

sample = np.array([[0.65, 0.15, 0.10, 0.90]], dtype=np.float32)
probabilities = model.predict(sample, verbose=0)[0]
mode_index = int(np.argmax(probabilities))

receipt = {
    "modelId": "ffp-scene-mode-demo-v0",
    "proofState": "EXPERIMENTAL_LEARNING_ONLY",
    "features": dict(zip(FEATURES, map(float, sample[0]))),
    "prediction": {
        "mode": MODES[mode_index],
        "confidence": float(probabilities[mode_index]),
        "distribution": {
            mode: float(probabilities[index]) for index, mode in enumerate(MODES)
        },
        "evidenceIds": ["synthetic-teaching-sample-001"],
    },
    "authority": {
        "maySuggestPresentation": True,
        "mayMutateCanon": False,
        "mayMutateRelationshipTruth": False,
        "mayMutateWorldHistory": False,
    },
}

out = Path(__file__).with_name("last-experiment-receipt.json")
out.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
print(json.dumps(receipt, indent=2))
