'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, RefreshCw, Save, Zap, TrendingUp, Target } from 'lucide-react';

interface AIAgent {
  name: string;
  status: 'idle' | 'processing' | 'complete';
  lastRun: string;
  description: string;
}

const agents: AIAgent[] = [
  { name: 'Intel Agent', status: 'complete', lastRun: '2 min ago', description: 'Analyzes buying signals and account intelligence' },
  { name: 'Score Agent', status: 'complete', lastRun: '5 min ago', description: 'Calculates deal health and win probability' },
  { name: 'Generate Agent', status: 'idle', lastRun: '1 hour ago', description: 'Generates emails, proposals, and content' },
];

export function AIWorkspacePanel() {
  const [activeTab, setActiveTab] = useState('intel');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Agent Status Cards */}
      {/* Agent Status Cards - Requirement 10: 1/2/3 responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.name} className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
            <div className="flex items-start justify-between mb-3 gap-2">
              <h3 className="text-sm font-semibold text-white truncate">{agent.name}</h3>
              <Badge className={`text-xs flex-shrink-0 ${
                agent.status === 'complete' ? 'bg-success/10 text-success border-success/30' :
                agent.status === 'processing' ? 'bg-primary/10 text-primary border-primary/30' :
                'bg-white/10 text-[#888] border-white/20'
              } border`}>
                {agent.status === 'processing' && '⟳ '}
                {agent.status === 'complete' && '✓ '}
                {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
              </Badge>
            </div>
            <p className="text-xs text-[#888] mb-2 truncate max-w-full" title={agent.description}>{agent.description}</p>
            <p className="text-[10px] text-[#666]">Last run: {agent.lastRun}</p>
          </Card>
        ))}
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg">
          <TabsTrigger value="intel" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            📊 Intel
          </TabsTrigger>
          <TabsTrigger value="score" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            ⭐ Score
          </TabsTrigger>
          <TabsTrigger value="generate" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            ✨ Generate
          </TabsTrigger>
          <TabsTrigger value="strategy" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            🎯 Strategy
          </TabsTrigger>
        </TabsList>

        {/* Intel Tab */}
        <TabsContent value="intel" className="space-y-4 mt-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              Buying Signals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {['Proposal Interest', 'Budget Confirmed', 'Timeline Aligned', 'Decision Maker Engaged'].map((signal, i) => (
                <Badge key={i} className="bg-success/10 text-success border-success/30 border justify-start">
                  ✓ {signal}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Score Tab */}
        <TabsContent value="score" className="space-y-4 mt-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Deal Health Score: 87%
            </h4>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4">
              <div className="bg-primary h-3 rounded-full" style={{ width: '87%' }} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Badge className="bg-success/10 text-success border-success/30 border">Win: 85%</Badge>
              <Badge className="bg-warning/10 text-warning border-warning/30 border">Risk: Medium</Badge>
            </div>
          </Card>
        </TabsContent>

        {/* Generate Tab - Requirement 10: Full-width responsive buttons */}
        <TabsContent value="generate" className="space-y-4 mt-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9">Email</Button>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9">Proposal</Button>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-9">Summary</Button>
            </div>
            <div className="flex flex-col gap-2">
              <Button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-10" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-10 flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </Button>
                <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 h-10 flex items-center justify-center">
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4 mt-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-success" />
              Recommended Next Actions
            </h4>
            <div className="space-y-2">
              {['Send custom proposal', 'Schedule executive meeting', 'Add to closing checklist'].map((action, i) => (
                <Badge key={i} className="bg-success/10 text-success border-success/30 border justify-start h-auto py-2 whitespace-normal">
                  {i + 1}. {action}
                </Badge>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
