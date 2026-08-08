export {
  InMemoryGSMB,
  PrismaGSMB,
  ContextManager,
  MemoryIndexer,
} from "./gsmb.js";

export type {
  IMemoryStore,
  GSMBWriteEntry,
  GSMBReadFilter,
  PersistedMemoryEntry,
  ObjectiveWeightVector,
} from "./gsmb.js";

export {
  ARPM_RESEARCH_PROFILE,
  MEMORY_RECEIPT_INVARIANTS,
  MemoryReceiptEngine,
  RELATIONAL_FAILURE_VECTORS,
  buildRiskVectorMatrix,
  validateMemoryReceiptInput,
} from "./memory-receipt-engine.js";

export type {
  MemoryReceipt,
  MemoryReceiptInput,
  MemoryReceiptRiskAnalysis,
  ReceiptAdmission,
  ReceiptConceptState,
  ReceiptMemoryLane,
  RelationalFailureVector,
  RetrievalValidationTrace,
  RiskVectorMatrix,
  RiskVectorObservation,
  RiskVectorObservations,
  TemporalGovernance,
} from "./memory-receipt-engine.js";
