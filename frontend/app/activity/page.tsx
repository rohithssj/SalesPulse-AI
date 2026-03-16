'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertCircle, CheckCircle, Mail, Zap, TrendingUp, Users, Clock, Filter, Archive, Trash2, Loader2 } from 'lucide-react';
import { fetchCompleteData, normalizeActivities } from '@/lib/api';
import { useAccount } from '@/context/AccountContext';

interface Activity {
  id: string;
  type: 'deal' | 'signal' | 'email' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  account?: string;
  timestamp: string;
  read: boolean;
  icon: React.ReactNode;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

// The activities will be generated dynamically below based on fetched backend API data

const severityColors = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/30', label: 'Critical' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/30', label: 'High' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/30', label: 'Medium' },
  low: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30', label: 'Low' },
};

const typeColors = {
  deal: { icon: 'bg-primary/10', text: 'text-primary' },
  signal: { icon: 'bg-warning/10', text: 'text-warning' },
  email: { icon: 'bg-secondary/10', text: 'text-secondary' },
  success: { icon: 'bg-success/10', text: 'text-success' },
  warning: { icon: 'bg-red-500/10', text: 'text-red-500' },
  info: { icon: 'bg-blue-500/10', text: 'text-blue-500' },
};

export default function ActivityPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  
  const { selectedAccountId } = useAccount();
  const [loading, setLoading] = useState(true);
  const [rawActivities, setRawActivities] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedAccountId) {
      setLoading(false);
      return;
    }
    fetchCompleteData(selectedAccountId).then(data => {
      if (data) {
        setRawActivities(normalizeActivities(data).slice(0, 30)); // limit to 30 for performance
      }
      setLoading(false);
    });
  }, [selectedAccountId]);

  const activities: Activity[] = useMemo(() => {
    return rawActivities.map((act, i) => {
      const isEmail = act.type?.toLowerCase().includes('email') || act.subject?.toLowerCase().includes('email');
      const isMeeting = act.type?.toLowerCase().includes('meeting') || act.type?.toLowerCase().includes('call');
      
      let type: Activity['type'] = 'info';
      let icon = <Zap className="w-5 h-5" />;
      let severity: Activity['severity'] = 'medium';

      if (isEmail) {
        type = 'email';
        icon = <Mail className="w-5 h-5" />;
        severity = 'low';
      } else if (isMeeting) {
        type = 'deal';
        icon = <Users className="w-5 h-5" />;
        severity = 'medium';
      } else if (act.status?.toLowerCase() === 'completed') {
        type = 'success';
        icon = <CheckCircle className="w-5 h-5" />;
        severity = 'low';
      } else {
        type = 'signal';
        icon = <AlertCircle className="w-5 h-5" />;
        severity = 'high';
      }

      return {
        id: act.id,
        type,
        title: act.subject,
        description: `Status: ${act.status || 'Pending'}`,
        account: 'CRM Account',
        timestamp: new Date(act.activityDate).toLocaleDateString(undefined, {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        }),
        read: i % 3 !== 0,
        icon,
        severity
      };
    });
  }, [rawActivities]);

  const unreadCount = activities.filter((a) => !a.read).length;

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (activity.account?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesRead = filterRead === 'all' || 
                        (filterRead === 'unread' && !activity.read) ||
                        (filterRead === 'read' && activity.read);
    return matchesSearch && matchesType && matchesRead;
  });

  return (
    <main className="min-h-screen bg-black text-white pt-[67px] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Activity Log</h1>
            <Badge className="bg-warning/20 text-warning border-warning/30 border">
              {unreadCount} unread
            </Badge>
          </div>
          <p className="text-sm text-[#888]">Real-time activity feed across all deals, signals, and communications</p>
        </div>

        {/* Stats Cards - Standardized 3-state responsiveness */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
            <p className="text-xs text-[#888] mb-1">Total Activities</p>
            <p className="text-2xl font-bold text-white">{activities.length}</p>
            <p className="text-xs text-[#666] mt-1">Last 7 days</p>
          </Card>
          <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
            <p className="text-xs text-[#888] mb-1">Unread</p>
            <p className="text-2xl font-bold text-warning">{unreadCount}</p>
            <p className="text-xs text-success mt-1">Require attention</p>
          </Card>
          <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
            <p className="text-xs text-[#888] mb-1">Critical</p>
            <p className="text-2xl font-bold text-red-500">
              {activities.filter((a) => a.severity === 'critical').length}
            </p>
            <p className="text-xs text-[#666] mt-1">Action needed</p>
          </Card>
          <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
            <p className="text-xs text-[#888] mb-1">This Week</p>
            <p className="text-2xl font-bold text-primary">{activities.filter((a) => a.timestamp.includes('ago')).length}</p>
            <p className="text-xs text-[#666] mt-1">New activities</p>
          </Card>
        </div>

        {/* Filters - Standardized 3-state responsiveness */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">
                Search
              </label>
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white/5 border-[#2a2a2a] text-white placeholder-[#666]"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-white/5 border border-[#2a2a2a] rounded text-white text-sm px-3 py-2"
              >
                <option value="all">All Types</option>
                <option value="deal">Deal</option>
                <option value="signal">Signal</option>
                <option value="email">Email</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
              </select>
            </div>

            {/* Read Status Filter */}
            <div>
              <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">
                Status
              </label>
              <select
                value={filterRead}
                onChange={(e) => setFilterRead(e.target.value)}
                className="w-full bg-white/5 border border-[#2a2a2a] rounded text-white text-sm px-3 py-2"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Activity List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 glass border-[#2a2a2a] rounded-lg bg-white/5" />
              ))}
            </div>
          ) : filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => {
              const severity = activity.severity ? severityColors[activity.severity] : { bg: '', text: '', border: '', label: '' };
              const typeColor = typeColors[activity.type as keyof typeof typeColors] || { icon: 'bg-white/10', text: 'text-white' };

              return (
                <Card
                  key={activity.id}
                  className={`glass border-[#2a2a2a] p-4 rounded-lg transition-all hover:border-white/20 group ${
                    !activity.read ? 'border-white/20 bg-white/[0.02]' : 'border-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2.5 rounded-lg flex-shrink-0 ${typeColor.icon}`}>
                      <span className={typeColor.text}>{activity.icon}</span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="text-sm font-semibold text-white">{activity.title}</h3>
                        {!activity.read && (
                          <div className="w-2 h-2 rounded-full bg-warning flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-sm text-[#888] mb-2">{activity.description}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        {activity.account && (
                          <span className="text-xs text-[#666] bg-white/5 px-2 py-1 rounded">
                            {activity.account}
                          </span>
                        )}
                        <span className="text-xs text-[#666] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Severity Badge */}
                    {severity.label && (
                      <Badge className={`${severity.bg} ${severity.text} border ${severity.border} text-xs flex-shrink-0`}>
                        {severity.label}
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <Archive className="w-4 h-4 text-[#888]" />
                      </button>
                      <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-red-500/70 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <Card className="glass luxury-panel border-[#2a2a2a] p-12 rounded-lg text-center">
              <AlertCircle className="w-8 h-8 text-[#666] mx-auto mb-3" />
              <p className="text-[#888]">No activities match your filter</p>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
