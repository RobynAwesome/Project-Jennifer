interface MenuSceneProps {
  onStartPlay: () => void;
  onRunDemo: () => void;
}

export default function MenuScene({ onStartPlay, onRunDemo }: MenuSceneProps) {
  return (
    <section className="bg-jennifer-surface border border-jennifer-border rounded-xl p-8">
      <h2 className="text-2xl font-bold text-white">MenuScene</h2>
      <p className="mt-2 text-sm text-gray-400">
        Control-room mission launcher for Project Jennifer APWA demo path.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStartPlay}
          className="rounded-md border border-emerald-400 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-400/20"
        >
          Enter PlayScene
        </button>
        <button
          type="button"
          onClick={onRunDemo}
          className="rounded-md border border-jennifer-primary bg-jennifer-primary/20 px-4 py-2 text-sm font-semibold text-jennifer-primary hover:bg-jennifer-primary/30"
        >
          Run Guided Demo Flow
        </button>
      </div>
    </section>
  );
}
