'use client';

import { Mail, Zap, TrendingUp, Settings, Clock, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ActivityItem {
  id: string;
  type: 'email' | 'signal' | 'score' | 'analysis' | 'action' | 'alert';
  title: string;
  description: string;
  timestamp: string;
  agent?: string;
}

const activityLog: ActivityItem[] = [
  {
    id: '1',
    type: 'alert',
    title: 'High-Risk Deal Detected',
    description: 'Acme Corp deal health dropped to 42%',
    timestamp: '2 minutes ago',
    agent: 'Score Agent',
  },
  {
    id: '2',
    type: 'email',
    title: 'Follow-up Email Generated',
    description: 'TechFlow Inc - Proposal follow-up sent',
    timestamp: '15 minutes ago',
    agent: 'Generate Agent',
  },
  {
    id: '3',
    type: 'signal',
    title: 'Buying Signal Detected',
    description: 'CloudBase Systems - Pricing discussion initiated',
    timestamp: '47 minutes ago',
    agent: 'Intel Agent',
  },
  {
    id: '4',
    type: 'score',
    title: 'Deal Score Updated',
    description: 'Enterprise Solutions - WinProb: 78%',
    timestamp: '1 hour ago',
    agent: 'Score Agent',
  },
  {
    id: '5',
    type: 'analysis',
    title: 'AI Analysis Complete',
    description: 'Pipeline analysis: 24 deals, 6 new signals',
    timestamp: '2 hours ago',
    agent: 'Intel Agent',
  },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="w-4 h-4 text-primary" />;
    case 'signal':
      return <Zap className="w-4 h-4 text-warning" />;
    case 'score':
      return <TrendingUp className="w-4 h-4 text-secondary" />;
    case 'analysis':
      return <Settings className="w-4 h-4 text-[#a3a3a3]" />;
    case 'action':
      return <Clock className="w-4 h-4 text-success" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    default:
      return null;
  }
};

export function ActivityLog() {
  return (
    <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg max-h-96 overflow-y-auto">
      <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Activity Log</h4>

      <div className="space-y-3">
        {activityLog.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer">
            <div className="flex-shrink-0 mt-1">{getActivityIcon(item.type)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{item.title}</p>
              <p className="text-[10px] text-[#888] mt-0.5 truncate">{item.description}</p>
              <div className="flex items-center gap-2 mt-1">
                {item.agent && <span className="text-[10px] bg-white/5 text-[#a3a3a3] px-1.5 py-0.5 rounded">{item.agent}</span>}
                <span className="text-[10px] text-[#666]">{item.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
