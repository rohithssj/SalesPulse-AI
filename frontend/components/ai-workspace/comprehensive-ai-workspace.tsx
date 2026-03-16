'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, FileText, Target, Copy, RefreshCw, Check, AlertCircle, Filter, Loader2, Brain } from 'lucide-react';
import { fetchCompleteData, postEmail, postStrategy, fetchAccountBrief, postMeetingPrep, postProposal, normalizeOpportunities, normalizeActivities, normalizeTimeline, extractSignalsFromActivities, apiGet } from '@/lib/api';
import { useAccount } from '@/context/AccountContext';
import { parseAnyResponse } from '@/lib/responseParser';
import { 
  buildFollowUpContext, 
  buildMeetingSummaryContext, 
  buildEngagementPlanContext,
  buildCallPrepContext
} from '@/lib/contextBuilder';
import { generateAIContent, GenerationType } from '@/lib/aiGenerator';
import { RenderedContent } from '../shared/RenderedContent';
import { usePageData } from '@/hooks/usePageData';
import { useDataSource } from '@/context/DataSourceContext';

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'medium':
      return 'bg-warning/10 text-warning border-warning/30';
    default:
      return 'bg-success/10 text-success border-success/30';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk?.toLowerCase()) {
    case 'very low':
      return 'bg-success/10 text-success border-success/30';
    case 'low':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'medium':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'high':
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    default:
      return 'bg-white/10 text-white border-white/30';
  }
};

// ── Types ──
interface AccountBrief {
  accountName:     string;
  summary:         string;
  engagementLevel: 'High' | 'Medium' | 'Low';
  detectedInterests: string[];
  keyDiscussionPoints: string[];
  lastActivity:    string;
  deals: Array<{
    name:        string;
    stage:       string;
    value:       string;
    probability: number;
  }>;
  contacts: Array<{
    name:  string;
    title: string;
  }>;
  recentActivities: string[];
  buyingSignals:   string[];
}

