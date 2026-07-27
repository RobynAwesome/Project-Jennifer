"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { NetworkStatus, QualityMode } from "@/lib/adaptive-policy";

interface PlaySceneProps {
  qualityMode: QualityMode;
  networkStatus: NetworkStatus;
  nonCriticalIntervalMs: number;
  effectsLevel: number;
  onLogEvent: (message: string) => void;
  onQueueAction: (source: "manual" | "demo") => void;
}

const ARENA_WIDTH = 540;
const ARENA_HEIGHT = 320;
const PLAYER_SIZE = 24;
const TARGET_SIZE = 28;
const TARGET_POSITIONS = [
  { x: 100, y: 80 },
  { x: 420, y: 80 },
  { x: 260, y: 160 },
  { x: 100, y: 240 },
  { x: 420, y: 240 },
];

type MovementKey = "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight";
const DIRECTIONAL_KEYS: MovementKey[] = [
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export default function PlayScene({
  qualityMode,
  networkStatus,
  nonCriticalIntervalMs,
  effectsLevel,
  onLogEvent,
  onQueueAction,
}: PlaySceneProps) {
  const [player, setPlayer] = useState({ x: 270, y: 160 });
  const [health, setHealth] = useState(100);
  const [score, setScore] = useState(0);
  const [hitFeedback, setHitFeedback] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Record<MovementKey, boolean>>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
  });

  const target = TARGET_POSITIONS[targetIndex] ?? { x: 260, y: 160 };
  const playerSpeed = qualityMode === "PERFORMANCE" ? 5 : qualityMode === "BALANCED" ? 4 : 3;
  const pulseCount = Math.max(2, effectsLevel * 3);
  const pulseElements = useMemo(
    () => Array.from({ length: pulseCount }, (_, index) => index),
    [pulseCount]
  );

  const movePlayer = useCallback(
    (movement: Partial<Record<MovementKey, boolean>>) => {
      setPressedKeys((current) => ({
        ...current,
        ...movement,
      }));
    },
    []
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!DIRECTIONAL_KEYS.includes(event.key as MovementKey)) {
        return;
      }

      event.preventDefault();
      setPressedKeys((current) => ({
        ...current,
        [event.key]: true,
      }));
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (!DIRECTIONAL_KEYS.includes(event.key as MovementKey)) {
        return;
      }

      event.preventDefault();
      setPressedKeys((current) => ({
        ...current,
        [event.key]: false,
      }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPlayer((current) => {
        let x = current.x;
        let y = current.y;

        if (pressedKeys.ArrowUp) y -= playerSpeed;
        if (pressedKeys.ArrowDown) y += playerSpeed;
        if (pressedKeys.ArrowLeft) x -= playerSpeed;
        if (pressedKeys.ArrowRight) x += playerSpeed;

        return {
          x: clamp(x, PLAYER_SIZE, ARENA_WIDTH - PLAYER_SIZE),
          y: clamp(y, PLAYER_SIZE, ARENA_HEIGHT - PLAYER_SIZE),
        };
      });
    }, 16);

    return () => window.clearInterval(interval);
  }, [playerSpeed, pressedKeys]);

  useEffect(() => {
    const collisionX = Math.abs(player.x - target.x) < (PLAYER_SIZE + TARGET_SIZE) / 2;
    const collisionY = Math.abs(player.y - target.y) < (PLAYER_SIZE + TARGET_SIZE) / 2;
    if (!collisionX || !collisionY) {
      return;
    }

    setScore((current) => current + 10);
    setHealth((current) => Math.max(0, current - 5));
    setTargetIndex((current) => (current + 1) % TARGET_POSITIONS.length);
    setHitFeedback(true);
    onLogEvent("Dummy target collision confirmed (+10 score, -5 health).");
    window.setTimeout(() => setHitFeedback(false), 300);
  }, [onLogEvent, player.x, player.y, target.x, target.y]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (networkStatus !== "ONLINE") {
        return;
      }
      onLogEvent(`Noncritical ambient tick (${qualityMode})`);
    }, nonCriticalIntervalMs);

    return () => window.clearInterval(interval);
  }, [networkStatus, nonCriticalIntervalMs, onLogEvent, qualityMode]);

  return (
    <section className="bg-jennifer-surface border border-jennifer-border rounded-xl p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-bold text-white">PlayScene</h2>
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full border border-jennifer-border px-2 py-1 text-gray-300">
            Health: {health}
          </span>
          <span className="rounded-full border border-jennifer-border px-2 py-1 text-gray-300">
            Score: {score}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
        <div
          className="relative overflow-hidden rounded-xl border border-jennifer-border bg-jennifer-dark"
          style={{ width: "100%", maxWidth: ARENA_WIDTH, height: ARENA_HEIGHT }}
        >
          {pulseElements.map((pulse) => (
            <span
              key={pulse}
              className="absolute h-1 w-1 rounded-full bg-jennifer-accent/30"
              style={{
                left: `${(pulse * 43) % ARENA_WIDTH}px`,
                top: `${(pulse * 31) % ARENA_HEIGHT}px`,
              }}
            />
          ))}
          <div
            className="absolute rounded-md bg-emerald-400 transition-all"
            style={{
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
              left: player.x - PLAYER_SIZE / 2,
              top: player.y - PLAYER_SIZE / 2,
            }}
          />
          <div
            className={`absolute rounded-full border border-red-300 bg-red-500/80 ${
              hitFeedback ? "scale-125" : "scale-100"
            } transition-transform`}
            style={{
              width: TARGET_SIZE,
              height: TARGET_SIZE,
              left: target.x - TARGET_SIZE / 2,
              top: target.y - TARGET_SIZE / 2,
            }}
          />
          {hitFeedback && (
            <p className="absolute left-3 top-3 text-xs font-semibold text-amber-300">
              HIT CONFIRMED
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs text-gray-300">
          <button
            type="button"
            onMouseDown={() => movePlayer({ ArrowUp: true })}
            onMouseUp={() => movePlayer({ ArrowUp: false })}
            onTouchStart={() => movePlayer({ ArrowUp: true })}
            onTouchEnd={() => movePlayer({ ArrowUp: false })}
            className="col-start-2 rounded-md border border-jennifer-border bg-jennifer-dark px-3 py-2"
          >
            ↑
          </button>
          <button
            type="button"
            onMouseDown={() => movePlayer({ ArrowLeft: true })}
            onMouseUp={() => movePlayer({ ArrowLeft: false })}
            onTouchStart={() => movePlayer({ ArrowLeft: true })}
            onTouchEnd={() => movePlayer({ ArrowLeft: false })}
            className="rounded-md border border-jennifer-border bg-jennifer-dark px-3 py-2"
          >
            ←
          </button>
          <button
            type="button"
            onMouseDown={() => movePlayer({ ArrowDown: true })}
            onMouseUp={() => movePlayer({ ArrowDown: false })}
            onTouchStart={() => movePlayer({ ArrowDown: true })}
            onTouchEnd={() => movePlayer({ ArrowDown: false })}
            className="rounded-md border border-jennifer-border bg-jennifer-dark px-3 py-2"
          >
            ↓
          </button>
          <button
            type="button"
            onMouseDown={() => movePlayer({ ArrowRight: true })}
            onMouseUp={() => movePlayer({ ArrowRight: false })}
            onTouchStart={() => movePlayer({ ArrowRight: true })}
            onTouchEnd={() => movePlayer({ ArrowRight: false })}
            className="rounded-md border border-jennifer-border bg-jennifer-dark px-3 py-2"
          >
            →
          </button>
          <button
            type="button"
            onClick={() => onQueueAction("manual")}
            className="col-span-3 rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-3 py-2 font-semibold text-jennifer-primary"
          >
            Queue Noncritical Action
          </button>
        </div>
      </div>
    </section>
  );
}
