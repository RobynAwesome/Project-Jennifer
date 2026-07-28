import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { StartMenuScene } from "./scenes/StartMenuScene";
import { PersonaSelectScene } from "./scenes/PersonaSelectScene";
import { GovernanceHallScene } from "./scenes/GovernanceHallScene";
import { MemoryDistrictScene } from "./scenes/MemoryDistrictScene";
import { ValidationDemoScene } from "./scenes/ValidationDemoScene";

/**
 * createJenniferGame – Phaser.Game factory.
 *
 * Only called client-side (inside a useEffect) so Phaser never runs during
 * Next.js server-side rendering.
 *
 * @param parentId  ID of the DOM element that Phaser should mount its canvas into.
 */
export function createJenniferGame(parentId: string): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentId,
    width: 800,
    height: 600,
    backgroundColor: "#0f0f1a",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 600,
    },
    scene: [
      BootScene,
      StartMenuScene,
      PersonaSelectScene,
      GovernanceHallScene,
      MemoryDistrictScene,
      ValidationDemoScene,
    ],
  });
}
