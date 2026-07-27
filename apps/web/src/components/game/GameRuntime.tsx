"use client";

import { useCallback, useEffect, useState } from "react";
import BootScene from "@/components/game/BootScene";
import MenuScene from "@/components/game/MenuScene";
import PlayScene from "@/components/game/PlayScene";
import {
  evaluateRuntimePolicy,
  type NetworkStatus,
  type ProfileMode,
} from "@/lib/adaptive-policy";

type Scene = "BOOT" | "MENU" | "PLAY";
type QueueSource = "manual" | "demo";

interface QueuedAction {
  id: string;
  source: QueueSource;
  label: string;
  createdAt: string;
}

const PROFILE_STORAGE_KEY = "jennifer.apwa.profile-mode.v1";
const QUEUE_STORAGE_KEY = "jennifer.apwa.offline-queue.v1";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readQueueStorage(): QueuedAction[] {
  const raw = window.localStorage.getItem(QUEUE_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QueuedAction[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueueStorage(queue: QueuedAction[]): void {
  window.localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
}

export default function GameRuntime() {
  const [scene, setScene] = useState<Scene>("BOOT");
  const [fps, setFps] = useState(60);
  const [profileMode, setProfileMode] = useState<ProfileMode>("AUTO");
  const [browserOnline, setBrowserOnline] = useState(true);
  const [manualNetworkStatus, setManualNetworkStatus] = useState<NetworkStatus | null>(null);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<QueuedAction[]>([]);
  const [replayState, setReplayState] = useState("Idle");

  const browserOnlineStatus: NetworkStatus = browserOnline ? "ONLINE" : "OFFLINE";

  const networkStatus = manualNetworkStatus ?? browserOnlineStatus;
  const policy = evaluateRuntimePolicy({ profileMode, fps, networkStatus });

  const pushEvent = useCallback((message: string) => {
    const stamped = `${new Date().toLocaleTimeString()} · ${message}`;
    setEventLog((current) => [stamped, ...current].slice(0, 10));
  }, []);

  useEffect(() => {
    setBrowserOnline(navigator.onLine);
    const setOnline = () => setBrowserOnline(true);
    const setOffline = () => setBrowserOnline(false);
    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);
    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  useEffect(() => {
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY) as ProfileMode | null;
    if (
      storedProfile === "AUTO" ||
      storedProfile === "LITE" ||
      storedProfile === "BALANCED" ||
      storedProfile === "PERFORMANCE"
    ) {
      setProfileMode(storedProfile);
    }
    const existingQueue = readQueueStorage();
    setOfflineQueue(existingQueue);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, profileMode);
  }, [profileMode]);

  useEffect(() => {
    let frameCount = 0;
    let lastTimestamp = performance.now();
    let rafId = 0;

    const updateFps = (timestamp: number) => {
      frameCount += 1;
      const elapsed = timestamp - lastTimestamp;
      if (elapsed >= 1000) {
        const nextFps = Math.round((frameCount * 1000) / elapsed);
        setFps(nextFps);
        frameCount = 0;
        lastTimestamp = timestamp;
      }
      rafId = window.requestAnimationFrame(updateFps);
    };

    rafId = window.requestAnimationFrame(updateFps);
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    pushEvent(`Quality mode: ${policy.qualityMode} (${profileMode} profile)`);
  }, [policy.qualityMode, profileMode, pushEvent]);

  useEffect(() => {
    pushEvent(`Network status: ${networkStatus}`);
  }, [networkStatus, pushEvent]);

  const queueAction = useCallback(
    (source: QueueSource) => {
      const action: QueuedAction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        source,
        label: source === "demo" ? "Demo incident action" : "Manual noncritical action",
        createdAt: new Date().toISOString(),
      };
      setOfflineQueue((current) => {
        const nextQueue = [...current, action];
        writeQueueStorage(nextQueue);
        return nextQueue;
      });
      pushEvent(`Queued offline action: ${action.label}`);
    },
    [pushEvent]
  );

  const replayQueuedActions = useCallback(async () => {
    if (networkStatus === "OFFLINE" || offlineQueue.length === 0) {
      return;
    }

    setReplayState("Replaying queued actions...");
    for (const action of offlineQueue) {
      await wait(400);
      pushEvent(`Replayed: ${action.label}`);
    }
    setOfflineQueue([]);
    writeQueueStorage([]);
    setReplayState("Replay complete");
  }, [networkStatus, offlineQueue, pushEvent]);

  useEffect(() => {
    void replayQueuedActions();
  }, [networkStatus, replayQueuedActions]);

  const runGuidedDemo = useCallback(async () => {
    if (isDemoRunning) {
      return;
    }

    setIsDemoRunning(true);
    pushEvent("Demo: launch readiness signal confirmed.");
    await wait(350);
    setScene("PLAY");
    pushEvent("Demo: entered PlayScene.");
    await wait(350);
    setProfileMode("AUTO");
    setManualNetworkStatus("DEGRADED");
    pushEvent("Demo: simulated DEGRADED network.");
    await wait(350);
    pushEvent("Demo: adaptive policy shifted quality to LITE.");
    await wait(350);
    setManualNetworkStatus("OFFLINE");
    queueAction("demo");
    pushEvent("Demo: queued offline noncritical action.");
    await wait(350);
    setManualNetworkStatus("ONLINE");
    pushEvent("Demo: network reconnected, replay initiated.");
    await replayQueuedActions();
    setIsDemoRunning(false);
  }, [isDemoRunning, pushEvent, queueAction, replayQueuedActions]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-jennifer-border bg-jennifer-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Project Jennifer APWA POC</h1>
            <p className="text-xs text-gray-400">
              Build 0.4.0 Sprint 3 · Record-ready guided mission flow
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-jennifer-border px-3 py-1 text-gray-300">
              Quality: {policy.qualityMode}
            </span>
            <span className="rounded-full border border-jennifer-border px-3 py-1 text-gray-300">
              Network: {networkStatus}
            </span>
            <span className="rounded-full border border-jennifer-border px-3 py-1 text-gray-300">
              FPS: {fps}
            </span>
            <span className="rounded-full border border-jennifer-accent px-3 py-1 text-jennifer-accent">
              APWA POC
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <label className="text-xs text-gray-400">
            Profile
            <select
              className="ml-2 rounded-md border border-jennifer-border bg-jennifer-dark px-2 py-1 text-gray-200"
              value={profileMode}
              onChange={(event) => setProfileMode(event.target.value as ProfileMode)}
            >
              <option value="AUTO">AUTO</option>
              <option value="LITE">LITE</option>
              <option value="BALANCED">BALANCED</option>
              <option value="PERFORMANCE">PERFORMANCE</option>
            </select>
          </label>
          <label className="text-xs text-gray-400">
            Network Override
            <select
              className="ml-2 rounded-md border border-jennifer-border bg-jennifer-dark px-2 py-1 text-gray-200"
              value={manualNetworkStatus ?? "AUTO"}
              onChange={(event) => {
                const value = event.target.value;
                setManualNetworkStatus(value === "AUTO" ? null : (value as NetworkStatus));
              }}
            >
              <option value="AUTO">AUTO</option>
              <option value="ONLINE">ONLINE</option>
              <option value="DEGRADED">DEGRADED</option>
              <option value="OFFLINE">OFFLINE</option>
            </select>
          </label>
          <button
            type="button"
            onClick={runGuidedDemo}
            className="rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-3 py-1 text-xs font-semibold text-jennifer-primary hover:bg-jennifer-primary/30 disabled:opacity-50"
            disabled={isDemoRunning}
          >
            {isDemoRunning ? "Demo Running..." : "Run Guided Demo Flow"}
          </button>
        </div>
      </div>

      {scene === "BOOT" && (
        <BootScene
          onReady={() => {
            setScene("MENU");
            pushEvent("BootScene completed. Transitioned to MenuScene.");
          }}
        />
      )}
      {scene === "MENU" && <MenuScene onStartPlay={() => setScene("PLAY")} onRunDemo={runGuidedDemo} />}
      {scene === "PLAY" && (
        <PlayScene
          qualityMode={policy.qualityMode}
          networkStatus={networkStatus}
          nonCriticalIntervalMs={policy.nonCriticalIntervalMs}
          effectsLevel={policy.effectsLevel}
          onLogEvent={pushEvent}
          onQueueAction={queueAction}
        />
      )}

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl border border-jennifer-border bg-jennifer-surface p-4">
          <h3 className="text-sm font-semibold text-white">Runtime Status</h3>
          <p className="mt-2 text-xs text-gray-400">Replay: {replayState}</p>
          <p className="mt-1 text-xs text-gray-400">Queued actions: {offlineQueue.length}</p>
          <p className="mt-1 text-xs text-gray-400">
            Noncritical interval: {policy.nonCriticalIntervalMs}ms
          </p>
        </div>
        <div className="rounded-xl border border-jennifer-border bg-jennifer-surface p-4">
          <h3 className="text-sm font-semibold text-white">Event Log (last 10)</h3>
          <ul className="mt-2 space-y-1 text-xs text-gray-400">
            {eventLog.length === 0 && <li>No events yet.</li>}
            {eventLog.map((event) => (
              <li key={event} className="truncate">
                {event}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
