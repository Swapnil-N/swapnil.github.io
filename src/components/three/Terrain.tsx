'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { createNoise2D } from 'simplex-noise';

function lerp3(
  a: [number, number, number],
  b: [number, number, number],
  t: number,
): [number, number, number] {
  const clamped = Math.max(0, Math.min(1, t));
  return [
    a[0] + (b[0] - a[0]) * clamped,
    a[1] + (b[1] - a[1]) * clamped,
    a[2] + (b[2] - a[2]) * clamped,
  ];
}

export default function Terrain() {
  const geometry = useMemo(() => {
    const noise2D = createNoise2D();
    const geo = new THREE.PlaneGeometry(100, 300, 128, 256);
    geo.rotateX(-Math.PI / 2);

    const positions = geo.attributes.position;
    const count = positions.count;
    const colors = new Float32Array(count * 3);

    const purple: [number, number, number] = [0.3, 0.1, 0.5];
    const coral: [number, number, number] = [1.0, 0.35, 0.37];
    const gold: [number, number, number] = [1.0, 0.8, 0.2];

    for (let i = 0; i < count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);

      const height =
        noise2D(x * 0.04, z * 0.04) * 8 +
        noise2D(x * 0.1, z * 0.1) * 2;

      positions.setY(i, height);

      let color: [number, number, number];
      if (height < -2) {
        color = purple;
      } else if (height < 4) {
        // Interpolate from purple to coral between -2 and 4
        const t = (height + 2) / 6;
        color = lerp3(purple, coral, t);
      } else {
        // Interpolate from coral to gold between 4 and 10
        const t = (height - 4) / 6;
        color = lerp3(coral, gold, t);
      }

      colors[i * 3] = color[0];
      colors[i * 3 + 1] = color[1];
      colors[i * 3 + 2] = color[2];
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();

    return geo;
  }, []);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors flatShading />
    </mesh>
  );
}
