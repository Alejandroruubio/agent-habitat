import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore, AgentStatus } from '@/state/world.store';

const MOVE_SPEED = 3;

interface AgentProps {
  id: string;
  color: string;
  position: [number, number, number];
  status: AgentStatus;
  isSelected: boolean;
  isHovered: boolean;
  onPointerOver: () => void;
  onPointerOut: () => void;
  onClick: () => void;
}

export function AgentMesh({
  id,
  color,
  position,
  status,
  isSelected,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: AgentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Mesh>(null!);
  const headRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  const updatePosition = useWorldStore((s) => s.updateAgentPosition);
  const clearTarget = useWorldStore((s) => s.clearTarget);
  const target = useWorldStore((s) => s.agents.find((a) => a.id === id)?.targetPosition);

  const [bobPhase] = useState(() => Math.random() * Math.PI * 2);

  const statusColor = useMemo(() => {
    switch (status) {
      case 'online': return '#00d4aa';
      case 'speaking': return '#ff9f43';
      case 'typing': return '#54a0ff';
      case 'idle': return '#a0a0a0';
      case 'offline': return '#555555';
    }
  }, [status]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const t = state.clock.elapsedTime;

    // Idle bob animation
    const bobY = Math.sin(t * 2 + bobPhase) * 0.05;
    
    // Move towards target
    if (target) {
      const current = groupRef.current.position;
      const dir = new THREE.Vector3(target[0] - current.x, 0, target[2] - current.z);
      const dist = dir.length();
      
      if (dist > 0.1) {
        dir.normalize();
        const step = Math.min(delta * MOVE_SPEED, dist);
        current.x += dir.x * step;
        current.z += dir.z * step;
        
        // Face movement direction
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          angle,
          delta * 8
        );
        
        // Walk bob
        const walkBob = Math.sin(t * 8) * 0.08;
        groupRef.current.position.y = walkBob;
        
        updatePosition(id, [current.x, 0, current.z]);
      } else {
        clearTarget(id);
        groupRef.current.position.y = bobY;
      }
    } else {
      groupRef.current.position.y = bobY;
    }

    // Selection ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.5;
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); }}
      onPointerOut={onPointerOut}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Body - capsule shape */}
      <mesh ref={bodyRef} position={[0, 0.6, 0]} castShadow>
        <capsuleGeometry args={[0.25, 0.5, 8, 16]} />
        <meshStandardMaterial
          color={isHovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.15}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Head */}
      <mesh ref={headRef} position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color={isHovered ? '#ffffff' : color}
          emissive={color}
          emissiveIntensity={isHovered ? 0.5 : 0.15}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Eyes - two small emissive spheres */}
      <mesh position={[0.08, 1.22, 0.17]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
      </mesh>
      <mesh position={[-0.08, 1.22, 0.17]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2} color="#ffffff" />
      </mesh>

      {/* Status indicator floating above head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial
          emissive={statusColor}
          emissiveIntensity={3}
          color={statusColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.6, 32]} />
          <meshStandardMaterial
            color="#00d4aa"
            emissive="#00d4aa"
            emissiveIntensity={2}
            transparent
            opacity={0.7}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Shadow blob */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}
