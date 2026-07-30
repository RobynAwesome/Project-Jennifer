# POC vs FOC Evaluation

`POCvsFOCEvaluator` is one evaluator implementation that can be plugged into CEEP.

## Why it exists

- Tracks conceptual **Proof of Concept** maturity (POC score)
- Surfaces **FOC** risk categories to avoid conceptual drift or fragility

## Supported FOC categories

- FakeOfConcept
- FreedomOfConcept
- FabricationOfConcept
- FailureOfConcept
- FrameworkOfConcept
- FractionOfConcept
- FallacyOfConcept
- FringementOfConcept
- FrictionOfConcept
- FragmentationOfConcept
- FinancialOfConcept
- FragilityOfConcept
- FandomOfConcept

## Evaluator output

- POC score
- Strengths
- FOC risk list
- Recommendations

## Relationship to CEEP

POC vs FOC **does not replace** CEEP. It is a single pluggable evaluator strategy used by CEEP to produce conceptual receipts that can later be processed by CCP.
