'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchCompleteData, normalizeOpportunities } from '@/lib/api';
import { useAccount } from '@/context/account-context';
import { Loader2 } from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'moderate' | 'risk';
  angle: number;
  distance: number;
}

export function DealRadar() {
  const { selectedAccountId } = useAccount();
  const [loading, setLoading] = useState(true);
  const [rawOpps, setRawOpps] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);
    fetchCompleteData(selectedAccountId).then((data) => {
      if (data) {
        setRawOpps(normalizeOpportunities(data).slice(0, 15)); // Keep visual clean with top 15
      }
      setLoading(false);
    });
  }, [selectedAccountId]);

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
        status,
        angle: (i * (360 / Math.max(rawOpps.length, 1))) % 360,
        distance: Math.max(0.2, 1 - (score / 100))
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
              const color = getStatusColor(deal.status);
              return (
                <g key={deal.id}>
                  {/* Glow circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={12}
                    fill={color}
                    opacity="0.1"
                    className="animate-pulse-glow"
                  />
                  {/* Main node */}
                  <circle cx={pos.x} cy={pos.y} r={6} fill={color} stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                  {/* Outer ring */}
                  <circle cx={pos.x} cy={pos.y} r={8} fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
                  
                  {/* Tooltip/Label could optionally be added here if desired */}
                </g>
              );
            })}
          </svg>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 grid grid-cols-3 gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success" />
          <span className="text-muted-foreground">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-warning" />
          <span className="text-muted-foreground">Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive" />
          <span className="text-muted-foreground">Risk</span>
        </div>
      </div>
    </div>
  );
}
