'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Mail, CheckCircle2, MessageSquare } from 'lucide-react';

const emailEngagementData = [
  { date: 'Mon', sent: 12, open: 8, click: 5, reply: 3 },
  { date: 'Tue', sent: 15, open: 11, click: 7, reply: 4 },
  { date: 'Wed', sent: 10, open: 8, click: 6, reply: 2 },
  { date: 'Thu', sent: 18, open: 14, click: 9, reply: 5 },
  { date: 'Fri', sent: 14, open: 11, click: 8, reply: 4 },
  { date: 'Sat', sent: 8, open: 6, click: 4, reply: 2 },
  { date: 'Sun', sent: 5, open: 3, click: 2, reply: 1 }
];

const followUpSuccessData = [
  { stage: '1st Follow-up', success: 45 },
  { stage: '2nd Follow-up', success: 38 },
  { stage: '3rd Follow-up', success: 28 },
  { stage: '4th Follow-up', success: 18 },
  { stage: '5th Follow-up', success: 12 }
];

export function EmailAnalyticsPanel() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Open Rate</p>
              <div className="text-2xl font-bold text-primary mt-2">32.4%</div>
              <p className="text-xs text-success mt-1">↑ 4.2% from last week</p>
            </div>
            <Mail className="w-8 h-8 text-primary/20" />
          </div>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Click Rate</p>
              <div className="text-2xl font-bold text-secondary mt-2">18.7%</div>
              <p className="text-xs text-success mt-1">↑ 2.1% from last week</p>
            </div>
            <MessageSquare className="w-8 h-8 text-secondary/20" />
          </div>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Reply Rate</p>
              <div className="text-2xl font-bold text-warning mt-2">9.3%</div>
              <p className="text-xs text-success mt-1">↑ 1.5% from last week</p>
            </div>
            <CheckCircle2 className="w-8 h-8 text-warning/20" />
          </div>
        </Card>

        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Conversion Rate</p>
              <div className="text-2xl font-bold text-success mt-2">6.8%</div>
              <p className="text-xs text-success mt-1">↑ 0.9% from last week</p>
            </div>
            <TrendingUp className="w-8 h-8 text-success/20" />
          </div>
        </Card>
      </div>

      {/* Email Engagement Timeline */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white">Email Engagement Trend</h3>
          <p className="text-xs text-[#888] mt-1">Sent, opened, clicked, and replied emails over 7 days</p>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={emailEngagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="sent" stroke="#8fb39a" strokeWidth={2} name="Sent" />
              <Line type="monotone" dataKey="open" stroke="#8a94a6" strokeWidth={2} name="Opened" />
              <Line type="monotone" dataKey="click" stroke="#b39a6b" strokeWidth={2} name="Clicked" />
              <Line type="monotone" dataKey="reply" stroke="#9a89a3" strokeWidth={2} name="Replied" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Follow-up Success Rate */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Follow-up Success Rate</h3>
            <p className="text-xs text-[#888] mt-1">Conversion rate by follow-up attempt</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={followUpSuccessData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis dataKey="stage" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
                <Bar dataKey="success" fill="#8fb39a" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Emails vs Deals Closed */}
        <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-white">Emails Sent vs Deals Closed</h3>
            <p className="text-xs text-[#888] mt-1">Correlation between email activity and closed deals</p>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#a3a3a3]">Emails Sent (This Week)</span>
                <span className="text-lg font-bold text-primary">127</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#a3a3a3]">Deals Closed (This Week)</span>
                <span className="text-lg font-bold text-success">12</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: '31%' }}></div>
              </div>
            </div>
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-[#888] mb-2">Email to Close Ratio</p>
              <p className="text-2xl font-bold text-warning">10.6:1</p>
              <p className="text-xs text-success mt-1">Industry avg: 12:1 (You're 11% above average)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">📊 Performance Insights</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-success/10 border border-success/30">
            <p className="text-xs text-success font-semibold uppercase tracking-wider mb-2">✓ Top Performer</p>
            <p className="text-sm text-[#b3b3b3]">Meeting Recap template is your most effective email (92% success)</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-xs text-warning font-semibold uppercase tracking-wider mb-2">⚠ Opportunity</p>
            <p className="text-sm text-[#b3b3b3]">Cold outreach emails need optimization. Current success: 42%</p>
          </div>
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-2">💡 Recommendation</p>
            <p className="text-sm text-[#b3b3b3]">Send follow-ups on Thursday-Friday for 12% higher response</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
