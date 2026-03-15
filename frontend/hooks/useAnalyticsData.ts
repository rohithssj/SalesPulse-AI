'use client';

import { useMemo } from 'react';
import { useDataSource } from '@/context/DataSourceContext';
import type { NormalizedDeal } from '@/context/DataSourceContext';

export interface AnalyticsData {
  // Top stat cards
  totalPipelineValue: number;
  formattedPipelineValue: string;
  activeDeals: number;
  winRate: number;
  avgDealSize: number;
  formattedAvgDealSize: string;

  // Pipeline by Stage (bar chart)
  pipelineByStage: Array<{ stage: string; value: number; count: number; label: string }>;

  // Deal Health Distribution (pie chart)
  dealHealthDist: Array<{ name: string; value: number; color: string }>;

  // Sales Funnel
  salesFunnel: Array<{ stage: string; count: number; value: number; percentage: number }>;

  // Engagement Metrics
  engagementMetrics: {
    highEngagement: number;
    mediumEngagement: number;
    lowEngagement: number;
    totalSignals: number;
    signalsByType: Array<{ type: string; count: number }>;
  };

  // Account Analysis
  accountAnalysis: Array<{
    name: string;
    dealCount: number;
    totalValue: number;
    formattedValue: string;
    avgProbability: number;
    industry: string;
    engagementLevel: string;
    topStage: string;
  }>;

  // Monthly trend (simulated from close dates)
  monthlyTrend: Array<{ month: string; value: number; deals: number }>;

  // Win/Loss breakdown
  winLossData: Array<{ name: string; value: number; color: string }>;

  // Stage velocity (avg days per stage)
  stageVelocity: Array<{ stage: string; avgDays: number }>;
}

const fmt = (v: number): string => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
};

const STAGE_ORDER = [
  'Prospecting', 'Qualification', 'Discovery',
  'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'
];

const HEALTH_COLORS = {
  'Excellent (80-100%)': '#22c55e',
  'Good (60-80%)':       '#86efac',
  'At Risk (30-60%)':    '#f59e0b',
  'Critical (0-30%)':    '#ef4444',
};

