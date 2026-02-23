import { create } from 'zustand';

export type AgentStatus = 'online' | 'speaking' | 'typing' | 'idle' | 'offline';
export type AgentMovementState = 'idle' | 'walking' | 'sitting';
export type AgentVisualState = 'idle' | 'talking' | 'typing' | 'thinking' | 'done' | 'warning';
export type AlertLevel = 'green' | 'yellow' | 'red';

export interface MeetingSlot {
  id: string;
  position: [number, number, number];
  rotationY: number;
  occupiedBy: string | null;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  movementState: AgentMovementState;
  visualState: AgentVisualState;
  speechBubble: string | null;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  color: string;
  avatar: string;
  slotId: string | null;
  metrics: {
    tasksCompleted: number;
    responseTime: string;
    uptime: string;
  };
}

interface WorldState {
  agents: Agent[];
  selectedAgentId: string | null;
  meetingMode: boolean;
  meetingSlots: MeetingSlot[];
  showDestinationMarkers: boolean;
  alertLevel: AlertLevel;
  debugMode: boolean;

  setSelectedAgent: (id: string | null) => void;
  updateAgentPosition: (id: string, position: [number, number, number]) => void;
  setAgentTarget: (id: string, target: [number, number, number]) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  setAgentMovementState: (id: string, state: AgentMovementState) => void;
  setAgentVisualState: (id: string, state: AgentVisualState) => void;
  setAgentSpeechBubble: (id: string, text: string | null) => void;
  clearTarget: (id: string) => void;
  commandAllToTable: () => void;
  dismissFromTable: () => void;
  markArrived: (id: string) => void;
  setAlertLevel: (level: AlertLevel) => void;
  toggleDebug: () => void;
}

// 10 slots around an oval meeting table at center
const TABLE_CENTER: [number, number, number] = [0, 0, 0];
const TABLE_RADIUS = 2.8;

function generateSlots(count: number): MeetingSlot[] {
  const slots: MeetingSlot[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = TABLE_CENTER[0] + Math.cos(angle) * TABLE_RADIUS;
    const z = TABLE_CENTER[2] + Math.sin(angle) * TABLE_RADIUS;
    const rotY = Math.atan2(TABLE_CENTER[0] - x, TABLE_CENTER[2] - z);
    slots.push({ id: `slot-${i}`, position: [x, 0, z], rotationY: rotY, occupiedBy: null });
  }
  return slots;
}

const initialAgents: Agent[] = [
  {
    id: 'agent-1', name: 'Atlas', role: 'Lead Coordinator', status: 'online',
    movementState: 'idle', visualState: 'idle', speechBubble: null,
    position: [5, 0, 4], targetPosition: null, color: '#00d4aa', avatar: '🤖', slotId: null,
    metrics: { tasksCompleted: 847, responseTime: '0.3s', uptime: '99.8%' },
  },
  {
    id: 'agent-2', name: 'Nova', role: 'Data Analyst', status: 'speaking',
    movementState: 'idle', visualState: 'idle', speechBubble: null,
    position: [-4, 0, 3], targetPosition: null, color: '#ff9f43', avatar: '🧠', slotId: null,
    metrics: { tasksCompleted: 632, responseTime: '0.5s', uptime: '99.2%' },
  },
  {
    id: 'agent-3', name: 'Echo', role: 'Communications', status: 'typing',
    movementState: 'idle', visualState: 'idle', speechBubble: null,
    position: [4, 0, -5], targetPosition: null, color: '#54a0ff', avatar: '📡', slotId: null,
    metrics: { tasksCompleted: 421, responseTime: '0.2s', uptime: '99.9%' },
  },
  {
    id: 'agent-4', name: 'Forge', role: 'Builder', status: 'idle',
    movementState: 'idle', visualState: 'idle', speechBubble: null,
    position: [-5, 0, -4], targetPosition: null, color: '#ff6b6b', avatar: '🔧', slotId: null,
    metrics: { tasksCompleted: 1203, responseTime: '0.8s', uptime: '97.5%' },
  },
];

