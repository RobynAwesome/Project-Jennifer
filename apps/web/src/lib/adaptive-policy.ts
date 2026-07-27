export type QualityMode = "LITE" | "BALANCED" | "PERFORMANCE";
export type ProfileMode = "AUTO" | QualityMode;
export type NetworkStatus = "ONLINE" | "DEGRADED" | "OFFLINE";

export interface RuntimePolicyInput {
  profileMode: ProfileMode;
  fps: number;
  networkStatus: NetworkStatus;
}

export interface RuntimePolicyResult {
  qualityMode: QualityMode;
  nonCriticalIntervalMs: number;
  effectsLevel: number;
}

export function selectQualityMode(input: RuntimePolicyInput): QualityMode {
  if (input.profileMode !== "AUTO") {
    return input.profileMode;
  }

  if (input.networkStatus !== "ONLINE") {
    return "LITE";
  }

  if (input.fps < 45) {
    return "LITE";
  }

  if (input.fps < 56) {
    return "BALANCED";
  }

  return "PERFORMANCE";
}

export function evaluateRuntimePolicy(
  input: RuntimePolicyInput
): RuntimePolicyResult {
  const qualityMode = selectQualityMode(input);
  const isDegradedNetwork = input.networkStatus === "DEGRADED";
  const isOffline = input.networkStatus === "OFFLINE";

  const nonCriticalIntervalMs = isOffline ? 5000 : isDegradedNetwork ? 3000 : 1200;
  const effectsLevel =
    qualityMode === "PERFORMANCE" ? 3 : qualityMode === "BALANCED" ? 2 : 1;

  return {
    qualityMode,
    nonCriticalIntervalMs,
    effectsLevel: isOffline ? Math.max(1, effectsLevel - 1) : effectsLevel,
  };
}
