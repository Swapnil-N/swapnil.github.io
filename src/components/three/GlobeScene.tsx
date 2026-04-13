'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';

interface Pin {
  lat: number;
  lng: number;
  title: string;
  slug: string;
}

function latLngToVec3(
  lat: number,
  lng: number,
  radius: number,
): [number, number, number] {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return [
    -(radius * Math.sin(phi) * Math.cos(theta)),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ];
}

function GlobePin({ lat, lng, title, radius }: { lat: number; lng: number; title: string; radius: number }) {
  const [hovered, setHovered] = useState(false);
  const position = latLngToVec3(lat, lng, radius);

  return (
    <group position={position}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial
          color="#ff5a5f"
          emissive="#ff5a5f"
          emissiveIntensity={hovered ? 2 : 1}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <div className="rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text)] whitespace-nowrap shadow-lg">
            {title}
          </div>
        </Html>
      )}
    </group>
  );
}

function Globe({ pins }: { pins: Pin[] }) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
    }
  });

  const radius = 2;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          color="#1a1a4e"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      {pins.map((pin) => (
        <GlobePin
          key={pin.slug}
          lat={pin.lat}
          lng={pin.lng}
          title={pin.title}
          radius={radius + 0.05}
        />
      ))}
    </group>
  );
}

export default function GlobeScene({ pins }: { pins: Pin[] }) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 0, 6] }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Globe pins={pins} />
    </Canvas>
  );
}
