import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

/** Small terminal/screen for incoming tickets */
export function InboxStation() {
  const blinkRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (blinkRef.current) {
      const t = state.clock.elapsedTime;
      (blinkRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
        1.5 + Math.sin(t * 4) * 0.8;
    }
  });

  return (
    <group position={[7, 0, 5]}>
      {/* Desk */}
      <RoundedBox args={[1.2, 0.06, 0.7]} position={[0, 0.72, 0]} radius={0.02} castShadow receiveShadow>
        <meshStandardMaterial color="#1a2535" roughness={0.6} metalness={0.3} />
      </RoundedBox>
      {/* Legs */}
      {[[-0.5, 0.36, -0.28], [0.5, 0.36, -0.28], [-0.5, 0.36, 0.28], [0.5, 0.36, 0.28]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.72, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}

      {/* Monitor */}
      <RoundedBox args={[0.7, 0.5, 0.03]} position={[0, 1.1, -0.15]} radius={0.01} castShadow>
        <meshStandardMaterial color="#0a0a18" emissive="#002255" emissiveIntensity={0.6} roughness={0.1} metalness={0.8} />
      </RoundedBox>

      {/* Notification blink dot */}
      <mesh ref={blinkRef} position={[0.28, 1.38, -0.13]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#ff6b6b" emissive="#ff6b6b" emissiveIntensity={1.5} />
      </mesh>

      {/* HTML overlay */}
      <Html position={[0, 1.1, -0.12]} transform distanceFactor={3} style={{ pointerEvents: 'none' }}>
        <div style={{
          width: '140px', padding: '8px', fontFamily: 'JetBrains Mono, monospace',
          color: '#6a9aba', fontSize: '8px', background: 'transparent', userSelect: 'none',
        }}>
          <div style={{ color: '#ff9f43', fontWeight: 700, fontSize: '9px', marginBottom: '4px' }}>⬤ INBOX</div>
          <div>▸ #142 — Bug report</div>
          <div>▸ #143 — Feature req.</div>
          <div style={{ color: '#ff6b6b' }}>▸ #144 — URGENT</div>
          <div style={{ color: '#4a6a7a', marginTop: '4px' }}>3 pending</div>
        </div>
      </Html>
    </group>
  );
}
