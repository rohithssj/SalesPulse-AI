'use client';

import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, AlertCircle, Target, CheckCircle2, Zap, Mail, Loader2 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchCompleteData, normalizeOpportunities, buildPipelineData, buildHealthScoreData, buildTopAccounts } from '@/lib/api';
import { useAccount } from '@/context/account-context';

export function DashboardMetrics() {
  const { selectedAccountId } = useAccount();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);
    fetchCompleteData(selectedAccountId).then((res) => {
      setData(res || {});
      setLoading(false);
    });
  }, [selectedAccountId]);

  const { pipelineData, healthScoreData, topAccounts, activeDealsCount, totalPipelineValue, avgHealthScore } = useMemo(() => {
    if (!data) return {
      pipelineData: [], healthScoreData: [], topAccounts: [],
      activeDealsCount: 0, totalPipelineValue: 0, avgHealthScore: 0
    };

    const opps = normalizeOpportunities(data);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      {/* KPI Grid */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Pipeline Value</p>
          <div className="text-2xl font-bold text-primary mt-2">${(totalPipelineValue / 1000).toFixed(1)}K</div>
          <p className="text-xs text-success mt-1">↑ 12% from last week</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Active Deals</p>
          <div className="text-2xl font-bold text-secondary mt-2">{activeDealsCount}</div>
          <p className="text-xs text-success mt-1">↑ 3 new this week</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Buying Signals</p>
          <div className="text-2xl font-bold text-warning mt-2">{buyingSignalsDetected}</div>
          <p className="text-xs text-warning mt-1">🔥 Requires action</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Avg Deal Health</p>
          <div className="text-2xl font-bold text-success mt-2">{avgHealthScore}%</div>
          <p className="text-xs text-success mt-1">Portfolio strong</p>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">High-Risk Deals</p>
          <div className="text-2xl font-bold text-red-500 mt-2">{highRiskDeals}</div>
          <Badge className="mt-2 bg-red-500/10 text-red-500 border-red-500/30 text-[10px] border">
            ⚠️ Monitor Closely
          </Badge>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Follow-up Queue</p>
          <div className="text-2xl font-bold text-primary mt-2">{dealsNeedingFollowUp}</div>
          <Button size="sm" className="mt-2 h-6 text-[10px] gap-1 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
            <Mail className="w-3 h-3" />
            Generate
          </Button>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pipeline Stage Distribution */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Pipeline Stage Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="stage" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="#8fb39a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Deal Health Score Distribution */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-4">Deal Health Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthScoreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ range, count }) => `${range}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
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
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Buying Signals Trend (7 Days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={signalsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
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
          {recentSignals.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start justify-between p-3 rounded-lg hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-3 flex-1">
                <Zap className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{item.signal}</p>
                  <p className="text-xs text-[#888]">{item.account} • {item.time}</p>
                </div>
              </div>
              <Badge className="text-[10px] bg-warning/10 text-warning border-warning/30 border flex-shrink-0">
                {item.confidence}%
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
