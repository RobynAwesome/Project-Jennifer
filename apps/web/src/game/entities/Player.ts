import Phaser from "phaser";
import { GameEntity, type IComponent } from "./Entity";
import { TEXTURE_KEYS, PALETTE } from "../AssetManifest";

// ─── Component: Keyboard input ───────────────────────────────────────────────

interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

class KeyboardInputComponent implements IComponent {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly wasd: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  constructor(scene: Phaser.Scene) {
    this.cursors = scene.input.keyboard!.createCursorKeys();
    const { KeyCodes } = Phaser.Input.Keyboard;
    this.wasd = {
      up: scene.input.keyboard!.addKey(KeyCodes.W),
      down: scene.input.keyboard!.addKey(KeyCodes.S),
      left: scene.input.keyboard!.addKey(KeyCodes.A),
      right: scene.input.keyboard!.addKey(KeyCodes.D),
    };
  }

  getInput(): InputState {
    return {
      up: this.cursors.up.isDown || this.wasd.up.isDown,
      down: this.cursors.down.isDown || this.wasd.down.isDown,
      left: this.cursors.left.isDown || this.wasd.left.isDown,
      right: this.cursors.right.isDown || this.wasd.right.isDown,
    };
  }

  update(_delta: number): void {}
  destroy(): void {}
}

// ─── Component: Movement ─────────────────────────────────────────────────────

class MovementComponent implements IComponent {
  constructor(
    private readonly body: Phaser.Physics.Arcade.Body,
    private readonly input: KeyboardInputComponent,
    readonly speed: number = 180
  ) {}

  update(_delta: number): void {
    const { up, down, left, right } = this.input.getInput();

    const vx = (left ? -1 : 0) + (right ? 1 : 0);
    const vy = (up ? -1 : 0) + (down ? 1 : 0);

    if (vx !== 0 || vy !== 0) {
      const magnitude = Math.sqrt(vx * vx + vy * vy);
      this.body.setVelocity(
        (vx / magnitude) * this.speed,
        (vy / magnitude) * this.speed
      );
    } else {
      this.body.setVelocity(0, 0);
    }
  }

  destroy(): void {}
}

// ─── Player entity ───────────────────────────────────────────────────────────

export class Player extends GameEntity {
  /** Public so scenes can attach camera follow and collision groups. */
  sprite!: Phaser.Physics.Arcade.Image;

  private label!: Phaser.GameObjects.Text;
  private interactKey!: Phaser.Input.Keyboard.Key;
  private glow!: Phaser.GameObjects.Ellipse;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly displayName: string = "Jennifer"
  ) {
    super(scene, x, y);
  }

  create(): void {
    // Glow ring (rendered below sprite)
    this.glow = this.scene.add.ellipse(
      this.initX,
      this.initY,
      48,
      48,
      PALETTE.PRIMARY,
      0.18
    );

    // Physics sprite
    this.sprite = this.scene.physics.add.image(
      this.initX,
      this.initY,
      TEXTURE_KEYS.PLAYER
    );
    this.sprite.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.glow.setDepth(9);

    // Name label
    this.label = this.scene.add
      .text(this.initX, this.initY - 26, this.displayName, {
        fontSize: "10px",
        color: "#9ca3af",
        fontFamily: '"Courier New", monospace',
      })
      .setOrigin(0.5, 1)
      .setDepth(11);

    // Interaction key
    this.interactKey = this.scene.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // Pulse tween on the glow
    this.scene.tweens.add({
      targets: this.glow,
      scaleX: 1.3,
      scaleY: 1.3,
      alpha: 0.08,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Wire up components
    const keyboard = this.addComponent(
      "keyboard",
      new KeyboardInputComponent(this.scene)
    );
    this.addComponent("movement", new MovementComponent(this.sprite.body as Phaser.Physics.Arcade.Body, keyboard));
  }

  override update(delta: number): void {
    super.update(delta);

    // Sync glow + label to sprite position
    this.glow.setPosition(this.sprite.x, this.sprite.y);
    this.label.setPosition(this.sprite.x, this.sprite.y - 22);

    // Emit interact event on E press
    if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
      this.scene.events.emit("player:interact", {
        x: this.sprite.x,
        y: this.sprite.y,
      });
    }
  }

  protected override onDestroy(): void {
    this.sprite?.destroy();
    this.label?.destroy();
    this.glow?.destroy();
  }
}
