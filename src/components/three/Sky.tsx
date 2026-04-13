'use client';

import { Stars } from '@react-three/drei';

export default function SceneLighting() {
  return (
    <>
      <Stars radius={100} count={3000} depth={50} factor={4} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.2} />
    </>
  );
}
