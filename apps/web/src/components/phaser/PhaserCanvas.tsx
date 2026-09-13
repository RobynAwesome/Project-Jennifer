"use client";

import { useEffect, useRef } from "react";

/**
 * PhaserCanvas – client-only React wrapper around the Phaser game.
 *
 * The game module and all its imports (Phaser, @jennifer/governance, …) are
 * loaded inside useEffect so they are never evaluated during Next.js
 * server-side rendering.
 */
export default function PhaserCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const containerId = "jennifer-phaser-game";
    // Type intentionally loosened: Phaser.Game is a browser-only type and
    // the module is loaded dynamically, so we avoid importing the Phaser type
    // at the module level which would break SSR analysis.
    // biome-ignore lint/suspicious/noExplicitAny: dynamic Phaser import
    let game: { destroy: (removeCanvas: boolean) => void } | null = null;
    let cancelled = false;

    void import("@/game/JenniferGame").then(({ createJenniferGame }) => {
      if (!cancelled && document.getElementById(containerId)) {
        game = createJenniferGame(containerId);
      }
    });

    return () => {
      cancelled = true;
      game?.destroy(true);
      game = null;
    };
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-jennifer-dark"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100dvh",
        overflow: "hidden",
      }}
    >
      <div
        id="jennifer-phaser-game"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
