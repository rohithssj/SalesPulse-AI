'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, Phone, Calendar, User, TrendingUp, AlertCircle, Zap, FileText, MessageSquare, Plus, Share2 } from 'lucide-react';

// Sample deal data
const dealData = {
  id: 'DEAL-2024-001',
  name: 'Enterprise Solutions - Full Platform',
  account: 'Enterprise Solutions Inc',
  value: 450000,
  stage: 'Negotiation',
  probability: 78,
  health: 85,
  nextStep: 'Executive Closing Call',
  nextStepDate: '2024-02-25',
  createdDate: '2024-01-15',
  estimatedClose: '2024-03-15',
};

const dealTimeline = [
  { date: '2024-01-15', event: 'Initial Contact', type: 'outreach', person: 'You', details: 'Cold email to VP of Operations' },
  { date: '2024-01-22', event: 'Discovery Call Completed', type: 'meeting', person: 'Sarah Johnson', details: 'Discussed key requirements and use cases' },
  { date: '2024-02-05', event: 'Demo Scheduled & Delivered', type: 'meeting', person: 'Sarah Johnson', details: 'Full product walkthrough, positive feedback' },
  { date: '2024-02-12', event: 'Proposal Sent', type: 'action', person: 'You', details: 'Custom proposal for 500+ user deployment' },
  { date: '2024-02-18', event: 'Budget Confirmation Signal', type: 'signal', person: 'CFO (Sarah Lee)', details: 'Budget allocated for Q1, timeline confirmed' },
];

const engagementHistory = [
  { id: 1, type: 'Email', status: 'opened', subject: 'Follow-up: Platform Capabilities', date: '2024-02-20', opens: 2, clicks: 1 },
  { id: 2, type: 'Call', status: 'completed', subject: '30-min Discovery Call', date: '2024-02-18', duration: '32 min' },
  { id: 3, type: 'Email', status: 'opened', subject: 'Custom Proposal', date: '2024-02-12', opens: 3, clicks: 2 },
  { id: 4, type: 'Meeting', status: 'completed', subject: 'Live Product Demo', date: '2024-02-05', duration: '45 min' },
  { id: 5, type: 'Call', status: 'completed', subject: 'Initial Discovery Call', date: '2024-01-22', duration: '28 min' },
];

const teamMembers = [
  { name: 'Sarah Johnson', role: 'VP of Operations', status: 'active', avatar: 'SJ' },
  { name: 'Mike Chen', role: 'CTO', status: 'engaged', avatar: 'MC' },
  { name: 'Emily Rodriguez', role: 'Procurement Manager', status: 'active', avatar: 'ER' },
];

const scoreBreakdown = [
  { factor: 'Engagement Level', score: 95, max: 100 },
  { factor: 'Budget Confirmation', score: 85, max: 100 },
  { factor: 'Timeline Alignment', score: 70, max: 100 },
  { factor: 'Stakeholder Agreement', score: 88, max: 100 },
  { factor: 'Competition Risk', score: 65, max: 100 },
];

const suggestedActions = [
  { priority: 'Critical', action: 'Schedule executive closing call with CEO', timeline: 'This week', owner: 'You' },
  { priority: 'High', action: 'Send implementation roadmap details', timeline: 'Within 2 days', owner: 'You' },
  { priority: 'High', action: 'Confirm onboarding timeline with team', timeline: 'Before call', owner: 'Sarah Johnson' },
  { priority: 'Medium', action: 'Prepare contract review comparison', timeline: 'By next week', owner: 'Legal' },
];

export interface DealDetailPanelProps {
  dealId?: string;
}

