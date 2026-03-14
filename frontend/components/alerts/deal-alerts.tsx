'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, Clock, Zap, Loader2 } from 'lucide-react';
import { useAccount } from '@/context/account-context';
import { fetchCompleteData } from '@/lib/api';

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

  const alerts = (data?.signals || []).map((s: any, idx: number) => ({
    id: String(idx),
    title: s.signal || 'Buying Signal',
    message: `${s.account || 'Account'} showed ${s.signal?.toLowerCase()} behavior with ${s.confidence}% confidence.`,
    type: s.confidence >= 90 ? 'critical' : s.confidence >= 75 ? 'warning' : 'info',
    icon: s.confidence >= 90 ? <Zap className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />,
    timestamp: s.time || 'recent'
  }));

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