// ── Build brief from upload data ──
const buildBriefFromUploadData = (
  ctx: any
): AccountBrief => {
  const account = ctx.selectedAccount;
  const deals   = ctx.getSelectedAccountDeals();
  const signals = ctx.getSelectedAccountSignals();

  if (!account) {
    return {
      accountName:       'No account selected',
      summary:           'Please select an account from the dropdown to view intelligence.',
      engagementLevel:   'Low',
      detectedInterests: [],
      keyDiscussionPoints: [],
      lastActivity:      '',
      deals:             [],
      contacts:          [],
      recentActivities:  [],
      buyingSignals:     [],
    };
  }

  const totalValue = deals.reduce((s: number, d: any) => s + (d.value || 0), 0);
  const fmt = (v: number) =>
    v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000   ? `$${(v / 1_000).toFixed(0)}K`
    : `$${v}`;

  const avgProb = deals.length > 0
    ? Math.round(deals.reduce((s: number, d: any) => s + (d.probability || 0), 0) / deals.length)
    : 0;

  const stageGroups = deals.reduce((acc: Record<string, number>, d: any) => {
    acc[d.stage] = (acc[d.stage] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topStage = Object.entries(stageGroups)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0] || 'Qualification';

  const discussionPoints: string[] = [];
  if (deals.length > 0) {
    discussionPoints.push(`Primary decision maker: ${account.primaryContact || 'Stakeholder'}`);
    if (deals[0].daysLeft <= 30) {
      discussionPoints.push(`Timeline: Target close in ${deals[0].daysLeft} days`);
    }
    if (deals[0].stage) {
      discussionPoints.push(`Current stage: ${deals[0].stage} — ${avgProb}% avg probability`);
    }
    if (totalValue > 0) {
      discussionPoints.push(`Total pipeline value: ${fmt(totalValue)} across ${deals.length} deals`);
    }
  }

  const cleanSignals = signals
    .map((s: string) => s.replace(/\s*\(\d+%\)\s*$/, '').trim())
    .filter((s: string, i: number, arr: string[]) => arr.indexOf(s) === i)
    .slice(0, 5);

  const recentActivities = deals
    .slice(0, 4)
    .map((d: any) => `${d.stage} stage — ${d.name} (${d.formattedValue || fmt(d.value)})`);

  return {
    accountName:     account.name,
    summary:         `${account.name} is an active ${account.industry || 'targeted'} account with ${deals.length} deal${deals.length !== 1 ? 's' : ''} in pipeline totaling ${fmt(totalValue)}. Overall engagement level is ${account.engagementLevel?.toLowerCase() || 'medium'} with an average win probability of ${avgProb}%. Primary contact is ${account.primaryContact}${account.city ? ` based in ${account.city}` : ''}.`,
    engagementLevel: (account.engagementLevel as any) || 'Medium',
    detectedInterests: cleanSignals.length > 0 ? cleanSignals : ['Platform integration', 'Enterprise deployment', 'ROI optimization'],
    keyDiscussionPoints: discussionPoints,
    lastActivity:    account.lastActivity || deals[0]?.lastActivity || '',
    deals:           deals.map((d: any) => ({
      name:        d.name,
      stage:       d.stage,
      value:       d.formattedValue || fmt(d.value),
      probability: d.probability,
    })),
    contacts: (account.contacts || []).slice(0, 3).map((c: any) => ({
      name:  c.name,
      title: c.title,
    })),
    recentActivities,
    buyingSignals: cleanSignals,
  };
};

const parseSFBrief = (data: unknown): AccountBrief => {
  const raw = parseAnyResponse(data);
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    return {
      accountName:       String(obj.accountName || ''),
      summary:           String(obj.summary || obj.brief || obj.description || raw),
      engagementLevel:   (obj.engagementLevel as 'High' | 'Medium' | 'Low') || 'Medium',
      detectedInterests: Array.isArray(obj.detectedInterests) ? obj.detectedInterests as string[] : Array.isArray(obj.interests) ? obj.interests as string[] : [],
      keyDiscussionPoints: Array.isArray(obj.keyDiscussionPoints) ? obj.keyDiscussionPoints as string[] : Array.isArray(obj.discussionPoints) ? obj.discussionPoints as string[] : [],
      lastActivity:      String(obj.lastActivity || ''),
      deals:             Array.isArray(obj.deals) ? obj.deals as AccountBrief['deals'] : [],
      contacts:          Array.isArray(obj.contacts) ? obj.contacts as AccountBrief['contacts'] : [],
      recentActivities:  Array.isArray(obj.recentActivities) ? obj.recentActivities as string[] : [],
      buyingSignals:     Array.isArray(obj.buyingSignals) ? obj.buyingSignals as string[] : [],
    };
  }
  return {
    accountName:       '',
    summary:           raw,
    engagementLevel:   'Medium',
    detectedInterests: [],
    keyDiscussionPoints: [],
    lastActivity:      '',
    deals:             [],
    contacts:          [],
    recentActivities:  [],
    buyingSignals:     [],
  };
};

const useIntelAgent = () => {
  const dataSource = useDataSource();
  const { selectedAccountId } = useAccount();
  const { isUploadMode, selectedAccount: dsAccount, getSelectedAccountDeals, getSelectedAccountSignals } = dataSource;
  const [brief, setBrief]     = useState<AccountBrief | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const effectiveId = isUploadMode ? dsAccount?.id : selectedAccountId;
  
  // Find the selected account object to get the name
  const effectiveAccount = useMemo(() => {
    if (isUploadMode) return dsAccount;
    // For Salesforce mode, we might need to find it in the global data or context
    return dsAccount || { id: selectedAccountId, name: 'Selected Account' };
  }, [isUploadMode, dsAccount, selectedAccountId]);

  const loadBrief = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isUploadMode) {
        setBrief(buildBriefFromUploadData(dataSource));
        setLoading(false);
        return;
      }
      if (!effectiveId) {
        setBrief(null);
        setLoading(false);
        return;
      }
      const data = await apiGet(`/accountBrief?accountId=${effectiveId}`);
      if (data) {
        setBrief(parseSFBrief(data));
      } else {
        const deals = getSelectedAccountDeals();
        const signals = getSelectedAccountSignals();
        const topDeal = deals[0];
        const generated = await generateAIContent({
          type: 'strategy',
          accountId: effectiveId,
          accountName: effectiveAccount?.name || 'Account',
          stage: topDeal?.stage,
          value: topDeal?.formattedValue,
          probability: topDeal?.probability,
          daysLeft: topDeal?.daysLeft,
          signals,
          context: `Generate an account intelligence brief for ${effectiveAccount?.name || 'Account'}. Include: 1) A 2-sentence account summary, 2) Key discussion points (3 bullets), 3) Detected interests based on recent activity, 4) Recommended next action. Plain text with clear labels. No JSON.`,
        });
        setBrief({
          accountName: effectiveAccount?.name || 'Account',
          summary: generated,
          engagementLevel: 'Medium',
          detectedInterests: signals.slice(0, 4),
          keyDiscussionPoints: [],
          lastActivity: topDeal?.lastActivity || '',
          deals: deals.slice(0, 3).map((d: any) => ({ name: d.name, stage: d.stage, value: d.formattedValue, probability: d.probability })),
          contacts: [],
          recentActivities: [],
          buyingSignals: signals,
        });
      }
    } catch (err) {
      console.error('Intel Agent error:', err);
      setError('Failed to load account intelligence.');
    } finally {
      setLoading(false);
    }
  }, [isUploadMode, effectiveId, effectiveAccount?.name, dataSource, getSelectedAccountDeals, getSelectedAccountSignals]);

  useEffect(() => { loadBrief(); }, [loadBrief]);
  return { brief, loading, error, reload: loadBrief };
};

