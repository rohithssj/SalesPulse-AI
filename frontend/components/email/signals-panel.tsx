import { useState } from 'react';
import { Zap, MessageSquare, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/context/account-context';
import { fetchEmail, fetchProposal, fetchStrategy, fetchMeetingPrep } from '@/lib/api';
import { GeneratedContentModal } from './generated-content-modal';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

interface BuyingSignal {
  id: string;
  type: 'proposal_interest' | 'pricing_discussion' | 'inactivity' | 'engagement';
  title: string;
  description: string;
  deal: string;
  confidence: number;
  timestamp: string;
  action: string;
  accountId?: string;
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

export function SignalsPanel() {
  const { accounts, selectedAccountId } = useAccount();
  const selectedAccount = accounts.find(a => a.Id === selectedAccountId);
  const { copied, copy } = useCopyToClipboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSignalAction = async (signal: BuyingSignal) => {
    setModalTitle(signal.title);
    setModalContent('');
    setIsGenerating(true);
    setModalOpen(true);

    try {
      let res;
      const accountId = selectedAccountId;
      const accountName = selectedAccount?.Name || signal.deal;

      if (signal.type === 'proposal_interest') {
        res = await fetchProposal({
          accountId,
          accountName,
          tone: "Formal",
          type: "proposal",
          emailType: "proposal_request_response",
          context: `The account ${accountName} has explicitly requested a detailed project scope and feature breakdown. Signal detected ${signal.timestamp}. Confidence: ${signal.confidence}%. Generate a formal proposal email that addresses their request with specific deliverables, timeline, and pricing structure.`,
          signalType: signal.type,
          urgency: "high"
        }, accountId);
      } else if (signal.type === 'pricing_discussion') {
        res = await fetchEmail({
          accountId,
          accountName,
          tone: "Formal",
          type: "pricing",
          emailType: "pricing_details",
          context: `${accountName} has inquired about the enterprise plan and annual licensing. Detected ${signal.timestamp}. Generate a pricing email that covers enterprise plan tiers, annual vs monthly billing, volume discounts, and a clear call to action to schedule a pricing call.`,
          signalType: "pricing_inquiry",
          urgency: "medium"
        }, accountId);
      } else if (signal.type === 'engagement') {
        res = await fetchEmail({
          accountId,
          accountName,
          tone: "Friendly",
          type: "followup",
          emailType: "engagement_followup",
          context: `${accountName} has shown high email engagement - ${signal.description}. Detected ${signal.timestamp}. Generate a warm follow-up email that acknowledges their interest, offers a personalized demo, and creates urgency around a limited-time offer.`,
          signalType: "high_engagement",
          urgency: "high"
        }, accountId);
      } else if (signal.type === 'inactivity') {
        res = await fetchEmail({
          accountId,
          accountName,
          tone: "Friendly",
          type: "reengagement",
          emailType: "reengagement",
          context: `${accountName} has gone silent (${signal.description}). Generate a re-engagement email that re-establishes value, acknowledges the gap in communication, references their original pain points, and offers something new (case study, ROI report, or exclusive offer) to restart the conversation.`,
          signalType: "dormant",
          urgency: "low"
        }, accountId);
      } else {
        // Fallback for Strategy or Meeting Prep
        if (signal.action.includes('Meeting')) {
          res = await fetchMeetingPrep({ context: signal.description }, accountId);
        } else {
          res = await fetchStrategy({ context: signal.description }, accountId);
        }
      }

      const content = res?.email?.body || res?.content || res?.summary || res?.result || (typeof res === 'string' ? res : JSON.stringify(res));
      setModalContent(content);
    } catch (err) {
      setModalContent('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
                  <Button 
                    size="sm" 
                    onClick={() => handleSignalAction(signal)}
                    className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                  >
                    {signal.action}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <GeneratedContentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        isLoading={isGenerating}
      />

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
