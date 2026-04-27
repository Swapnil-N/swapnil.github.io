'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 800;

// Generate positions outside the component (module scope — runs once)
function generatePositions(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  // Deterministic pseudo-random using sine
  for (let i = 0; i < count; i++) {
    const seed1 = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
    const seed2 = Math.sin(i * 45.164 + 29.673) * 23421.6312;
    const seed3 = Math.sin(i * 67.345 + 83.112) * 65432.1234;
    pos[i * 3] = (seed1 - Math.floor(seed1) - 0.5) * 10;
    pos[i * 3 + 1] = (seed2 - Math.floor(seed2) - 0.5) * 8;
    pos[i * 3 + 2] = (seed3 - Math.floor(seed3) - 0.5) * 6;
  }
  return pos;
}

const initialPositions = generatePositions(PARTICLE_COUNT);

function Particles() {
  const mesh = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  const positions = useMemo(() => new Float32Array(initialPositions), []);
  const originalPositions = useMemo(() => new Float32Array(initialPositions), []);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const time = clock.getElapsedTime();
    const posArray = mesh.current.geometry.attributes.position
      .array as Float32Array;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      // Gentle floating drift
      posArray[i3] =
        originalPositions[i3] + Math.sin(time * 0.3 + i * 0.1) * 0.15;
      posArray[i3 + 1] =
        originalPositions[i3 + 1] + Math.cos(time * 0.2 + i * 0.05) * 0.15;
      posArray[i3 + 2] =
        originalPositions[i3 + 2] + Math.sin(time * 0.1 + i * 0.08) * 0.1;

      // Mouse repulsion (in screen space, approximate)
      const dx = posArray[i3] - pointer.x * 5;
      const dy = posArray[i3 + 1] - pointer.y * 3;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) {
        const force = (2 - dist) * 0.02;
        posArray[i3] += (dx / dist) * force;
        posArray[i3 + 1] += (dy / dist) * force;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#ff5a5f"
        transparent
        opacity={0.6}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: '0' }}
      gl={{ alpha: true }}
    >
      <Particles />
    </Canvas>
  );
}
