'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Target, Zap, Mail, Activity } from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const pipelineData = [
  { stage: 'Prospecting', value: 320000, deals: 8 },
  { stage: 'Discovery', value: 520000, deals: 6 },
  { stage: 'Proposal', value: 880000, deals: 5 },
  { stage: 'Negotiation', value: 640000, deals: 4 },
];

const signalsTrendData = [
  { date: 'Mon', signals: 5 },
  { date: 'Tue', signals: 8 },
  { date: 'Wed', signals: 6 },
  { date: 'Thu', signals: 12 },
  { date: 'Fri', signals: 9 },
  { date: 'Sat', signals: 4 },
  { date: 'Sun', signals: 7 },
];

const recentActivity = [
  { id: '1', type: 'signal', title: 'Proposal Request', account: 'Acme Corp', time: '2h ago', severity: 'high' },
  { id: '2', type: 'deal', title: 'Deal Health Updated', account: 'TechFlow Inc', time: '4h ago', severity: 'medium' },
  { id: '3', type: 'email', title: 'Follow-up Sent', account: 'CloudBase Systems', time: '6h ago', severity: 'low' },
  { id: '4', type: 'alert', title: 'High Risk Deal', account: 'DataSync Ltd', time: '8h ago', severity: 'critical' },
];

export default function EnhancedDashboard() {
  const totalPipelineValue = pipelineData.reduce((sum, item) => sum + item.value, 0);
  const totalDeals = pipelineData.reduce((sum, item) => sum + item.deals, 0);

  return (
    <main className="min-h-screen bg-black text-white pt-[67px]">
        <div className="relative min-h-screen">
          {/* Background Grid & Orbs */}
          <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
          <div className="fixed top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-white/[0.05] blur-[130px] pointer-events-none lux-orb" />

          {/* Content */}
          <div className="relative z-10 px-8 py-12 max-w-7xl">
            {/* Header */}
            <div className="mb-12 animate-fade-up-soft">
              <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-[#a3a3a3]">Real-time pipeline intelligence and AI-powered insights</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
                <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Total Pipeline Value</p>
                <div className="text-3xl font-bold text-primary mt-3">${(totalPipelineValue / 1000000).toFixed(2)}M</div>
                <p className="text-xs text-success mt-2">↑ 12.5% from last month</p>
              </Card>

              <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
                <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Active Deals</p>
                <div className="text-3xl font-bold text-secondary mt-3">{totalDeals}</div>
                <p className="text-xs text-success mt-2">3 closing this month</p>
              </Card>

              <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
                <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Buying Signals</p>
                <div className="text-3xl font-bold text-warning mt-3">23</div>
                <p className="text-xs text-success mt-2">↑ 8 detected this week</p>
              </Card>

              <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
                <p className="text-xs text-[#888] font-medium uppercase tracking-wider">Avg Deal Health</p>
                <div className="text-3xl font-bold text-success mt-3">72%</div>
                <p className="text-xs text-warning mt-2">2 high-risk deals</p>
              </Card>
            </div>

            {/* Alerts & Charts */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              {/* High Risk Alert */}
              <Card className="glass luxury-panel border-red-500/30 bg-red-500/5 p-6 rounded-lg col-span-1">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">High-Risk Deal</h3>
                    <p className="text-xs text-[#a3a3a3] mb-3">DataSync Ltd • Deal health: 28%</p>
                    <Button size="sm" className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30">
                      Review Deal
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Deals Needing Follow-up */}
              <Card className="glass luxury-panel border-warning/30 bg-warning/5 p-6 rounded-lg col-span-1">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-warning flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Follow-up Needed</h3>
                    <p className="text-xs text-[#a3a3a3] mb-3">5 deals need email follow-up</p>
                    <Button size="sm" className="w-full bg-warning/20 hover:bg-warning/30 text-warning border border-warning/30">
                      <Mail className="w-3 h-3 mr-1" />
                      Generate Emails
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Signals This Week */}
              <Card className="glass luxury-panel border-primary/30 bg-primary/5 p-6 rounded-lg col-span-1">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">Signals This Week</h3>
                    <p className="text-xs text-[#a3a3a3] mb-3">51 buying signals detected</p>
                    <Button size="sm" className="w-full bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30">
                      View All
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Pipeline Distribution */}
              <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-4">Pipeline by Stage</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pipelineData} dataKey="value" nameKey="stage" cx="50%" cy="50%" outerRadius={80}>
                        <Cell fill="#8fb39a" />
                        <Cell fill="#8a94a6" />
                        <Cell fill="#b39a6b" />
                        <Cell fill="#9a89a3" />
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Signals Trend */}
              <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
                <h3 className="text-sm font-semibold text-white mb-4">Signals Detected This Week</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={signalsTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                      <XAxis dataKey="date" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a' }} />
                      <Line type="monotone" dataKey="signals" stroke="#8fb39a" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Recent Activity Feed */}
            <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/10 hover:border-white/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        activity.severity === 'critical' ? 'bg-red-500' :
                        activity.severity === 'high' ? 'bg-warning' :
                        activity.severity === 'medium' ? 'bg-primary' :
                        'bg-success'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium">{activity.title}</p>
                        <p className="text-xs text-[#888]">{activity.account}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[#666] flex-shrink-0">{activity.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
    </main>
  );
}
