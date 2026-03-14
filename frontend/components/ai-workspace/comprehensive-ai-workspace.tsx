'use client';

import { useState, useEffect, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Zap, TrendingUp, FileText, Target, Copy, RefreshCw, Check, AlertCircle, Filter, Loader2, Brain } from 'lucide-react';
import { fetchCompleteData, fetchEmail, fetchStrategy, fetchAccountBrief, fetchMeetingPrep, fetchProposal, normalizeOpportunities, normalizeActivities, normalizeTimeline, extractSignalsFromActivities } from '@/lib/api';
import { useAccount } from '@/context/account-context';

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

export function ComprehensiveAIWorkspace() {
  const { selectedAccountId } = useAccount();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState<any>(null);
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Email Generation State
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatingEmail, setGeneratingEmail] = useState(false);

  // Tone & Content Type State
  const [selectedTone, setSelectedTone] = useState('Formal');
  const [selectedContentType, setSelectedContentType] = useState('followup');

  // Strategy State
  const [strategyData, setStrategyData] = useState<any>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);
    Promise.all([
      fetchCompleteData(selectedAccountId),
      fetchAccountBrief(selectedAccountId),
      fetchStrategy({}, selectedAccountId)
    ]).then(([completeRes, briefRes, strategyRes]) => {
      setData(completeRes || {});
      setBrief(briefRes || {});
      setStrategyData(strategyRes || null);
      setLoading(false);
    });
  }, [selectedAccountId]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateEmailContent = async () => {
    setGeneratingEmail(true);
    try {
      let endpoint = fetchEmail;
      if (selectedContentType === 'summary') endpoint = fetchMeetingPrep as any;
      if (selectedContentType === 'proposal_draft') endpoint = fetchProposal;

      const res = await endpoint({ tone: selectedTone }, selectedAccountId);
      if (res?.content) {
        setGeneratedEmail(res.content);
      } else if (res?.summary) {
        setGeneratedEmail(res.summary); // Handle different response keys if necessary
      } else if (res?.notes) {
        setGeneratedEmail(res.notes); // Handle meetingPrep notes
      } else {
        setGeneratedEmail("Error generating content. Please try again.");
      }
    } catch (err) {
      console.error("Content generation failed:", err);
      setGeneratedEmail("Network error. Please try again.");
    }
    setGeneratingEmail(false);
  };

  const loadStrategy = async () => {
    setLoadingStrategy(true);
    try {
      const res = await fetchStrategy({}, selectedAccountId);
      if (res) setStrategyData(res);
    } catch (err) {
      console.error("Strategy fetch failed:", err);
    }
    setLoadingStrategy(false);
  };

  const { buyingSignals, accountTimeline, dealHealthData, scoreFactors, dealScores } = useMemo(() => {
    if (!data) return { buyingSignals: [], accountTimeline: [], dealHealthData: [], scoreFactors: [], dealScores: [] };

    const opps = normalizeOpportunities(data);
    const acts = normalizeActivities(data);

    const bSignals = Array.isArray(data.buyingSignals) && data.buyingSignals.length > 0 
      ? data.buyingSignals.map((s: any, i: number) => ({
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      <Tabs defaultValue="intel" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg mb-8">
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
          <div className="grid grid-cols-2 gap-6">
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
              <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 min-h-[140px]">
                <p className="text-sm text-[#b3b3b3] leading-relaxed italic">
                  {brief?.summary || "Analyzing account history and recent interactions..."}
                </p>
                {brief?.buyingSignal?.keywords && brief.buyingSignal.keywords.length > 0 && (
                   <div className="mt-4 pt-4 border-t border-secondary/10">
                     <p className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">Detected Interests</p>
                     <div className="flex flex-wrap gap-2">
                       {brief.buyingSignal.keywords.map((kw: string, i: number) => (
                         <Badge key={i} variant="outline" className="text-[10px] bg-secondary/10 border-secondary/30">{kw}</Badge>
                       ))}
                     </div>
                   </div>
                )}
              </div>
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
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Opportunities</p>
                <p className="text-2xl font-bold text-primary">{normalizeOpportunities(data).length}</p>
                <p className="text-xs text-primary mt-1">Active Deals</p>
              </div>
              <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                <p className="text-xs text-[#888] mb-2">Buying Intent</p>
                <p className="text-2xl font-bold text-secondary">{brief?.buyingSignal?.level || 'LOW'}</p>
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
          <div className="grid grid-cols-2 gap-6">
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
                  {dealScores.map((deal, idx) => (
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

            <div className="grid grid-cols-2 gap-3 mb-6">
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
                  <>
                    <p className="text-sm text-white font-medium">Generated Content</p>
                    <p className="text-sm text-[#b3b3b3] whitespace-pre-wrap">
                      {generatedEmail || "Click an option above to generate AI content based on your latest discussions and deal CRM stage."}
                    </p>
                  </>
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
