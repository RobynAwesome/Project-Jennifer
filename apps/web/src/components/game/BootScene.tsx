interface BootSceneProps {
  onReady: () => void;
}

export default function BootScene({ onReady }: BootSceneProps) {
  return (
    <section className="bg-jennifer-surface border border-jennifer-border rounded-xl p-8 text-center">
      <h2 className="text-2xl font-bold text-white">BootScene</h2>
      <p className="mt-2 text-sm text-gray-400">
        APWA game shell initialization complete. Runtime signal ready.
      </p>
      <button
        type="button"
        onClick={onReady}
        className="mt-6 rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-4 py-2 text-sm font-semibold text-jennifer-primary hover:bg-jennifer-primary/30"
      >
        Continue to MenuScene
      </button>
    </section>
  );
}
