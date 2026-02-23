import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { useWorldStore } from '@/state/world.store';

export function MeetingTable() {
  const commandAllToTable = useWorldStore((s) => s.commandAllToTable);
  const dismissFromTable = useWorldStore((s) => s.dismissFromTable);
  const meetingMode = useWorldStore((s) => s.meetingMode);
  const slots = useWorldStore((s) => s.meetingSlots);

  const [hovered, setHovered] = useState(false);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (glowRef.current) {
      const t = state.clock.elapsedTime;
      const mat = glowRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = hovered ? 1.5 + Math.sin(t * 3) * 0.5 : meetingMode ? 0.6 + Math.sin(t * 2) * 0.2 : 0.3;
    }
  });

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (meetingMode) dismissFromTable();
    else commandAllToTable();
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Table top — oval */}
      <RoundedBox
        args={[3.6, 0.12, 2.2]}
        position={[0, 0.75, 0]}
        radius={0.06}
        smoothness={4}
        castShadow receiveShadow
        onClick={handleClick}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <meshStandardMaterial
          color={hovered ? '#5a3a1a' : '#3d2510'}
          roughness={0.25} metalness={0.15}
          emissive={meetingMode ? '#00d4aa' : '#3d2510'}
          emissiveIntensity={meetingMode ? 0.3 : 0.05}
        />
      </RoundedBox>

      {/* Edge trim */}
      <RoundedBox args={[3.7, 0.04, 2.3]} position={[0, 0.82, 0]} radius={0.02} smoothness={4} castShadow>
        <meshStandardMaterial color="#2a1808" roughness={0.3} metalness={0.4} />
      </RoundedBox>

      {/* Legs — 4 posts */}
      {[[-1.5, 0, -0.85], [1.5, 0, -0.85], [-1.5, 0, 0.85], [1.5, 0, 0.85]].map((pos, i) => (
        <mesh key={i} position={[pos[0], 0.375, pos[2]]} castShadow>
          <cylinderGeometry args={[0.05, 0.06, 0.75, 8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.7} />
        </mesh>
      ))}

      {/* Center holographic ring */}
      <mesh ref={glowRef} position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.42, 32]} />
        <meshStandardMaterial color="#00d4aa" emissive="#00d4aa" emissiveIntensity={0.3} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner dot */}
      <mesh position={[0, 0.84, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#00d4aa" emissive="#00d4aa" emissiveIntensity={2} transparent opacity={0.5} />
      </mesh>

      {/* Slot markers */}
      {slots.map((slot) => (
        <mesh key={slot.id} position={[slot.position[0], 0.02, slot.position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.15, 0.2, 16]} />
          <meshStandardMaterial
            color={slot.occupiedBy ? '#00d4aa' : '#253045'}
            emissive={slot.occupiedBy ? '#00d4aa' : '#253045'}
            emissiveIntensity={slot.occupiedBy ? 1 : 0.3}
            transparent opacity={0.5} side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
