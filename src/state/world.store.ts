import { create } from 'zustand';

export type AgentStatus = 'online' | 'speaking' | 'typing' | 'idle' | 'offline';

export interface Agent {
  id: string;
  name: string;
  role: string;
  status: AgentStatus;
  position: [number, number, number];
  targetPosition: [number, number, number] | null;
  color: string;
  avatar: string;
  metrics: {
    tasksCompleted: number;
    responseTime: string;
    uptime: string;
  };
}

interface WorldState {
  agents: Agent[];
  selectedAgentId: string | null;
  setSelectedAgent: (id: string | null) => void;
  updateAgentPosition: (id: string, position: [number, number, number]) => void;
  setAgentTarget: (id: string, target: [number, number, number]) => void;
  updateAgentStatus: (id: string, status: AgentStatus) => void;
  clearTarget: (id: string) => void;
}

const initialAgents: Agent[] = [
  {
    id: 'agent-1',
    name: 'Atlas',
    role: 'Lead Coordinator',
    status: 'online',
    position: [0, 0, 0],
    targetPosition: null,
    color: '#00d4aa',
    avatar: '🤖',
    metrics: { tasksCompleted: 847, responseTime: '0.3s', uptime: '99.8%' },
  },
  {
    id: 'agent-2',
    name: 'Nova',
    role: 'Data Analyst',
    status: 'speaking',
    position: [3, 0, -2],
    targetPosition: null,
    color: '#ff9f43',
    avatar: '🧠',
    metrics: { tasksCompleted: 632, responseTime: '0.5s', uptime: '99.2%' },
  },
  {
    id: 'agent-3',
    name: 'Echo',
    role: 'Communications',
    status: 'typing',
    position: [-2, 0, 3],
    targetPosition: null,
    color: '#54a0ff',
    avatar: '📡',
    metrics: { tasksCompleted: 421, responseTime: '0.2s', uptime: '99.9%' },
  },
  {
    id: 'agent-4',
    name: 'Forge',
    role: 'Builder',
    status: 'idle',
    position: [-3, 0, -1],
    targetPosition: null,
    color: '#ff6b6b',
    avatar: '🔧',
    metrics: { tasksCompleted: 1203, responseTime: '0.8s', uptime: '97.5%' },
  },
];

export const useWorldStore = create<WorldState>((set) => ({
  agents: initialAgents,
  selectedAgentId: null,
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
        a.id === id ? { ...a, targetPosition: target } : a
      ),
    })),
  updateAgentStatus: (id, status) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, status } : a
      ),
    })),
  clearTarget: (id) =>
    set((state) => ({
      agents: state.agents.map((a) =>
        a.id === id ? { ...a, targetPosition: null } : a
      ),
    })),
}));
