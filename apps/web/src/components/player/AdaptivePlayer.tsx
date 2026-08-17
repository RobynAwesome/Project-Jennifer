"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./AdaptivePlayer.module.css";
import { ThreePlayerRuntime, type PlayerTelemetry } from "./three-player-runtime";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface StickPosition {
  x: number;
  y: number;
}

export default function AdaptivePlayer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const runtimeRef = useRef<ThreePlayerRuntime | null>(null);
  const joystickPointer = useRef<number | null>(null);
  const [telemetry, setTelemetry] = useState<PlayerTelemetry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stick, setStick] = useState<StickPosition>({ x: 0, y: 0 });
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let runtime: ThreePlayerRuntime | undefined;
    try {
      runtime = new ThreePlayerRuntime(canvas, setTelemetry);
      runtimeRef.current = runtime;
      runtime.start();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "WebGL initialization failed.");
    }

    return () => {
      runtime?.destroy();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
    setInstalled(standalone);

    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const applyJoystick = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const radius = Math.min(rect.width, rect.height) * 0.34;
    let x = event.clientX - (rect.left + rect.width / 2);
    let y = event.clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(x, y);
    if (length > radius) {
      x = (x / length) * radius;
      y = (y / length) * radius;
    }
    setStick({ x, y });
    runtimeRef.current?.setVirtualMovement(x / radius, -y / radius);
  }, []);

  const onJoystickDown = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    joystickPointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    applyJoystick(event);
  }, [applyJoystick]);

  const onJoystickMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (joystickPointer.current !== event.pointerId) return;
    applyJoystick(event);
  }, [applyJoystick]);

  const releaseJoystick = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (joystickPointer.current !== event.pointerId) return;
    joystickPointer.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setStick({ x: 0, y: 0 });
    runtimeRef.current?.setVirtualMovement(0, 0);
  }, []);

  const requestInstall = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  }, [installPrompt]);

  const stickStyle = {
    "--stick-x": `${stick.x}px`,
    "--stick-y": `${stick.y}px`,
  } as CSSProperties;

  return (
    <section
      className={styles.shell}
      data-adaptive-player="kap-v1"
      data-player-ready={telemetry ? "true" : "false"}
      data-input-mode={telemetry?.inputMode ?? "detecting"}
      data-quality-tier={telemetry?.qualityTier ?? "detecting"}
      data-runtime-id={telemetry?.runtimeId ?? "pending"}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-label="Kopano Adaptive Player 3D world" />
      <div className={styles.vignette} aria-hidden="true" />

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <p className={styles.eyebrow}>KPGS · Jennifer Runtime</p>
          <h1 className={styles.title}>Kopano Adaptive Player</h1>
          <p className={styles.subtitle}>One governed player · adaptive rendering · mobile + PC input surfaces</p>
        </div>
        <div className={styles.actions}>
          {!installed && installPrompt ? (
            <button type="button" className={styles.installButton} onClick={requestInstall}>
              Install PWA
            </button>
          ) : null}
          <Link className={styles.backLink} href="/">← Jennifer</Link>
        </div>
      </header>

      <div className={styles.telemetry} aria-live="polite">
        <span>input</span><strong>{telemetry?.inputMode ?? "detecting"}</strong>
        <span>quality</span><strong>{telemetry?.qualityTier ?? "detecting"}</strong>
        <span>fps</span><strong>{telemetry?.fps ?? "—"}</strong>
        <span>draws</span><strong>{telemetry?.drawCalls ?? "—"}</strong>
        <span>position</span><strong>{telemetry ? `${telemetry.playerX}, ${telemetry.playerZ}` : "—"}</strong>
      </div>

      <div className={styles.centerLabel} aria-hidden="true">
        <span>original Jennifer world proof</span>
        <strong>AUTHORITY ≠ RENDERER</strong>
      </div>

      <div className={styles.bottomHud}>
        <div className={styles.desktopControls}>
          <div className={styles.controlCard}>
            <b>WASD / arrows</b> move · <b>drag</b> orbit · <b>wheel</b> zoom · <b>E / Space</b> pulse
          </div>
        </div>

        <div className={styles.touchControls} data-touch-controls="true">
          <div
            className={styles.joystick}
            role="group"
            aria-label="Movement joystick"
            onPointerDown={onJoystickDown}
            onPointerMove={onJoystickMove}
            onPointerUp={releaseJoystick}
            onPointerCancel={releaseJoystick}
          >
            <div className={styles.stick} style={stickStyle} aria-hidden="true" />
          </div>
          <button
            type="button"
            className={styles.actionButton}
            aria-label="Pulse Jennifer core"
            onPointerDown={() => runtimeRef.current?.triggerAction()}
          >
            Pulse
          </button>
        </div>
      </div>

      {error ? (
        <div className={styles.error} role="alert">
          <div className={styles.errorCard}>
            <h2>3D runtime unavailable</h2>
            <p>{error}</p>
            <p>The governed Jennifer web shell remains available; this device can continue through non-WebGL surfaces.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
