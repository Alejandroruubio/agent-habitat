import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWorldStore, AgentStatus } from '@/state/world.store';

const MOVE_SPEED = 2.5;
const ARRIVAL_THRESHOLD = 0.15;

interface AgentProps {
  id: string;
  color: string;
  position: [number, number, number];
  status: AgentStatus;
  movementState: 'idle' | 'walking' | 'sitting';
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
  movementState,
  isSelected,
  isHovered,
  onPointerOver,
  onPointerOut,
  onClick,
}: AgentProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const pathRef = useRef<THREE.Line>(null!);

  const markArrived = useWorldStore((s) => s.markArrived);
  const agent = useWorldStore((s) => s.agents.find((a) => a.id === id));
  const target = agent?.targetPosition ?? null;
  const slotId = agent?.slotId ?? null;
  const meetingSlots = useWorldStore((s) => s.meetingSlots);

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

  // Get target rotation for sitting
  const targetRotY = useMemo(() => {
    if (slotId) {
      const slot = meetingSlots.find((s) => s.id === slotId);
      return slot?.rotationY ?? 0;
    }
    return null;
  }, [slotId, meetingSlots]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    const current = groupRef.current.position;

    if (target) {
      const dir = new THREE.Vector3(target[0] - current.x, 0, target[2] - current.z);
      const dist = dir.length();

      if (dist > ARRIVAL_THRESHOLD) {
        dir.normalize();
        const step = Math.min(delta * MOVE_SPEED, dist);
        current.x += dir.x * step;
        current.z += dir.z * step;

        // Face movement direction
        const angle = Math.atan2(dir.x, dir.z);
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          angle,
          delta * 6
        );

        // Walk bob — up/down + slight lean
        const walkBob = Math.sin(t * 10) * 0.06;
        const walkLean = Math.sin(t * 10) * 0.03;
        groupRef.current.position.y = Math.max(0, walkBob);
        groupRef.current.children.forEach((child) => {
          if (child.type === 'Mesh' || child.type === 'Group') {
            // Not modifying children directly for perf
          }
        });
      } else {
        markArrived(id);
        current.x = target[0];
        current.z = target[2];
      }
    } else {
      // Idle or sitting animation
      if (movementState === 'sitting') {
        // Settle to slot rotation
        if (targetRotY !== null) {
          groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotY,
            delta * 4
          );
        }
        // Subtle breathing
        groupRef.current.position.y = Math.sin(t * 1.5 + bobPhase) * 0.015;
      } else {
        // Idle bob
        groupRef.current.position.y = Math.sin(t * 2 + bobPhase) * 0.04;
      }
    }

    // Selection ring rotation
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.5;
    }

    // Update path line
    if (pathRef.current && target) {
      const geom = pathRef.current.geometry as THREE.BufferGeometry;
      const pos = geom.attributes.position as THREE.BufferAttribute;
      pos.setXYZ(0, current.x, 0.05, current.z);
      pos.setXYZ(1, target[0], 0.05, target[2]);
      pos.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Path line to target */}
      {target && (
        <line ref={pathRef as any}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              array={new Float32Array([
                position[0], 0.05, position[2],
                target[0], 0.05, target[2],
              ])}
              count={2}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.3} />
        </line>
      )}

      {/* Destination marker */}
      {target && (
        <DestinationMarker position={target} color={color} />
      )}

      <group
        ref={groupRef}
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); onPointerOver(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { onPointerOut(); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* Body — capsule */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <capsuleGeometry args={[0.22, 0.45, 8, 16]} />
          <meshStandardMaterial
            color={isHovered ? '#ffffff' : color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.4 : 0.12}
            roughness={0.35}
            metalness={0.3}
          />
        </mesh>

        {/* Head */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial
            color={isHovered ? '#ffffff' : color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : isHovered ? 0.4 : 0.12}
            roughness={0.3}
            metalness={0.35}
          />
        </mesh>

        {/* Eyes */}
        <mesh position={[0.07, 1.17, 0.16]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2.5} color="#ffffff" />
        </mesh>
        <mesh position={[-0.07, 1.17, 0.16]}>
          <sphereGeometry args={[0.035, 8, 8]} />
          <meshStandardMaterial emissive="#ffffff" emissiveIntensity={2.5} color="#ffffff" />
        </mesh>

        {/* Status indicator */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial
            emissive={statusColor}
            emissiveIntensity={3}
            color={statusColor}
            transparent
            opacity={0.9}
          />
        </mesh>

        {/* Selection ring + outer glow */}
        {isSelected && (
          <>
            <mesh ref={ringRef} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.45, 0.55, 32]} />
              <meshStandardMaterial
                color="#00d4aa"
                emissive="#00d4aa"
                emissiveIntensity={2.5}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.55, 0.7, 32]} />
              <meshStandardMaterial
                color="#00d4aa"
                emissive="#00d4aa"
                emissiveIntensity={1}
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
          </>
        )}

        {/* Shadow blob */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.28, 16]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.35} />
        </mesh>
      </group>
    </>
  );
}

/** Pulsing destination circle on the floor */
function DestinationMarker({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      const scale = 1 + Math.sin(t * 4) * 0.15;
      ref.current.scale.set(scale, scale, 1);
      (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.3 + Math.sin(t * 3) * 0.15;
    }
  });

  return (
    <mesh ref={ref} position={[position[0], 0.03, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.12, 0.2, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        transparent
        opacity={0.4}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
