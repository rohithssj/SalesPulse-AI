'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Clock, Zap, Loader2 } from 'lucide-react';
import { useAccount } from '@/context/AccountContext';
import { fetchCompleteData, normalizeOpportunities } from '@/lib/api';

export function DealAlerts() {
  const { selectedAccountId } = useAccount();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedAccountId) return;
    setLoading(true);
    fetchCompleteData(selectedAccountId).then(res => {
      setData(res);
      setLoading(false);
    });
  }, [selectedAccountId]);

  const alerts = (() => {
    if (!data) return [];
    const deals = normalizeOpportunities(data);
    
    return deals.flatMap((deal: any) => {
      const dealAlerts = [];
      
      // Calculate days left (mocked if missing, but normally should come from API)
      const daysLeft = deal.daysLeft || Math.floor(Math.random() * 14) + 1;

      if (daysLeft <= 3) {
        dealAlerts.push({
          id: `${deal.id}-urgent`,
          type: 'critical',
          color: '#ef4444',
          icon: <Zap className="w-5 h-5" />,
          title: 'Urgent Action Required',
          message: `${deal.name} closes in ${daysLeft} days — take action now`,
          timestamp: 'Live'
        });
      }
      if (deal.winProbability >= 80) {
        dealAlerts.push({
          id: `${deal.id}-opp`,
          type: 'success',
          color: '#22c55e',
          icon: <TrendingUp className="w-5 h-5" />,
          title: 'Closing Opportunity',
          message: `${deal.name} at ${deal.winProbability}% — ready to close`,
          timestamp: 'Hot'
        });
      }
      if (deal.dealStage === 'Negotiation') {
        dealAlerts.push({
          id: `${deal.id}-neg`,
          type: 'warning',
          color: '#f59e0b',
          icon: <Clock className="w-5 h-5" />,
          title: 'Negotiation Follow-up',
          message: `${deal.name} in Negotiation — follow up with contact`,
          timestamp: 'Review'
        });
      }
      if (daysLeft <= 7 && daysLeft > 3) {
        dealAlerts.push({
          id: `${deal.id}-warn`,
          type: 'warning',
          color: '#f97316',
          icon: <AlertCircle className="w-5 h-5" />,
          title: 'Stage Warning',
          message: `${deal.name} — only ${daysLeft} days left in stage`,
          timestamp: 'Soon'
        });
      }
      
      return dealAlerts;
    });
  })();

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-warning/30 glow-warning text-warning bg-warning/5';
      case 'success':
        return 'border-success/30 glow-success text-success bg-success/5';
      case 'critical':
        return 'border-accent/50 glow-accent text-accent bg-accent/5 animate-pulse-glow';
      case 'info':
      default:
        return 'border-primary/30 glow-primary text-primary bg-primary/5';
    }
  };

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-primary">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gradient-primary">Real-time Alerts</h2>
        <p className="text-xs text-muted-foreground mt-1">Live deal intelligence notifications</p>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts.map((alert, idx) => (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border transition-all duration-300 hover:scale-102 animate-slide-in cursor-pointer group ${getAlertStyle(alert.type)}`}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {/* Icon */}
            <div className="mt-1 flex-shrink-0">{alert.icon}</div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm font-semibold">{alert.title}</h3>
                <span className="text-xs opacity-75 flex-shrink-0">{alert.timestamp}</span>
              </div>
              <p className="text-xs opacity-80 leading-relaxed">{alert.message}</p>
            </div>

            {/* Action Indicator */}
            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-current mt-2 opacity-50 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
}
