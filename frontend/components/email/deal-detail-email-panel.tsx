'use client';

import { useState, useEffect } from 'react';
import { Clock, Mail, Send, Zap, MessageSquare, FileText, Loader2, RotateCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchEmail } from '@/lib/api';

interface EmailInteraction {
  id: string;
  type: 'sent' | 'opened' | 'clicked' | 'replied';
  subject: string;
  timestamp: string;
  status: 'delivered' | 'opened' | 'clicked' | 'replied';
  recipientName: string;
}

interface ConversationEvent {
  id: string;
  type: 'email' | 'note' | 'call' | 'meeting';
  title: string;
  description: string;
  timestamp: string;
  actor: string;
}

const emailInteractions: EmailInteraction[] = [
  {
    id: '1',
    type: 'sent',
    subject: 'Proposal: Custom Enterprise Solution',
    timestamp: '2 days ago',
    status: 'opened',
    recipientName: 'Sarah Johnson'
  },
  {
    id: '2',
    type: 'opened',
    subject: 'Market Analysis & Feature Comparison',
    timestamp: '3 days ago',
    status: 'clicked',
    recipientName: 'Sarah Johnson (3x opened)'
  },
  {
    id: '3',
    type: 'replied',
    subject: 'RE: Pricing Discussion',
    timestamp: '4 days ago',
    status: 'replied',
    recipientName: 'Sarah Johnson'
  },
  {
    id: '4',
    type: 'sent',
    subject: 'Follow-up: Implementation Timeline',
    timestamp: '5 days ago',
    status: 'opened',
    recipientName: 'Sarah Johnson'
  }
];

const conversationTimeline: ConversationEvent[] = [
  {
    id: '1',
    type: 'email',
    title: 'Proposal Sent',
    description: 'Custom Enterprise Solution (PDF attached)',
    timestamp: '2 days ago',
    actor: 'You'
  },
  {
    id: '2',
    type: 'email',
    title: 'Email Opened',
    description: 'Proposal viewed 3 times in 24 hours',
    timestamp: '1 day ago',
    actor: 'Sarah Johnson'
  },
  {
    id: '3',
    type: 'call',
    title: 'Sales Call Scheduled',
    description: 'Discussion of custom deployment options',
    timestamp: '1 day ago',
    actor: 'System'
  },
  {
    id: '4',
    type: 'email',
    title: 'Follow-up Email Replied',
    description: 'Asked about timeline and budget details',
    timestamp: '12 hours ago',
    actor: 'Sarah Johnson'
  },
  {
    id: '5',
    type: 'note',
    title: 'Internal Note',
    description: 'Decision maker highly interested. Budget confirmed. Push for close.',
    timestamp: '8 hours ago',
    actor: 'You'
  }
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="w-4 h-4 text-primary" />;
    case 'call':
      return <MessageSquare className="w-4 h-4 text-secondary" />;
    case 'meeting':
      return <Clock className="w-4 h-4 text-success" />;
    case 'note':
      return <FileText className="w-4 h-4 text-[#a3a3a3]" />;
    default:
      return <Zap className="w-4 h-4 text-primary" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'text-[#888]';
    case 'opened':
      return 'text-primary';
    case 'clicked':
      return 'text-secondary';
    case 'replied':
      return 'text-success';
    default:
      return 'text-[#a3a3a3]';
  }
};

