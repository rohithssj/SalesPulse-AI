'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Mail, Phone, Calendar, User, TrendingUp, AlertCircle, Zap, FileText, MessageSquare, Plus, Share2, Copy, Check, X } from 'lucide-react';
import { generateAIContent } from '@/lib/aiGenerator';
import { useAccount } from '@/context/account-context';
import { useDataSource } from '@/context/DataSourceContext';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { parseAnyResponse } from '@/lib/responseParser';
import { 
  buildFollowUpContext, 
  buildCallPrepContext, 
  buildEngagementPlanContext,
  buildMeetingSummaryContext
} from '@/lib/contextBuilder';
import { RenderedContent } from '../shared/RenderedContent';

// Sample deal data
const dealData = {
  id: 'DEAL-2024-001',
  name: 'Enterprise Solutions - Full Platform',
  account: 'Enterprise Solutions Inc',
  contact: 'Sarah Johnson',
  value: 450000,
  formattedValue: '$450K',
  stage: 'Negotiation',
  probability: 78,
  health: 85,
  nextStep: 'Executive Closing Call',
  nextStepDate: '2024-02-25',
  createdDate: '2024-01-15',
  estimatedClose: '2024-03-15',
  daysLeft: 10,
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
  { id: '1', priority: 'Critical', action: 'Schedule executive closing call with CEO', timeline: 'This week', owner: 'You' },
  { id: '2', priority: 'High', action: 'Send implementation roadmap details', timeline: 'Within 2 days', owner: 'You' },
  { id: '3', priority: 'High', action: 'Confirm onboarding timeline with team', timeline: 'Before call', owner: 'Sarah Johnson' },
  { id: '4', priority: 'Medium', action: 'Prepare contract review comparison', timeline: 'By next week', owner: 'Legal' },
];

export interface Action {
  id: string;
  priority: string;
  action: string;
  timeline: string;
  owner: string;
  aiSuggestion?: string;
  isCustom?: boolean;
}

export interface DealDetailPanelProps {
  dealId?: string;
}

