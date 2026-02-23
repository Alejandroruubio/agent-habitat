import * as THREE from 'three';
import { Grid, RoundedBox } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

/** Upgraded room: floor, grid, decorative props, ambient elements */
export function Room() {
  return (
    <group>
      {/* Floor — dark wood/concrete */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#18120e" roughness={0.8} metalness={0.05} />
      </mesh>

      {/* Subtle carpet/rug under the table */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]} receiveShadow>
        <circleGeometry args={[4, 48]} />
        <meshStandardMaterial color="#1a1520" roughness={0.95} metalness={0} />
      </mesh>

      {/* Grid overlay */}
      <Grid
        position={[0, 0.001, 0]}
        args={[24, 24]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1a1a22"
        sectionSize={4}
        sectionThickness={0.8}
        sectionColor="#222235"
        fadeDistance={20}
        fadeStrength={1.5}
        infiniteGrid={false}
      />

      {/* === Decorative Props === */}

      {/* Workstation desks */}
      <Desk position={[6, 0, 5]} rotation={0.3} />
      <Desk position={[-6, 0, -5]} rotation={2.5} />
      <Desk position={[7, 0, -3]} rotation={-0.5} />

      {/* Display screens */}
      <HoloScreen position={[-7, 1.8, 0]} rotationY={Math.PI / 6} />
      <HoloScreen position={[7, 1.8, -1]} rotationY={-Math.PI / 5} />

      {/* Plants */}
      <Plant position={[-5, 0, 6]} scale={0.8} />
      <Plant position={[5, 0, -6]} scale={1} />
      <Plant position={[8, 0, 5]} scale={0.6} />

      {/* Neon accent strip along "wall" */}
      <NeonStrip position={[0, 0.5, -9]} length={12} color="#00d4aa" />
      <NeonStrip position={[-9, 0.5, 0]} length={12} color="#54a0ff" rotationY={Math.PI / 2} />

      {/* Floor lamps */}
      <FloorLamp position={[8, 0, 7]} color="#ff9f43" />
      <FloorLamp position={[-8, 0, -7]} color="#54a0ff" />

      {/* Dust particles */}
      <DustParticles />
    </group>
  );
}

/* --- Sub components --- */

function Desk({ position, rotation }: { position: [number, number, number]; rotation: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Desktop */}
      <RoundedBox args={[1.6, 0.06, 0.8]} position={[0, 0.72, 0]} radius={0.02} castShadow receiveShadow>
        <meshStandardMaterial color="#1e2a3a" roughness={0.6} metalness={0.3} />
      </RoundedBox>
      {/* Legs */}
      {[[-0.65, 0.36, -0.3], [0.65, 0.36, -0.3], [-0.65, 0.36, 0.3], [0.65, 0.36, 0.3]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} castShadow>
          <boxGeometry args={[0.04, 0.72, 0.04]} />
          <meshStandardMaterial color="#111" roughness={0.5} metalness={0.6} />
        </mesh>
      ))}
      {/* Small monitor */}
      <RoundedBox args={[0.5, 0.35, 0.03]} position={[0, 1.05, -0.2]} radius={0.01} castShadow>
        <meshStandardMaterial color="#0a0a15" emissive="#1a3050" emissiveIntensity={0.8} roughness={0.2} metalness={0.5} />
      </RoundedBox>
    </group>
  );
}

function HoloScreen({ position, rotationY }: { position: [number, number, number]; rotationY: number }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.6 + Math.sin(state.clock.elapsedTime * 1.5) * 0.2;
    }
  });

  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <RoundedBox args={[1.8, 1.2, 0.04]} radius={0.02} castShadow>
        <meshStandardMaterial
          ref={matRef}
          color="#050a15"
          emissive="#0066aa"
          emissiveIntensity={0.6}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.9}
        />
      </RoundedBox>
      {/* Frame */}
      <RoundedBox args={[1.9, 1.3, 0.02]} radius={0.03}>
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.7} />
      </RoundedBox>
    </group>
  );
}

function Plant({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* Pot */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.22, 0.4, 8]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} metalness={0.1} />
      </mesh>
      {/* Foliage (layered spheres) */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshStandardMaterial color="#1a4a2a" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[0.1, 0.75, 0.05]} castShadow>
        <sphereGeometry args={[0.18, 8, 8]} />
        <meshStandardMaterial color="#206030" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[-0.08, 0.8, -0.06]} castShadow>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#2a6a35" roughness={0.85} metalness={0} />
      </mesh>
    </group>
  );
}

function NeonStrip({ position, length, color, rotationY = 0 }: {
  position: [number, number, number]; length: number; color: string; rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <boxGeometry args={[length, 0.05, 0.05]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

function FloorLamp({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.6, 8]} />
        <meshStandardMaterial color="#222" roughness={0.5} metalness={0.6} />
      </mesh>
      {/* Shade/bulb */}
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={3}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Actual light */}
      <pointLight position={[0, 1.65, 0]} color={color} intensity={0.8} distance={6} castShadow={false} />
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  );
}

function DustParticles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 80;

  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 18;
    positions[i * 3 + 1] = Math.random() * 4 + 0.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 18;
  }

  useFrame((state) => {
    if (ref.current) {
      const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      const t = state.clock.elapsedTime;
      for (let i = 0; i < count; i++) {
        arr[i * 3 + 1] += Math.sin(t * 0.3 + i) * 0.001;
        arr[i * 3] += Math.cos(t * 0.2 + i * 0.5) * 0.0005;
      }
      posAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={count}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#aabbcc"
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
