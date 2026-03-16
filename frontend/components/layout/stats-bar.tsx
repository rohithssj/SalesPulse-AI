'use client';

import { TrendingUp, Target, Users, Zap, Loader2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { normalizeOpportunities } from '@/lib/api';

export function StatsBar() {
  const { data, loading } = usePageData(
    '/completeData',
    (ctx) => ctx.globalData
  );

  const stats = (() => {
    if (!data) return [
      { label: 'Active Deals', value: 0, icon: <Target className="w-4 h-4" />, trend: 0, color: 'from-primary to-primary-light' },
      { label: 'Pipeline Value', value: '$0K', icon: <TrendingUp className="w-4 h-4" />, trend: 0, color: 'from-secondary to-secondary-light' },
      { label: 'Win Rate', value: '0%', icon: <Zap className="w-4 h-4" />, trend: 0, color: 'from-accent to-accent-light' },
      { label: 'Avg Deal Size', value: '$0K', icon: <Users className="w-4 h-4" />, trend: 0, color: 'from-success to-warning' },
    ];

    const getStats = () => {
      // Salesforce mode: data is raw array or object with opportunities
      const isRaw = (data as any).opportunities !== undefined || Array.isArray(data);
      if (isRaw) {
        const opps = normalizeOpportunities(data);
        const activeDeals = opps.filter(o => !['Closed Won', 'Closed Lost'].includes(o.dealStage)).length;
        const totalPipe = opps.reduce((sum, o) => sum + (o.dealValue || 0), 0);
        const closed = opps.filter(o => o.dealStage?.startsWith('Closed')).length;
        const won = opps.filter(o => o.dealStage === 'Closed Won').length;
        const winRate = closed > 0 ? Math.round((won / closed) * 100) : 42;
        const avgSize = opps.length > 0 ? Math.round(totalPipe / opps.length) : 0;
        
        return { activeDeals, totalPipe, winRate, avgSize };
      }
      
      // Upload mode: data is GlobalData, stats are in summary
      const summary = (data as any).summary;
      return {
        activeDeals: summary?.activeDeals || 0,
        totalPipe: summary?.totalPipelineValue || 0,
        winRate: summary?.winRate || 0,
        avgSize: summary?.avgDealSize || 0
      };
    };

    const s = getStats();

    return [
      { label: 'Active Deals', value: s.activeDeals, icon: <Target className="w-4 h-4" />, trend: 12, color: 'from-primary to-primary-light' },
      { label: 'Pipeline Value', value: `$${(s.totalPipe / 1000).toFixed(1)}K`, icon: <TrendingUp className="w-4 h-4" />, trend: 8.5, color: 'from-secondary to-secondary-light' },
      { label: 'Win Rate', value: `${s.winRate}%`, icon: <Zap className="w-4 h-4" />, trend: 5.2, color: 'from-accent to-accent-light' },
      { label: 'Avg Deal Size', value: `$${(s.avgSize / 1000).toFixed(1)}K`, icon: <Users className="w-4 h-4" />, trend: 3.1, color: 'from-success to-warning' },
    ];
  })();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 glass rounded-lg border border-white/10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="glass rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer animate-slide-in"
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-10`}>{stat.icon}</div>
          </div>

          <div className="flex items-end justify-between">
            <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
              {stat.value}
            </div>
            {stat.trend !== undefined && (
              <div 
                className={`flex items-center gap-1 text-xs font-semibold ${stat.trend >= 0 ? 'text-success' : 'text-red-500'}`}
              >
                <span>{stat.trend >= 0 ? '↑' : '↓'}</span>
                {Math.abs(stat.trend)}%
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