export function DealDetailEmailPanel() {
  const [emailDraft, setEmailDraft] = useState<{subject: string; content: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDraft = async () => {
    setIsGenerating(true);
    const data = await fetchEmail({ type: 'follow-up', tone: 'persuasive' });
    if (data && data.email) {
      setEmailDraft({ subject: data.email.subject || 'Generated Draft', content: data.email.body || data.email });
    } else if (data) {
      setEmailDraft({ subject: 'Generated Draft', content: typeof data === 'string' ? data : JSON.stringify(data) });
    }
    setIsGenerating(false);
  };

  useEffect(() => {
    generateDraft();
  }, []);

  return (
    <div className="space-y-6">
      {/* Deal Header */}
      <div className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Acme Corp</h2>
            <p className="text-sm text-[#a3a3a3] mt-1">Enterprise Solutions • Decision Maker: Sarah Johnson (CFO)</p>
            <div className="flex items-center gap-2 mt-4">
              <Badge className="bg-success/10 text-success border-success/30 border">✓ High Engagement</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/30 border">⚡ Buying Signals Detected</Badge>
              <Badge className="bg-warning/10 text-warning border-warning/30 border">💼 Enterprise Deal</Badge>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-[#a3a3a3]">Deal Value</div>
            <div className="text-3xl font-bold text-success">$2.4M</div>
            <div className="text-xs text-[#888] mt-2">Expected Close: May 2026</div>
          </div>
        </div>
      </div>

      {/* Email Interaction History */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Email Interaction History
          </h3>
        </div>
        <div className="space-y-3">
          {emailInteractions.map((interaction) => (
            <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-primary/20 transition-colors">
              <div className={`flex-shrink-0 mt-1 text-sm font-bold ${getStatusColor(interaction.status)}`}>
                {interaction.status === 'delivered' && '📤'}
                {interaction.status === 'opened' && '👁'}
                {interaction.status === 'clicked' && '🔗'}
                {interaction.status === 'replied' && '💬'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{interaction.subject}</p>
                <p className="text-xs text-[#888] mt-1">{interaction.recipientName} • {interaction.timestamp}</p>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-primary hover:bg-primary/10">
                View
              </Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Conversation Timeline */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
          <p className="text-xs text-[#888] mt-1">Complete communication history</p>
        </div>
        <div className="space-y-4">
          {conversationTimeline.map((event, idx) => (
            <div key={event.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                  {getEventIcon(event.type)}
                </div>
                {idx !== conversationTimeline.length - 1 && <div className="w-0.5 h-12 bg-white/10 my-2"></div>}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-sm font-semibold text-white">{event.title}</h4>
                <p className="text-xs text-[#888] mt-1">{event.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-[#666]">{event.timestamp}</span>
                  <span className="text-xs text-[#666]">•</span>
                  <span className="text-xs text-[#a3a3a3] font-medium">{event.actor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Email Engagement Status */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3">Last Email Sent</h4>
          <p className="text-sm font-medium text-white mb-1">Proposal: Custom Enterprise Solution</p>
          <p className="text-xs text-[#888]">2 days ago • Opened 3 times</p>
          <Badge className="mt-3 bg-success/10 text-success border-success/30 border text-xs">
            ✓ Delivered & Opened
          </Badge>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <h4 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3">Last Interaction</h4>
          <p className="text-sm font-medium text-white mb-1">Email Reply Received</p>
          <p className="text-xs text-[#888]">12 hours ago • Asked about timeline</p>
          <Badge className="mt-3 bg-primary/10 text-primary border-primary/30 border text-xs">
            💬 Response Required
          </Badge>
        </Card>
      </div>

      {/* Suggested Response */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg relative">
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            AI-Suggested Response Email
          </h3>
          <Button size="sm" variant="ghost" className="h-8 gap-2 text-xs text-[#888] hover:text-white" onClick={generateDraft} disabled={isGenerating}>
            <RotateCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
        
        {isGenerating && !emailDraft ? (
           <div className="flex justify-center p-8">
             <Loader2 className="w-8 h-8 animate-spin text-primary" />
           </div>
        ) : (
          <>
            <div className="space-y-3">
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-lg space-y-2">
                <p className="text-xs text-[#888] font-medium">SUBJECT:</p>
                <p className="text-sm text-white">{emailDraft?.subject || 'Drafting...'}</p>
              </div>
              <div className="p-4 bg-white/[0.02] border border-white/10 rounded-lg space-y-2">
                <p className="text-xs text-[#888] font-medium">PREVIEW:</p>
                <p className="text-sm text-[#b3b3b3] whitespace-pre-wrap">
                  {emailDraft?.content || 'Drafting...'}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white" disabled={isGenerating}>
                <Send className="w-4 h-4" />
                Send This Draft
              </Button>
              <Button className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20" disabled={isGenerating}>
                <FileText className="w-4 h-4" />
                View Full Email
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <Button onClick={generateDraft} disabled={isGenerating} className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12 flex-col">
          <Mail className="w-4 h-4" />
          <span className="text-xs">Generate Email</span>
        </Button>
        <Button className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12 flex-col">
          <Clock className="w-4 h-4" />
          <span className="text-xs">Schedule Follow-up</span>
        </Button>
        <Button className="gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 h-12 flex-col">
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs">Log Interaction</span>
        </Button>
      </div>
    </div>
  );
}
