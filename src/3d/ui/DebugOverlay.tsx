import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useWorldStore } from '@/state/world.store';

/** Simple debug FPS and scene stats overlay (toggled via store.debugMode) */
export function DebugOverlay() {
  const debugMode = useWorldStore((s) => s.debugMode);
  const agents = useWorldStore((s) => s.agents);
  const [fps, setFps] = useState(60);
  const [frames, setFrames] = useState(0);

  useFrame(() => {
    setFrames((f) => f + 1);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setFps(frames);
      setFrames(0);
    }, 1000);
    return () => clearInterval(interval);
  }, [frames]);

  if (!debugMode) return null;

  const walking = agents.filter((a) => a.movementState === 'walking').length;
  const sitting = agents.filter((a) => a.movementState === 'sitting').length;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <div style={{
        position: 'fixed', top: '60px', left: '10px',
        background: 'rgba(0,0,0,0.75)', borderRadius: '6px',
        padding: '8px 12px', fontFamily: 'JetBrains Mono, monospace',
        fontSize: '10px', color: '#00d4aa', lineHeight: '1.6',
        border: '1px solid rgba(0,212,170,0.2)',
        zIndex: 100,
      }}>
        <div>FPS: {fps}</div>
        <div>Agents: {agents.length} (🚶{walking} 🪑{sitting})</div>
        <div>Meeting: {useWorldStore.getState().meetingMode ? 'ON' : 'OFF'}</div>
      </div>
    </Html>
  );
}
