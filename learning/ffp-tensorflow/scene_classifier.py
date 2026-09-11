"""
Fox Forge Protocol (FFP) — TensorFlow "Hello World" learning lab.

This is deliberately NOT a production authority component.

The Coursera concept being practised is:
    examples + labels -> model -> learned decision boundary

Project Jennifer adds a governance membrane:
    model probabilities -> FFP deterministic gate -> receipt -> scene presentation

The model may propose WORK / CLOUD / HEALING / MISSION.
It may never assign animal forms, pronouns, identity canon or relationship truth.
"""

from __future__ import annotations

import json
import os

import numpy as np
import tensorflow as tf

LABELS = ["work", "cloud", "healing", "mission"]
FEATURES = [
    "task_focus",
    "creative_exploration",
    "recovery_need",
    "mission_urgency",
    "relational_warmth",
]

# Small synthetic examples for the learning exercise.
# They are teaching data, not claims about a human psychological state.
X = np.array(
    [
        [0.95, 0.20, 0.10, 0.35, 0.45],
        [0.90, 0.25, 0.15, 0.30, 0.50],
        [0.82, 0.30, 0.20, 0.40, 0.40],
        [0.25, 0.95, 0.10, 0.15, 0.85],
        [0.30, 0.90, 0.15, 0.20, 0.90],
        [0.20, 0.88, 0.20, 0.10, 0.80],
        [0.15, 0.20, 0.95, 0.10, 0.75],
        [0.20, 0.25, 0.90, 0.10, 0.80],
        [0.25, 0.15, 0.88, 0.15, 0.70],
        [0.55, 0.20, 0.10, 0.95, 0.55],
        [0.60, 0.15, 0.15, 0.92, 0.50],
        [0.50, 0.25, 0.10, 0.90, 0.45],
    ],
    dtype=np.float32,
)

y = np.array(
    [
        0, 0, 0,  # work
        1, 1, 1,  # cloud
        2, 2, 2,  # healing
        3, 3, 3,  # mission
    ],
    dtype=np.int32,
)

tf.keras.utils.set_random_seed(42)

model = tf.keras.Sequential(
    [
        tf.keras.layers.Input(shape=(len(FEATURES),)),
        tf.keras.layers.Dense(8, activation="relu"),
        tf.keras.layers.Dense(len(LABELS), activation="softmax"),
    ],
    name="ffp_scene_classifier_hello_world",
)

model.compile(
    optimizer="adam",
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

model.fit(X, y, epochs=250, verbose=0)

# Example signal packet. Override with FFP_FEATURES='[0.9,0.2,0.1,0.4,0.5]'.
raw_features = os.getenv("FFP_FEATURES")
sample = (
    np.array(json.loads(raw_features), dtype=np.float32)
    if raw_features
    else np.array([0.72, 0.30, 0.12, 0.82, 0.60], dtype=np.float32)
)

if sample.shape != (len(FEATURES),):
    raise ValueError(
        f"FFP_FEATURES must contain {len(FEATURES)} numbers in this order: {FEATURES}"
    )

probabilities = model.predict(sample.reshape(1, -1), verbose=0)[0]
winner = int(np.argmax(probabilities))

print(
    json.dumps(
        {
            "modelId": "tensorflow-ffp-hello-world-v0",
            "mode": LABELS[winner],
            "probabilities": {
                label: float(probabilities[index])
                for index, label in enumerate(LABELS)
            },
            "provenanceRefs": ["learning/ffp-tensorflow/scene_classifier.py"],
            "source": "machine-learning",
            "governance": {
                "canonical": False,
                "next": "Pass this proposal through FoxForgeProtocolEngine.evaluateScenePrediction().",
                "mayMutateIdentityCanon": False,
            },
        },
        indent=2,
    )
)
