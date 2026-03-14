'use client';

import { Zap, MessageSquare, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BuyingSignal {
  id: string;
  type: 'proposal_interest' | 'pricing_discussion' | 'inactivity' | 'engagement';
  title: string;
  description: string;
  deal: string;
  confidence: number;
  timestamp: string;
  action: string;
}

const buyingSignals: BuyingSignal[] = [
  {
    id: '1',
    type: 'proposal_interest',
    title: 'Proposal Request Received',
    description: 'Asked for detailed project scope and feature breakdown',
    deal: 'TechFlow Inc',
    confidence: 95,
    timestamp: '2 hours ago',
    action: 'Generate Proposal Email'
  },
  {
    id: '2',
    type: 'pricing_discussion',
    title: 'Pricing Inquiry',
    description: 'Inquired about enterprise plan and annual licensing',
    deal: 'Acme Corp',
    confidence: 87,
    timestamp: '5 hours ago',
    action: 'Send Pricing Details'
  },
  {
    id: '3',
    type: 'engagement',
    title: 'High Email Engagement',
    description: 'Opened feature comparison email 4 times + clicked CTA',
    deal: 'CloudBase Systems',
    confidence: 92,
    timestamp: '1 day ago',
    action: 'Generate Follow-up'
  },
  {
    id: '4',
    type: 'inactivity',
    title: 'Re-engagement Needed',
    description: 'No interaction for 14 days. Last touched by competitor',
    deal: 'DataSync Ltd',
    confidence: 78,
    timestamp: '2 days ago',
    action: 'Send Re-engagement'
  },
  {
    id: '5',
    type: 'proposal_interest',
    title: 'Budget Allocation Mentioned',
    description: 'Finance team confirmed budget allocated for Q2 2026',
    deal: 'Enterprise Solutions',
    confidence: 88,
    timestamp: '3 days ago',
    action: 'Request Meeting'
  },
  {
    id: '6',
    type: 'engagement',
    title: 'Multiple Stakeholder Engagement',
    description: 'CFO, CTO, and Head of Operations opened proposal',
    deal: 'Global Holdings Inc',
    confidence: 94,
    timestamp: '3 days ago',
    action: 'Generate Strategy'
  }
];

const getSignalIcon = (type: string) => {
  switch (type) {
    case 'proposal_interest':
      return <Zap className="w-5 h-5 text-warning" />;
    case 'pricing_discussion':
      return <TrendingUp className="w-5 h-5 text-success" />;
    case 'engagement':
      return <MessageSquare className="w-5 h-5 text-primary" />;
    case 'inactivity':
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    default:
      return <Zap className="w-5 h-5 text-primary" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-success';
  if (confidence >= 80) return 'text-warning';
  return 'text-red-500';
};

export function SignalsPanel() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Buying Signals Dashboard</h3>
          <p className="text-sm text-[#888] mt-1">{buyingSignals.length} signals detected across pipeline</p>
        </div>
        <Badge className="bg-primary/20 text-primary border-primary/50 border text-sm">
          🔥 {buyingSignals.filter((s) => s.confidence >= 90).length} High Confidence
        </Badge>
      </div>

      <div className="grid gap-3">
        {buyingSignals.map((signal) => (
          <Card
            key={signal.id}
            className="glass luxury-panel border-[#2a2a2a] hover:border-primary/50 p-4 transition-all duration-300 cursor-pointer group lift-hover"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">{getSignalIcon(signal.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{signal.title}</h4>
                    <p className="text-xs text-[#888] mt-1">{signal.description}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-sm font-bold ${getConfidenceColor(signal.confidence)}`}>
                      {signal.confidence}%
                    </div>
                    <p className="text-xs text-[#666] mt-1">confidence</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-xs text-[#a3a3a3] font-medium">{signal.deal}</p>
                    <p className="text-xs text-[#666]">{signal.timestamp}</p>
                  </div>
                  <Button size="sm" className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                    {signal.action}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="glass rounded-xl p-6 border border-white/10 bg-white/[0.01]">
        <h4 className="text-sm font-semibold text-white mb-4">Signal Insights</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-success">6</div>
            <p className="text-xs text-[#888] mt-2">High Confidence</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">4</div>
            <p className="text-xs text-[#888] mt-2">Requires Action</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">89%</div>
            <p className="text-xs text-[#888] mt-2">Avg Confidence</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-[#888] mt-2">Re-engagement Needed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
