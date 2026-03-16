'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrendingUp, AlertCircle, Target, CheckCircle2, Zap, Mail, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchCompleteData, normalizeOpportunities, buildPipelineData, buildHealthScoreData, buildTopAccounts } from '@/lib/api';
import { useAccount } from '@/context/AccountContext';
import { useDataSource } from '@/context/DataSourceContext';

export function DashboardMetrics() {
  const { selectedAccountId } = useAccount();
  const { isUploadMode, globalData, selectedAccount } = useDataSource();
  const [sfData, setSfData] = useState<any>(null);
  const [loadingSf, setLoadingSf] = useState(false);
  const [errorSf, setErrorSf] = useState<string | null>(null);

  const loadData = useCallback(() => {
    if (isUploadMode || !selectedAccountId) return;
    setLoadingSf(true);
    setErrorSf(null);
    fetchCompleteData(selectedAccountId)
      .then((res) => {
        if (!res) throw new Error('Failed to load dashboard data');
        setSfData(res);
        setErrorSf(null);
      })
      .catch((err) => {
        console.error('Dashboard load error:', err);
        setErrorSf('Unable to load CRM data. Please check your connection.');
      })
      .finally(() => {
        setLoadingSf(false);
      });
  }, [selectedAccountId, isUploadMode]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const data = isUploadMode ? globalData : sfData;
  const loading = isUploadMode ? false : loadingSf;

  const { pipelineData, healthScoreData, topAccounts, activeDealsCount, totalPipelineValue, avgHealthScore } = useMemo(() => {
    if (!data) return {
      pipelineData: [], healthScoreData: [], topAccounts: [],
      activeDealsCount: 0, totalPipelineValue: 0, avgHealthScore: 0
    };

    let opps = normalizeOpportunities(data);

    // Filter by selected account if in upload mode and one is selected
    if (isUploadMode && selectedAccount) {
      opps = opps.filter(o => o.accountId === selectedAccount.id || o.accountName === selectedAccount.name);
    }
    const pData = buildPipelineData(opps);
    const hData = buildHealthScoreData(opps);
    const tAccts = buildTopAccounts(opps);

    const totalVal = pData.reduce((sum, stage) => sum + stage.value, 0);
    const activeDeals = pData.reduce((sum, stage) => sum + stage.count, 0);
    const avgHealth = Math.round(tAccts.reduce((sum, acc) => sum + acc.health, 0) / (tAccts.length || 1));

    return {
      pipelineData: pData,
      healthScoreData: hData,
      topAccounts: tAccts,
      totalPipelineValue: totalVal,
      activeDealsCount: activeDeals,
      avgHealthScore: avgHealth || 85
    };
  }, [data]);

  const buyingSignalsDetected = data?.buyingSignals?.length || 0;
  const dealsNeedingFollowUp = data?.needsFollowUp || 0;
  const highRiskDeals = healthScoreData.slice(0, 2).reduce((sum, item) => sum + item.count, 0);

  const signalsOverTime = data?.signalsOverTime || [
    { date: 'Mon', signals: 3 },
    { date: 'Tue', signals: 5 },
    { date: 'Wed', signals: 2 },
    { date: 'Thu', signals: 8 },
    { date: 'Fri', signals: 6 },
    { date: 'Sat', signals: 1 },
    { date: 'Sun', signals: 2 },
  ];

  const recentSignals = useMemo(() => {
    if (!data?.buyingSignals) return [];
    return data.buyingSignals.map((s: any) => ({
      signal: s.signal || s.detail || s.type || 'Signal',
      account: s.account || 'Active Deal',
      time: s.time || 'Recent',
      confidence: s.confidence || (s.intentLevel === 'HIGH' ? 95 : 70)
    })).slice(0, 6);
  }, [data]);

  const COLORS = ['#ef4444', '#f97316', '#22c55e', '#8fb39a'];

  if (errorSf && !isUploadMode) {
    return (
      <Card className="glass luxury-panel border-red-500/20 p-8 text-center bg-red-500/5">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-white mb-2">Sync Error</h3>
        <p className="text-sm text-[#888] mb-6 max-w-md mx-auto">{errorSf}</p>
        <Button onClick={loadData} className="bg-red-500 hover:bg-red-600 text-white gap-2">
          <TrendingUp className="w-4 h-4 rotate-90" />
          Retry Connection
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          <div className="h-64 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/5" />
          <div className="h-64 glass luxury-panel border-[#2a2a2a] rounded-lg bg-white/0.02 border-dashed" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      {/* KPI Grid - Requirement 10: 1/2/3/6 responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">Pipeline Value</p>
          <div className="text-2xl font-bold text-primary mt-2 truncate">${(totalPipelineValue / 1000).toFixed(1)}K</div>
          <p className="text-[10px] text-success mt-1">↑ 12%</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">Active Deals</p>
          <div className="text-2xl font-bold text-secondary mt-2">{activeDealsCount}</div>
          <p className="text-[10px] text-success mt-1">↑ 3 new</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">Buying Signals</p>
          <div className="text-2xl font-bold text-warning mt-2">{buyingSignalsDetected}</div>
          <p className="text-[10px] text-warning mt-1">🔥 Action</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">Avg Health</p>
          <div className="text-2xl font-bold text-success mt-2">{avgHealthScore}%</div>
          <p className="text-[10px] text-success mt-1">Strong</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">High-Risk</p>
          <div className="text-2xl font-bold text-red-500 mt-2">{highRiskDeals}</div>
          <Badge className="mt-2 bg-red-500/10 text-red-500 border-red-500/30 text-[10px] border truncate max-w-full">
            ⚠️ Monitor
          </Badge>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg overflow-hidden">
          <p className="text-[10px] text-[#888] font-bold uppercase tracking-wider truncate">Queue</p>
          <div className="text-2xl font-bold text-primary mt-2">{dealsNeedingFollowUp}</div>
          <Button size="sm" className="mt-2 h-7 text-[10px] gap-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 w-full truncate">
            <Mail className="w-3 h-3" />
            Generate
          </Button>
        </Card>
      </div>

      {/* Main Dashboard Layout - Requirements 10: 1/2/3 grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 shadow-sm">
        {/* Pipeline Stage Distribution */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 md:p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Stage Distribution</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="stage" stroke="#666" fontSize={10} />
                <YAxis stroke="#666" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8fb39a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Deal Health Score Distribution */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 md:p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Deal Health Distribution</h3>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthScoreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="count"
                  fontSize={10}
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Signals Over Time */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-4 md:p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Buying Signals Trend (7 Days)</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signalsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" fontSize={10} />
              <YAxis stroke="#666" fontSize={10} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="signals" stroke="#f97316" strokeWidth={2} dot={{ fill: '#f97316', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Top Accounts by Value */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Top Accounts by Deal Value</h3>
        <div className="space-y-3">
          {topAccounts.map((account, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{account.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-[#888]">${account.value}M</span>
                  <span className="text-xs text-[#666]">•</span>
                  <span className="text-xs text-[#888]">{account.deals} deal(s)</span>
                </div>
              </div>
              <div className="text-right">
                <Badge className={`text-[10px] ${account.health >= 80 ? 'bg-success/10 text-success border-success/30' : account.health >= 60 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-red-500/10 text-red-500 border-red-500/30'} border`}>
                  {account.health}% Health
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Signals Activity */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-warning" />
          Recent Signals Activity
        </h3>
        <div className="space-y-2">
          {recentSignals.length > 0 ? (
            recentSignals.map((item: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Zap className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.signal}</p>
                    <p className="text-[10px] text-[#666] truncate">{item.account} • {item.time}</p>
                  </div>
                </div>
                <Badge className="text-[10px] bg-warning/10 text-warning border-warning/30 border flex-shrink-0 ml-2">
                  {item.confidence}%
                </Badge>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/10 rounded-lg">
              <Zap className="w-8 h-8 text-white/5 mb-2" />
              <p className="text-xs text-[#555]">No buying signals detected for this account yet.</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
