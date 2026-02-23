import { useRef } from 'react';
import * as THREE from 'three';
import { Grid, RoundedBox } from '@react-three/drei';

/** Procedural room: floor + decorative props */
export function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#151921" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Grid overlay */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#1a2030"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#253045"
        fadeDistance={18}
        fadeStrength={1}
        infiniteGrid={false}
      />

      {/* Decorative props - "desks" / "stations" */}
      <Prop position={[4, 0.25, 3]} size={[1.2, 0.5, 0.8]} color="#1e2a3a" />
      <Prop position={[-4, 0.25, -3]} size={[1.5, 0.5, 0.8]} color="#1e2a3a" />
      <Prop position={[2, 0.25, -4]} size={[0.8, 0.5, 1.2]} color="#1e2a3a" />
      <Prop position={[-3, 0.25, 2]} size={[1, 0.5, 1]} color="#1e2a3a" />

      {/* Glowing accent markers on floor */}
      <GlowMarker position={[0, 0.02, 0]} />
      <GlowMarker position={[5, 0.02, 5]} size={0.3} />
      <GlowMarker position={[-5, 0.02, -5]} size={0.3} />
      <GlowMarker position={[5, 0.02, -5]} size={0.2} />
      <GlowMarker position={[-5, 0.02, 5]} size={0.2} />
    </group>
  );
}

function Prop({ position, size, color }: { position: [number, number, number]; size: [number, number, number]; color: string }) {
  return (
    <RoundedBox args={size} position={position} radius={0.05} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.7} metalness={0.3} />
    </RoundedBox>
  );
}

function GlowMarker({ position, size = 0.15 }: { position: [number, number, number]; size?: number }) {
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[size, 32]} />
      <meshStandardMaterial
        color="#00d4aa"
        emissive="#00d4aa"
        emissiveIntensity={2}
        transparent
        opacity={0.4}
      />
    </mesh>
  );
}
