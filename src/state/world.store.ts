import { create } from 'zustand';

export type AgentStatus = 'online' | 'speaking' | 'typing' | 'idle' | 'offline';
export type AgentMovementState = 'idle' | 'walking' | 'sitting';

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

  setSelectedAgent: (id: string | null) => void;
  updateAgentPosition: (id: string, position: [number, number, number]) => void;
  setAgentTarget: (id: string, target: [number, number, number]) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  setAgentMovementState: (id: string, state: AgentMovementState) => void;
  clearTarget: (id: string) => void;
  commandAllToTable: () => void;
  dismissFromTable: () => void;
  markArrived: (id: string) => void;
}

// 8 slots around an oval meeting table at center
const TABLE_CENTER: [number, number, number] = [0, 0, 0];
const TABLE_RADIUS = 2.8;

function generateSlots(count: number): MeetingSlot[] {
  const slots: MeetingSlot[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    const x = TABLE_CENTER[0] + Math.cos(angle) * TABLE_RADIUS;
    const z = TABLE_CENTER[2] + Math.sin(angle) * TABLE_RADIUS;
    // Face toward center
    const rotY = Math.atan2(TABLE_CENTER[0] - x, TABLE_CENTER[2] - z);
    slots.push({
      id: `slot-${i}`,
      position: [x, 0, z],
      rotationY: rotY,
      occupiedBy: null,
    });
  }
  return slots;
}

const initialAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Atlas',
    role: 'Lead Coordinator',
    status: 'online',
    movementState: 'idle',
    position: [5, 0, 4],
    targetPosition: null,
    color: '#00d4aa',
    avatar: '🤖',
    slotId: null,
    metrics: { tasksCompleted: 847, responseTime: '0.3s', uptime: '99.8%' },
  },
  {
    id: 'agent-2',
    name: 'Nova',
    role: 'Data Analyst',
    status: 'speaking',
    movementState: 'idle',
    position: [-4, 0, 3],
    targetPosition: null,
    color: '#ff9f43',
    avatar: '🧠',
    slotId: null,
    metrics: { tasksCompleted: 632, responseTime: '0.5s', uptime: '99.2%' },
  },
  {
    id: 'agent-3',
    name: 'Echo',
    role: 'Communications',
    status: 'typing',
    movementState: 'idle',
    position: [4, 0, -5],
    targetPosition: null,
    color: '#54a0ff',
    avatar: '📡',
    slotId: null,
    metrics: { tasksCompleted: 421, responseTime: '0.2s', uptime: '99.9%' },
  },
  {
    id: 'agent-4',
    name: 'Forge',
    role: 'Builder',
    status: 'idle',
    movementState: 'idle',
    position: [-5, 0, -4],
    targetPosition: null,
    color: '#ff6b6b',
    avatar: '🔧',
    slotId: null,
    metrics: { tasksCompleted: 1203, responseTime: '0.8s', uptime: '97.5%' },
  },
];

export const useWorldStore = create<WorldState>((set, get) => ({
  agents: initialAgents,
  selectedAgentId: null,
  meetingMode: false,
  meetingSlots: generateSlots(8),
  showDestinationMarkers: true,

  setSelectedAgent: (id) => set({ selectedAgentId: id }),

  updateAgentPosition: (id, position) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, position } : a
      ),
    })),

  setAgentTarget: (id, target) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, targetPosition: target, movementState: 'walking' } : a
      ),
    })),

  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),

  setAgentMovementState: (id, movementState) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, movementState } : a
      ),
    })),

  clearTarget: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, targetPosition: null } : a
      ),
    })),

  commandAllToTable: () => {
    const state = get();
    const slots = [...state.meetingSlots].map((s) => ({ ...s, occupiedBy: null }));
    const updatedAgents = state.agents.map((agent, i) => {
      const slot = slots[i % slots.length];
      slot.occupiedBy = agent.id;
      return {
        ...agent,
        targetPosition: slot.position as [number, number, number],
        movementState: 'walking' as AgentMovementState,
        slotId: slot.id,
      };
    });
    set({
      agents: updatedAgents,
      meetingSlots: slots,
      meetingMode: true,
    });
  },

  dismissFromTable: () => {
    const state = get();
    const slots = state.meetingSlots.map((s) => ({ ...s, occupiedBy: null }));
    // Send agents back to spread positions
    const spreadPositions: [number, number, number][] = [
      [5, 0, 4], [-4, 0, 3], [4, 0, -5], [-5, 0, -4],
    ];
    const updatedAgents = state.agents.map((agent, i) => ({
      ...agent,
      targetPosition: spreadPositions[i % spreadPositions.length],
      movementState: 'walking' as AgentMovementState,
      slotId: null,
    }));
    set({
      agents: updatedAgents,
      meetingSlots: slots,
      meetingMode: false,
    });
  },

  markArrived: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id
          ? { ...a, targetPosition: null, movementState: state.meetingMode && a.slotId ? 'sitting' : 'idle' }
          : a
      ),
    })),
}));
