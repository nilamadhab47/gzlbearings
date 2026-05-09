"use client";

/**
 * Procedural 3D bearing — outer race, inner race, ring of balls.
 * No external GLB needed. Slow cinematic spin + subtle mouse parallax.
 *
 * Performance strategy:
 * - Mounted only after first paint (see DeferredBearing in src/App.tsx)
 *   so the HDR environment fetch and shadow-map render happen AFTER LCP.
 * - DPR capped at 1.5; mobile capped at 1 to halve fragment work.
 * - Honours prefers-reduced-motion (frozen, no parallax, frameloop "demand").
 * - On mobile we drop the HDR Environment + ContactShadows for a lighter scene.
 */

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function Bearing({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const balls = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (reducedMotion) return;
    // slow spin around the bearing's own axis (now pointing at the camera)
    group.current.rotation.z += delta * 0.18;
    // subtle mouse parallax tilt
    const { x, y } = state.pointer;
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      Math.PI / 2 - 0.12 - y * 0.18,
      0.05,
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      x * 0.18,
      0.05,
    );
    if (balls.current) {
      balls.current.rotation.y -= delta * 0.55;
    }
  });

  // Bearing geometry parameters
  const outerRadius = 1.6;
  const outerThickness = 0.35;
  const innerRadius = 0.85;
  const innerThickness = 0.35;
  const ballRadius = 0.18;
  const ballOrbit = (outerRadius + innerRadius) / 2 + 0.05;
  const ballCount = 12;
  const height = 0.55;

  // Materials
  const steelMat = (
    <meshStandardMaterial
      color="#9a9a9a"
      metalness={1}
      roughness={0.28}
      envMapIntensity={1.2}
    />
  );
  const ballMat = (
    <meshStandardMaterial
      color="#cfcfcf"
      metalness={1}
      roughness={0.12}
      envMapIntensity={1.4}
    />
  );

  return (
    <group ref={group} rotation={[Math.PI / 2 - 0.12, 0, 0]}>
      {/* Outer race */}
      <mesh>
        <cylinderGeometry
          args={[outerRadius, outerRadius, height, 96, 1, true]}
        />
        {steelMat}
      </mesh>
      <mesh>
        <cylinderGeometry
          args={[
            outerRadius - outerThickness,
            outerRadius - outerThickness,
            height,
            96,
            1,
            true,
          ]}
        />
        {steelMat}
      </mesh>
      {/* Outer race top/bottom rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height / 2, 0]}>
        <ringGeometry
          args={[outerRadius - outerThickness, outerRadius, 96]}
        />
        {steelMat}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]}>
        <ringGeometry
          args={[outerRadius - outerThickness, outerRadius, 96]}
        />
        {steelMat}
      </mesh>

      {/* Inner race */}
      <mesh>
        <cylinderGeometry
          args={[innerRadius, innerRadius, height, 96, 1, true]}
        />
        {steelMat}
      </mesh>
      <mesh>
        <cylinderGeometry
          args={[
            innerRadius - innerThickness,
            innerRadius - innerThickness,
            height,
            96,
            1,
            true,
          ]}
        />
        {steelMat}
      </mesh>
      {/* Inner race top/bottom rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, height / 2, 0]}>
        <ringGeometry
          args={[innerRadius - innerThickness, innerRadius, 96]}
        />
        {steelMat}
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -height / 2, 0]}>
        <ringGeometry
          args={[innerRadius - innerThickness, innerRadius, 96]}
        />
        {steelMat}
      </mesh>

      {/* Balls */}
      <group ref={balls}>
        {Array.from({ length: ballCount }).map((_, i) => {
          const angle = (i / ballCount) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * ballOrbit,
                0,
                Math.sin(angle) * ballOrbit,
              ]}
             
            >
              <sphereGeometry args={[ballRadius, 32, 32]} />
              {ballMat}
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

export default function BearingHero() {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const w = window.matchMedia("(max-width: 768px)");
    const apply = () => {
      setReducedMotion(mq.matches);
      setIsMobile(w.matches);
    };
    apply();
    mq.addEventListener("change", apply);
    w.addEventListener("change", apply);
    return () => {
      mq.removeEventListener("change", apply);
      w.removeEventListener("change", apply);
    };
  }, []);

  return (
    <Canvas
      shadows={!isMobile}
      dpr={isMobile ? 1 : [1, 1.5]}
      camera={{ position: [0, 0.6, 5], fov: 38 }}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: "high-performance" }}
      frameloop={reducedMotion ? "demand" : "always"}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={isMobile ? 0.55 : 0.35} />
        <directionalLight
          position={[5, 6, 4]}
          intensity={isMobile ? 1.6 : 1.1}
          color="#ffffff"
          castShadow={!isMobile}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight
          position={[-4, -2, -3]}
          intensity={isMobile ? 0.8 : 0.6}
          color="#f4c400"
        />
        <pointLight position={[0, 2, 4]} intensity={0.5} color="#ffe599" />

        {/* HDR reflections — desktop only. Mobile uses studio lights only. */}
        {!isMobile && <Environment preset="warehouse" />}

        <Bearing reducedMotion={reducedMotion} />

        {!isMobile && (
          <ContactShadows
            position={[0, -1.4, 0]}
            opacity={0.45}
            scale={8}
            blur={2.4}
            far={3}
            resolution={512}
          />
        )}
      </Suspense>
    </Canvas>
  );
}
