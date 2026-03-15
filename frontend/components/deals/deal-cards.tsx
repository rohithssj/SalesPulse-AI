'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Zap, Loader2, Copy, X } from 'lucide-react';
import { useAccount } from '@/context/account-context';
import { fetchCompleteData, normalizeOpportunities, fetchEmail, fetchStrategy } from '@/lib/api';
import { getDealColor, getStageBorderColor } from '@/lib/deal-colors';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { GeneratedContentModal } from '../email/generated-content-modal';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  daysLeft: number;
  status: 'healthy' | 'moderate' | 'risk';
  contact: string;
}

export function DealCards() {
  const { selectedAccountId } = useAccount();
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { copied, copy } = useCopyToClipboard();

  // AI Functionality State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isEngaging, setIsEngaging] = useState(false);
  
  const [showTips, setShowTips] = useState<Record<string, boolean>>({});
  const [tips, setTips] = useState<Record<string, string>>({});
  const [loadingTips, setLoadingTips] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);
    fetchCompleteData(selectedAccountId).then(data => {
      if (data) {
        setDeals(normalizeOpportunities(data).slice(0, 5));
      }
      setLoading(false);
    });
  }, [selectedAccountId]);

  const daysColor = (days: number) => {
    if (days <= 2) return '#ef4444';   // red — critical
    if (days <= 5) return '#f97316';   // orange — urgent
    if (days <= 10) return '#f59e0b';  // amber — warning
    return '#22c55e';                  // green — healthy
  };

  const handleEngage = async (deal: any) => {
    setModalTitle(`Engagement Plan — ${deal.name}`);
    setModalContent('');
    setIsEngaging(true);
    setModalOpen(true);

    try {
      const res = await fetchEmail({
        accountId: deal.accountId,
        accountName: deal.accountName,
        contactName: deal.contact || 'Customer',
        tone: "Formal",
        type: "engage",
        emailType: "deal_engagement",
        dealStage: deal.dealStage,
        dealValue: deal.dealValue,
        daysLeft: deal.daysLeft || 7,
        probability: deal.winProbability,
        context: `Generate a deal engagement action plan for ${deal.name} with ${deal.accountName}.
          Current stage: ${deal.dealStage}.
          Deal value: ${deal.dealValue}.
          Probability: ${deal.winProbability}%.
          Days remaining: ${deal.daysLeft || 7} days.
          Primary contact: ${deal.contact || 'Customer'}.
          
          Provide:
          1. A personalized outreach email to ${deal.contact || 'Customer'} appropriate for the ${deal.dealStage} stage
          2. Three specific next actions the sales rep should take in the next 48 hours
          3. Key objections likely at this stage and how to handle them
          4. Suggested meeting agenda if a call is needed
          
          Make all advice specific to the ${deal.dealStage} stage and ${deal.winProbability}% probability context.`
      }, selectedAccountId);

      const generated = res?.email?.body || res?.content || res?.result || (typeof res === 'string' ? res : JSON.stringify(res));
      setModalContent(generated || 'Failed to generate plan.');
    } catch (err) {
      setModalContent('Error generating engagement plan. Please try again.');
    } finally {
      setIsEngaging(false);
    }
  };

  const handleAITips = async (deal: any) => {
    if (showTips[deal.id]) {
      setShowTips(prev => ({ ...prev, [deal.id]: false }));
      return;
    }

    setShowTips(prev => ({ ...prev, [deal.id]: true }));
    if (tips[deal.id]) return;

    setLoadingTips(prev => ({ ...prev, [deal.id]: true }));
    try {
      const stageContexts: Record<string, string> = {
        'Proposal': `The deal "${deal.name}" with ${deal.accountName} is in Proposal stage at ${deal.winProbability}% probability. Generate 4 tactical AI tips...`,
        'Negotiation': `The deal "${deal.name}" with ${deal.accountName} is in Negotiation stage at ${deal.winProbability}% probability. Generate 4 tactical AI tips...`,
        'Prospecting': `The deal "${deal.name}" with ${deal.accountName} is in early Prospecting stage at ${deal.winProbability}%. Generate 4 qualification tips...`,
        'Qualification': `The deal "${deal.name}" with ${deal.accountName} is in Qualification stage at ${deal.winProbability}%. Generate BANT tips...`,
        'default': `The deal "${deal.name}" with ${deal.accountName} is in ${deal.dealStage} stage at ${deal.winProbability}%. Generate tactical tips...`
      };

      const context = stageContexts[deal.dealStage] || stageContexts['default'];

      const res = await fetchStrategy({
        accountId: deal.accountId,
        context: context
      }, selectedAccountId);

      const tipsText = res?.strategy || res?.content || res?.result || (typeof res === 'string' ? res : JSON.stringify(res));
      setTips(prev => ({ ...prev, [deal.id]: tipsText || 'No tips available.' }));
    } catch (err) {
      setTips(prev => ({ ...prev, [deal.id]: 'Failed to load tips.' }));
    } finally {
      setLoadingTips(prev => ({ ...prev, [deal.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 glass rounded-lg border border-white/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {deals.map((deal, idx) => {
        const dealStyle = getDealColor(deal.winProbability);
        const stageColor = getStageBorderColor(deal.dealStage);
        const daysLeft = deal.daysLeft || Math.floor(Math.random() * 14) + 1;
        
        return (
          <div
            key={deal.id}
            className={`glass rounded-lg p-5 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer animate-slide-in`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gradient-primary transition-all">
                  {deal.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{deal.accountName}</p>
              </div>
              <div 
                className={`px-2 py-1 rounded-full text-xs font-bold`}
                style={{ color: dealStyle.dot, backgroundColor: `${dealStyle.dot}15` }}
              >
                {deal.winProbability}%
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-bold text-gradient-primary">${(deal.dealValue / 1000).toFixed(0)}K</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Stage</p>
                <div className="flex">
                  <span style={{
                    backgroundColor: stageColor + '22',
                    color: stageColor,
                    border: `1px solid ${stageColor}`,
                    borderRadius: '4px',
                    padding: '1px 6px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    {deal.dealStage}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Due In</p>
                <p className="text-sm font-bold" style={{ color: daysColor(daysLeft) }}>{daysLeft}d</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <p className="text-sm font-bold text-secondary truncate">{deal.contact || 'Main Contact'}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Probability</span>
                <span style={{ color: dealStyle.dot }}>{deal.winProbability}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ 
                    width: `${deal.winProbability}%`,
                    backgroundColor: dealStyle.dot,
                    boxShadow: `0 0 8px ${dealStyle.glow}`
                  }}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                disabled={isEngaging}
                onClick={() => handleEngage(deal)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/25 text-[#c7cfda] transition-colors disabled:opacity-50"
              >
                <Users className="w-3 h-3" />
                <span>{isEngaging ? '⟳ Generating...' : '👤 Engage'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleAITips(deal)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#b6aeca] transition-colors"
                style={{ color: showTips[deal.id] ? '#a78bfa' : '' }}
              >
                <Zap className="w-3 h-3" />
                <span>{loadingTips[deal.id] ? '⟳ Loading...' : showTips[deal.id] ? '✦ Hide Tips' : '✦ AI Tips'}</span>
              </button>
            </div>

            {/* Inline AI Tips Panel */}
            {showTips[deal.id] && (
              <div className="mt-4 animate-accordion-down overflow-hidden">
                {loadingTips[deal.id] ? (
                  <p className="text-xs text-muted-foreground py-2 italic text-center">⟳ Generating tactical advice for {deal.name}...</p>
                ) : (
                  <div className="border-t border-white/5 pt-4 mt-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-accent mb-2">✦ AI Strategy Guidance — {deal.dealStage} Stage</p>
                    <p className="text-xs text-[#d1d5db] leading-relaxed whitespace-pre-wrap bg-white/5 p-3 rounded-lg border border-white/5">
                      {tips[deal.id]}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button 
                        onClick={() => copy(tips[deal.id])}
                        className="text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
                      >
                        {copied ? '✓ Copied!' : 'Copy Tactical Tips'}
                      </button>
                      <button 
                        onClick={() => setShowTips(prev => ({ ...prev, [deal.id]: false }))}
                        className="text-[10px] font-bold uppercase tracking-tight px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-[#888] hover:text-white transition-all"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <GeneratedContentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        isLoading={isEngaging}
      />
    </div>
  );
}
