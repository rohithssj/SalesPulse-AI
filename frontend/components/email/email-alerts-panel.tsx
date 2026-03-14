'use client';

import { useState, useEffect } from 'react';
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAccount } from '@/context/account-context';
import { fetchCompleteData } from '@/lib/api';

export function EmailAlertsPanel() {
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

  const emailAlerts = (data?.signals || []).filter((s: any) => s.signal?.includes('Email') || s.signal?.includes('Follow-up')).map((s: any, idx: number) => ({
    id: String(idx),
    type: s.signal?.includes('Urgent') ? 'urgent' : 'follow_up',
    title: s.signal || 'Email Follow-up',
    description: `AI recommended follow-up for ${s.account || 'Recent Contact'}.`,
    dealName: s.account || 'Unknown Account',
    daysOverdue: s.confidence > 90 ? 3 : 0,
    priority: s.confidence > 85 ? 'high' : 'medium',
    action: 'Generate Response'
  }));

  // Fallback if no signals
  const alertsToDisplay = emailAlerts.length > 0 ? emailAlerts : [
    {
      id: 'default-1',
      type: 'follow_up',
      title: 'Follow-up needed',
      description: 'Scheduled outreach based on recent engagement',
      dealName: 'Recent Salesforce Contacts',
      daysOverdue: 0,
      priority: 'medium',
      action: 'Quick Draft'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 border-red-500/30 text-red-500';
      case 'medium': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-600';
      default: return 'bg-blue-500/10 border-blue-500/30 text-blue-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'follow_up': return <Mail className="w-5 h-5 text-primary" />;
      case 'engagement': return <CheckCircle2 className="w-5 h-5 text-success" />;
      default: return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 glass rounded-lg border border-white/10">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Activity Alerts</h3>
          <p className="text-sm text-[#888] mt-1">{alertsToDisplay.length} action items requiring your attention</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Mail className="w-4 h-4 mr-2" />
          Generate All
        </Button>
      </div>

      <div className="grid gap-3">
        {alertsToDisplay.map((alert: any) => (
          <Card
            key={alert.id}
            className="glass luxury-panel border-[#2a2a2a] hover:border-primary/50 p-4 transition-all duration-300 cursor-pointer group lift-hover"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getTypeIcon(alert.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                    <p className="text-xs text-[#888] mt-1">{alert.description}</p>
                  </div>
                  <Badge className={`flex-shrink-0 text-xs ${getPriorityColor(alert.priority)}`}>
                    {alert.priority === 'high' ? '⚡ URGENT' : alert.priority === 'medium' ? '⚠ MED' : '• LOW'}
                  </Badge>
                </div>
                <div className="text-xs text-[#a3a3a3] mb-3">
                  <span className="font-medium">{alert.dealName}</span>
                  {alert.daysOverdue > 0 && (
                    <span className="ml-2 text-red-400">• {alert.daysOverdue}d overdue</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                className="flex-shrink-0 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                {alert.action}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="glass rounded-xl p-6 border border-white/10 bg-white/[0.01]">
        <h4 className="text-sm font-semibold text-white mb-4">Email Activity Summary</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{data?.emailsSentToday || 0}</div>
            <p className="text-xs text-[#888] mt-2">Emails Sent Today</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">{data?.openRate || '0%'}</div>
            <p className="text-xs text-[#888] mt-2">Open Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{alertsToDisplay.length}</div>
            <p className="text-xs text-[#888] mt-2">Awaiting Response</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">100%</div>
            <p className="text-xs text-[#888] mt-2">Delivery Rate</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
