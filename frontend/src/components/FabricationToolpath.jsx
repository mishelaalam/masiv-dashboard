/**
 * FabricationToolpath — animates a "print head" tracing building footprints.
 *
 * For each selected building we generate a 3D path at ground level then
 * animate a sphere along it. A line shows the already-traced path.
 * This is a simplified geometry-to-motion visualisation (not physically accurate).
 */

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useStore } from "../store/useStore";

const SPEED = 0.4; // units per frame at 60fps

export default function FabricationToolpath() {
  const { buildings, fabricationBuildings, fabricationStep, advanceFabricationStep } =
    useStore();

  const headRef = useRef();
  const traceRef = useRef();
  const progressRef = useRef(0);
  const pathRef = useRef([]);

  // Build flat 3D waypoints from all fabricating buildings
  const waypoints = useMemo(() => {
    const pts = [];
    for (const id of fabricationBuildings) {
      const b = buildings.find((x) => x.id === id);
      if (!b || !b.footprint) continue;
      const fp = b.footprint;
      // Trace footprint at ground + 0.5 m lift
      for (const [x, z] of fp) pts.push(new THREE.Vector3(x, 0.5, -z));
      // Close the loop
      if (fp.length > 0) pts.push(new THREE.Vector3(fp[0][0], 0.5, -fp[0][1]));
      // Lift between buildings
      const last = pts[pts.length - 1];
      if (last) pts.push(new THREE.Vector3(last.x, 8, last.z));
    }
    return pts;
  }, [fabricationBuildings, buildings]);

  const curve = useMemo(() => {
    if (waypoints.length < 2) return null;
    return new THREE.CatmullRomCurve3(waypoints, false, "catmullrom", 0.1);
  }, [waypoints]);

  const totalLength = useMemo(() => {
    if (!curve) return 0;
    return curve.getLength();
  }, [curve]);

  // Animate head along curve
  useFrame(() => {
    if (!curve || !headRef.current || !traceRef.current) return;

    progressRef.current = Math.min(progressRef.current + SPEED / totalLength, 1);
    const pt = curve.getPoint(progressRef.current);
    headRef.current.position.copy(pt);

    // Update traced line
    const tracePts = curve.getPoints(Math.floor(progressRef.current * 200));
    const geo = new THREE.BufferGeometry().setFromPoints(tracePts);
    traceRef.current.geometry.dispose();
    traceRef.current.geometry = geo;

    if (progressRef.current >= 1) progressRef.current = 0; // loop
  });

  if (!curve) return null;

  const fullPathPoints = curve.getPoints(300);

  return (
    <group>
      {/* Ghost path */}
      <line>
        <bufferGeometry setFromPoints={fullPathPoints} />
        <lineBasicMaterial color="#334155" opacity={0.4} transparent linewidth={1} />
      </line>

      {/* Live traced path */}
      <line ref={traceRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#00ffcc" linewidth={2} />
      </line>

      {/* Toolhead sphere */}
      <mesh ref={headRef}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshStandardMaterial
          color="#00ffcc"
          emissive="#00ffcc"
          emissiveIntensity={1}
          roughness={0}
          metalness={0.5}
        />
      </mesh>
    </group>
  );
}