export function useAnalyticsData(): {
  data: AnalyticsData | null;
  loading: boolean;
  isUploadMode: boolean;
} {
  const {
    isUploadMode, globalData,
    getDeals, getAccounts,
    selectedAccount, getSelectedAccountDeals,
  } = useDataSource();

  const data = useMemo((): AnalyticsData | null => {
    if (!isUploadMode || !globalData) return null;

    // Use selected account deals or all deals
    const deals: NormalizedDeal[] = selectedAccount
      ? getSelectedAccountDeals()
      : getDeals();

    const accounts = getAccounts();

    if (deals.length === 0) return null;

    // ── Top stat cards ──
    const totalValue  = deals.reduce((s, d) => s + d.value, 0);
    const closedWon   = deals.filter(d =>
      d.stage.toLowerCase().replace(/\s/g, '') === 'closedwon'
    );
    const activeDeals = deals.filter(d =>
      !d.stage.toLowerCase().includes('closed')
    );
    const winRate = deals.length > 0
      ? Math.round((closedWon.length / deals.length) * 100) : 0;
    const avgDeal = deals.length > 0
      ? Math.round(totalValue / deals.length) : 0;

    // ── Pipeline by Stage ──
    const stageMap = new Map<string, { value: number; count: number }>();
    deals.forEach(d => {
      const cur = stageMap.get(d.stage) || { value: 0, count: 0 };
      stageMap.set(d.stage, {
        value: cur.value + d.value,
        count: cur.count + 1,
      });
    });
    const pipelineByStage = STAGE_ORDER
      .filter(s => stageMap.has(s))
      .map(s => ({
        stage: s,
        value: stageMap.get(s)!.value,
        count: stageMap.get(s)!.count,
        label: fmt(stageMap.get(s)!.value),
      }))
      .concat(
        // Add stages not in STAGE_ORDER
        Array.from(stageMap.entries())
          .filter(([s]) => !STAGE_ORDER.includes(s))
          .map(([s, v]) => ({
            stage: s, value: v.value,
            count: v.count, label: fmt(v.value),
          }))
      );

    // ── Deal Health Distribution ──
    const healthBuckets: Record<string, number> = {
      'Excellent (80-100%)': 0,
      'Good (60-80%)':       0,
      'At Risk (30-60%)':    0,
      'Critical (0-30%)':    0,
    };
    deals.forEach(d => {
      if (d.probability >= 80)      healthBuckets['Excellent (80-100%)']++;
      else if (d.probability >= 60) healthBuckets['Good (60-80%)']++;
      else if (d.probability >= 30) healthBuckets['At Risk (30-60%)']++;
      else                          healthBuckets['Critical (0-30%)']++;
    });
    const dealHealthDist = Object.entries(healthBuckets)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({
        name, value,
        color: HEALTH_COLORS[name as keyof typeof HEALTH_COLORS],
      }));

    // ── Sales Funnel ──
    const funnelStages = ['Prospecting', 'Qualification', 'Discovery',
                          'Proposal', 'Negotiation', 'Closed Won'];
    const totalDeals = deals.length;
    const salesFunnel = funnelStages
      .map(stage => {
        const stageDeals = deals.filter(d => d.stage === stage);
        return {
          stage,
          count:      stageDeals.length,
          value:      stageDeals.reduce((s, d) => s + d.value, 0),
          percentage: totalDeals > 0
            ? Math.round((stageDeals.length / totalDeals) * 100) : 0,
        };
      })
      .filter(s => s.count > 0);

    // ── Engagement Metrics ──
    const allSignals = deals.flatMap(d => d.signals);
    const signalTypeMap = new Map<string, number>();
    allSignals.forEach(s => {
      // Extract signal type (remove confidence %)
      const type = s.replace(/\s*\(\d+%\)\s*$/, '').trim();
      signalTypeMap.set(type, (signalTypeMap.get(type) || 0) + 1);
    });
    const highEng = accounts.filter(a => a.engagementLevel === 'High').length;
    const medEng  = accounts.filter(a => a.engagementLevel === 'Medium').length;
    const lowEng  = accounts.filter(a => a.engagementLevel === 'Low').length;
    const engagementMetrics = {
      highEngagement:   highEng,
      mediumEngagement: medEng,
      lowEngagement:    lowEng,
      totalSignals:     allSignals.length,
      signalsByType:    Array.from(signalTypeMap.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6),
    };

    // ── Account Analysis ──
    const accountAnalysis = accounts.map(acc => {
      const accDeals = deals.filter(
        d => d.accountId === acc.id || d.accountName === acc.name
      );
      const accValue = accDeals.reduce((s, d) => s + d.value, 0);
      const avgProb  = accDeals.length > 0
        ? Math.round(accDeals.reduce((s, d) => s + d.probability, 0) / accDeals.length)
        : 0;
      const stageCounts = accDeals.reduce((m, d) => {
        m[d.stage] = (m[d.stage] || 0) + 1; return m;
      }, {} as Record<string, number>);
      const topStage = Object.entries(stageCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';
      return {
        name:            acc.name,
        dealCount:       accDeals.length,
        totalValue:      accValue,
        formattedValue:  fmt(accValue),
        avgProbability:  avgProb,
        industry:        acc.industry,
        engagementLevel: acc.engagementLevel,
        topStage,
      };
    })
    .filter(a => a.dealCount > 0)
    .sort((a, b) => b.totalValue - a.totalValue);

    // ── Monthly Trend (from close dates) ──
    const monthMap = new Map<string, { value: number; deals: number }>();
    deals.forEach(d => {
      if (!d.closeDate) return;
      const date = new Date(d.closeDate);
      if (isNaN(date.getTime())) return;
      const key = date.toLocaleString('default',
        { month: 'short', year: '2-digit' });
      const cur = monthMap.get(key) || { value: 0, deals: 0 };
      monthMap.set(key, {
        value: cur.value + d.value,
        deals: cur.deals + 1,
      });
    });
    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => {
        const da = new Date(`1 ${a.month}`);
        const db = new Date(`1 ${b.month}`);
        return da.getTime() - db.getTime();
      })
      .slice(-6); // Last 6 months

    // ── Win/Loss ──
    const wonValue  = closedWon.reduce((s, d) => s + d.value, 0);
    const lostDeals = deals.filter(d =>
      d.stage.toLowerCase().includes('closed lost')
    );
    const lostValue = lostDeals.reduce((s, d) => s + d.value, 0);
    const openValue = activeDeals.reduce((s, d) => s + d.value, 0);
    const winLossData = [
      { name: 'Closed Won',  value: closedWon.length,  color: '#22c55e' },
      { name: 'Closed Lost', value: lostDeals.length,  color: '#ef4444' },
      { name: 'Active',      value: activeDeals.length, color: '#6366f1' },
    ].filter(d => d.value > 0);

    // ── Stage Velocity (estimated from daysLeft) ──
    const stageVelocity = Array.from(stageMap.entries()).map(([stage]) => {
      const stageDeals = deals.filter(d => d.stage === stage);
      const avgDays = stageDeals.length > 0
        ? Math.round(
            stageDeals.reduce((s, d) => s + d.daysLeft, 0) / stageDeals.length
          ) : 0;
      return { stage, avgDays };
    });

    return {
      totalPipelineValue:    totalValue,
      formattedPipelineValue: fmt(totalValue),
      activeDeals:           activeDeals.length,
      winRate,
      avgDealSize:           avgDeal,
      formattedAvgDealSize:  fmt(avgDeal),
      pipelineByStage,
      dealHealthDist,
      salesFunnel,
      engagementMetrics,
      accountAnalysis,
      monthlyTrend,
      winLossData,
      stageVelocity,
    };
  }, [isUploadMode, globalData, selectedAccount?.id]);

  return {
    data,
    loading: false,
    isUploadMode,
  };
}
