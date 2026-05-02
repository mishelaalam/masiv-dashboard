/**
 * Scene3D — the main Three.js / R3F canvas containing:
 *   • Ground plane grid
 *   • All BuildingMesh instances
 *   • FabricationToolpath (when fabrication mode is active)
 *   • Orbit controls, lights
 */

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Sky } from "@react-three/drei";
import BuildingMesh from "./BuildingMesh";
import FabricationToolpath from "./FabricationToolpath";
import { useStore, applyFilter } from "../store/useStore";

function Buildings() {
  const {
    buildings,
    activeFilter,
    selectedBuilding,
    setSelectedBuilding,
    fabricationMode,
    fabricationBuildings,
  } = useStore();

  const filteredIds = useMemo(() => {
    if (!activeFilter) return null;
    const matched = applyFilter(buildings, activeFilter);
    return new Set(matched.map((b) => b.id));
  }, [buildings, activeFilter]);

  return (
    <>
      {buildings.map((b) => {
        const highlighted = filteredIds ? filteredIds.has(b.id) : false;
        const selected    = selectedBuilding?.id === b.id;
        const fabricating = fabricationMode && fabricationBuildings.includes(b.id);

        return (
          <BuildingMesh
            key={b.id}
            building={b}
            highlighted={highlighted}
            selected={selected}
            fabricating={fabricating}
            onClick={setSelectedBuilding}
          />
        );
      })}
    </>
  );
}

export default function Scene3D() {
  const { fabricationMode } = useStore();

  return (
    <Canvas
      camera={{ position: [0, 300, 400], fov: 50 }}
      shadows
      gl={{ antialias: true }}
      style={{ background: "#0a0f1a" }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[200, 400, 200]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight position={[-200, 200, -200]} intensity={0.3} color="#4488ff" />

      {/* Sky */}
      <Sky sunPosition={[100, 50, 100]} turbidity={8} rayleigh={0.5} />

      {/* Ground grid */}
      <Grid
        args={[2000, 2000]}
        position={[0, 0, 0]}
        cellSize={20}
        cellThickness={0.5}
        cellColor="#1e293b"
        sectionSize={100}
        sectionThickness={1}
        sectionColor="#334155"
        fadeDistance={1200}
        fadeStrength={1}
      />

      <Suspense fallback={null}>
        <Buildings />
        {fabricationMode && <FabricationToolpath />}
      </Suspense>

      <OrbitControls
        makeDefault
        minDistance={50}
        maxDistance={2000}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
