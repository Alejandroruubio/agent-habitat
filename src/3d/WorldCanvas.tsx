import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import { Room } from './Room';
import { AgentMesh } from './Agent';
import { useWorldStore } from '@/state/world.store';

export function WorldCanvas() {
  const agents = useWorldStore((s) => s.agents);
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);
  const setSelectedAgent = useWorldStore((s) => s.setSelectedAgent);
  const setAgentTarget = useWorldStore((s) => s.setAgentTarget);

  const [hoveredAgentId, setHoveredAgentId] = useState<string | null>(null);

  const handleFloorClick = useCallback(
    (e: any) => {
      if (selectedAgentId && e.point) {
        const p = e.point;
        // Clamp to room bounds
        const x = THREE.MathUtils.clamp(p.x, -8, 8);
        const z = THREE.MathUtils.clamp(p.z, -8, 8);
        setAgentTarget(selectedAgentId, [x, 0, z]);
      }
    },
    [selectedAgentId, setAgentTarget]
  );

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.1,
      }}
      camera={{
        position: [10, 10, 10],
        fov: 35,
        near: 0.1,
        far: 100,
      }}
      style={{ background: '#0a0e17' }}
    >
      <Suspense fallback={null}>
        {/* Lighting - cinematic 3-point + ambient */}
        <ambientLight intensity={0.15} color="#b0c4de" />
        
        {/* Key light - warm, from upper right */}
        <directionalLight
          position={[8, 12, 5]}
          intensity={1.2}
          color="#ffeedd"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.001}
        />

        {/* Fill light - cool, from left */}
        <directionalLight
          position={[-6, 8, -3]}
          intensity={0.4}
          color="#88bbff"
        />

        {/* Rim light - from behind */}
        <pointLight position={[0, 6, -8]} intensity={0.6} color="#00d4aa" distance={20} />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Room */}
        <Room />

        {/* Floor click target (invisible) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={handleFloorClick}
          visible={false}
        >
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial />
        </mesh>

        {/* Agents */}
        {agents.map((agent) => (
          <AgentMesh
            key={agent.id}
            id={agent.id}
            color={agent.color}
            position={agent.position}
            status={agent.status}
            isSelected={agent.id === selectedAgentId}
            isHovered={agent.id === hoveredAgentId}
            onPointerOver={() => setHoveredAgentId(agent.id)}
            onPointerOut={() => setHoveredAgentId(null)}
            onClick={() => setSelectedAgent(agent.id)}
          />
        ))}

        {/* Camera controls - limited */}
        <OrbitControls
          target={[0, 0, 0]}
          minDistance={8}
          maxDistance={20}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 6}
          enablePan={true}
          panSpeed={0.5}
          enableRotate={true}
          rotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Postprocessing */}
        <EffectComposer>
          <Bloom
            intensity={0.4}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <Vignette offset={0.3} darkness={0.6} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
