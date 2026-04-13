'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import Link from 'next/link';
import * as THREE from 'three';

interface DestinationProps {
  position: [number, number, number];
  label: string;
  href: string;
}

function Destination({ position, label, href }: DestinationProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const s = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.2;
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial
          emissive="#ffc832"
          emissiveIntensity={2}
          color="#ffc832"
        />
      </mesh>
      <Html center distanceFactor={15}>
        <Link
          href={href}
          className="whitespace-nowrap font-bold text-white text-lg drop-shadow-lg hover:text-[#ffc832] transition-colors"
          style={{ textDecoration: 'none' }}
        >
          {label}
        </Link>
      </Html>
    </group>
  );
}

export default function Destinations() {
  return (
    <>
      <Destination position={[10, 4, -10]} label="Travel" href="/travel" />
      <Destination
        position={[-8, 3, -40]}
        label="Projects"
        href="/projects"
      />
      <Destination position={[6, 5, -65]} label="About" href="/about" />
    </>
  );
}
