import * as THREE from "three";
import {
  detectPlayerProfile,
  nextQualityTier,
  QUALITY_PRESETS,
  type PlayerInputMode,
  type PlayerProfile,
  type PlayerQualityTier,
} from "./player-profile";

export interface PlayerTelemetry {
  runtimeId: string;
  inputMode: PlayerInputMode;
  qualityTier: PlayerQualityTier;
  reducedMotion: boolean;
  fps: number;
  drawCalls: number;
  triangles: number;
  playerX: number;
  playerZ: number;
}

const MAX_PARTICLES = 1000;
const WORLD_RADIUS = 24;
const CAMERA_HEIGHT = 6.5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export class ThreePlayerRuntime {
  readonly profile: PlayerProfile;
  readonly runtimeId: string;

  private readonly canvas: HTMLCanvasElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(58, 1, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly clock = new THREE.Clock();
  private readonly player = new THREE.Group();
  private readonly playerMaterial = new THREE.MeshStandardMaterial({
    color: 0xf4f7ff,
    emissive: 0x4d7cff,
    emissiveIntensity: 1.2,
    metalness: 0.4,
    roughness: 0.25,
  });
  private readonly coreMaterial = new THREE.MeshStandardMaterial({
    color: 0x101a33,
    emissive: 0x00d9ff,
    emissiveIntensity: 1.6,
    metalness: 0.7,
    roughness: 0.2,
  });
  private readonly core = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.7, 0.22, 96, 12),
    this.coreMaterial,
  );
  private readonly particles = new THREE.Points();
  private readonly keys = new Set<string>();
  private readonly movement = new THREE.Vector3();
  private readonly cameraOffset = new THREE.Vector3();
  private readonly cameraTarget = new THREE.Vector3();
  private readonly forward = new THREE.Vector3();
  private readonly right = new THREE.Vector3();
  private readonly onTelemetry: (telemetry: PlayerTelemetry) => void;

  private frameRequest = 0;
  private virtualX = 0;
  private virtualZ = 0;
  private yaw = Math.PI;
  private cameraDistance = 11;
  private pointerId: number | undefined;
  private pointerX = 0;
  private qualityTier: PlayerQualityTier;
  private frameTotalMs = 0;
  private frameCount = 0;
  private telemetryElapsedMs = 0;
  private qualityElapsedMs = 0;
  private actionPulse = 0;
  private destroyed = false;

  constructor(canvas: HTMLCanvasElement, onTelemetry: (telemetry: PlayerTelemetry) => void) {
    this.canvas = canvas;
    this.onTelemetry = onTelemetry;
    this.profile = detectPlayerProfile();
    this.qualityTier = this.profile.qualityTier;
    this.runtimeId = `kap-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    const preset = QUALITY_PRESETS[this.qualityTier];
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: preset.antialias,
      alpha: false,
      powerPreference: this.qualityTier === "lite" ? "low-power" : "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.scene.background = new THREE.Color(0x060912);
    this.scene.fog = new THREE.FogExp2(0x060912, 0.026);

    this.buildWorld();
    this.applyQuality(this.qualityTier);
    this.resize();
  }

  start(): void {
    if (this.destroyed) return;
    window.addEventListener("resize", this.resize);
    window.addEventListener("orientationchange", this.resize);
    window.addEventListener("keydown", this.onKeyDown, { passive: false });
    window.addEventListener("keyup", this.onKeyUp);
    this.canvas.addEventListener("pointerdown", this.onPointerDown);
    this.canvas.addEventListener("pointermove", this.onPointerMove);
    this.canvas.addEventListener("pointerup", this.onPointerUp);
    this.canvas.addEventListener("pointercancel", this.onPointerUp);
    this.canvas.addEventListener("wheel", this.onWheel, { passive: false });

    this.canvas.dataset.playerReady = "true";
    this.canvas.dataset.runtimeId = this.runtimeId;
    this.canvas.dataset.inputMode = this.profile.inputMode;
    this.canvas.dataset.qualityTier = this.qualityTier;

    this.clock.start();
    this.frameRequest = window.requestAnimationFrame(this.tick);
    this.emitTelemetry(60);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    window.cancelAnimationFrame(this.frameRequest);
    window.removeEventListener("resize", this.resize);
    window.removeEventListener("orientationchange", this.resize);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    this.canvas.removeEventListener("pointercancel", this.onPointerUp);
    this.canvas.removeEventListener("wheel", this.onWheel);
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
        object.geometry.dispose();
        const material = object.material;
        if (Array.isArray(material)) material.forEach((entry) => entry.dispose());
        else material.dispose();
      }
    });
    this.renderer.dispose();
  }

  setVirtualMovement(x: number, z: number): void {
    this.virtualX = THREE.MathUtils.clamp(x, -1, 1);
    this.virtualZ = THREE.MathUtils.clamp(z, -1, 1);
  }

  triggerAction(): void {
    this.actionPulse = 1;
  }

  private buildWorld(): void {
    const hemi = new THREE.HemisphereLight(0x91a7ff, 0x080b14, 1.25);
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(8, 14, 4);
    this.scene.add(hemi, key);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(WORLD_RADIUS + 8, 64),
      new THREE.MeshStandardMaterial({
        color: 0x080d19,
        roughness: 0.92,
        metalness: 0.08,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.03;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(56, 56, 0x3454d1, 0x15213f);
    const gridMaterial = grid.material as THREE.LineBasicMaterial;
    gridMaterial.transparent = true;
    gridMaterial.opacity = 0.32;
    this.scene.add(grid);

    this.core.position.set(0, 2.8, 0);
    this.scene.add(this.core);

    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(3.2, 0.035, 8, 96),
      new THREE.MeshBasicMaterial({ color: 0xff4d8d, transparent: true, opacity: 0.75 }),
    );
    halo.rotation.x = Math.PI / 2;
    halo.position.y = 1.2;
    this.scene.add(halo);

    const towerGeometry = new THREE.BoxGeometry(1.1, 1, 1.1);
    const towerMaterial = new THREE.MeshStandardMaterial({
      color: 0x16294e,
      emissive: 0x0a1a3a,
      emissiveIntensity: 0.7,
      metalness: 0.45,
      roughness: 0.5,
    });
    const towers = new THREE.InstancedMesh(towerGeometry, towerMaterial, 40);
    const matrix = new THREE.Matrix4();
    const random = seededRandom(0x4a454e4e);
    for (let index = 0; index < 40; index += 1) {
      const angle = (index / 40) * Math.PI * 2 + random() * 0.12;
      const radius = 7 + random() * 15;
      const height = 0.8 + random() * 5.2;
      matrix.compose(
        new THREE.Vector3(Math.cos(angle) * radius, height / 2, Math.sin(angle) * radius),
        new THREE.Quaternion(),
        new THREE.Vector3(0.7 + random() * 1.6, height, 0.7 + random() * 1.6),
      );
      towers.setMatrixAt(index, matrix);
    }
    towers.instanceMatrix.needsUpdate = true;
    this.scene.add(towers);

    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(MAX_PARTICLES * 3);
    for (let index = 0; index < MAX_PARTICLES; index += 1) {
      const radius = 4 + random() * 26;
      const angle = random() * Math.PI * 2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = 0.3 + random() * 10;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x6ce8ff,
      size: 0.055,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });
    this.particles.geometry = particleGeometry;
    this.particles.material = particleMaterial;
    this.scene.add(this.particles);

    const playerMesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.52, 0), this.playerMaterial);
    playerMesh.position.y = 0.62;
    const playerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.72, 32),
      new THREE.MeshBasicMaterial({ color: 0x7b8dff, transparent: true, opacity: 0.7, side: THREE.DoubleSide }),
    );
    playerRing.rotation.x = -Math.PI / 2;
    playerRing.position.y = 0.03;
    this.player.add(playerMesh, playerRing);
    this.player.position.set(0, 0, 8);
    this.scene.add(this.player);

    this.camera.position.set(0, CAMERA_HEIGHT, 18);
    this.camera.lookAt(this.player.position);
  }

  private applyQuality(tier: PlayerQualityTier): void {
    const preset = QUALITY_PRESETS[tier];
    this.qualityTier = tier;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, preset.maxPixelRatio));
    this.particles.geometry.setDrawRange(0, preset.particleCount);
    this.canvas.dataset.qualityTier = tier;
  }

  private readonly resize = (): void => {
    const width = Math.max(1, this.canvas.clientWidth || window.innerWidth);
    const height = Math.max(1, this.canvas.clientHeight || window.innerHeight);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    if (["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
      event.preventDefault();
    }
    this.keys.add(event.code);
    if (event.code === "Space" || event.code === "KeyE") this.triggerAction();
  };

  private readonly onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private readonly onPointerDown = (event: PointerEvent): void => {
    this.pointerId = event.pointerId;
    this.pointerX = event.clientX;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private readonly onPointerMove = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - this.pointerX;
    this.pointerX = event.clientX;
    this.yaw -= deltaX * 0.006;
  };

  private readonly onPointerUp = (event: PointerEvent): void => {
    if (this.pointerId !== event.pointerId) return;
    this.pointerId = undefined;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
  };

  private readonly onWheel = (event: WheelEvent): void => {
    event.preventDefault();
    this.cameraDistance = THREE.MathUtils.clamp(this.cameraDistance + event.deltaY * 0.008, 7, 17);
  };

  private readonly tick = (): void => {
    if (this.destroyed) return;
    const rawDelta = this.clock.getDelta();
    const delta = Math.min(rawDelta, 0.05);
    const frameMs = rawDelta * 1000;

    const keyX = (this.keys.has("KeyD") || this.keys.has("ArrowRight") ? 1 : 0) - (this.keys.has("KeyA") || this.keys.has("ArrowLeft") ? 1 : 0);
    const keyZ = (this.keys.has("KeyW") || this.keys.has("ArrowUp") ? 1 : 0) - (this.keys.has("KeyS") || this.keys.has("ArrowDown") ? 1 : 0);
    const inputX = THREE.MathUtils.clamp(keyX + this.virtualX, -1, 1);
    const inputZ = THREE.MathUtils.clamp(keyZ + this.virtualZ, -1, 1);

    this.forward.set(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    this.right.copy(this.forward).applyAxisAngle(Y_AXIS, -Math.PI / 2);
    this.movement.set(0, 0, 0).addScaledVector(this.right, inputX).addScaledVector(this.forward, inputZ);
    if (this.movement.lengthSq() > 1) this.movement.normalize();
    this.player.position.addScaledVector(this.movement, delta * 5.4);
    const radial = Math.hypot(this.player.position.x, this.player.position.z);
    if (radial > WORLD_RADIUS) this.player.position.multiplyScalar(WORLD_RADIUS / radial);

    if (!this.profile.reducedMotion) {
      this.core.rotation.x += delta * 0.22;
      this.core.rotation.y += delta * 0.34;
      this.particles.rotation.y += delta * 0.012;
    }

    this.actionPulse = Math.max(0, this.actionPulse - delta * 2.4);
    const pulseScale = 1 + Math.sin(this.actionPulse * Math.PI) * 0.35;
    this.player.scale.setScalar(pulseScale);
    this.playerMaterial.emissiveIntensity = 1.2 + this.actionPulse * 2;
    this.coreMaterial.emissiveIntensity = 1.6 + this.actionPulse * 1.5;

    this.cameraOffset.set(Math.sin(this.yaw) * this.cameraDistance, CAMERA_HEIGHT, Math.cos(this.yaw) * this.cameraDistance);
    this.cameraTarget.copy(this.player.position).add(this.cameraOffset);
    this.camera.position.lerp(this.cameraTarget, 1 - Math.pow(0.001, delta));
    this.camera.lookAt(this.player.position.x, 1.15, this.player.position.z);

    this.renderer.render(this.scene, this.camera);
    this.observeFrame(frameMs);
    this.frameRequest = window.requestAnimationFrame(this.tick);
  };

  private observeFrame(frameMs: number): void {
    this.frameTotalMs += frameMs;
    this.frameCount += 1;
    this.telemetryElapsedMs += frameMs;
    this.qualityElapsedMs += frameMs;

    if (this.qualityElapsedMs >= 6000 && this.frameCount > 30) {
      const averageFrameMs = this.frameTotalMs / this.frameCount;
      const candidate = nextQualityTier(this.qualityTier, averageFrameMs, this.profile.reducedMotion);
      if (candidate !== this.qualityTier) this.applyQuality(candidate);
      this.frameTotalMs = 0;
      this.frameCount = 0;
      this.qualityElapsedMs = 0;
    }

    if (this.telemetryElapsedMs >= 1000) {
      const averageFrameMs = this.frameCount > 0 ? this.frameTotalMs / this.frameCount : 16.67;
      this.emitTelemetry(Math.round(1000 / Math.max(1, averageFrameMs)));
      this.telemetryElapsedMs = 0;
    }
  }

  private emitTelemetry(fps: number): void {
    const telemetry: PlayerTelemetry = {
      runtimeId: this.runtimeId,
      inputMode: this.profile.inputMode,
      qualityTier: this.qualityTier,
      reducedMotion: this.profile.reducedMotion,
      fps,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      playerX: Number(this.player.position.x.toFixed(2)),
      playerZ: Number(this.player.position.z.toFixed(2)),
    };
    this.canvas.dataset.playerX = String(telemetry.playerX);
    this.canvas.dataset.playerZ = String(telemetry.playerZ);
    this.onTelemetry(telemetry);
  }
}
