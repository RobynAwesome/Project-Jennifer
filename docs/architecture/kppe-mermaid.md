# KPPE Lightweight Diagram

```mermaid
flowchart TD
    P[Human / Player] --> X[Experience]
    X --> A[Action]
    A --> T[Telemetry]
    T --> S[Structured Event]
    S --> L[Ledger of Time]
    L --> K[KPPE]

    K --> M[KMEC Parser + Provenance]
    M --> Q[PKA Evaluation]
    Q -->|MAYBE / HOLD| L
    Q -->|PROPOSE| G[GLM / SLM Interpretation]
    G --> D[CDP: Explore]
    D --> C[CCP: Converge]
    C --> V[KPGS Validation]
    V -->|Reject / Hold| L
    V -->|Approve| E[Execution]
    E --> R[Receipt]

    R --> W[Game / Economy / NPC / Nature / Device]
    W --> N[New Reality]
    N --> O[Observed Again]
    O --> T

    K -. EP .-> EP[📍 ⏭️ 👑 🔔]
```

## ASCII fallback

```text
PLAYER
  ↓
EXPERIENCE → ACTION → TELEMETRY → STRUCTURED EVENT
                                  ↓
                            LEDGER OF TIME
                                  ↓
                                 KPPE
                                  ↓
                   KMEC PARSE + PROVENANCE
                                  ↓
                           PKA EVALUATION
                           ↙             ↘
                    MAYBE/HOLD          PROPOSE
                        ↓                  ↓
                     LEDGER      GLM / SLM INTERPRET
                                           ↓
                                          CDP
                                           ↓
                                          CCP
                                           ↓
                                     KPGS VALIDATE
                                      ↙          ↘
                                  HOLD          APPROVE
                                    ↓              ↓
                                 LEDGER         EXECUTE
                                                   ↓
                                                RECEIPT
                                                   ↓
                      GAME / ECONOMY / NPC / NATURE / DEVICE
                                                   ↓
                                             NEW REALITY
                                                   ↓
                                            OBSERVED AGAIN
                                                   ↺
```
