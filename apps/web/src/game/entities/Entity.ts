import type Phaser from "phaser";

/**
 * IComponent – minimal interface every component must implement.
 * Components hold one focused piece of behaviour and update each frame.
 */
export interface IComponent {
  update(delta: number): void;
  destroy(): void;
}

/**
 * GameEntity – base class for all game entities.
 *
 * Entities are plain composition containers: they own a set of IComponents
 * and delegate each frame's update to them.  Direct Phaser GameObjects
 * (sprites, images, text) are stored as public properties of concrete
 * entity subclasses so scenes can reference them without casting.
 *
 * Lifecycle:
 *   new Entity(scene, x, y)
 *   entity.create()           ← call once after construction
 *   entity.update(delta)      ← call from scene.update()
 *   entity.destroy()          ← call when removing from scene
 */
export abstract class GameEntity {
  private readonly _components = new Map<string, IComponent>();

  constructor(
    protected readonly scene: Phaser.Scene,
    protected readonly initX: number,
    protected readonly initY: number
  ) {}

  // ─── Component registry ──────────────────────────────────────────────────

  addComponent<T extends IComponent>(name: string, component: T): T {
    this._components.set(name, component);
    return component;
  }

  getComponent<T extends IComponent>(name: string): T | undefined {
    return this._components.get(name) as T | undefined;
  }

  hasComponent(name: string): boolean {
    return this._components.has(name);
  }

  // ─── Lifecycle ───────────────────────────────────────────────────────────

  /** Subclasses create their Phaser game objects here. */
  abstract create(): void;

  /** Called by the scene's update loop; delegates to all components. */
  update(delta: number): void {
    for (const component of this._components.values()) {
      component.update(delta);
    }
  }

  /** Destroys all components then calls onDestroy for subclass cleanup. */
  destroy(): void {
    for (const component of this._components.values()) {
      component.destroy();
    }
    this._components.clear();
    this.onDestroy();
  }

  /** Subclasses override to destroy their own Phaser game objects. */
  protected onDestroy(): void {}
}

// ─── Reusable concrete components ────────────────────────────────────────────

/**
 * PingPongPatrolComponent – moves a physics body back and forth between two
 * x positions at a constant speed.
 */
export class PingPongPatrolComponent implements IComponent {
  private direction = 1;

  constructor(
    private readonly body: Phaser.Physics.Arcade.Body,
    private readonly minX: number,
    private readonly maxX: number,
    private readonly speed: number = 60
  ) {}

  update(_delta: number): void {
    const x = this.body.x;

    if (x >= this.maxX) this.direction = -1;
    if (x <= this.minX) this.direction = 1;

    this.body.setVelocityX(this.direction * this.speed);
  }

  destroy(): void {}
}
