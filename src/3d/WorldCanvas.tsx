import { Suspense, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import {
  EffectComposer,
  Bloom,
  Vignette,
  SSAO,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { Room } from './Room';
import { MeetingTable } from './MeetingTable';
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
        const x = THREE.MathUtils.clamp(p.x, -10, 10);
        const z = THREE.MathUtils.clamp(p.z, -10, 10);
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
        toneMapping: THREE.NoToneMapping, // Handled by postprocessing
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        position: [12, 12, 12],
        fov: 30,
        near: 0.1,
        far: 100,
      }}
      style={{ background: '#08080f' }}
    >
      <Suspense fallback={null}>
        {/* === Lighting — cinematic 3-point === */}
        <ambientLight intensity={0.12} color="#9aaec0" />

        {/* Key light — warm, upper right */}
        <directionalLight
          position={[10, 14, 6]}
          intensity={1.4}
          color="#ffeedd"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={35}
          shadow-camera-left={-12}
          shadow-camera-right={12}
          shadow-camera-top={12}
          shadow-camera-bottom={-12}
          shadow-bias={-0.0008}
          shadow-normalBias={0.02}
        />

        {/* Fill light — cool, from left */}
        <directionalLight
          position={[-8, 10, -4]}
          intensity={0.35}
          color="#7799cc"
        />

        {/* Rim light — teal, from behind */}
        <pointLight position={[0, 8, -10]} intensity={0.7} color="#00d4aa" distance={25} />

        {/* Accent light over table */}
        <spotLight
          position={[0, 6, 0]}
          intensity={0.6}
          color="#ddeeff"
          angle={Math.PI / 5}
          penumbra={0.8}
          distance={12}
          castShadow={false}
          target-position={[0, 0, 0]}
        />

        {/* Environment for reflections */}
        <Environment preset="night" />

        {/* Room + props */}
        <Room />

        {/* Meeting Table */}
        <MeetingTable />

        {/* Floor click target (invisible) */}
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0, 0]}
          onClick={handleFloorClick}
          visible={false}
        >
          <planeGeometry args={[24, 24]} />
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
            movementState={agent.movementState}
            isSelected={agent.id === selectedAgentId}
            isHovered={agent.id === hoveredAgentId}
            onPointerOver={() => setHoveredAgentId(agent.id)}
            onPointerOut={() => setHoveredAgentId(null)}
            onClick={() => setSelectedAgent(agent.id)}
          />
        ))}

        {/* Camera controls — limited rotation */}
        <OrbitControls
          target={[0, 0.5, 0]}
          minDistance={8}
          maxDistance={22}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 7}
          maxAzimuthAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 3}
          enablePan={true}
          panSpeed={0.5}
          enableRotate={true}
          rotateSpeed={0.25}
          enableDamping
          dampingFactor={0.05}
        />

        {/* === Postprocessing === */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.35}
            luminanceThreshold={0.7}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
          <SSAO
            intensity={15}
            radius={0.12}
            luminanceInfluence={0.5}
            bias={0.025}
            worldDistanceThreshold={0.5}
            worldDistanceFalloff={0.1}
            worldProximityThreshold={0.3}
            worldProximityFalloff={0.1}
          />
          <Vignette offset={0.25} darkness={0.55} />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
