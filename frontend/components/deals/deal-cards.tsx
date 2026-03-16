'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Calendar, Zap, Loader2, Copy, X } from 'lucide-react';
import { useAccount } from '@/context/AccountContext';
import { fetchCompleteData, normalizeOpportunities } from '@/lib/api';
import { generateAIContent } from '@/lib/aiGenerator';
import { getDealColor, getStageBorderColor } from '@/lib/deal-colors';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { GeneratedContentModal } from '../email/generated-content-modal';

import { buildEngagementPlanContext, buildAITipsContext } from '@/lib/contextBuilder';
import { parseAnyResponse } from '@/lib/responseParser';
import { usePageData } from '@/hooks/usePageData';

export function DealCards() {
  const { selectedAccountId } = useAccount();
  const { data: dealsData, loading } = usePageData(
    '/completeData',
    (gd: any) => gd.deals
  );
  
  const [deals, setDeals] = useState<any[]>([]);
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
    if (dealsData) {
      if ((dealsData as any).opportunities !== undefined || Array.isArray(dealsData)) {
        setDeals(normalizeOpportunities(dealsData).slice(0, 5));
      } else {
        setDeals((dealsData as any[]).slice(0, 5));
      }
    }
  }, [dealsData]);

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
      const content = await generateAIContent({
        type:        'engage',
        accountId:   deal.accountId || undefined,
        accountName: deal.accountName,
        contactName: deal.contact || 'Customer',
        dealName:    deal.name,
        stage:       deal.dealStage || 'Qualification',
        value:       deal.formattedValue || deal.dealValue || '$0',
        probability: deal.winProbability || 65,
        daysLeft:    deal.daysLeft || 7,
        industry:    deal.industry,
      });

      setModalContent(content);
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
      const content = await generateAIContent({
        type:        'strategy',
        accountId:   deal.accountId || undefined,
        accountName: deal.accountName,
        contactName: deal.contact || 'Customer',
        dealName:    deal.name,
        stage:       deal.dealStage || 'Qualification',
        value:       deal.formattedValue || deal.dealValue || '$0',
        probability: deal.winProbability || 65,
        daysLeft:    deal.daysLeft || 7,
      });

      setTips(prev => ({ ...prev, [deal.id]: content }));
    } catch (err) {
      setTips(prev => ({ ...prev, [deal.id]: 'Failed to load tips.' }));
    } finally {
      setLoadingTips(prev => ({ ...prev, [deal.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 glass rounded-lg border border-white/10 bg-white/5" />
        ))}
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

            {/* Details Grid - Requirement 10: 1/2/4 responsive grid for details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 truncate">Value</p>
                <p className="text-sm font-bold text-gradient-primary truncate">${(deal.dealValue / 1000).toFixed(0)}K</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 truncate">Stage</p>
                <div className="flex truncate">
                  <span className="truncate" style={{
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

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 truncate">Due In</p>
                <p className="text-sm font-bold truncate" style={{ color: daysColor(daysLeft) }}>{daysLeft}d</p>
              </div>

              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 overflow-hidden">
                <p className="text-[10px] text-muted-foreground uppercase mb-1 truncate">Contact</p>
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

            {/* Bottom Actions - Requirement 10: Full-width responsive buttons */}
            <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                disabled={isEngaging}
                onClick={() => handleEngage(deal)}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/25 text-[#c7cfda] transition-all disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                <span>{isEngaging ? '⟳ Generating...' : '👤 Engage'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleAITips(deal)}
                className="w-full sm:flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#b6aeca] transition-all"
                style={{ color: showTips[deal.id] ? '#a78bfa' : '' }}
              >
                <Zap className="w-4 h-4" />
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