export function DealDetailPanel({ dealId = 'DEAL-2024-001' }: DealDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Discovery':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'Demo':
        return 'bg-primary/10 text-primary border-primary/30';
      case 'Proposal':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'Negotiation':
        return 'bg-secondary/10 text-secondary border-secondary/30';
      case 'Closed Won':
        return 'bg-success/10 text-success border-success/30';
      default:
        return 'bg-white/10 text-white border-white/30';
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 80) return 'text-success';
    if (health >= 60) return 'text-warning';
    return 'text-red-500';
  };

  return (
    <div className="w-full animate-fade-up-soft">
      {/* Deal Header */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg mb-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">{dealData.name}</h1>
                <Badge className={`${getStageColor(dealData.stage)} border`}>{dealData.stage}</Badge>
              </div>
              <p className="text-sm text-[#888]">{dealData.account}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${(dealData.value / 1000).toFixed(0)}K</p>
              <p className="text-xs text-[#888] mt-1">Deal Value</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-5 gap-4">
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Win Probability</p>
              <p className={`text-2xl font-bold ${dealData.probability >= 70 ? 'text-success' : 'text-warning'}`}>
                {dealData.probability}%
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Deal Health</p>
              <p className={`text-2xl font-bold ${getHealthColor(dealData.health)}`}>{dealData.health}%</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Days in Stage</p>
              <p className="text-2xl font-bold text-white">13</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Touchpoints</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Signals</p>
              <p className="text-2xl font-bold text-warning">3</p>
            </div>
          </div>

          {/* Timeline Info */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[#888]" />
              <div>
                <p className="text-xs text-[#888]">Current Stage Since</p>
                <p className="text-sm font-medium text-white">Feb 12, 2024</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-warning" />
              <div>
                <p className="text-xs text-[#888]">Next Step</p>
                <p className="text-sm font-medium text-white">{dealData.nextStep}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-4 h-4 text-[#888]" />
              <div>
                <p className="text-xs text-[#888]">Est. Close Date</p>
                <p className="text-sm font-medium text-white">{dealData.estimatedClose}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg mb-6">
          <TabsTrigger value="overview" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            📊 Overview
          </TabsTrigger>
          <TabsTrigger value="timeline" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            📅 Timeline
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            👥 Team
          </TabsTrigger>
          <TabsTrigger value="actions" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            ✨ Actions
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Deal Health Score Breakdown */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Health Score Breakdown</h3>
              <div className="space-y-3">
                {scoreBreakdown.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#a3a3a3]">{item.factor}</span>
                      <span className="text-sm font-bold text-primary">{item.score}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Engagement Summary */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Engagement Summary</h3>
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#a3a3a3]">Email Opens</span>
                    <span className="text-lg font-bold text-primary">5/7</span>
                  </div>
                  <p className="text-xs text-[#888]">71% open rate (vs 45% avg)</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#a3a3a3]">Link Clicks</span>
                    <span className="text-lg font-bold text-secondary">12</span>
                  </div>
                  <p className="text-xs text-[#888]">3 clicks per email average</p>
                </div>
                <div className="p-3 rounded-lg bg-success/10 border border-success/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#a3a3a3]">Meetings</span>
                    <span className="text-lg font-bold text-success">3</span>
                  </div>
                  <p className="text-xs text-[#888]">Total meetings held</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Key Contacts */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Key Stakeholders</h3>
            <div className="space-y-3">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 border border-white/20">
                      <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">{member.avatar}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-[#888]">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="text-[10px] gap-1 border-white/20">
                      <Mail className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-[10px] gap-1 border-white/20">
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-6">Deal Evolution</h3>
            <div className="space-y-4">
              {dealTimeline.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      item.type === 'signal' ? 'bg-warning' :
                      item.type === 'action' ? 'bg-secondary' :
                      item.type === 'meeting' ? 'bg-primary' :
                      'bg-blue-500'
                    } mt-1.5`} />
                    {idx !== dealTimeline.length - 1 && <div className="w-px h-12 bg-white/10 my-2" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-semibold text-white">{item.event}</p>
                    <p className="text-xs text-[#888]">{item.date} · {item.person}</p>
                    <p className="text-sm text-[#a3a3a3] mt-1">{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Engagement History */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Engagement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Type</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Subject</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Date</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {engagementHistory.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-3">
                        <Badge className="text-[10px] bg-white/10 text-white border-white/20 border">{item.type}</Badge>
                      </td>
                      <td className="py-3 px-3 text-white font-medium">{item.subject}</td>
                      <td className="py-3 px-3 text-[#888]">{item.date}</td>
                      <td className="py-3 px-3 text-[#888]">
                        {item.type === 'Email' && `${item.opens} opens, ${item.clicks} clicks`}
                        {item.type === 'Call' && `${item.duration}`}
                        {item.type === 'Meeting' && `${item.duration}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Team Members</h3>
            <div className="space-y-4">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-white/20">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-white">{member.name}</p>
                        <p className="text-xs text-[#888]">{member.role}</p>
                      </div>
                    </div>
                    <Badge className={`text-[10px] ${member.status === 'active' ? 'bg-success/10 text-success border-success/30' : 'bg-primary/10 text-primary border-primary/30'} border`}>
                      {member.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-8">
                      <Mail className="w-3 h-3" />
                      Email
                    </Button>
                    <Button size="sm" className="flex-1 gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-8">
                      <Phone className="w-3 h-3" />
                      Call
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Suggested Next Steps</h3>
              <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90 text-white text-xs h-8">
                <Plus className="w-3 h-3" />
                Add Action
              </Button>
            </div>
            <div className="space-y-3">
              {suggestedActions.map((action, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{action.action}</p>
                      <p className="text-xs text-[#888] mt-1">Owner: {action.owner} · {action.timeline}</p>
                    </div>
                    <Badge className={`text-[10px] ${
                      action.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                      'bg-warning/10 text-warning border-warning/30'
                    } border`}>
                      {action.priority}
                    </Badge>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" className="gap-1 bg-primary/20 hover:bg-primary/30 text-primary text-xs h-7 flex-1">
                      <Zap className="w-3 h-3" />
                      Start
                    </Button>
                    <Button size="sm" className="gap-1 bg-white/10 hover:bg-white/20 text-white text-xs h-7 flex-1">
                      <Share2 className="w-3 h-3" />
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
