'use client';

import { Bell, X, AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  actionLabel?: string;
}

const notifications: Notification[] = [
  {
    id: '1',
    type: 'error',
    title: 'High-Risk Deal Alert',
    message: 'Acme Corp deal health critical (42%)',
    timestamp: '2 min ago',
    actionLabel: 'View Deal',
  },
  {
    id: '2',
    type: 'warning',
    title: 'Follow-up Overdue',
    message: '5 deals need follow-up emails',
    timestamp: '1 hour ago',
    actionLabel: 'Send Now',
  },
  {
    id: '3',
    type: 'success',
    title: 'Analysis Complete',
    message: 'Pipeline analysis finished - 6 new signals',
    timestamp: '2 hours ago',
  },
  {
    id: '4',
    type: 'info',
    title: 'Dataset Updated',
    message: 'CRM sync completed successfully',
    timestamp: '3 hours ago',
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-warning" />;
    case 'success':
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    default:
      return <Info className="w-5 h-5 text-primary" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'error':
      return 'border-red-500/30 bg-red-500/10';
    case 'warning':
      return 'border-warning/30 bg-warning/10';
    case 'success':
      return 'border-success/30 bg-success/10';
    default:
      return 'border-primary/30 bg-primary/10';
  }
};

export function NotificationsPanel() {
  return (
    <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Notifications</h4>
        </div>
        <span className="text-[10px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full font-bold">{notifications.length}</span>
      </div>

      <div className="space-y-2">
        {notifications.map((notif) => (
          <div key={notif.id} className={`flex items-start gap-3 p-3 rounded-lg ${getNotificationColor(notif.type)}`}>
            <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white">{notif.title}</p>
              <p className="text-[10px] text-[#999] mt-0.5">{notif.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-[#666]">{notif.timestamp}</span>
                {notif.actionLabel && <button className="text-[10px] font-semibold text-primary hover:underline">{notif.actionLabel}</button>}
              </div>
            </div>

            <button className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors">
              <X className="w-3 h-3 text-[#666]" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
}
