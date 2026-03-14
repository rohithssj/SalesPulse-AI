'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Deal Updated',
      message: 'Acme Corp proposal accepted by stakeholder',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Action Required',
      message: 'TechFlow Inc needs follow-up within 24 hours',
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, 6000);

    return () => clearTimeout(timer);
  }, [notifications]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/5 text-success';
      case 'warning':
        return 'border-warning/30 bg-warning/5 text-warning';
      case 'info':
      default:
        return 'border-primary/30 bg-primary/5 text-primary';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5" />;
      case 'info':
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="fixed bottom-8 right-8 space-y-3 max-w-sm z-50 pointer-events-none">
      {notifications.map((notification, idx) => (
        <div
          key={notification.id}
          className={`glass rounded-lg p-4 border flex items-start gap-3 pointer-events-auto animate-slide-in ${getNotificationStyle(notification.type)}`}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold">{notification.title}</h3>
            <p className="text-xs opacity-80 mt-0.5">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
