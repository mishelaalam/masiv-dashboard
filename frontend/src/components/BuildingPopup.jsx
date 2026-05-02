/**
 * BuildingPopup — shown when a building is clicked.
 * Displays: name, address, use type, zoning, height, assessed value, levels, year built.
 */

import { useStore } from "../store/useStore";

const fmt = (n) =>
  n != null ? `$${Number(n).toLocaleString("en-CA")}` : "N/A";

export default function BuildingPopup() {
  const { selectedBuilding, setSelectedBuilding } = useStore();
  if (!selectedBuilding) return null;

  const b = selectedBuilding;

  return (
    <div className="glass absolute top-4 right-4 w-72 p-4 z-50 text-sm shadow-2xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-base text-white leading-tight">
            {b.name || "Building"}
          </h3>
          <p className="text-slate-400 text-xs mt-0.5">{b.address}</p>
        </div>
        <button
          onClick={() => setSelectedBuilding(null)}
          className="text-slate-500 hover:text-white ml-2 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Data grid */}
      <div className="grid grid-cols-2 gap-y-2 gap-x-3">
        <DataRow label="Use Type"    value={b.use_type}    accent="blue" />
        <DataRow label="Zoning"      value={b.zoning}      accent="purple" />
        <DataRow label="Height"      value={`${b.height_m} m`} accent="cyan" />
        <DataRow label="Floors"      value={b.levels}      accent="cyan" />
        <DataRow label="Assessed"    value={fmt(b.assessed_value)} accent="green" />
        <DataRow label="Year Built"  value={b.year_built}  accent="yellow" />
        <DataRow label="Source"      value={b.source}      accent="slate" />
      </div>
    </div>
  );
}

function DataRow({ label, value, accent }) {
  const colors = {
    blue:   "text-blue-400",
    purple: "text-purple-400",
    cyan:   "text-cyan-400",
    green:  "text-emerald-400",
    yellow: "text-yellow-400",
    slate:  "text-slate-400",
  };
  return (
    <>
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium ${colors[accent] || "text-white"}`}>{value ?? "—"}</span>
    </>
  );
}
