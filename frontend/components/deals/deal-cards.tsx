'use client';

import { useState } from 'react';
import { TrendingUp, Users, Calendar, Zap } from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  daysLeft: number;
  status: 'healthy' | 'moderate' | 'risk';
  contact: string;
}

export function DealCards() {
  const [actionFeedback, setActionFeedback] = useState<Record<string, string>>({});

  const deals: Deal[] = [
    {
      id: '1',
      name: 'Enterprise License',
      company: 'Acme Corporation',
      value: 150000,
      stage: 'Proposal',
      probability: 85,
      daysLeft: 8,
      status: 'healthy',
      contact: 'John Smith',
    },
    {
      id: '2',
      name: 'Integration Services',
      company: 'TechFlow Inc',
      value: 200000,
      stage: 'Negotiation',
      probability: 72,
      daysLeft: 2,
      status: 'moderate',
      contact: 'Sarah Johnson',
    },
    {
      id: '3',
      name: 'Support Package',
      company: 'DataSync Ltd',
      value: 85000,
      stage: 'Contract Review',
      probability: 45,
      daysLeft: 15,
      status: 'risk',
      contact: 'Mike Chen',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return { bg: 'bg-success/10', border: 'border-success/30', text: 'text-success' };
      case 'moderate':
        return { bg: 'bg-warning/10', border: 'border-warning/30', text: 'text-warning' };
      case 'risk':
        return { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' };
      default:
        return { bg: 'bg-primary/10', border: 'border-primary/30', text: 'text-primary' };
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'Proposal':
        return 'text-secondary';
      case 'Negotiation':
        return 'text-accent';
      case 'Contract Review':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {deals.map((deal, idx) => {
        const colors = getStatusColor(deal.status);
        return (
          <div
            key={deal.id}
            className={`glass rounded-lg p-5 border ${colors.border} hover:border-opacity-50 transition-all duration-300 group cursor-pointer animate-slide-in`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground group-hover:text-gradient-primary transition-all">
                  {deal.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{deal.company}</p>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                {deal.probability}%
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {/* Value */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Value</p>
                <p className="text-sm font-bold text-gradient-primary">${(deal.value / 1000).toFixed(0)}K</p>
              </div>

              {/* Stage */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Stage</p>
                <p className={`text-sm font-bold ${getStageColor(deal.stage)}`}>{deal.stage}</p>
              </div>

              {/* Days Left */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Days Left</p>
                <p className="text-sm font-bold text-accent">{deal.daysLeft}d</p>
              </div>

              {/* Contact */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-muted-foreground mb-1">Contact</p>
                <p className="text-sm font-bold text-secondary truncate">{deal.contact}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Probability</span>
                <span className={colors.text}>{deal.probability}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    deal.probability > 75
                      ? 'bg-gradient-to-r from-success to-primary'
                      : deal.probability > 50
                        ? 'bg-gradient-to-r from-warning to-accent'
                        : 'bg-gradient-to-r from-destructive to-warning'
                  }`}
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setActionFeedback((prev) => ({
                    ...prev,
                    [deal.id]: `Engagement task created for ${deal.contact}`,
                  }))
                }
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/8 border border-white/15 hover:bg-white/12 hover:border-white/25 text-[#c7cfda] transition-colors"
              >
                <Users className="w-3 h-3" />
                <span>Engage</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setActionFeedback((prev) => ({
                    ...prev,
                    [deal.id]: `AI tip generated for ${deal.company}`,
                  }))
                }
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#b6aeca] transition-colors"
              >
                <Zap className="w-3 h-3" />
                <span>AI Tips</span>
              </button>
            </div>

            {actionFeedback[deal.id] && (
              <p className="mt-2 text-[11px] text-[#9a9a9a]">{actionFeedback[deal.id]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
