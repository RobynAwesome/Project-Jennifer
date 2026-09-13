/**
 * KPGSthree.ts is Kopano's governed spatial-runtime layer over Three.js.
 * Jennifer City's admitted renderer is Phaser. Do not mount a second WebGL
 * root until a measured product receipt says the hall needs it.
 */
export const KPGS_THREE_HOLD = {
  package: "KPGSthree.ts",
  repository: "https://github.com/Kopano-Labs/KPGSthree.ts",
  jenniferRenderer: "phaser",
  disposition: "HOLD",
  autoMount: false,
  reasons: [
    "Phaser already owns /game scene authority",
    "GSMB Sprint 2 seeded KPGSthree as a separate spatial POC",
    "two WebGL roots are not a city upgrade",
  ],
} as const;
