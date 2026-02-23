import { WorldCanvas } from '@/3d/WorldCanvas';
import { AgentPanel } from '@/components/AgentPanel';

const Index = () => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Header bar */}
      <div className="absolute top-0 left-0 right-80 z-10 px-6 py-3 flex items-center justify-between glass">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[hsl(var(--status-online))] status-dot" />
          <h1 className="text-sm font-semibold text-foreground font-mono tracking-wider uppercase">
            Agent World
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span>4 Agents</span>
          <span>•</span>
          <span>System Active</span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="flex-1 relative cursor-crosshair">
        <WorldCanvas />
      </div>

      {/* Side panel */}
      <AgentPanel />
    </div>
  );
};

export default Index;
