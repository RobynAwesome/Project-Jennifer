import DistrictCard from "./DistrictCard";

// Static district data matching the DistrictManager definitions
const DISTRICTS = [
  {
    name: "central-governance-hall",
    displayName: "Central Governance Hall",
    description: "The seat of governance. Policies are enacted and decisions validated here.",
    npcIds: [],
    activityLevel: 0.85,
    lastEvent: "Policy GP-001 evaluated",
  },
  {
    name: "memory-district",
    displayName: "Memory District",
    description: "The GSMB lives here. Persistent memories form the bedrock of Jennifer's knowledge.",
    npcIds: [],
    activityLevel: 0.6,
    lastEvent: "12 memories consolidated",
  },
  {
    name: "telemetry-tower",
    displayName: "Telemetry Tower",
    description: "Real-time runtime signals converge in this tower. Every event is observable.",
    npcIds: [],
    activityLevel: 1.0,
    lastEvent: "Streaming 247 events/s",
  },
  {
    name: "crisis-connect-hq",
    displayName: "Crisis Connect HQ",
    description: "Humanitarian operations hub. Crisis reports, resource allocation, community support.",
    npcIds: [],
    activityLevel: 0.3,
    lastEvent: "0 active crises",
  },
  {
    name: "collective-ingress-observatory",
    displayName: "Collective Ingress Observatory",
    description: "Monitors societal signals: trends, events, sentiment, and cultural patterns.",
    npcIds: [],
    activityLevel: 0.7,
    lastEvent: "Sentiment: +0.42",
  },
  {
    name: "hue-institute",
    displayName: "HUE Institute",
    description: "Dedicated to human understanding – emotional weighting, context, and adaptation.",
    npcIds: [],
    activityLevel: 0.5,
    lastEvent: "Persona: Best Friend",
  },
  {
    name: "financial-exchange",
    displayName: "Financial Exchange",
    description: "Tracks financial ingress signals and economic impact on the runtime.",
    npcIds: [],
    activityLevel: 0.45,
  },
  {
    name: "training-grounds",
    displayName: "Training Grounds",
    description: "Where NPCs develop skills and users explore governance scenarios.",
    npcIds: [],
    activityLevel: 0.2,
  },
  {
    name: "knowledge-library",
    displayName: "Knowledge Library",
    description: "Semantic memory archive. Grounded facts and validated knowledge reside here.",
    npcIds: [],
    activityLevel: 0.55,
  },
  {
    name: "agent-workshop",
    displayName: "Agent Workshop",
    description: "NPC creation and configuration studio. Design, test, and deploy new agents.",
    npcIds: [],
    activityLevel: 0.15,
  },
];

export default function DistrictGrid() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white">Governance City</h2>
        <span className="text-xs text-gray-500 bg-jennifer-surface border border-jennifer-border rounded-full px-3 py-1">
          10 Districts · World Active
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {DISTRICTS.map((district) => (
          <DistrictCard key={district.name} district={district} />
        ))}
      </div>
    </div>
  );
}
