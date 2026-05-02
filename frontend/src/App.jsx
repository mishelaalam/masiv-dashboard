/**
 * App — root layout.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │  Header                                       │
 *   ├──────────┬───────────────────────────────────┤
 *   │ Left     │                                   │
 *   │ Panel    │         3D Scene                  │
 *   │ (AI +    │                                   │
 *   │ Projects)│                                   │
 *   └──────────┴───────────────────────────────────┘
 *                                     ↖ BuildingPopup (absolute)
 *                                     ↖ Legend (absolute, bottom-left)
 */

import { useEffect } from "react";
import "./index.css";
import Scene3D      from "./components/Scene3D";
import Header       from "./components/Header";
import LLMPanel     from "./components/LLMPanel";
import ProjectsPanel from "./components/ProjectsPanel";
import BuildingPopup from "./components/BuildingPopup";
import Legend        from "./components/Legend";
import { useStore }  from "./store/useStore";

export default function App() {
  const fetchBuildings = useStore((s) => s.fetchBuildings);

  useEffect(() => {
    fetchBuildings();
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden">
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-3 p-3 overflow-y-auto bg-slate-900/60 z-10">
          <LLMPanel />
          <ProjectsPanel />
        </aside>

        {/* 3D viewport */}
        <main className="flex-1 relative">
          <Scene3D />

          {/* Floating panels */}
          <BuildingPopup />

          <div className="absolute bottom-4 left-4 z-50">
            <Legend />
          </div>

          {/* Camera controls hint */}
          <div className="absolute bottom-4 right-4 text-xs text-slate-600 text-right">
            <div>Drag to orbit • Scroll to zoom</div>
            <div>Click building to inspect</div>
          </div>
        </main>
      </div>
    </div>
  );
}
