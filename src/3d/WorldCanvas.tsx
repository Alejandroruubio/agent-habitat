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
import { AgentLabels } from './ui/AgentLabels';
import { DebugOverlay } from './ui/DebugOverlay';
import { OpsWall } from './zones/OpsWall';
import { InboxStation } from './zones/InboxStation';
import { AlertsBeacon } from './zones/AlertsBeacon';
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
        const x = THREE.MathUtils.clamp(p.x, -12, 12);
        const z = THREE.MathUtils.clamp(p.z, -12, 12);
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
        toneMapping: THREE.NoToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      camera={{
        position: [14, 14, 14],
        fov: 28,
        near: 0.1,
        far: 120,
      }}
      style={{ background: '#08080f' }}
    >
      <Suspense fallback={null}>
        {/* === Cinematic Lighting === */}
        <ambientLight intensity={0.1} color="#8899bb" />

        {/* Key light — warm */}
        <directionalLight
          position={[10, 16, 6]}
          intensity={1.3}
          color="#ffeedd"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={40}
          shadow-camera-left={-14}
          shadow-camera-right={14}
          shadow-camera-top={14}
          shadow-camera-bottom={-14}
          shadow-bias={-0.0008}
          shadow-normalBias={0.02}
        />

        {/* Fill — cool */}
        <directionalLight position={[-10, 10, -6]} intensity={0.3} color="#6688bb" />

        {/* Rim — teal accent from back */}
        <pointLight position={[0, 8, -12]} intensity={0.6} color="#00d4aa" distance={28} />

        {/* Accent spotlight over table */}
        <spotLight
          position={[0, 7, 0]}
          intensity={0.5}
          color="#ddeeff"
          angle={Math.PI / 5}
          penumbra={0.8}
          distance={14}
          castShadow={false}
        />

        <Environment preset="night" />

        {/* Scene */}
        <Room />
        <MeetingTable />
        <OpsWall />
        <InboxStation />
        <AlertsBeacon />

        {/* Floor click target */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={handleFloorClick} visible={false}>
          <planeGeometry args={[28, 28]} />
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

        {/* Labels & bubbles */}
        <AgentLabels />

        {/* Debug overlay */}
        <DebugOverlay />

        {/* Camera controls */}
        <OrbitControls
          target={[0, 0.5, 0]}
          minDistance={8}
          maxDistance={26}
          maxPolarAngle={Math.PI / 3}
          minPolarAngle={Math.PI / 7}
          maxAzimuthAngle={Math.PI / 3}
          minAzimuthAngle={-Math.PI / 3}
          enablePan
          panSpeed={0.5}
          enableRotate
          rotateSpeed={0.2}
          enableDamping
          dampingFactor={0.05}
        />

        {/* === Postprocessing === */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.3}
            luminanceThreshold={0.65}
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
          <Vignette offset={0.25} darkness={0.5} />
          <ToneMapping mode={ToneMappingMode.AGX} />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
}
