'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Users, Mail, Target, Loader2 } from 'lucide-react';
import { fetchCompleteData, normalizeOpportunities, normalizeActivities, buildPipelineData, buildHealthScoreData, buildTopAccounts } from '@/lib/api';
import { useAccount } from '@/context/AccountContext';
import { useDataSource } from '@/context/DataSourceContext';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

const COLORS = ['#8fb39a', '#7ea38a', '#b39a6b', '#d97706'];

import { usePageData } from '@/hooks/usePageData';

export function AnalyticsPage() {
  const { data, loading } = usePageData(
    '/completeData',
    (ctx) => ctx.globalData
  );

  const { data: uploadData, isUploadMode } = useAnalyticsData();
  const { globalData } = useDataSource();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const {
    pipelineData,
    healthDistribution,
    touchpointData,
    engagementTrend,
    topAccounts,
    conversionMetrics,
    totalPipeline,
    activeDeals,
    winRate,
    avgDealSize
  } = useMemo(() => {
    if (!data) return { pipelineData: [], healthDistribution: [], touchpointData: [], engagementTrend: [], topAccounts: [], conversionMetrics: [], totalPipeline: '$0', activeDeals: 0, winRate: '0%', avgDealSize: '$0' };

    const opps = normalizeOpportunities(data);
    
    // Pipeline basic stats
    const totalPipe = opps.reduce((sum, o) => sum + (o.dealValue || 0), 0);
    const activeD = opps.filter(o => o.dealStage !== 'Closed' && o.dealStage !== 'Closed Won' && o.dealStage !== 'Closed Lost').length;
    const closedWon = opps.filter(o => o.dealStage === 'Closed Won').length;
    const closedOpps = opps.filter(o => o.dealStage?.startsWith('Closed')).length;
    const wRate = closedOpps > 0 ? Math.round((closedWon / closedOpps) * 100) : 42;
    const avgSize = opps.length > 0 ? Math.round(totalPipe / opps.length) : 0;

    const totalPipelineStr = totalPipe >= 1000000 ? `$${(totalPipe / 1000000).toFixed(2)}M` : `$${(totalPipe / 1000).toFixed(0)}K`;
    const avgDealSizeStr = avgSize >= 1000000 ? `$${(avgSize / 1000000).toFixed(2)}M` : `$${(avgSize / 1000).toFixed(0)}K`;

    const pDataRaw = buildPipelineData(opps);
    const pData = pDataRaw.map(p => ({ stage: p.stage, value: p.value, deals: p.count }));

    const hDataRaw = buildHealthScoreData(opps);
    const colors = ['#d97706', '#b39a6b', '#8fb39a', '#7ea38a'];
    const hData = hDataRaw.map((h, i) => ({ name: h.range, value: h.count, color: colors[i] }));

    const tAccs = buildTopAccounts(opps).map(acc => ({
      name: acc.name, 
      value: acc.value * 1000000, 
      growth: Math.floor(Math.random() * 20), 
      health: acc.health 
    }));

    const tData = [
      { week: 'Week 1', emails: 24, calls: 8, meetings: 3, proposals: 1 },
      { week: 'Week 2', emails: 32, calls: 12, meetings: 5, proposals: 2 },
      { week: 'Week 3', emails: 28, calls: 10, meetings: 4, proposals: 3 },
      { week: 'Week 4', emails: 36, calls: 14, meetings: 6, proposals: 4 },
      { week: 'Week 5', emails: 40, calls: 16, meetings: 7, proposals: 2 },
    ];
    const eTrend = [
      { date: 'Jan 1', opens: 45, clicks: 12, responses: 3 },
      { date: 'Jan 8', opens: 58, clicks: 18, responses: 5 },
      { date: 'Jan 15', opens: 52, clicks: 15, responses: 4 },
      { date: 'Jan 22', opens: 68, clicks: 22, responses: 7 },
      { date: 'Jan 29', opens: 72, clicks: 26, responses: 8 },
      { date: 'Feb 5', opens: 85, clicks: 32, responses: 10 },
      { date: 'Feb 12', opens: 92, clicks: 38, responses: 12 },
    ];
    const cMetrics = [
      { stage: 'Prospects', count: opps.length * 3 || 150 },
      { stage: 'Leads', count: opps.length * 2 || 85, rate: '57%' },
      { stage: 'Opportunities', count: opps.length, rate: '40%' },
      { stage: 'Proposals', count: opps.filter(o => o.dealStage === 'Proposal' || o.dealStage === 'Negotiation').length, rate: '35%' },
      { stage: 'Closed Won', count: closedWon, rate: '42%' },
    ];

    return {
      pipelineData: pData.length ? pData : [ { stage: 'None', value: 0, deals: 0 } ],
      healthDistribution: hData,
      touchpointData: tData,
      engagementTrend: eTrend,
      topAccounts: tAccs,
      conversionMetrics: cMetrics,
      totalPipeline: totalPipelineStr,
      activeDeals: activeD,
      winRate: `${wRate}%`,
      avgDealSize: avgDealSizeStr
    };
  }, [data]);

  // ── Adapters for Upload Data ──
  const effectiveTotalPipeline = isUploadMode ? (uploadData?.formattedPipelineValue ?? '$0') : totalPipeline;
  const effectiveActiveDeals = isUploadMode ? (uploadData?.activeDeals ?? 0) : activeDeals;
  const effectiveWinRate = isUploadMode ? `${uploadData?.winRate ?? 0}%` : winRate;
  const effectiveAvgDealSize = isUploadMode ? (uploadData?.formattedAvgDealSize ?? '$0') : avgDealSize;

  const effectivePipelineData = isUploadMode && uploadData
    ? uploadData.pipelineByStage.map(s => ({ stage: s.stage, value: s.value, deals: s.count }))
    : pipelineData;

  const effectiveHealthDistribution = isUploadMode && uploadData
    ? uploadData.dealHealthDist.map(d => ({ name: d.name, value: d.value, color: d.color }))
    : healthDistribution;

  const effectiveConversionMetrics = isUploadMode && uploadData
    ? uploadData.salesFunnel.map(s => ({ stage: s.stage, count: s.count, rate: `${s.percentage}%` }))
    : conversionMetrics;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="h-12 glass border border-[#2a2a2a] rounded-lg w-full bg-white/5" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          <div className="h-80 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Analytics</h1>
          <p className="text-sm text-[#888] mt-1">Comprehensive performance metrics and engagement insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-white/20 text-white">
            <Calendar className="w-4 h-4" />
            Last 30 days
          </Button>
          <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards - Requirement 10: Standardized 1/2/3 grid pattern */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Total Pipeline</p>
          <p className="text-2xl font-bold text-white">{effectiveTotalPipeline}</p>
          <p className="text-xs text-success mt-2">{isUploadMode ? `${effectiveActiveDeals} active deals` : '↑ 12% vs last month'}</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Active Deals</p>
          <p className="text-2xl font-bold text-white">{effectiveActiveDeals}</p>
          <p className="text-xs text-[#888] mt-2">{isUploadMode ? `${uploadData?.salesFunnel?.length ?? 0} stages active` : '8 proposals pending'}</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Win Rate</p>
          <p className="text-2xl font-bold text-primary">{effectiveWinRate}</p>
          <p className="text-xs text-[#888] mt-2">{isUploadMode ? `${uploadData?.accountAnalysis?.length ?? 0} accounts analyzed` : 'Industry avg: 28%'}</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Avg Deal Size</p>
          <p className="text-2xl font-bold text-secondary">{effectiveAvgDealSize}</p>
          <p className="text-xs text-success mt-2">{isUploadMode ? `${uploadData?.engagementMetrics?.totalSignals ?? 0} signals detected` : '↑ 8% increase'}</p>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-2 custom-scrollbar">
          <TabsList className="flex min-w-max bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg mb-6">
          <TabsTrigger value="overview" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            Pipeline Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            Engagement Metrics
          </TabsTrigger>
          <TabsTrigger value="accounts" className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]">
            Account Analysis
          </TabsTrigger>
          </TabsList>
        </div>

        {/* Pipeline Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline by Stage */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Pipeline by Stage</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={effectivePipelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                    <XAxis dataKey="stage" stroke="#666" fontSize={10} interval={0} />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="#8fb39a" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Deal Health Distribution */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Deal Health Distribution</h3>
              <div className="h-80 flex items-center justify-center">
                {healthDistribution.length === 1 && healthDistribution[0].value > 0 ? (
                  <div className="text-center p-6 bg-white/[0.02] border border-white/10 rounded-xl w-full">
                    <p className="text-sm text-[#888] uppercase tracking-wider mb-2">{healthDistribution[0].name}</p>
                    <p className="text-5xl font-bold text-primary mb-2">{healthDistribution[0].value}</p>
                    <p className="text-xs text-[#666]">Deals in this health range</p>
                  </div>
                ) : healthDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={effectiveHealthDistribution}
                        cx="50%"
                        cy="45%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={60}
                        paddingAngle={5}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {effectiveHealthDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => <span className="text-xs text-[#888]">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-[#666] text-sm">No health data available</div>
                )}
              </div>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Sales Funnel</h3>
            <div className="space-y-4">
              {effectiveConversionMetrics.map((metric, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-white">{metric.stage}</p>
                      <p className="text-xs text-[#888]">{metric.count} {metric.count === 1 ? 'lead' : 'leads'}</p>
                    </div>
                    {metric.rate && <Badge className="bg-primary/20 text-primary border-primary/30 border">{metric.rate} conversion</Badge>}
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full"
                      style={{ width: `${(metric.count / (effectiveConversionMetrics[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Engagement Metrics Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {/* Touchpoint Activity */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Touchpoint Activity (Last 5 Weeks)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={touchpointData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="week" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                  <Legend />
                  <Area type="monotone" dataKey="emails" stackId="1" stroke="#8fb39a" fill="#8fb39a" />
                  <Area type="monotone" dataKey="calls" stackId="1" stroke="#7ea38a" fill="#7ea38a" />
                  <Area type="monotone" dataKey="meetings" stackId="1" stroke="#b39a6b" fill="#b39a6b" />
                  <Area type="monotone" dataKey="proposals" stackId="1" stroke="#66a3d9" fill="#66a3d9" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Email Engagement Trend */}
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">Email Engagement Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" />
                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                  <Legend />
                  <Line type="monotone" dataKey="opens" stroke="#8fb39a" strokeWidth={2} dot={{ fill: '#8fb39a', r: 3 }} />
                  <Line type="monotone" dataKey="clicks" stroke="#b39a6b" strokeWidth={2} dot={{ fill: '#b39a6b', r: 3 }} />
                  <Line type="monotone" dataKey="responses" stroke="#66a3d9" strokeWidth={2} dot={{ fill: '#66a3d9', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Engagement Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-2">{isUploadMode ? 'High Engagement Accounts' : 'Avg Opens/Week'}</p>
              <p className="text-2xl font-bold text-primary">
                {isUploadMode ? (uploadData?.engagementMetrics?.highEngagement ?? 0) : '74'}
              </p>
              <p className="text-xs text-success mt-2">{isUploadMode ? 'Accounts with High interest' : '↑ 15% increase'}</p>
            </Card>
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-2">{isUploadMode ? 'Medium Engagement' : 'Click Rate'}</p>
              <p className="text-2xl font-bold text-secondary">
                {isUploadMode ? (uploadData?.engagementMetrics?.mediumEngagement ?? 0) : '32%'}
              </p>
              <p className="text-xs text-[#888] mt-2">{isUploadMode ? 'Nurturing required' : 'vs 22% industry'}</p>
            </Card>
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-2">{isUploadMode ? 'Total Buying Signals' : 'Response Rate'}</p>
              <p className="text-2xl font-bold text-warning">
                {isUploadMode ? (uploadData?.engagementMetrics?.totalSignals ?? 0) : '18%'}
              </p>
              <p className="text-xs text-success mt-2">{isUploadMode ? 'From latest updates' : '↑ 5% vs last month'}</p>
            </Card>
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <p className="text-xs text-[#888] uppercase tracking-wider mb-2">Meetings Scheduled</p>
              <p className="text-2xl font-bold text-success">42</p>
              <p className="text-xs text-[#888] mt-2">From 280 touches</p>
            </Card>
          </div>

          {isUploadMode && uploadData && (
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg mt-6">
              <h3 className="text-sm font-semibold text-white mb-4">Signal Breakdown</h3>
              <div className="space-y-4">
                {uploadData.engagementMetrics.signalsByType.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm text-[#d1d5db]">{s.type}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-48 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${Math.round((s.count / (uploadData.engagementMetrics.totalSignals || 1)) * 100)}%` }} 
                        />
                      </div>
                      <span className="text-sm font-bold text-primary min-w-[30px] text-right">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Account Analysis Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-white mb-4">
              {isUploadMode ? 'Detailed Account Breakdown' : 'Top Accounts by Pipeline Value'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Account</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">{isUploadMode ? 'Industry' : 'Pipeline Value'}</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">{isUploadMode ? 'Deals' : 'Growth'}</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">{isUploadMode ? 'Pipeline' : 'Health'}</th>
                    {isUploadMode && (
                      <>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Avg Win %</th>
                        <th className="text-left py-2 px-3 text-xs font-semibold text-[#a3a3a3] uppercase">Engagement</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isUploadMode && uploadData ? (
                    uploadData.accountAnalysis.map((acc, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-white font-medium">{acc.name}</td>
                        <td className="py-3 px-3 text-[#9ca3af]">{acc.industry}</td>
                        <td className="py-3 px-3 text-[#d1d5db] text-center">{acc.dealCount}</td>
                        <td className="py-3 px-3 text-primary font-bold">{acc.formattedValue}</td>
                        <td className="py-3 px-3">
                          <span className={`font-bold ${acc.avgProbability >= 70 ? 'text-success' : acc.avgProbability >= 50 ? 'text-warning' : 'text-destructive'}`}>
                            {acc.avgProbability}%
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant="outline" className={`text-[10px] ${
                            acc.engagementLevel === 'High' ? 'bg-success/10 text-success border-success/30' :
                            acc.engagementLevel === 'Medium' ? 'bg-warning/10 text-warning border-warning/30' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}>
                            {acc.engagementLevel}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    topAccounts.map((account, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-3 text-white font-medium">{account.name}</td>
                        <td className="py-3 px-3 text-[#b3b3b3]">${(account.value / 1000).toFixed(0)}K</td>
                        <td className="py-3 px-3 text-success">↑ {account.growth}%</td>
                        <td className="py-3 px-3">
                          <Badge
                            className={`text-[10px] border ${
                              account.health >= 80 ? 'bg-success/10 text-success border-success/30' : 'bg-warning/10 text-warning border-warning/30'
                            }`}
                          >
                            {account.health}%
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Account Engagement Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#888] uppercase tracking-wider">Avg Engagement Score</p>
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-white">7.8/10</p>
              <p className="text-xs text-[#888] mt-2">Across all accounts</p>
            </Card>
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#888] uppercase tracking-wider">Total Touchpoints</p>
                <Target className="w-4 h-4 text-secondary" />
              </div>
              <p className="text-2xl font-bold text-white">287</p>
              <p className="text-xs text-success mt-2">↑ 45 this month</p>
            </Card>
            <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-[#888] uppercase tracking-wider">Active Deals</p>
                <Users className="w-4 h-4 text-warning" />
              </div>
              <p className="text-2xl font-bold text-white">34</p>
              <p className="text-xs text-[#888] mt-2">28% churn rate</p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
