'use client';

import { useFrame } from '@react-three/fiber';
import { useScrollProgress } from '@/hooks/useScrollProgress';

export default function CameraRig() {
  const scrollProgress = useScrollProgress();

  useFrame(({ camera }) => {
    const t = scrollProgress.current;
    camera.position.set(
      Math.sin(t * Math.PI * 2) * 5,
      15 - t * 6,
      50 - t * 120,
    );
    camera.lookAt(
      Math.sin(t * Math.PI * 2) * 5,
      0,
      50 - t * 120 - 30,
    );
  });

  return null;
}
