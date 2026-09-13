/**
 * Minimal procedural city ambience — no external audio assets required.
 */
export function attachCityAmbience(scene: {
  events: { once: (event: string, fn: () => void) => void };
}): void {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 92;
    gain.gain.value = 0.012;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    const stop = () => {
      try {
        osc.stop();
        void ctx.close();
      } catch {
        // ignore
      }
    };

    scene.events.once("shutdown", stop);
    scene.events.once("destroy", stop);
  } catch {
    // Audio is optional flavour; never block play.
  }
}
