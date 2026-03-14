'use client';

import { AlertCircle, CheckCircle2, Database, Cpu, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface StatusIndicatorProps {
  type: 'dataset' | 'agents' | 'agent-intel' | 'agent-score' | 'agent-generate';
  status: 'idle' | 'processing' | 'ready' | 'error';
  message?: string;
}

const statusConfig = {
  dataset: {
    idle: { color: 'bg-[#888]', text: 'No Dataset', icon: Database },
    processing: { color: 'bg-warning animate-pulse', text: 'Processing...', icon: Database },
    ready: { color: 'bg-success', text: 'Dataset Ready', icon: Database },
    error: { color: 'bg-red-500', text: 'Error', icon: AlertCircle },
  },
  agents: {
    idle: { color: 'bg-[#888]', text: 'Agents Ready', icon: Cpu },
    processing: { color: 'bg-primary animate-pulse', text: 'Running Analysis...', icon: Cpu },
    ready: { color: 'bg-success', text: 'All Systems Ready', icon: CheckCircle2 },
    error: { color: 'bg-red-500', text: 'Agent Error', icon: AlertCircle },
  },
  'agent-intel': {
    idle: { color: 'bg-[#888]', text: 'Intel Agent Idle', icon: Zap },
    processing: { color: 'bg-secondary animate-pulse', text: 'Intel Running...', icon: Zap },
    ready: { color: 'bg-success', text: 'Intel Ready', icon: CheckCircle2 },
    error: { color: 'bg-red-500', text: 'Intel Error', icon: AlertCircle },
  },
  'agent-score': {
    idle: { color: 'bg-[#888]', text: 'Score Agent Idle', icon: TrendingUp },
    processing: { color: 'bg-warning animate-pulse', text: 'Scoring...', icon: TrendingUp },
    ready: { color: 'bg-success', text: 'Score Ready', icon: CheckCircle2 },
    error: { color: 'bg-red-500', text: 'Score Error', icon: AlertCircle },
  },
  'agent-generate': {
    idle: { color: 'bg-[#888]', text: 'Generate Agent Idle', icon: Zap },
    processing: { color: 'bg-primary animate-pulse', text: 'Generating...', icon: Zap },
    ready: { color: 'bg-success', text: 'Generate Ready', icon: CheckCircle2 },
    error: { color: 'bg-red-500', text: 'Generate Error', icon: AlertCircle },
  },
};

export function StatusIndicator({ type, status, message }: StatusIndicatorProps) {
  const config = statusConfig[type];
  const state = config[status];
  const Icon = state.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${state.color}`} />
      <span className="text-xs font-medium text-[#a3a3a3]">{state.text}</span>
      {message && <span className="text-xs text-[#666]">({message})</span>}
    </div>
  );
}

export function GlobalStatusPanel() {
  return (
    <div className="glass rounded-lg p-4 border border-[#2a2a2a] space-y-3 bg-white/[0.02]">
      <h4 className="text-xs font-semibold text-white uppercase tracking-wider">System Status</h4>

      <div className="space-y-2">
        <StatusIndicator type="dataset" status="ready" message="CRM_Data_2024.csv" />
        <StatusIndicator type="agents" status="idle" />
        <StatusIndicator type="agent-intel" status="ready" />
        <StatusIndicator type="agent-score" status="ready" />
        <StatusIndicator type="agent-generate" status="ready" />
      </div>

      <div className="pt-2 border-t border-white/10 flex gap-2">
        <Badge className="text-[10px] bg-success/10 text-success border-success/30 border">
          ✓ All Systems Operational
        </Badge>
      </div>
    </div>
  );
}