export function DealDetailPanel({ dealId = 'DEAL-2024-001' }: DealDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isExpanded, setIsExpanded] = useState(true);
  const { isUploadMode, globalData, selectedAccount } = useDataSource();
  const selectedAccountId = selectedAccount?.id;
  const { copied, copy } = useCopyToClipboard();

  // --- ACTIONS STATE ---
  const [actions, setActions] = useState<Action[]>(suggestedActions);
  const [startedActions, setStartedActions] = useState<Record<string, boolean>>({});
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [actionResults, setActionResults] = useState<Record<string, string>>({});
  
  const [assignedActions, setAssignedActions] = useState<Record<string, string>>({});
  const [showAssignModal, setShowAssignModal] = useState<string | null>(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '', priority: 'High', owner: 'You', deadline: 'This week'
  });

  // --- TEAM OUTREACH STATE ---
  const [generatingEmail, setGeneratingEmail] = useState<Record<string, boolean>>({});
  const [emailResults, setEmailResults] = useState<Record<string, string>>({});
  const [showEmailModal, setShowEmailModal] = useState<string | null>(null);
  
  const [preparingCall, setPreparingCall] = useState<Record<string, boolean>>({});
  const [callPreps, setCallPreps] = useState<Record<string, string>>({});
  const [showCallModal, setShowCallModal] = useState<string | null>(null);

  // --- HANDLERS ---
  const handleStart = async (action: Action) => {
    setLoadingActions(prev => ({ ...prev, [action.id]: true }));
    try {
      const content = await generateAIContent({
        type:        'email',
        accountId:   selectedAccountId || undefined,
        accountName: selectedAccount?.name || dealData.account || 'Account',
        contactName: dealData.contact || 'Contact',
        stage:       dealData.stage || 'Qualification',
        value:       dealData.formattedValue || dealData.value || '$0',
        probability: dealData.probability || 65,
        daysLeft:    10,
        context:     `Generate an email to execute this action: "${action.action}". Account: ${selectedAccount?.name}. Priority: ${action.priority}. Deadline: ${action.timeline}. Make it direct and actionable.`,
      });

      setActionResults(prev => ({ ...prev, [action.id]: content }));
      setStartedActions(prev => ({ ...prev, [action.id]: true }));
    } catch (err) {
      console.error('Failed to start action', err);
    } finally {
      setLoadingActions(prev => ({ ...prev, [action.id]: false }));
    }
  };

  const handleAssign = (actionId: string, memberName: string) => {
    setAssignedActions(prev => ({ ...prev, [actionId]: memberName }));
    setShowAssignModal(null);
  };

  const handleAddAction = async () => {
    if (!newAction.title.trim()) return;
    
    const tempId = `custom_${Date.now()}`;
    setActions(prev => [...prev, {
      id: tempId,
      action: newAction.title,
      priority: newAction.priority,
      owner: newAction.owner,
      timeline: newAction.deadline,
      isCustom: true
    }]);
    
    setShowAddModal(false);
    
    try {
      const content = await generateAIContent({
        type: 'strategy',
        accountId: selectedAccountId || undefined,
        accountName: selectedAccount?.name || dealData.account || 'Account',
        stage: dealData.stage || 'Qualification',
        context: `Provide a tactical execution plan for: "${newAction.title}" for ${selectedAccount?.name || dealData.account}.`
      });
      setActionResults(prev => ({ ...prev, [tempId]: content }));
    } catch (err) {
      console.error('Failed to generate AI suggestion', err);
    }
    
    setNewAction({ title: '', priority: 'High', owner: 'You', deadline: 'This week' });
  };

  const handleEmailMember = async (member: any) => {
    setGeneratingEmail(prev => ({ ...prev, [member.name]: true }));
    try {
      const content = await generateAIContent({
        type:        'email',
        accountId:   selectedAccountId || undefined,
        accountName: selectedAccount?.name || dealData.account || 'Account',
        contactName: member.name,
        contactRole: member.role,
        stage:       dealData.stage || 'Qualification',
        value:       dealData.formattedValue || dealData.value || '$0',
        probability: dealData.probability || 65,
        daysLeft:    dealData.daysLeft || 30,
        signals:     [member.status === 'engaged'
          ? 'Actively engaged — maintain momentum'
          : 'Needs re-engagement — warm outreach required'],
      });

      setEmailResults(prev => ({ ...prev, [member.name]: content }));
      setShowEmailModal(member.name);
    } catch (err) {
      console.error('Email generation failed', err);
    } finally {
      setGeneratingEmail(prev => ({ ...prev, [member.name]: false }));
    }
  };

  const handleCallPrep = async (member: any) => {
    setPreparingCall(prev => ({ ...prev, [member.name]: true }));
    try {
      const content = await generateAIContent({
        type:        'callprep',
        accountId:   selectedAccountId || undefined,
        accountName: selectedAccount?.name || dealData.account || 'Account',
        contactName: member.name,
        contactRole: member.role,
        stage:       dealData.stage || 'Qualification',
        value:       dealData.formattedValue || dealData.value || '$0',
        probability: dealData.probability || 65,
        daysLeft:    dealData.daysLeft || 30,
      });
      
      setCallPreps(prev => ({ ...prev, [member.name]: content }));
      setShowCallModal(member.name);
    } catch (err) {
      console.error('Call prep failed', err);
    } finally {
      setPreparingCall(prev => ({ ...prev, [member.name]: false }));
    }
  };

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
              <p className="text-sm text-[#888]">{selectedAccount?.name || dealData.account}</p>
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
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-8"
                      onClick={() => handleEmailMember(member)}
                      disabled={generatingEmail[member.name]}
                    >
                      <Mail className="w-3 h-3" />
                      {generatingEmail[member.name] ? 'Generating...' : 'Email'}
                    </Button>
                    <Button 
                      size="sm" 
                      className="flex-1 gap-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-8"
                      onClick={() => handleCallPrep(member)}
                      disabled={preparingCall[member.name]}
                    >
                      <Phone className="w-3 h-3" />
                      {preparingCall[member.name] ? 'Preparing...' : 'Call'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Email Modal */}
          {showEmailModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
              <Card className="glass luxury-panel border-[#2a2a2a] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Outreach Email: {showEmailModal}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowEmailModal(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 text-sm text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                  {emailResults[showEmailModal]}
                </div>
                <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowEmailModal(null)}>Close</Button>
                  <Button onClick={() => copy(emailResults[showEmailModal])}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy Email'}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Call Modal */}
          {showCallModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
              <Card className="glass luxury-panel border-[#2a2a2a] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Call Prep: {showCallModal}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowCallModal(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 text-sm text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                  {callPreps[showCallModal]}
                </div>
                <div className="p-6 border-t border-white/10 flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setShowCallModal(null)}>Close</Button>
                  <Button onClick={() => copy(callPreps[showCallModal])}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copied' : 'Copy Prep'}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Suggested Next Steps</h3>
              <Button 
                size="sm" 
                className="gap-1 bg-primary hover:bg-primary/90 text-white text-xs h-8 transition-all hover:scale-105"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-3 h-3" />
                Add Action
              </Button>
            </div>
            <div className="space-y-3">
              {actions.map((action, idx) => (
                <div key={action.id || idx} className="p-4 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{action.action}</p>
                      <p className="text-xs text-[#888] mt-1">
                        Owner: {assignedActions[action.id] || action.owner} · {action.timeline}
                        {action.isCustom && <Badge className="ml-2 bg-blue-500/10 text-blue-500 border-none h-4 text-[9px]">Custom</Badge>}
                      </p>
                    </div>
                    <Badge className={`text-[10px] ${
                      action.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                      'bg-warning/10 text-warning border-warning/30'
                    } border`}>
                      {action.priority}
                    </Badge>
                  </div>
                  
                  {/* Action Result Display */}
                  {actionResults[action.id] && (
                    <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          AI Action Plan
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => copy(actionResults[action.id])}
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <p className="text-xs text-[#d1d5db] leading-relaxed whitespace-pre-wrap">
                        {actionResults[action.id]}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-3 relative">
                    <Button 
                      size="sm" 
                      className={`gap-1 text-xs h-8 flex-1 transition-all ${
                        startedActions[action.id] 
                          ? 'bg-success/20 text-success border-success/30' 
                          : 'bg-primary/20 hover:bg-primary/30 text-primary'
                      }`}
                      onClick={() => handleStart(action)}
                      disabled={loadingActions[action.id] || startedActions[action.id]}
                    >
                      {loadingActions[action.id] ? 'Starting...' : startedActions[action.id] ? 'Started' : <><Zap className="w-3 h-3" /> Start</>}
                    </Button>
                    
                    <div className="flex-1 relative">
                      <Button 
                        size="sm" 
                        className={`gap-1 w-full text-xs h-8 transition-all ${
                          assignedActions[action.id]
                            ? 'bg-secondary/20 text-secondary border-secondary/30'
                            : 'bg-white/10 hover:bg-white/20 text-white'
                        }`}
                        onClick={() => setShowAssignModal(showAssignModal === action.id ? null : action.id)}
                      >
                        <Share2 className="w-3 h-3" />
                        {assignedActions[action.id] ? assignedActions[action.id] : 'Assign'}
                      </Button>
                      
                      {showAssignModal === action.id && (
                        <Card className="absolute top-full right-0 mt-2 z-[100] bg-[#1a1a1a] border-[#333] shadow-2xl p-2 min-w-[180px] animate-in fade-in slide-in-from-top-1">
                          <p className="text-[10px] text-[#6b7280] font-bold uppercase tracking-wider p-2">Assign to</p>
                          {teamMembers.map(member => (
                            <button
                              key={member.name}
                              className="w-full text-left p-2 rounded hover:bg-white/5 text-xs text-[#d1d5db] flex items-center gap-2 transition-colors"
                              onClick={() => handleAssign(action.id, member.name)}
                            >
                              <div className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                                {member.avatar}
                              </div>
                              {member.name}
                            </button>
                          ))}
                        </Card>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Add Action Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-sm p-4">
              <Card className="glass luxury-panel border-[#2a2a2a] w-full max-w-md p-6 space-y-6 animate-in zoom-in-95">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">Add New Action</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#888] uppercase">Action Title</label>
                    <input 
                      type="text" 
                      className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                      placeholder="e.g. Schedule ROI review"
                      value={newAction.title}
                      onChange={e => setNewAction(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#888] uppercase">Priority</label>
                      <select 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                        value={newAction.priority}
                        onChange={e => setNewAction(p => ({ ...p, priority: e.target.value }))}
                      >
                        <option>Critical</option>
                        <option>High</option>
                        <option>Medium</option>
                        <option>Low</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-[#888] uppercase">Deadline</label>
                      <select 
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-primary/50"
                        value={newAction.deadline}
                        onChange={e => setNewAction(p => ({ ...p, deadline: e.target.value }))}
                      >
                        <option>Today</option>
                        <option>This week</option>
                        <option>Next week</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleAddAction} disabled={!newAction.title.trim()}>
                    Create Action
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
