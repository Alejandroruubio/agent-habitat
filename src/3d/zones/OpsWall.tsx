import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

/** Large display screen showing mock metrics */
export function OpsWall() {
  const scanRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (scanRef.current) {
      const t = state.clock.elapsedTime;
      scanRef.current.position.y = -1.0 + ((t * 0.3) % 2.2);
      (scanRef.current.material as THREE.MeshStandardMaterial).opacity = 0.15 + Math.sin(t * 2) * 0.05;
    }
  });

  return (
    <group position={[-8, 0, 0]}>
      {/* Wall mount / frame */}
      <RoundedBox args={[0.15, 3.2, 4.5]} position={[0, 1.8, 0]} radius={0.05} castShadow>
        <meshStandardMaterial color="#111118" roughness={0.4} metalness={0.7} />
      </RoundedBox>

      {/* Screen surface */}
      <RoundedBox args={[0.06, 2.8, 4.0]} position={[0.1, 1.8, 0]} radius={0.03}>
        <meshStandardMaterial
          color="#060a14"
          emissive="#0044aa"
          emissiveIntensity={0.4}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.95}
        />
      </RoundedBox>

      {/* Scan line */}
      <mesh ref={scanRef} position={[0.14, 1.5, 0]}>
        <planeGeometry args={[0.01, 3.8]} />
        <meshStandardMaterial
          color="#00d4aa"
          emissive="#00d4aa"
          emissiveIntensity={3}
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML overlay for mock metrics */}
      <Html
        position={[0.15, 1.8, 0]}
        rotation={[0, Math.PI / 2, 0]}
        transform
        distanceFactor={4}
        style={{ pointerEvents: 'none' }}
      >
        <div style={{
          width: '320px', padding: '20px', fontFamily: 'JetBrains Mono, monospace',
          color: '#7cb8e8', fontSize: '10px', lineHeight: '1.6',
          background: 'transparent', userSelect: 'none',
        }}>
          <div style={{ color: '#00d4aa', fontWeight: 700, fontSize: '11px', marginBottom: '8px', letterSpacing: '2px' }}>
            ▸ OPS DASHBOARD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <div>CPU ▏██████░░░ 67%</div>
            <div>MEM ▏████████░ 84%</div>
            <div>NET ▏███░░░░░░ 32%</div>
            <div>GPU ▏█████░░░░ 55%</div>
          </div>
          <div style={{ marginTop: '10px', color: '#4a7a9a', fontSize: '9px' }}>
            TASKS QUEUED: 12 · COMPLETED: 847 · FAILED: 2
          </div>
          <div style={{ marginTop: '4px', color: '#3a6a4a' }}>
            ▸ ALL SYSTEMS NOMINAL
          </div>
        </div>
      </Html>

      {/* Accent light from screen */}
      <pointLight position={[1, 1.8, 0]} color="#0066cc" intensity={0.4} distance={5} />
    </group>
  );
}
