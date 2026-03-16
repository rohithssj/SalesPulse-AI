import { useState, useMemo } from 'react';
import { Zap, MessageSquare, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/context/AccountContext';
import { generateAIContent, GenerationType } from '@/lib/aiGenerator';
import { GeneratedContentModal } from './generated-content-modal';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { usePageData } from '@/hooks/usePageData';
import { normalizeActivities, extractSignalsFromActivities, normalizeOpportunities } from '@/lib/api';

interface BuyingSignal {
  id: string;
  type: string;
  account: string;
  detail: string;
  severity: string;
  confidence: number;
  time: string;
  action?: string;
  accountId?: string;
}

export function SignalsPanel() {
  const { accounts, selectedAccountId } = useAccount();
  const selectedAccount = accounts.find(a => a.Id === selectedAccountId);
  
  const { data, loading } = usePageData(
    '/completeData',
    (ctx) => ctx.globalData
  );

  const buyingSignals = useMemo(() => {
    if (!data) return [];
    
    const acts = normalizeActivities(data);
    const opps = normalizeOpportunities(data);
    const extracted = extractSignalsFromActivities(acts, opps);
    
    return extracted.map(s => ({
      ...s,
      action: s.type === 'Proposal Interest' ? 'Generate Proposal' : 
              s.type === 'Pricing Discussion' ? 'Send Pricing' :
              s.type === 'High Intent' ? 'Generate Strategy' : 'Generate Follow-up'
    }));
  }, [data]);

  const { copied, copy } = useCopyToClipboard();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSignalAction = async (signal: BuyingSignal) => {
    setModalTitle(signal.type);
    setModalContent('');
    setIsGenerating(true);
    setModalOpen(true);

    let actionType: GenerationType = 'followup';
    const action = signal.action || '';
    if (action.includes('Proposal')) actionType = 'proposal';
    else if (action.includes('Pricing')) actionType = 'followup'; // pricing mapped to follow up
    else if (action.includes('Strategy')) actionType = 'strategy';
    else actionType = 'followup';

    try {
      const content = await generateAIContent({
        type:        actionType,
        accountId:   selectedAccountId || signal.accountId || undefined,
        accountName: selectedAccount?.Name || signal.account,
        industry:    selectedAccount?.Industry || 'Technology',
        contactName: 'Contact',
        stage:       'Qualification',
        value:       '$0',
        probability: signal.confidence,
        daysLeft:    30,
        signals:     [signal.detail],
        tone:        'Formal',
      });

      setModalContent(content);
    } catch (err) {
      setModalContent('Failed to generate response. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getSignalIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('proposal')) return <Zap className="w-5 h-5 text-warning" />;
    if (t.includes('pricing')) return <TrendingUp className="w-5 h-5 text-success" />;
    if (t.includes('engagement')) return <MessageSquare className="w-5 h-5 text-primary" />;
    if (t.includes('urgency') || t.includes('at risk')) return <AlertTriangle className="w-5 h-5 text-red-500" />;
    return <Zap className="w-5 h-5 text-primary" />;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 80) return 'text-warning';
    return 'text-red-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

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
        {buyingSignals.length === 0 ? (
          <Card className="glass luxury-panel border-[#2a2a2a] p-12 text-center rounded-lg">
            <Zap className="w-8 h-8 text-[#444] mx-auto mb-4 opacity-20" />
            <p className="text-[#888] text-sm">No buying signals detected for this account yet.</p>
          </Card>
        ) : (
          buyingSignals.map((signal) => (
            <Card
              key={signal.id}
              className="glass luxury-panel border-[#2a2a2a] hover:border-primary/50 p-4 transition-all duration-300 cursor-pointer group lift-hover"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">{getSignalIcon(signal.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{signal.type}</h4>
                      <p className="text-xs text-[#888] mt-1">{signal.detail}</p>
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
                      <p className="text-xs text-[#a3a3a3] font-medium">{signal.account}</p>
                      <p className="text-xs text-[#666]">{signal.time}</p>
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
          ))
        )}
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
