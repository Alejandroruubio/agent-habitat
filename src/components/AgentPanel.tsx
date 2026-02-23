import { useEffect } from 'react';
import { useWorldStore, AgentStatus, AgentVisualState, AlertLevel } from '@/state/world.store';

const statusConfig: Record<AgentStatus, { label: string; colorClass: string }> = {
  online: { label: 'Online', colorClass: 'bg-[hsl(var(--status-online))]' },
  speaking: { label: 'Speaking', colorClass: 'bg-[hsl(var(--status-speaking))]' },
  typing: { label: 'Typing...', colorClass: 'bg-[hsl(var(--status-typing))]' },
  idle: { label: 'Idle', colorClass: 'bg-[hsl(var(--status-offline))]' },
  offline: { label: 'Offline', colorClass: 'bg-[hsl(var(--status-offline))]' },
};

const movementLabels: Record<string, string> = {
  idle: '⏸ Standing',
  walking: '🚶 Walking',
  sitting: '🪑 Seated',
};

const visualStates: AgentVisualState[] = ['idle', 'talking', 'typing', 'thinking', 'done', 'warning'];
const alertLevels: AlertLevel[] = ['green', 'yellow', 'red'];

const speechSamples = [
  'Analyzing data...',
  'Ready to deploy.',
  'Found an anomaly!',
  'Task completed.',
  'Checking logs...',
  null,
];

export function AgentPanel() {
  const agents = useWorldStore((s) => s.agents);
  const selectedAgentId = useWorldStore((s) => s.selectedAgentId);
  const setSelectedAgent = useWorldStore((s) => s.setSelectedAgent);
  const updateAgentStatus = useWorldStore((s) => s.updateAgentStatus);
  const meetingMode = useWorldStore((s) => s.meetingMode);
  const commandAllToTable = useWorldStore((s) => s.commandAllToTable);
  const dismissFromTable = useWorldStore((s) => s.dismissFromTable);
  const setAgentVisualState = useWorldStore((s) => s.setAgentVisualState);
  const setAgentSpeechBubble = useWorldStore((s) => s.setAgentSpeechBubble);
  const alertLevel = useWorldStore((s) => s.alertLevel);
  const setAlertLevel = useWorldStore((s) => s.setAlertLevel);
  const debugMode = useWorldStore((s) => s.debugMode);
  const toggleDebug = useWorldStore((s) => s.toggleDebug);

  const selected = agents.find((a) => a.id === selectedAgentId);

  // Simulate status + visual state changes
  useEffect(() => {
    const statuses: AgentStatus[] = ['online', 'speaking', 'typing', 'idle'];
    const interval = setInterval(() => {
      const agent = agents[Math.floor(Math.random() * agents.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      updateAgentStatus(agent.id, status);

      // Random visual state changes
      if (Math.random() > 0.5) {
        const vs = visualStates[Math.floor(Math.random() * visualStates.length)];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        setAgentVisualState(randomAgent.id, vs);
      }

      // Random speech bubbles
      if (Math.random() > 0.7) {
        const speech = speechSamples[Math.floor(Math.random() * speechSamples.length)];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        setAgentSpeechBubble(randomAgent.id, speech);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [agents, updateAgentStatus, setAgentVisualState, setAgentSpeechBubble]);

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

      {/* Controls */}
      <div className="px-4 py-3 border-b border-border space-y-2">
        <button
          onClick={() => (meetingMode ? dismissFromTable() : commandAllToTable())}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-mono font-semibold tracking-wider uppercase transition-all duration-300 ${
            meetingMode
              ? 'bg-destructive/20 text-destructive border border-destructive/30 hover:bg-destructive/30'
              : 'bg-primary/15 text-primary border border-primary/30 hover:bg-primary/25 glow-primary'
          }`}
        >
          {meetingMode ? '✕ Dismiss Meeting' : '◉ Call All to Table'}
        </button>

        {/* Alert level */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground uppercase">Alert:</span>
          {alertLevels.map((level) => (
            <button
              key={level}
              onClick={() => setAlertLevel(level)}
              className={`w-5 h-5 rounded-full border transition-all ${
                alertLevel === level ? 'scale-125 border-foreground/50' : 'border-border opacity-50 hover:opacity-80'
              }`}
              style={{ background: level === 'green' ? '#00d4aa' : level === 'yellow' ? '#ffcc00' : '#ff4444' }}
            />
          ))}
        </div>

        {/* Debug toggle */}
        <button
          onClick={toggleDebug}
          className={`text-[10px] font-mono px-2 py-1 rounded border transition-all ${
            debugMode ? 'border-primary/40 text-primary bg-primary/10' : 'border-border text-muted-foreground hover:text-foreground'
          }`}
        >
          {debugMode ? '⬤ DEBUG ON' : '○ DEBUG'}
        </button>
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
                    <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                    <span className={`status-dot ${cfg.colorClass}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{agent.role}</span>
                    <span className="text-[10px] text-muted-foreground/60">{movementLabels[agent.movementState]}</span>
                  </div>
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
                <span className="text-xs text-muted-foreground">{statusConfig[selected.status].label}</span>
                <span className="text-xs text-muted-foreground/60">· {movementLabels[selected.movementState]}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p className="mb-1 font-mono uppercase tracking-wider text-foreground/60">Role</p>
            <p className="text-foreground">{selected.role}</p>
          </div>

          {/* Visual state toggles */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Visual State</p>
            <div className="flex flex-wrap gap-1">
              {visualStates.map((vs) => (
                <button
                  key={vs}
                  onClick={() => setAgentVisualState(selected.id, vs)}
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                    selected.visualState === vs
                      ? 'border-primary/50 text-primary bg-primary/10'
                      : 'border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {vs}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <MetricCard label="Tasks" value={String(selected.metrics.tasksCompleted)} />
            <MetricCard label="Resp." value={selected.metrics.responseTime} />
            <MetricCard label="Uptime" value={selected.metrics.uptime} />
          </div>

          <div className="text-xs text-muted-foreground font-mono">
            Pos: ({selected.position[0].toFixed(1)}, {selected.position[2].toFixed(1)})
            {selected.targetPosition && (
              <span className="text-primary/70">
                {' → '}({selected.targetPosition[0].toFixed(1)}, {selected.targetPosition[2].toFixed(1)})
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground italic">
            Click floor to move · Click table for meeting
          </p>
        </div>
      )}

      {!selected && (
        <div className="border-t border-border p-4">
          <p className="text-xs text-muted-foreground text-center italic">Select an agent to view details</p>
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
