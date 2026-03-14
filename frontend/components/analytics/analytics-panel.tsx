'use client';

import { useMemo, useState } from 'react';
import { TrendingUp, Calendar } from 'lucide-react';

interface DataPoint {
  label: string;
  value: number;
  change: number;
  color: string;
}

export function AnalyticsPanel() {
  const [rangeIndex, setRangeIndex] = useState(0);
  const ranges = ['This Week', 'This Month', 'This Quarter'] as const;
  const activeRange = ranges[rangeIndex];

  const metrics: DataPoint[] = [
    { label: 'Pipeline Value', value: 2540000, change: 12.5, color: 'from-[#8a94a6] to-[#a7afbd]' },
    { label: 'Win Rate', value: 68, change: 5.2, color: 'from-[#7f8aa0] to-[#9fa7b8]' },
    { label: 'Avg Deal Size', value: 125000, change: 8.3, color: 'from-[#9a89a3] to-[#b0a1b8]' },
    { label: 'Sales Velocity', value: 4.2, change: 3.1, color: 'from-[#7ea38a] to-[#b39a6b]' },
  ];

  const timelineItems = useMemo(
    () => [
      { time: 'Today', deals: 3, textColor: 'text-[#7ea38a]', barClass: 'from-[#7ea38a] to-[#93b19e]', icon: '✓' },
      { time: 'Yesterday', deals: 5, textColor: 'text-[#8a94a6]', barClass: 'from-[#8a94a6] to-[#a7afbd]', icon: '→' },
      { time: 'This Week', deals: 18, textColor: 'text-[#7f8aa0]', barClass: 'from-[#7f8aa0] to-[#9fa7b8]', icon: '↑' },
      { time: 'This Month', deals: 64, textColor: 'text-[#9a89a3]', barClass: 'from-[#9a89a3] to-[#b0a1b8]', icon: '◆' },
    ],
    []
  );

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-primary h-full flex flex-col">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#a7afbd]" />
          <h2 className="text-lg font-semibold text-gradient-primary">Analytics</h2>
        </div>
        <button
          type="button"
          onClick={() => setRangeIndex((current) => (current + 1) % ranges.length)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-[#b3b3b3] transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#b3b3b3]" />
          {activeRange}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 group animate-slide-in"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#7ea38a]">
                <TrendingUp className="w-3 h-3" />
                {metric.change}%
              </div>
            </div>

            <div className={`text-2xl font-bold bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-3`}>
              {metric.label.includes('Rate') || metric.label.includes('Velocity')
                ? metric.value.toFixed(1) + (metric.label.includes('Rate') ? '%' : 'x')
                : '$' + (metric.value / 1000000 > 1 ? (metric.value / 1000000).toFixed(2) + 'M' : (metric.value / 1000).toFixed(0) + 'K')}
            </div>

            {/* Mini Chart */}
            <div className="h-12 flex items-end gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm transition-all duration-300 group-hover:opacity-100 ${
                    i > 6 ? 'opacity-100' : 'opacity-40'
                  }`}
                  style={{
                    height: `${30 + Math.random() * 40}%`,
                    background: `linear-gradient(180deg, ${i % 2 === 0 ? 'rgba(138,148,166,0.65)' : 'rgba(154,137,163,0.6)'}, transparent)`,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Timeline */}
      <div className="flex-1 p-4 rounded-lg bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Timeline</h3>
        <div className="space-y-4">
          {timelineItems.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 animate-slide-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10 text-xs">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">{item.time}</span>
                  <span className={`text-xs font-bold ${item.textColor}`}>{item.deals} deals</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full bg-gradient-to-r ${item.barClass} rounded-full`}
                    style={{ width: `${(item.deals / 64) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
