import Phaser from "@/game/phaser-runtime";
import { BootScene } from "./scenes/BootScene";
import { StartMenuScene } from "./scenes/StartMenuScene";
import { PersonaSelectScene } from "./scenes/PersonaSelectScene";
import { CompanionSelectScene } from "./scenes/CompanionSelectScene";
import { GovernanceHallScene } from "./scenes/GovernanceHallScene";
import { MemoryDistrictScene } from "./scenes/MemoryDistrictScene";
import { TelemetryTowerScene } from "./scenes/TelemetryTowerScene";
import { ObservationDistrictScene } from "./scenes/ObservationDistrictScene";
import { ValidationDemoScene } from "./scenes/ValidationDemoScene";
import { KPGS_THREE_HOLD } from "./kpgs-three-hold";

/**
 * createJenniferGame – Phaser.Game factory.
 *
 * Only called client-side (inside a useEffect) so Phaser never runs during
 * Next.js server-side rendering.
 */
export function createJenniferGame(parentId: string): Phaser.Game {
  const parent = document.getElementById(parentId);
  const width = parent?.clientWidth || window.innerWidth || 1280;
  const height = parent?.clientHeight || window.innerHeight || 720;

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width,
    height,
    backgroundColor: "#0f0f1a",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.RESIZE,
      width,
      height,
      autoRound: true,
    },
    scene: [
      BootScene,
      StartMenuScene,
      PersonaSelectScene,
      CompanionSelectScene,
      GovernanceHallScene,
      MemoryDistrictScene,
      TelemetryTowerScene,
      ObservationDistrictScene,
      ValidationDemoScene,
    ],
  });

  (
    window as Window & {
      __JENNIFER_CITY__?: {
        renderer: "phaser";
        kpgsThree: typeof KPGS_THREE_HOLD;
        scale: () => { width: number; height: number };
      };
    }
  ).__JENNIFER_CITY__ = {
    renderer: "phaser",
    kpgsThree: KPGS_THREE_HOLD,
    scale: () => ({ width: game.scale.width, height: game.scale.height }),
  };

  return game;
}
