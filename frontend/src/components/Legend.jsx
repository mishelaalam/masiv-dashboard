/**
 * Legend — small colour key for building use types.
 */

const ENTRIES = [
  { color: "#3b82f6", label: "Residential" },
  { color: "#f59e0b", label: "Commercial" },
  { color: "#8b5cf6", label: "Office" },
  { color: "#ec4899", label: "Hotel" },
  { color: "#64748b", label: "Industrial" },
  { color: "#10b981", label: "Institutional" },
  { color: "#06b6d4", label: "Mixed Use" },
  { color: "#eab308", label: "Retail" },
  { color: "#facc15", label: "Highlighted" },
  { color: "#ff6a00", label: "Selected" },
  { color: "#00ffcc", label: "Fabricating" },
];

export default function Legend() {
  return (
    <div className="glass p-3">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Legend</p>
      <div className="flex flex-col gap-1">
        {ENTRIES.map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
