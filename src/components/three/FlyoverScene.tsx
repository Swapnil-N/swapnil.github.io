'use client';

import { Canvas } from '@react-three/fiber';
import Terrain from './Terrain';
import CameraRig from './CameraRig';
import Destinations from './Destinations';
import SceneLighting from './Sky';

export default function FlyoverScene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov: 60, near: 0.1, far: 200, position: [0, 15, 50] }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
      }}
    >
      <fog attach="fog" args={['#0f0f19', 30, 100]} />
      <CameraRig />
      <Terrain />
      <Destinations />
      <SceneLighting />
    </Canvas>
  );
}
