interface DistrictCardProps {
  district: {
    name: string;
    displayName: string;
    description: string;
    npcIds: string[];
    activityLevel: number;
    lastEvent?: string;
  };
}

const DISTRICT_ICONS: Record<string, string> = {
  "central-governance-hall": "⚖️",
  "memory-district": "🧠",
  "telemetry-tower": "📡",
  "crisis-connect-hq": "🆘",
  "collective-ingress-observatory": "🌍",
  "hue-institute": "💙",
  "financial-exchange": "💹",
  "training-grounds": "⚔️",
  "knowledge-library": "📚",
  "agent-workshop": "🤖",
};

export default function DistrictCard({ district }: DistrictCardProps) {
  const icon = DISTRICT_ICONS[district.name] ?? "🏛️";
  const activityPercent = Math.round(district.activityLevel * 100);

  return (
    <div className="bg-jennifer-surface border border-jennifer-border rounded-xl p-5 hover:border-jennifer-primary transition-colors duration-200 cursor-pointer group">
      {/* Icon + Name */}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white group-hover:text-jennifer-primary transition-colors truncate">
            {district.displayName}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
            {district.description}
          </p>
        </div>
      </div>

      {/* Activity bar */}
      <div className="mb-2">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Activity</span>
          <span>{activityPercent}%</span>
        </div>
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-jennifer-primary to-jennifer-accent rounded-full transition-all duration-500"
            style={{ width: `${activityPercent}%` }}
          />
        </div>
      </div>

      {/* NPCs + Last event */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{district.npcIds.length} NPCs</span>
        {district.lastEvent && (
          <span className="truncate ml-2 text-gray-600">{district.lastEvent}</span>
        )}
      </div>
    </div>
  );
}