export function ComprehensiveAIWorkspace() {
  const { 
    isUploadMode, globalData, selectedAccount, 
    source, getSelectedAccountSignals
  } = useDataSource();
  
  const { data, loading } = usePageData(
    '/completeData',
    (ctx) => ctx.globalData
  );
  
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const { brief, loading: loadingBrief, error: briefError, reload: reloadBrief } = useIntelAgent();
  const [strategyData, setStrategyData] = useState<any>(null);

  // Email Generation State
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatingEmail, setGeneratingEmail] = useState(false);

  // Tone & Content Type State
  const [selectedTone, setSelectedTone] = useState('Formal');
  const [selectedContentType, setSelectedContentType] = useState('followup');

  // Strategy State
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  useEffect(() => {
    if (!data) return;
    
    // Attempt to extract strategy if present in the data blob
    if ((data as any).strategy) setStrategyData((data as any).strategy);
  }, [data]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEmailContent = async () => {
    setGeneratingEmail(true);
    try {
      let context = '';
      const commonParams = {
        accountName: selectedAccount?.name || (selectedAccount as any)?.Name || 'Active Account',
        contactName: selectedAccount?.primaryContact || (selectedAccount as any)?.Primary_Contact__r?.Name || 'Prospect',
        stage: selectedAccount?.deals?.[0]?.stage || 'Evaluation',
        value: selectedAccount?.revenue || 0,
        probability: selectedAccount?.deals?.[0]?.probability || 75,
        daysLeft: selectedAccount?.deals?.[0]?.daysLeft || 14,
      };

      if (selectedContentType === 'followup') {
        context = buildFollowUpContext(commonParams);
      } else if (selectedContentType === 'summary') {
        context = buildMeetingSummaryContext({
          ...commonParams,
          attendees: ['Key Stakeholder'],
          keyPoints: ['Interest in Enterprise plan', 'Timeline clarified'],
          followUpActions: ['Send tech specs'],
        });
      } else if (selectedContentType === 'proposal_draft') {
        context = buildEngagementPlanContext({
          ...commonParams,
          dealName: 'Active Deal',
          signals: ['Positive feedback', 'Budget allocated'],
        });
      }

      let aiType: GenerationType = 'email';
      if (selectedContentType === 'summary') aiType = 'meetingPrep';
      if (selectedContentType === 'proposal_draft') aiType = 'proposal';
      if (selectedContentType === 'followup') aiType = 'followup';

      const content = await generateAIContent({
        type: aiType,
        accountId: selectedAccount?.id,
        accountName: commonParams.accountName,
        contactName: commonParams.contactName,
        stage: commonParams.stage,
        value: commonParams.value,
        probability: commonParams.probability,
        daysLeft: commonParams.daysLeft,
        tone: selectedTone,
        context: context
      });
      
      setGeneratedEmail(content);
    } catch (err) {
      console.error("Content generation failed:", err);
      setGeneratedEmail("Network error. Please try again.");
    }
    setGeneratingEmail(false);
  };

  const loadStrategy = async () => {
    if (isUploadMode) {
      // Mock strategy for upload mode
      setStrategyData({
        recommendation: "Focus on closing the technical gap by providing detailed case studies.",
        winProbability: selectedAccount?.deals?.[0]?.probability || 65,
        healthGrade: 'A-',
        priorities: [
          { title: "Schedule Demo", desc: "Showcase enterprise features", badge: "🔴 Critical", color: "red-500" },
          { title: "Review Pricing", desc: "Align with budget expectations", badge: "🟡 High", color: "warning" }
        ],
        checklist: ['Verify stakeholder list', 'Send proposal draft']
      });
      return;
    }
    setLoadingStrategy(true);
    try {
      // For Salesforce mode only, generate a strategy plan based on context
      const content = await generateAIContent({
        type: 'strategy',
        accountId: selectedAccount?.id,
        accountName: selectedAccount?.name || 'Account',
        stage: selectedAccount?.deals?.[0]?.stage || 'Qualification',
      });
      
      // We'll mock the structured object from the generic text for now 
      // since the legacy backend returned a structured JSON object
      setStrategyData({
        recommendation: content.substring(0, 150) + '...',
        winProbability: selectedAccount?.deals?.[0]?.probability || 65,
        healthGrade: 'A',
        priorities: [
          { title: "Review AI Plan", desc: "Follow AI strategy guidance", badge: "🟡 High", color: "warning" }
        ],
        checklist: ['Execute strategy']
      });
    } catch (err) {
      console.error("Strategy fetch failed:", err);
    }
    setLoadingStrategy(false);
  };

  const { buyingSignals, accountTimeline, dealHealthData, scoreFactors, dealScores } = useMemo(() => {
    if (isUploadMode && globalData) {
      const activeDeals = selectedAccount ? selectedAccount.deals : globalData.deals;
      const bSignals = (selectedAccount?.buyingSignals || globalData.deals.flatMap(d => d.signals)).map((s: string, i: number) => ({
        id: i,
        signal: s,
        severity: s.includes('Technical') ? 'High' : 'Medium',
        confidence: 85,
        time: 'Recent'
      }));

      return {
        buyingSignals: bSignals,
        accountTimeline: globalData.activities.filter(a => !selectedAccount || a.accountName === selectedAccount.name),
        dealHealthData: activeDeals.slice(0, 5).map(d => ({ name: d.name, score: d.probability })),
        scoreFactors: [
          { factor: 'Pipeline Health', weight: 40, value: 85 },
          { factor: 'Activity', weight: 30, value: 70 },
          { factor: 'Signals', weight: 30, value: 90 }
        ],
        dealScores: activeDeals.slice(0, 5).map((d: any) => ({
          deal: d.name,
          health: d.probability,
          winProb: d.probability,
          risk: d.probability >= 70 ? 'Low' : 'Medium',
          stage: d.stage
        }))
      };
    }

    if (!data) return { buyingSignals: [], accountTimeline: [], dealHealthData: [], scoreFactors: [], dealScores: [] };

    const opps = normalizeOpportunities(data);
    const acts = normalizeActivities(data);

    const bSignals = Array.isArray((data as any).buyingSignals) && (data as any).buyingSignals.length > 0 
      ? (data as any).buyingSignals.map((s: any, i: number) => ({
          id: i,
          signal: s.keyword || s.signalType,
          detail: s.quoteContext || s.detail,
          severity: s.intentLevel || 'Medium',
          confidence: s.confidence || (s.intentLevel === 'HIGH' ? 95 : 70),
          time: s.time || 'Recent'
        }))
      : extractSignalsFromActivities(acts).slice(0, 5);

    const aTimeline = normalizeTimeline(data).length > 0 ? normalizeTimeline(data) : [
      { date: 'Recent', event: 'No recent activities found in CRM.', type: 'info' }
    ];

    const dHealthData = opps.slice(0, 5).map((opp: any) => ({ name: (opp.name.substring(0, 15) || 'Unknown'), score: (opp.healthScore || opp.winProbability) }));
    
    const sFactors = [
      { factor: 'Opportunity Health', weight: 40, value: dHealthData.length > 0 ? Math.round(dHealthData.reduce((a, b) => a + b.score, 0) / dHealthData.length) : 50 },
      { factor: 'Activity Volume', weight: 30, value: Math.min(100, acts.length * 10) },
      { factor: 'Signal Intensity', weight: 30, value: bSignals.length * 20 }
    ];

    const dScores = opps.slice(0, 5).map((opp: any) => ({
      deal: opp.name,
      health: opp.healthScore || opp.winProbability,
      winProb: opp.winProbability,
      risk: (opp.healthScore || opp.winProbability) >= 75 ? 'Low' : (opp.healthScore || opp.winProbability) >= 40 ? 'Medium' : 'High',
      stage: opp.dealStage
    }));

    return {
      buyingSignals: bSignals,
      accountTimeline: aTimeline,
      dealHealthData: dHealthData,
      scoreFactors: sFactors,
      dealScores: dScores
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 glass border border-[#2a2a2a] rounded-lg w-full bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          <div className="h-96 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      <Tabs defaultValue="intel" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg mb-8">
          <TabsTrigger
            value="intel"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            🧠 Intel Agent
          </TabsTrigger>
          <TabsTrigger
            value="score"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            📊 Score Agent
          </TabsTrigger>
          <TabsTrigger
            value="generate"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            ✨ Generate Agent
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            🎯 Strategy Agent
          </TabsTrigger>
        </TabsList>

        {/* Intel Tab */}
        <TabsContent value="intel" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Buying Signals List */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-warning" />
                  Detected Buying Signals
                </h3>
                <Button size="sm" variant="outline" className="text-[10px] gap-1 border-white/20">
                  <Filter className="w-3 h-3" />
                  Filter
                </Button>
              </div>
              <div className="space-y-2">
                {buyingSignals.length > 0 ? (
                  buyingSignals.map((signal: any) => (
                    <div key={signal.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-white">
                          {signal.signal || signal.detail || signal.type || 'Engagement Signal'}
                        </p>
                        <Badge className={`text-[10px] ${getSeverityColor(signal.severity || signal.intentLevel)} border`}>
                          { (signal.severity || signal.intentLevel)?.toLowerCase() === 'high' || (signal.severity || signal.intentLevel)?.toLowerCase() === 'critical' ? '🔴' : '🟡'} {signal.severity || signal.intentLevel || 'Medium'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#888]">{signal.account || brief?.accountName || 'Active Account'}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-[#666]">{signal.time || signal.messageDate || 'Recent'}</span>
                        <span className="text-[10px] font-bold text-primary">{signal.confidence || (signal.intentLevel === 'HIGH' ? 95 : 70)}% confidence</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-lg">
                    <Zap className="w-8 h-8 text-white/10 mb-2" />
                    <p className="text-xs text-[#666]">No significant buying signals detected for this account yet.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Account Intelligence Brief */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-5 h-5 text-secondary" />
                <h3 className="text-sm font-semibold text-white">Account Intelligence Brief</h3>
              </div>
              
              {loadingBrief ? (
                <div style={{ padding: '20px 0' }}>
                  <p style={{ color: '#9ca3af', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                    ⟳ Analyzing account history and recent interactions...
                  </p>
                </div>
              ) : briefError ? (
                <div style={{ padding: '12px', background: '#7f1d1d', borderRadius: '8px' }}>
                  <p style={{ color: '#fca5a5', fontSize: '13px', margin: '0 0 8px' }}>
                    {briefError}
                  </p>
                  <button onClick={reloadBrief} style={{
                    background: 'transparent', color: '#f87171',
                    border: '1px solid #ef4444', borderRadius: '6px',
                    padding: '4px 12px', fontSize: '12px', cursor: 'pointer'
                  }}>
                    Retry
                  </button>
                </div>
              ) : !brief ? (
                <p style={{ color: '#6b7280', fontSize: '13px', fontStyle: 'italic', margin: 0 }}>
                  Select an account to view intelligence.
                </p>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div>
                      {brief.accountName && (
                        <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>
                          {brief.accountName}
                        </p>
                      )}
                      {brief.lastActivity && (
                        <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>
                          Last interaction: {brief.lastActivity}
                        </p>
                      )}
                    </div>
                    {brief.engagementLevel && (
                      <span style={{
                        fontSize: '11px', fontWeight: 700,
                        padding: '3px 10px', borderRadius: '20px', flexShrink: 0,
                        background: brief.engagementLevel === 'High' ? '#14532d' : brief.engagementLevel === 'Medium' ? '#92400e' : '#1e3a5f',
                        color: brief.engagementLevel === 'High' ? '#86efac' : brief.engagementLevel === 'Medium' ? '#fde68a' : '#93c5fd',
                        border: `1px solid ${brief.engagementLevel === 'High' ? '#22c55e' : brief.engagementLevel === 'Medium' ? '#f59e0b' : '#3b82f6'}`,
                      }}>
                        {brief.engagementLevel} Engagement
                      </span>
                    )}
                  </div>

                  {brief.summary && (
                    <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.7', margin: '0 0 16px', whiteSpace: 'pre-wrap' }}>
                      {brief.summary}
                    </p>
                  )}

                  {brief.detectedInterests.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 600 }}>
                        DETECTED INTERESTS
                      </p>
                      {brief.detectedInterests.map((interest, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ color: '#22c55e', fontSize: '12px', flexShrink: 0 }}>✓</span>
                          <span style={{ color: '#d1d5db', fontSize: '13px' }}>{interest}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {brief.keyDiscussionPoints.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 600 }}>
                        KEY DISCUSSION POINTS
                      </p>
                      {brief.keyDiscussionPoints.map((point, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '5px' }}>
                          <span style={{ color: '#6366f1', fontSize: '12px', flexShrink: 0, marginTop: '1px' }}>•</span>
                          <span style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.5' }}>{point}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {brief.deals.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 600 }}>
                        ACTIVE DEALS ({brief.deals.length})
                      </p>
                      {brief.deals.map((deal, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#0f172a', borderRadius: '6px', marginBottom: '6px', border: '1px solid #1e3a5f' }}>
                          <div>
                            <p style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 500, margin: '0 0 2px' }}>{deal.name}</p>
                            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{deal.stage}</p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ color: '#6366f1', fontSize: '12px', fontWeight: 700, margin: '0 0 2px' }}>{deal.value}</p>
                            <p style={{ fontSize: '11px', margin: 0, color: deal.probability >= 70 ? '#22c55e' : deal.probability >= 50 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                              {deal.probability}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {brief.contacts.length > 0 && (
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontWeight: 600 }}>
                        KEY CONTACTS
                      </p>
                      {brief.contacts.map((c, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4338ca', display: 'flex', alignItems: 'center', justifySelf: 'center', color: '#fff', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                            {c.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p style={{ color: '#f9fafb', fontSize: '12px', fontWeight: 500, margin: 0 }}>{c.name}</p>
                            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{c.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <button onClick={reloadBrief} style={{ width: '100%', marginTop: '8px', background: 'transparent', color: '#6b7280', border: '1px solid #374151', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer' }}>
                    ↻ Refresh Intelligence
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Account Activity Timeline */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Account Activity Timeline</h3>
            <div className="space-y-3">
              {accountTimeline.map((item: any, idx: number) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    {idx !== accountTimeline.length - 1 && <div className="w-px h-8 bg-white/10 my-1" />}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-medium text-white">{item.event}</p>
                    <p className="text-xs text-[#888]">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Engagement Insights */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Engagement Insights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Opportunities</p>
                <p className="text-2xl font-bold text-primary">{normalizeOpportunities(data).length}</p>
                <p className="text-xs text-primary mt-1">Active Deals</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Buying Intent</p>
                <p className="text-2xl font-bold text-secondary">{brief?.engagementLevel?.toUpperCase() || 'MEDIUM'}</p>
                <p className="text-xs text-secondary mt-1">Signal Strength</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Activities</p>
                <p className="text-2xl font-bold text-warning">{normalizeActivities(data).length}</p>
                <p className="text-xs text-[#888] mt-1">Recent touches</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Deal Pipeline</p>
                <p className="text-2xl font-bold text-success">
                  ${(normalizeOpportunities(data).reduce((sum, o) => sum + o.dealValue, 0) / 1000).toFixed(0)}K
                </p>
                <p className="text-xs text-success mt-1">Total Value</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Score Tab */}
        <TabsContent value="score" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Deal Health Scores */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Deal Health Scores</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dealHealthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="name" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                    <Bar dataKey="score" fill="#8fb39a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Score Factor Breakdown */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Score Factor Breakdown</h3>
              <div className="space-y-3">
                {scoreFactors.map((factor: any, idx: number) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-[#a3a3a3]">{factor.factor}</span>
                      <span className="text-sm font-bold text-primary">{factor.value}%</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                        style={{ width: `${factor.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Deal Score Table */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">All Deal Scores</h3>
              <div className="space-x-2">
                <Button size="sm" variant="outline" className="text-[10px] border-white/20">
                  High-Risk Filter
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Deal</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Health</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Win Prob</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Risk</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Stage</th>
                  </tr>
                </thead>
                <tbody>
                  {dealScores.map((deal: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-2 px-3 text-[#b3b3b3] font-medium">{deal.deal}</td>
                      <td className="py-2 px-3">
                        <Badge className={`text-[10px] ${deal.health >= 80 ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'} border`}>
                          {deal.health}%
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-[#b3b3b3]">{deal.winProb}%</td>
                      <td className="py-2 px-3">
                        <Badge className={`text-[10px] ${getRiskColor(deal.risk)} border`}>{deal.risk}</Badge>
                      </td>
                      <td className="py-2 px-3 text-[#888]">{deal.stage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Generate Content
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <Button 
                onClick={() => setSelectedContentType('followup')} 
                className={`gap-2 ${selectedContentType === 'followup' ? 'bg-primary/20 border-primary/50' : 'bg-white/10 border-white/20'} hover:bg-white/20 text-white border h-12 justify-start`}
              >
                <FileText className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs font-semibold">Follow-up Email</div>
                  <div className="text-[10px] text-[#888]">Gentle check-in</div>
                </div>
              </Button>
              <Button 
                onClick={() => setSelectedContentType('summary')} 
                className={`gap-2 ${selectedContentType === 'summary' ? 'bg-primary/20 border-primary/50' : 'bg-white/10 border-white/20'} hover:bg-white/20 text-white border h-12 justify-start`}
              >
                <FileText className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs font-semibold">Meeting Summary</div>
                  <div className="text-[10px] text-[#888]">Quick recap</div>
                </div>
              </Button>
              <Button 
                onClick={() => setSelectedContentType('proposal_draft')} 
                className={`gap-2 ${selectedContentType === 'proposal_draft' ? 'bg-primary/20 border-primary/50' : 'bg-white/10 border-white/20'} hover:bg-white/20 text-white border h-14 justify-start`}
              >
                <FileText className="w-4 h-4" />
                <div className="text-left">
                  <div className="text-xs font-semibold">Sales Proposal</div>
                  <div className="text-[10px] text-[#888]">Full doc generation</div>
                </div>
              </Button>
              <Button 
                onClick={generateEmailContent} 
                className="bg-primary hover:bg-primary/90 text-white font-bold h-14"
              >
                Generate Agent Content
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">
                  Tone
                </label>
                <div className="flex gap-2">
                  {['Formal', 'Friendly', 'Persuasive'].map((tone) => (
                    <Button 
                      key={tone} 
                      size="sm" 
                      onClick={() => setSelectedTone(tone)}
                      variant={selectedTone === tone ? 'default' : 'outline'} 
                      className={`text-xs ${selectedTone === tone ? 'bg-primary text-white' : 'border-white/20'}`}
                    >
                      {tone}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 space-y-2 relative min-h-[120px]">
                {generatingEmail ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <RenderedContent data={generatedEmail} fallback="Click an option above to generate AI content based on your latest discussions and deal CRM stage." />
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCopy} disabled={!generatedEmail} className={`flex-1 gap-2 ${copied ? 'bg-success/20 text-success' : 'bg-white/10 text-white hover:bg-white/20'} border border-white/20`}>
                  <Copy className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy Email'}
                </Button>
                <Button onClick={() => generateEmailContent()} className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              AI Recommended Strategy
            </h3>

            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/30 relative min-h-[100px]">
                {loadingStrategy ? (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <Loader2 className="w-5 h-5 animate-spin text-success" />
                   </div>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-success mb-2">✓ Recommended Action</p>
                    <p className="text-sm text-[#b3b3b3]">
                      {strategyData?.recommendedNextAction || strategyData?.recommendation || "Analyzing latest deal signals to determine optimal next step..."}
                    </p>
                    <div className="mt-4 flex gap-4">
                       <div className="flex-1 p-3 rounded bg-black/20 border border-success/20">
                         <p className="text-[10px] text-success/70 uppercase">Win Probability</p>
                         <p className="text-xl font-bold text-success">{strategyData?.winProbability || strategyData?.healthScore || 0}%</p>
                       </div>
                       <div className="flex-1 p-3 rounded bg-black/20 border border-success/20">
                         <p className="text-[10px] text-success/70 uppercase">Health Grade</p>
                         <p className="text-xl font-bold text-success">{strategyData?.healthGrade || 'B'}</p>
                       </div>
                    </div>
                    {!strategyData && !loadingStrategy && (
                      <Button onClick={loadStrategy} size="sm" className="mt-4 bg-success/20 hover:bg-success/30 text-success border-success/30 text-xs gap-1 h-7">
                        <RefreshCw className="w-3 h-3" /> Fetch Predicted Strategy
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Long-term Strategy</h4>
                <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20 text-sm text-[#b3b3b3]">
                  {strategyData?.strategyRecommendation || "Fetch strategy to see AI-generated long-term plan."}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Action Priority Ranking</h4>
                <div className="space-y-2">
                  {(strategyData?.priorities || [
                    { title: "Schedule Executive Closing Call", desc: "Critical for close probability", badge: "🔴 Critical", color: "red-500" },
                    { title: "Send Tailored Proposal", desc: "Customize for their specific technical needs", badge: "🟡 High", color: "warning" },
                    { title: "Prepare Implementation Timeline", desc: "Show phased approach for faster ROI", badge: "🔵 Medium", color: "blue-500" }
                  ]).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10">
                      <div>
                        <p className="text-sm font-medium text-white">{idx + 1}. {item.title}</p>
                        <p className="text-xs text-[#888]">{item.desc}</p>
                      </div>
                      <Badge className={`bg-${item.color}/10 text-${item.color} border-${item.color}/30 border`}>{item.badge}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Deal Closing Checklist</h4>
                <div className="space-y-2">
                  {(strategyData?.checklist || [
                    'Get CFO sign-off on budget',
                    'Schedule onboarding meeting',
                    'Prepare contract review document',
                    'Confirm implementation start date',
                    'Set up customer success kickoff',
                  ]).map((item: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-2">
                      <Check className="w-4 h-4 text-success" />
                      <span className="text-sm text-[#a3a3a3]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
