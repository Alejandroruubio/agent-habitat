import { Html } from '@react-three/drei';
import { useWorldStore, AgentVisualState } from '@/state/world.store';

const VISUAL_STATE_ICONS: Record<AgentVisualState, { icon: string; color: string } | null> = {
  idle: null,
  talking: { icon: '💬', color: '#ff9f43' },
  typing: { icon: '⌨️', color: '#54a0ff' },
  thinking: { icon: '💭', color: '#a78bfa' },
  done: { icon: '✅', color: '#00d4aa' },
  warning: { icon: '⚠️', color: '#ffcc00' },
};

/** Floating labels, state icons and speech bubbles rendered as HTML overlays */
export function AgentLabels() {
  const agents = useWorldStore((s) => s.agents);
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);

  return (
    <>
      {agents.map((agent) => {
        const stateInfo = VISUAL_STATE_ICONS[agent.visualState];
        const isSelected = agent.id === selectedAgentId;

        return (
          <group key={agent.id} position={agent.position}>
            {/* Agent name label — only on selected or hover-implied */}
            {isSelected && (
              <Html position={[0, 2.0, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                  background: 'rgba(8, 8, 15, 0.85)',
                  backdropFilter: 'blur(8px)',
                  border: `1px solid ${agent.color}40`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '10px',
                  color: agent.color,
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  textAlign: 'center',
                }}>
                  <div style={{ fontWeight: 700, letterSpacing: '1px' }}>{agent.name}</div>
                  <div style={{ fontSize: '8px', color: '#8899aa', marginTop: '1px' }}>{agent.role}</div>
                </div>
              </Html>
            )}

            {/* Visual state floating icon */}
            {stateInfo && (
              <Html position={[0.3, 1.7, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                  fontSize: '16px',
                  filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.5))',
                  animation: 'float-icon 2s ease-in-out infinite',
                  userSelect: 'none',
                }}>
                  {stateInfo.icon}
                </div>
              </Html>
            )}

            {/* Speech bubble */}
            {agent.speechBubble && (
              <Html position={[0.4, 1.9, 0]} center style={{ pointerEvents: 'none' }}>
                <div style={{
                  background: 'rgba(15, 15, 25, 0.9)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(100, 120, 140, 0.3)',
                  borderRadius: '8px',
                  padding: '5px 10px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '10px',
                  color: '#c8d8e8',
                  maxWidth: '140px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  userSelect: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}>
                  {agent.speechBubble}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </>
  );
}
