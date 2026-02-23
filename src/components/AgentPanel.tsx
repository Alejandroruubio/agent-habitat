import { useEffect } from 'react';
import { useWorldStore, AgentStatus } from '@/state/world.store';

const statusConfig: Record<AgentStatus, { label: string; colorClass: string }> = {
  online: { label: 'Online', colorClass: 'bg-[hsl(var(--status-online))]' },
  speaking: { label: 'Speaking', colorClass: 'bg-[hsl(var(--status-speaking))]' },
  typing: { label: 'Typing...', colorClass: 'bg-[hsl(var(--status-typing))]' },
  idle: { label: 'Idle', colorClass: 'bg-[hsl(var(--status-offline))]' },
  offline: { label: 'Offline', colorClass: 'bg-[hsl(var(--status-offline))]' },
};

export function AgentPanel() {
  const agents = useWorldStore((s) => s.agents);
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);
  const setSelectedAgent = useWorldStore((s) => s.setSelectedAgent);
  const updateAgentStatus = useWorldStore((s) => s.updateAgentStatus);

  const selected = agents.find((a) => a.id === selectedAgentId);

  // Simulate real-time status changes
  useEffect(() => {
    const statuses: AgentStatus[] = ['online', 'speaking', 'typing', 'idle'];
    const interval = setInterval(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      updateAgentStatus(randomAgent.id, randomStatus);
    }, 4000);
    return () => clearInterval(interval);
  }, [agents, updateAgentStatus]);

  return (
    <div className="w-80 h-full flex flex-col bg-card border-l border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground tracking-wider uppercase font-mono">
          Agent Control
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {agents.filter((a) => a.status !== 'offline').length}/{agents.length} active
        </p>
      </div>

      {/* Agent list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {agents.map((agent) => {
          const cfg = statusConfig[agent.status];
          const isActive = agent.id === selectedAgentId;
          return (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary/10 border border-primary/30 glow-primary'
                  : 'hover:bg-secondary border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{agent.avatar}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground truncate">
                      {agent.name}
                    </span>
                    <span className={`status-dot ${cfg.colorClass}`} />
                  </div>
                  <span className="text-xs text-muted-foreground">{agent.role}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected agent detail */}
      {selected && (
        <div className="border-t border-border p-4 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selected.avatar}</span>
            <div>
              <h3 className="text-base font-semibold text-foreground">{selected.name}</h3>
              <div className="flex items-center gap-2">
                <span className={`status-dot ${statusConfig[selected.status].colorClass}`} />
                <span className="text-xs text-muted-foreground">
                  {statusConfig[selected.status].label}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1 font-mono uppercase tracking-wider text-foreground/60">Role</p>
            <p className="text-foreground">{selected.role}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Tasks" value={String(selected.metrics.tasksCompleted)} />
            <MetricCard label="Resp." value={selected.metrics.responseTime} />
            <MetricCard label="Uptime" value={selected.metrics.uptime} />
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Pos: ({selected.position[0].toFixed(1)}, {selected.position[2].toFixed(1)})
          </div>

          <p className="text-xs text-muted-foreground italic">
            Click the floor to move this agent
          </p>
        </div>
      )}

      {!selected && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground text-center italic">
            Select an agent to view details
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-md p-2 text-center">
      <div className="text-xs text-muted-foreground font-mono">{label}</div>
      <div className="text-sm font-semibold text-foreground mt-0.5">{value}</div>
    </div>
  );
}
