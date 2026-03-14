'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Zap, Mail, TrendingUp } from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'info' | 'signal' | 'email';
  title: string;
  message: string;
  timestamp?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'signal',
      title: 'Buying Signal Detected',
      message: 'Budget confirmation signal from Acme Corp',
      timestamp: '2 min ago',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Action Required',
      message: 'TechFlow Inc needs follow-up within 24 hours',
      timestamp: '1 hour ago',
    },
  ]);

  const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>(notifications.slice(0, 3));

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setDisplayedNotifications((prev) => prev.slice(1));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [displayedNotifications, notifications]);

  const getNotificationStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-success/30 bg-success/5';
      case 'warning':
        return 'border-red-500/30 bg-red-500/5';
      case 'signal':
        return 'border-warning/30 bg-warning/5';
      case 'email':
        return 'border-secondary/30 bg-secondary/5';
      case 'info':
      default:
        return 'border-primary/30 bg-primary/5';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'signal':
        return <Zap className="w-5 h-5 text-warning" />;
      case 'email':
        return <Mail className="w-5 h-5 text-secondary" />;
      case 'info':
      default:
        return <TrendingUp className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="fixed bottom-8 right-8 space-y-3 max-w-sm z-40 pointer-events-none">
      {displayedNotifications.map((notification, idx) => (
        <div
          key={notification.id}
          className={`glass rounded-lg p-4 border flex items-start gap-3 pointer-events-auto animate-slide-in ${getNotificationStyle(notification.type)}`}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <div className="flex-shrink-0 mt-0.5">{getIcon(notification.type)}</div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white">{notification.title}</h3>
            <p className="text-xs text-[#888] mt-0.5">{notification.message}</p>
            {notification.timestamp && (
              <p className="text-xs text-[#666] mt-1">{notification.timestamp}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
