'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchCompleteData, normalizeOpportunities } from '@/lib/api';
import { useAccount } from '@/context/AccountContext';
import { Loader2 } from 'lucide-react';
import { getDealColor } from '@/lib/deal-colors';

interface Deal {
  id: string;
  name: string;
  value: number;
  probability: number;
  status: 'healthy' | 'moderate' | 'risk';
  angle: number;
  distance: number;
}

import { usePageData } from '@/hooks/usePageData';

export function DealRadar() {
  const { data: dealsData, loading } = usePageData(
    '/completeData',
    (ctx) => ctx.getSelectedAccountDeals()
  );

  const rawOpps = useMemo(() => {
    if (!dealsData) return [];
    // If dealsData is coming from Salesforce (raw api result), normalize it
    if ((dealsData as any).opportunities !== undefined || Array.isArray(dealsData)) {
      return normalizeOpportunities(dealsData).slice(0, 15);
    }
    return (dealsData as any[]).slice(0, 15);
  }, [dealsData]);

  const deals: Deal[] = useMemo(() => {
    if (!rawOpps.length) return [];
    return rawOpps.map((opp, i) => {
      // Use healthScore if available, otherwise fallback to winProbability
      const score = opp.healthScore !== undefined ? opp.healthScore : opp.winProbability || 0;
      let status: 'healthy' | 'moderate' | 'risk' = 'moderate';
      if (score >= 70) status = 'healthy';
      else if (score <= 40) status = 'risk';

      return {
        id: opp.id,
        name: opp.name || opp.accountName || 'Unknown Deal',
        value: opp.dealValue || 0,
        probability: score,
        status,
        angle: (i * (360 / Math.max(rawOpps.length, 1))) % 360,
        distance: Math.max(0.15, 1 - (score / 100))
      };
    });
  }, [rawOpps]);

  const size = 500;
  const center = size / 2;
  const maxRadius = size * 0.35;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return '#00ff88';
      case 'moderate':
        return '#ffb700';
      case 'risk':
        return '#ff3333';
      default:
        return '#00d9ff';
    }
  };

  const convertPolar = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: center + maxRadius * distance * Math.cos(rad - Math.PI / 2),
      y: center + maxRadius * distance * Math.sin(rad - Math.PI / 2),
    };
  };

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-primary h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gradient-primary">Deal Radar</h2>
        <p className="text-xs text-muted-foreground mt-1">Real-time pipeline visualization</p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center relative">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="w-full max-w-md">
            {/* Radar circles */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
              <circle
                key={`circle-${ratio}`}
                cx={center}
                cy={center}
                r={maxRadius * ratio}
                fill="none"
                stroke="rgba(0, 217, 255, 0.1)"
                strokeWidth="1"
                strokeDasharray="4"
              />
            ))}

            {/* Radar grid lines */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const x2 = center + maxRadius * Math.cos(rad - Math.PI / 2);
              const y2 = center + maxRadius * Math.sin(rad - Math.PI / 2);
              return (
                <line
                  key={`line-${angle}`}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(0, 217, 255, 0.08)"
                  strokeWidth="1"
                />
              );
            })}

            {/* Sweep animation - background */}
            <g opacity="0.1">
              <path
                d={`M ${center} ${center} L ${center} ${center - maxRadius} A ${maxRadius} ${maxRadius} 0 0 1 ${center + maxRadius} ${center} Z`}
                fill="url(#sweep-gradient)"
                className="animate-radar-sweep"
              />
            </g>

            <defs>
              <linearGradient id="sweep-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgba(0, 217, 255, 0.3)" />
                <stop offset="100%" stopColor="rgba(0, 217, 255, 0)" />
              </linearGradient>
            </defs>

            {/* Deal nodes */}
            {deals.map((deal) => {
              const pos = convertPolar(deal.angle, deal.distance);
              const dealStyle = getDealColor(deal.probability);
              const dotSize = Math.max(4, Math.min(12, (deal.value / 1000000) * 8 + 4));
              
              return (
                <g key={deal.id} className="cursor-pointer group">
                  {/* Glow circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={dotSize + 6}
                    fill={dealStyle.dot}
                    opacity="0.2"
                    className={deal.probability >= 75 ? "animate-pulse-glow" : ""}
                  />
                  {/* Main node */}
                  <circle 
                    cx={pos.x} 
                    cy={pos.y} 
                    r={dotSize} 
                    fill={dealStyle.dot} 
                    stroke="rgba(255,255,255,0.4)" 
                    strokeWidth="1.5" 
                    style={{ filter: `drop-shadow(0 0 4px ${dealStyle.glow})` }}
                  />
                  
                  {/* Deal Label */}
                  <text
                    x={pos.x + dotSize + 4}
                    y={pos.y + 4}
                    fill="white"
                    fontSize="10"
                    className="opacity-70 group-hover:opacity-100 transition-opacity font-medium pointer-events-none"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {deal.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Radar Legend */}
      <div className="radar-legend mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5 transition-all hover:opacity-100 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e', boxShadow: '0 0 8px rgba(34, 197, 94, 0.4)' }} />
          <span className="text-[11px] font-semibold text-[#bbf7d0]">High (75%+)</span>
        </div>
        <div className="flex items-center gap-1.5 transition-all hover:opacity-100 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 8px rgba(245, 158, 11, 0.4)' }} />
          <span className="text-[11px] font-semibold text-[#fde68a]">Med (50-74%)</span>
        </div>
        <div className="flex items-center gap-1.5 transition-all hover:opacity-100 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f97316', boxShadow: '0 0 8px rgba(249, 115, 22, 0.4)' }} />
          <span className="text-[11px] font-semibold text-[#fed7aa]">At Risk (25-49%)</span>
        </div>
        <div className="flex items-center gap-1.5 transition-all hover:opacity-100 opacity-70">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444', boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }} />
          <span className="text-[11px] font-semibold text-[#fecaca]">Crit (&lt;25%)</span>
        </div>
      </div>
    </div>
  );
}
