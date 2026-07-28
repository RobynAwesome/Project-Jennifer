/**
 * AssetManifest – single source of truth for all game texture keys.
 *
 * Textures are generated programmatically in BootScene using Phaser's
 * Graphics API so no external image files are required for the vertical slice.
 * External image paths can be added to the `externalImages` list for future
 * art passes.
 */

// ─── Texture keys ────────────────────────────────────────────────────────────

export const TEXTURE_KEYS = {
  // Player
  PLAYER: "player",
  // District portals
  PORTAL_ACTIVE: "portal-active",
  PORTAL_LOCKED: "portal-locked",
  // Memory District
  MEMORY_NODE: "memory-node",
  TERMINAL: "terminal",
  // NPCs
  NPC_GUIDE: "npc-guide",
  NPC_ARCHIVIST: "npc-archivist",
  // UI panels
  PANEL_DARK: "panel-dark",
  PANEL_BORDER: "panel-border",
  // Buttons
  BTN_PRIMARY: "btn-primary",
  BTN_SUCCESS: "btn-success",
  BTN_DANGER: "btn-danger",
  BTN_MUTED: "btn-muted",
} as const;

export type TextureKey = (typeof TEXTURE_KEYS)[keyof typeof TEXTURE_KEYS];

// ─── Colour palette (mirrors globals.css tokens) ─────────────────────────────

export const PALETTE = {
  PRIMARY: 0x6366f1,
  ACCENT: 0xa855f7,
  DARK: 0x0f0f1a,
  SURFACE: 0x1a1a2e,
  SURFACE_LIGHT: 0x151526,
  BORDER: 0x2d2d4a,
  TEXT_WHITE: 0xffffff,
  TEXT_MUTED: 0x9ca3af,
  BLUE: 0x3b82f6,
  BLUE_LIGHT: 0x60a5fa,
  BLUE_DARK: 0x1e3a5f,
  CYAN: 0x06b6d4,
  CYAN_LIGHT: 0x22d3ee,
  EMERALD: 0x10b981,
  AMBER: 0xf59e0b,
  RED: 0xef4444,
  GRAY: 0x374151,
  GRAY_LIGHT: 0x4b5563,
} as const;

// ─── Programmatic texture definitions ────────────────────────────────────────

export type GeneratedShape = "circle" | "rounded-rect" | "rect";

export interface AssetDefinition {
  key: TextureKey;
  shape: GeneratedShape;
  width: number;
  height: number;
  fillColor: number;
  fillAlpha?: number;
  strokeColor?: number;
  strokeWidth?: number;
  radius?: number; // for rounded-rect
}

export const ASSET_MANIFEST: AssetDefinition[] = [
  {
    key: TEXTURE_KEYS.PLAYER,
    shape: "circle",
    width: 32,
    height: 32,
    fillColor: PALETTE.PRIMARY,
    strokeColor: PALETTE.ACCENT,
    strokeWidth: 2,
  },
  {
    key: TEXTURE_KEYS.PORTAL_ACTIVE,
    shape: "rounded-rect",
    width: 80,
    height: 80,
    fillColor: PALETTE.BLUE_DARK,
    strokeColor: PALETTE.BLUE,
    strokeWidth: 2,
    radius: 8,
  },
  {
    key: TEXTURE_KEYS.PORTAL_LOCKED,
    shape: "rounded-rect",
    width: 80,
    height: 80,
    fillColor: 0x111827,
    strokeColor: PALETTE.GRAY,
    strokeWidth: 1,
    radius: 8,
  },
  {
    key: TEXTURE_KEYS.MEMORY_NODE,
    shape: "circle",
    width: 22,
    height: 22,
    fillColor: PALETTE.BLUE,
    fillAlpha: 0.8,
    strokeColor: PALETTE.BLUE_LIGHT,
    strokeWidth: 1,
  },
  {
    key: TEXTURE_KEYS.TERMINAL,
    shape: "rounded-rect",
    width: 48,
    height: 48,
    fillColor: 0x064e63,
    strokeColor: PALETTE.CYAN,
    strokeWidth: 2,
    radius: 6,
  },
  {
    key: TEXTURE_KEYS.NPC_GUIDE,
    shape: "circle",
    width: 28,
    height: 28,
    fillColor: PALETTE.AMBER,
    strokeColor: 0xfcd34d,
    strokeWidth: 1,
  },
  {
    key: TEXTURE_KEYS.NPC_ARCHIVIST,
    shape: "circle",
    width: 28,
    height: 28,
    fillColor: PALETTE.CYAN,
    strokeColor: PALETTE.CYAN_LIGHT,
    strokeWidth: 1,
  },
  {
    key: TEXTURE_KEYS.BTN_PRIMARY,
    shape: "rounded-rect",
    width: 200,
    height: 44,
    fillColor: 0x312e81,
    strokeColor: PALETTE.PRIMARY,
    strokeWidth: 2,
    radius: 6,
  },
  {
    key: TEXTURE_KEYS.BTN_SUCCESS,
    shape: "rounded-rect",
    width: 200,
    height: 44,
    fillColor: 0x064e3b,
    strokeColor: PALETTE.EMERALD,
    strokeWidth: 2,
    radius: 6,
  },
  {
    key: TEXTURE_KEYS.BTN_DANGER,
    shape: "rounded-rect",
    width: 200,
    height: 44,
    fillColor: 0x450a0a,
    strokeColor: PALETTE.RED,
    strokeWidth: 2,
    radius: 6,
  },
  {
    key: TEXTURE_KEYS.BTN_MUTED,
    shape: "rounded-rect",
    width: 200,
    height: 44,
    fillColor: 0x1f2937,
    strokeColor: PALETTE.GRAY_LIGHT,
    strokeWidth: 1,
    radius: 6,
  },
  {
    key: TEXTURE_KEYS.PANEL_DARK,
    shape: "rounded-rect",
    width: 500,
    height: 380,
    fillColor: PALETTE.SURFACE,
    fillAlpha: 0.97,
    strokeColor: PALETTE.BORDER,
    strokeWidth: 2,
    radius: 10,
  },
  {
    key: TEXTURE_KEYS.PANEL_BORDER,
    shape: "rounded-rect",
    width: 500,
    height: 380,
    fillColor: PALETTE.DARK,
    fillAlpha: 0.95,
    strokeColor: PALETTE.PRIMARY,
    strokeWidth: 2,
    radius: 10,
  },
];
