/**
 * BuildingMesh — renders a single extruded building from a footprint polygon.
 *
 * Props:
 *   building   — building data object
 *   highlighted — bool — bright accent colour (matched LLM filter)
 *   selected    — bool — orange selection colour
 *   onClick     — fn(building)
 *   fabricating — bool — this building is being "printed"
 */

import { useMemo, useRef } from "react";
import * as THREE from "three";
const USE_COLORS = {
  Residential:   "#3b82f6",
  Commercial:    "#f59e0b",
  Office:        "#8b5cf6",
  Hotel:         "#ec4899",
  Industrial:    "#64748b",
  Institutional: "#10b981",
  Religious:     "#f97316",
  Parking:       "#475569",
  "Mixed Use":   "#06b6d4",
  Retail:        "#eab308",
};

export default function BuildingMesh({ building, highlighted, selected, onClick, fabricating }) {
  const meshRef = useRef();

  const geometry = useMemo(() => {
    const shape = new THREE.Shape();
    const pts = building.footprint;
    if (!pts || pts.length < 3) return null;
    shape.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
    shape.closePath();

    const extrudeSettings = {
      depth: building.height_m,
      bevelEnabled: false,
    };
    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, [building]);

  if (!geometry) return null;

  let color = USE_COLORS[building.use_type] || "#64748b";
  let emissive = "#000000";
  let emissiveIntensity = 0;
  let opacity = 1;

  if (fabricating) {
    color = "#00ffcc";
    emissive = "#00ffcc";
    emissiveIntensity = 0.6;
  } else if (selected) {
    color = "#ff6a00";
    emissive = "#ff6a00";
    emissiveIntensity = 0.4;
  } else if (highlighted) {
    color = "#facc15";
    emissive = "#facc15";
    emissiveIntensity = 0.25;
  }

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(building);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    document.body.style.cursor = "default";
  };

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
          opacity={opacity}
          transparent={opacity < 1}
          roughness={0.6}
          metalness={0.3}
        />
      </mesh>
      {/* Wireframe outline */}
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#1e293b" wireframe wireframeLinewidth={0.5} />
      </mesh>
    </group>
  );
}
