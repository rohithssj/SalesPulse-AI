'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, Search, TrendingUp, AlertCircle, Mail, Calendar, Download, Loader2 } from 'lucide-react';
import { fetchCompleteData, normalizeActivities, extractSignalsFromActivities } from '@/lib/api';

// Signal types and data
const signalTypes = ['All', 'Proposal Request', 'Email Engagement', 'Price Inquiry', 'Decision Signal', 'Budget Allocated', 'Meeting Scheduled'];
const severityLevels = ['All', 'Critical', 'High', 'Medium', 'Low'];
const confidenceRanges = ['All', '90%+', '75-90%', '50-75%', '<50%'];

const getSeverityColor = (severity: string) => {
  switch (severity?.toLowerCase()) {
    case 'critical':
      return 'bg-red-500/10 text-red-500 border-red-500/30';
    case 'high':
      return 'bg-warning/10 text-warning border-warning/30';
    case 'medium':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
    case 'low':
      return 'bg-success/10 text-success border-success/30';
    default:
      return 'bg-white/10 text-white border-white/30';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 90) return 'text-success';
  if (confidence >= 75) return 'text-primary';
  if (confidence >= 50) return 'text-warning';
  return 'text-red-500';
};

export function SignalsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedSeverity, setSelectedSeverity] = useState('All');
  const [selectedConfidence, setSelectedConfidence] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompleteData().then((res) => {
      setData(res || {});
      setLoading(false);
    });
  }, []);

  const { signals, timeline } = useMemo(() => {
    if (!data) return { signals: [], timeline: [] };
    const acts = normalizeActivities(data);
    
    // Use API signals if present, otherwise extract from activities
    let resolvedSignals = Array.isArray(data.signals) && data.signals.length > 0 
      ? data.signals 
      : extractSignalsFromActivities(acts);
    
    // Provide some default dummy timeline if not present
    let resTimeline = [
      { date: 'Jan 1', count: 3 },
      { date: 'Jan 8', count: 8 },
      { date: 'Jan 15', count: 5 },
      { date: 'Jan 22', count: 12 },
      { date: 'Jan 29', count: 10 },
      { date: 'Feb 5', count: 15 },
      { date: 'Feb 12', count: 18 },
    ];
    
    return { signals: resolvedSignals, timeline: resTimeline };
  }, [data]);

  const filteredSignals = signals.filter((signal: any) => {
    const typeMatch = selectedType === 'All' || signal.type === selectedType;
    const severityMatch = selectedSeverity === 'All' || signal.severity === selectedSeverity;
    const confidenceMatch = selectedConfidence === 'All' || (
      selectedConfidence === '90%+' ? signal.confidence >= 90 :
      selectedConfidence === '75-90%' ? signal.confidence >= 75 && signal.confidence < 90 :
      selectedConfidence === '50-75%' ? signal.confidence >= 50 && signal.confidence < 75 :
      signal.confidence < 50
    );
    const queryMatch = signal.account.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       signal.detail.toLowerCase().includes(searchQuery.toLowerCase());

    return typeMatch && severityMatch && confidenceMatch && queryMatch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Buying Signals</h1>
          <p className="text-sm text-[#888] mt-1">AI-detected signals indicating buying intent and decision progress</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Total Signals</p>
          <p className="text-2xl font-bold text-white">{signals.length}</p>
          <p className="text-xs text-success mt-2">↑ 3 this week</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Critical</p>
          <p className="text-2xl font-bold text-red-500">{signals.filter((s: any) => s.severity === 'Critical' || s.severity?.toLowerCase() === 'high').length}</p>
          <p className="text-xs text-[#888] mt-2">Require action</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-primary">{signals.length ? Math.round(signals.reduce((a: number, b: any) => a + (b.confidence || 85), 0) / signals.length) : 0}%</p>
          <p className="text-xs text-[#888] mt-2">High quality</p>
        </Card>
        <Card className="glass luxury-panel border-[#2a2a2a] p-4 rounded-lg">
          <p className="text-xs text-[#888] uppercase tracking-wider mb-1">Response Rate</p>
          <p className="text-2xl font-bold text-success">73%</p>
          <p className="text-xs text-success mt-2">↑ Above average</p>
        </Card>
      </div>

      {/* Signals Trend Chart */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <h3 className="text-sm font-semibold text-white mb-4">Signals Detected Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="date" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="count" stroke="#8fb39a" strokeWidth={2} dot={{ fill: '#8fb39a', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Filters */}
      <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-lg">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#666]" />
            <Input
              placeholder="Search signals, accounts, contacts..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-[#666] h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter buttons */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">Signal Type</label>
              <div className="flex flex-wrap gap-2">
                {signalTypes.map((type) => (
                  <Button
                    key={type}
                    size="sm"
                    variant={selectedType === type ? 'default' : 'outline'}
                    className={`text-xs ${selectedType === type ? 'bg-primary text-white border-primary' : 'border-white/20'}`}
                    onClick={() => setSelectedType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">Severity</label>
                <div className="flex flex-wrap gap-2">
                  {severityLevels.map((level) => (
                    <Button
                      key={level}
                      size="sm"
                      variant={selectedSeverity === level ? 'default' : 'outline'}
                      className={`text-xs ${selectedSeverity === level ? 'bg-warning text-white border-warning' : 'border-white/20'}`}
                      onClick={() => setSelectedSeverity(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block mb-2">Confidence</label>
                <div className="flex flex-wrap gap-2">
                  {confidenceRanges.map((range) => (
                    <Button
                      key={range}
                      size="sm"
                      variant={selectedConfidence === range ? 'default' : 'outline'}
                      className={`text-xs ${selectedConfidence === range ? 'bg-success text-white border-success' : 'border-white/20'}`}
                      onClick={() => setSelectedConfidence(range)}
                    >
                      {range}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Signals List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white">
          {filteredSignals.length} Signal{filteredSignals.length !== 1 ? 's' : ''} Found
        </h3>
        {filteredSignals.length === 0 ? (
          <Card className="glass luxury-panel border-[#2a2a2a] p-12 rounded-lg text-center">
            <AlertCircle className="w-8 h-8 text-[#666] mx-auto mb-2" />
            <p className="text-[#888]">No signals match your filter criteria</p>
          </Card>
        ) : (
          filteredSignals.map((signal: any) => (
            <Card key={signal.id} className="glass luxury-panel border-[#2a2a2a] p-5 rounded-lg hover:border-white/20 transition-colors cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-1">{signal.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-semibold text-white">{signal.type || signal.signal}</h4>
                        <Badge className={`text-[10px] ${getSeverityColor(signal.severity)} border`}>
                          {signal.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#b3b3b3] font-medium">{signal.account}</p>
                      <p className="text-sm text-[#888] mt-1">{signal.detail}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-[#666]">👤 {signal.contact}</span>
                        <span className="text-xs text-[#666]">🕐 {signal.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="mb-4">
                    <p className={`text-lg font-bold ${getConfidenceColor(signal.confidence || 85)}`}>{signal.confidence || 85}%</p>
                    <p className="text-xs text-[#888]">Confidence</p>
                  </div>
                  <Button size="sm" className="gap-1 bg-primary hover:bg-primary/90 text-white text-xs h-8">
                    <Mail className="w-3 h-3" />
                    Reply
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
