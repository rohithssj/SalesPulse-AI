import { useState, useEffect } from 'react';
import { Clock, Mail, Send, Zap, MessageSquare, FileText, Loader2, RotateCw, Copy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchCompleteData } from '@/lib/api';
import { generateAIContent } from '@/lib/aiGenerator';
import { useAccount } from '@/context/AccountContext';
import { GeneratedContentModal } from './generated-content-modal';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

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
  }
];

export function DealDetailEmailPanel() {
  const { accounts, selectedAccountId } = useAccount();
  const selectedAccount = accounts.find(a => a.Id === selectedAccountId);
  const { copied, copy } = useCopyToClipboard();
  const [emailDraft, setEmailDraft] = useState<{subject: string; content: string} | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [isModalLoading, setIsModalLoading] = useState(false);

  const generateDraft = async () => {
    if (!selectedAccountId) return;
    setIsGenerating(true);
    try {
      const lastEmail = emailInteractions.find(i => i.type === 'replied' || i.type === 'opened')?.subject || '';
      const content = await generateAIContent({
        type: 'suggestedResponse',
        accountId: selectedAccountId,
        accountName: selectedAccount?.Name || 'Account',
        lastEmail: lastEmail,
        stage: (selectedAccount as any)?.deals?.[0]?.stage || 'Evaluation',
        industry: selectedAccount?.Industry || 'enterprise',
        tone: 'persuasive',
      });
      setEmailDraft({ subject: 'Suggested Response', content: content });
    } catch (err) {
      console.error('Failed to generate draft', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewHistory = async (interaction: EmailInteraction) => {
    setModalTitle(interaction.subject);
    setModalContent('');
    setIsModalLoading(true);
    setModalOpen(true);

    try {
      const data = await fetchCompleteData(selectedAccountId);
      // Logic to find actual email body from activities/emails if present
      const activities = (data as any)?.activities || [];
      const match = activities.find((a: any) => a.Subject === interaction.subject || a.subject === interaction.subject);
      
      setModalContent(match?.Description || match?.description || `Subject: ${interaction.subject}\nFrom: ${interaction.recipientName}\nDate: ${interaction.timestamp}\n\n[Body content not found in current Salesforce activity view. Fetching metadata...]`);
    } catch (err) {
      setModalContent('Failed to load email history.');
    } finally {
      setIsModalLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (emailDraft?.content) {
      copy(emailDraft.content);
    }
  };

  useEffect(() => {
    if (selectedAccountId) {
      generateDraft();
    }
  }, [selectedAccountId]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4 text-primary" />;
      case 'call': return <MessageSquare className="w-4 h-4 text-secondary" />;
      case 'meeting': return <Clock className="w-4 h-4 text-success" />;
      case 'note': return <FileText className="w-4 h-4 text-[#a3a3a3]" />;
      default: return <Zap className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-[#888]';
      case 'opened': return 'text-primary';
      case 'clicked': return 'text-secondary';
      case 'replied': return 'text-success';
      default: return 'text-[#a3a3a3]';
    }
  };

  return (
    <div className="space-y-6">
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
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleViewHistory(interaction)}
                className="text-xs text-primary hover:bg-primary/10"
              >
                View
              </Button>
            </div>
          ))}
        </div>
      </Card>

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
                <pre className="text-sm text-[#b3b3b3] whitespace-pre-wrap font-sans">
                  {emailDraft?.content || 'Drafting...'}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={handleCopyResponse} className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white" disabled={isGenerating || !emailDraft}>
                <Copy className="w-4 h-4" />
                {copied ? '✓ Copied!' : 'Copy Response'}
              </Button>
              <Button onClick={() => {
                if (emailDraft) {
                  setModalTitle(emailDraft.subject);
                  setModalContent(emailDraft.content);
                  setModalOpen(true);
                }
              }} className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20" disabled={isGenerating || !emailDraft}>
                <FileText className="w-4 h-4" />
                View Full Email
              </Button>
            </div>
          </>
        )}
      </Card>

      <GeneratedContentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        isLoading={isModalLoading}
      />

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
