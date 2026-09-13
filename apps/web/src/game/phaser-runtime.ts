import * as PhaserNamespace from "phaser";

type PhaserModule = typeof PhaserNamespace & {
  default?: typeof PhaserNamespace;
};

const phaserModule = PhaserNamespace as PhaserModule;

/**
 * Phaser 3.88 ships as a namespace export. Next/webpack rejects
 * `import Phaser from "phaser"` and leaves the canvas blank.
 */
const Phaser = phaserModule.default ?? phaserModule;

export default Phaser;
