'use client';

import { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle, Zap, Brain, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgentStatus {
  name: string;
  icon: React.ReactNode;
  description: string;
  status: 'idle' | 'running' | 'complete' | 'error';
  lastRun?: string;
  outputCount?: number;
}

const agents: AgentStatus[] = [
  {
    name: 'Intel Agent',
    icon: <Brain className="w-5 h-5 text-secondary" />,
    description: 'Detects buying signals & engagement insights',
    status: 'complete',
    lastRun: '2 hours ago',
    outputCount: 6,
  },
  {
    name: 'Score Agent',
    icon: <TrendingUp className="w-5 h-5 text-warning" />,
    description: 'Calculates deal health & win probability',
    status: 'complete',
    lastRun: '1 hour ago',
    outputCount: 24,
  },
  {
    name: 'Generate Agent',
    icon: <FileText className="w-5 h-5 text-primary" />,
    description: 'Creates emails, summaries & strategies',
    status: 'idle',
    lastRun: '15 minutes ago',
    outputCount: 47,
  },
];

import { TrendingUp } from 'lucide-react';

export function AgentControlPanel() {
  const [runningAgent, setRunningAgent] = useState<string | null>(null);

  const handleRunAgent = (agentName: string) => {
    setRunningAgent(agentName);
    setTimeout(() => setRunningAgent(null), 3000);
  };

  return (
    <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          AI Agent Control
        </h3>
        <p className="text-xs text-[#888] mt-1">Run analysis agents on demand</p>
      </div>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-start justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-1">{agent.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{agent.name}</p>
                <p className="text-xs text-[#888] mt-0.5">{agent.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  {agent.status === 'complete' && (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-success" />
                      <span className="text-[10px] text-[#888]">Last run: {agent.lastRun}</span>
                      {agent.outputCount && <span className="text-[10px] text-[#a3a3a3]">({agent.outputCount} outputs)</span>}
                    </>
                  )}
                  {agent.status === 'running' && (
                    <>
                      <Loader2 className="w-3 h-3 text-primary animate-spin" />
                      <span className="text-[10px] text-primary font-medium">Running...</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => handleRunAgent(agent.name)}
              disabled={runningAgent === agent.name}
              className={`flex-shrink-0 gap-1 ml-3 ${
                runningAgent === agent.name
                  ? 'bg-white/10 text-white'
                  : 'bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30'
              }`}
            >
              {runningAgent === agent.name ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  Run
                </>
              )}
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
        <p className="text-xs text-[#a3a3a3]">
          <span className="font-semibold text-primary">💡 Tip:</span> Run agents individually to analyze specific aspects or together for comprehensive pipeline analysis
        </p>
      </div>
    </Card>
  );
}
