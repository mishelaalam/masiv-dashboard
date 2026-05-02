/**
 * Header — app title, building count stats, fabrication mode toggle.
 */

import { useStore, applyFilter } from "../store/useStore";
import { useMemo } from "react";

export default function Header() {
  const { buildings, activeFilter, fabricationMode, toggleFabricationMode, loadingBuildings } =
    useStore();

  const matchCount = useMemo(() => {
    if (!activeFilter) return null;
    return applyFilter(buildings, activeFilter).length;
  }, [buildings, activeFilter]);

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/90 z-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-sm">
          M
        </div>
        <div>
          <h1 className="font-bold text-white text-sm leading-tight">MASIV Urban Dashboard</h1>
          <p className="text-slate-500 text-xs">Calgary Downtown 3D City Map</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-400">
        {loadingBuildings ? (
          <span className="text-blue-400 animate-pulse">Loading buildings…</span>
        ) : (
          <>
            <Stat label="Total" value={buildings.length} />
            {matchCount != null && (
              <Stat label="Matched" value={matchCount} accent="yellow" />
            )}
          </>
        )}

        <button
          onClick={toggleFabricationMode}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
            fabricationMode
              ? "bg-cyan-600 border-cyan-500 text-white"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:border-cyan-600"
          }`}
        >
          {fabricationMode ? "⚙ Stop Fabrication" : "⚙ Fabrication Mode"}
        </button>
      </div>
    </header>
  );
}

function Stat({ label, value, accent }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-slate-500">{label}:</span>
      <span className={accent === "yellow" ? "text-yellow-400 font-bold" : "text-white font-bold"}>
        {value}
      </span>
    </span>
  );
}
