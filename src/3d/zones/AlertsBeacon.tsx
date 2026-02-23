import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore, AlertLevel } from '@/state/world.store';

const ALERT_COLORS: Record<AlertLevel, string> = {
  green: '#00d4aa',
  yellow: '#ffcc00',
  red: '#ff4444',
};

/** Tower with light that changes color based on alert level */
export function AlertsBeacon() {
  const alertLevel = useWorldStore((s) => s.alertLevel);
  const lightRef = useRef<THREE.PointLight>(null!);
  const orbRef = useRef<THREE.Mesh>(null!);

  const color = useMemo(() => ALERT_COLORS[alertLevel], [alertLevel]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const speed = alertLevel === 'red' ? 6 : alertLevel === 'yellow' ? 3 : 1.5;
    const intensity = alertLevel === 'red' ? 2 : alertLevel === 'yellow' ? 1.2 : 0.6;

    if (orbRef.current) {
      const mat = orbRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = intensity + Math.sin(t * speed) * (intensity * 0.4);
      mat.color.set(color);
      mat.emissive.set(color);
    }
    if (lightRef.current) {
      lightRef.current.color.set(color);
      lightRef.current.intensity = intensity + Math.sin(t * speed) * 0.3;
    }
  });

  return (
    <group position={[8, 0, -5]}>
      {/* Base */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.3, 12]} />
        <meshStandardMaterial color="#1a1a22" roughness={0.5} metalness={0.7} />
      </mesh>

      {/* Tower pole */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.1, 8]} />
        <meshStandardMaterial color="#222233" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Ring decorations */}
      {[0.5, 1.0, 1.5].map((y, i) => (
        <mesh key={i} position={[0, y, 0]}>
          <torusGeometry args={[0.1, 0.015, 8, 16]} />
          <meshStandardMaterial color="#333344" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Glowing orb at top */}
      <mesh ref={orbRef} position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outer glow shell */}
      <mesh position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Actual light */}
      <pointLight ref={lightRef} position={[0, 2.4, 0]} color={color} intensity={0.6} distance={8} />
    </group>
  );
}