export const useWorldStore = create<WorldState>((set, get) => ({
  agents: initialAgents,
  selectedAgentId: null,
  meetingMode: false,
  meetingSlots: generateSlots(10),
  showDestinationMarkers: true,
  alertLevel: 'green',
  debugMode: false,

  setSelectedAgent: (id) => set({ selectedAgentId: id }),

  updateAgentPosition: (id, position) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, position } : a)) })),

  setAgentTarget: (id, target) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, targetPosition: target, movementState: 'walking' } : a)) })),

  updateAgentStatus: (id, status) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, status } : a)) })),

  setAgentMovementState: (id, movementState) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, movementState } : a)) })),

  setAgentVisualState: (id, visualState) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, visualState } : a)) })),

  setAgentSpeechBubble: (id, text) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, speechBubble: text } : a)) })),

  clearTarget: (id) =>
    set((s) => ({ agents: s.agents.map((a) => (a.id === id ? { ...a, targetPosition: null } : a)) })),

  commandAllToTable: () => {
    const state = get();
    const slots = [...state.meetingSlots].map((s) => ({ ...s, occupiedBy: null }));
    const updatedAgents = state.agents.map((agent, i) => {
      const slot = slots[i % slots.length];
      slot.occupiedBy = agent.id;
      return { ...agent, targetPosition: slot.position as [number, number, number], movementState: 'walking' as AgentMovementState, slotId: slot.id };
    });
    set({ agents: updatedAgents, meetingSlots: slots, meetingMode: true });
  },

  dismissFromTable: () => {
    const state = get();
    const slots = state.meetingSlots.map((s) => ({ ...s, occupiedBy: null }));
    const spreadPositions: [number, number, number][] = [
      [5, 0, 4], [-4, 0, 3], [4, 0, -5], [-5, 0, -4],
    ];
    const updatedAgents = state.agents.map((agent, i) => ({
      ...agent, targetPosition: spreadPositions[i % spreadPositions.length], movementState: 'walking' as AgentMovementState, slotId: null,
    }));
    set({ agents: updatedAgents, meetingSlots: slots, meetingMode: false });
  },

  markArrived: (id) =>
    set((s) => ({
      agents: s.agents.map((a) =>
        a.id === id ? { ...a, targetPosition: null, movementState: s.meetingMode && a.slotId ? 'sitting' : 'idle' } : a
      ),
    })),

  setAlertLevel: (level) => set({ alertLevel: level }),
  toggleDebug: () => set((s) => ({ debugMode: !s.debugMode })),
}));

// ── Hook Points for future backend integration ──
export function dispatchWorldCommand(cmd: { type: string; payload?: any }) {
  console.log('[WorldCommand]', cmd);
  const store = useWorldStore.getState();
  switch (cmd.type) {
    case 'CALL_MEETING': store.commandAllToTable(); break;
    case 'DISMISS_MEETING': store.dismissFromTable(); break;
    case 'SET_ALERT': store.setAlertLevel(cmd.payload?.level ?? 'green'); break;
    case 'MOVE_AGENT': store.setAgentTarget(cmd.payload?.agentId, cmd.payload?.target); break;
    case 'SET_VISUAL_STATE': store.setAgentVisualState(cmd.payload?.agentId, cmd.payload?.state); break;
    case 'SPEECH_BUBBLE': store.setAgentSpeechBubble(cmd.payload?.agentId, cmd.payload?.text); break;
    default: console.warn('[WorldCommand] Unknown:', cmd.type);
  }
}

export function applyWorldPatch(patch: Partial<{ agents: Partial<Agent>[]; alertLevel: AlertLevel; meetingMode: boolean }>) {
  console.log('[WorldPatch]', patch);
  const store = useWorldStore.getState();
  if (patch.alertLevel) store.setAlertLevel(patch.alertLevel);
  if (patch.meetingMode === true) store.commandAllToTable();
  if (patch.meetingMode === false) store.dismissFromTable();
  if (patch.agents) {
    patch.agents.forEach((p) => {
      if (!p.id) return;
      if (p.visualState) store.setAgentVisualState(p.id, p.visualState);
      if (p.speechBubble !== undefined) store.setAgentSpeechBubble(p.id, p.speechBubble);
      if (p.status) store.updateAgentStatus(p.id, p.status);
    });
  }
}
