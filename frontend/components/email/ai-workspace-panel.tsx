'use client';

import { useState, useEffect } from 'react';
import { Copy, RotateCw, WandIcon, Download, Save, Loader2 } from 'lucide-react';
import { fetchAccountBrief, fetchStrategy, fetchEmail } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface ConversationSummary {
  lastInteractionDate: string;
  emailCount: number;
  buyingSignals: string[];
  keyPoints: string[];
  engagementLevel: 'high' | 'medium' | 'low';
}

interface GeneratedEmail {
  id: string;
  type: 'follow-up' | 'cold-outreach' | 'meeting-recap' | 'proposal' | 're-engagement';
  subject: string;
  content: string;
  tone: 'formal' | 'friendly' | 'persuasive';
}

const conversationData: ConversationSummary = {
  lastInteractionDate: '2 days ago',
  emailCount: 8,
  buyingSignals: [
    'Requested pricing for enterprise plan',
    'Asked about API integrations',
    'Inquired about custom deployment',
    'Mentioned budget allocation'
  ],
  keyPoints: [
    'Primary decision maker: CFO Sarah Johnson',
    'Timeline: Looking to implement Q2 2026',
    'Pain point: Current system scalability issues',
    'Technical requirements: 99.99% uptime SLA',
    'Budget bracket: $500K - $1M annually'
  ],
  engagementLevel: 'high'
};

const emailTemplates: GeneratedEmail[] = [
  {
    id: '1',
    type: 'follow-up',
    subject: 'Quick Follow-up: Enterprise Plan Details',
    content: 'Hi Sarah,\n\nI wanted to follow up on your interest in our enterprise plan. Based on our previous conversation, I\'ve prepared some custom deployment options that align with your 99.99% uptime requirements.\n\nWould you be available for a brief 20-minute call this week to discuss implementation timelines?\n\nBest regards,\nAlex',
    tone: 'formal'
  },
  {
    id: '2',
    type: 'proposal',
    subject: 'Your Custom Enterprise Solution - Next Steps',
    content: 'Hi Sarah,\n\nThank you for your interest. Here\'s what we\'ve prepared for you:\n\n✓ Enterprise Plan ($650K/year)\n✓ Custom API integration (included)\n✓ Dedicated support team\n✓ 99.99% uptime SLA guarantee\n✓ Q2 2026 implementation timeline\n\nAttached is your proposal with full technical specifications. Ready to discuss?\n\nBest regards,\nAlex',
    tone: 'friendly'
  }
];

export function AIWorkspacePanel() {
  const [activeTab, setActiveTab] = useState('intel');
  const [emailData, setEmailData] = useState<any>(emailTemplates[0]);
  const [tone, setTone] = useState<'formal' | 'friendly' | 'persuasive'>('formal');
  const [emailType, setEmailType] = useState('follow-up');
  const [copied, setCopied] = useState(false);

  const [intelData, setIntelData] = useState<any>(conversationData);
  const [strategyData, setStrategyData] = useState<any>(null);
  
  const [loadingIntel, setLoadingIntel] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(true);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchAccountBrief().then(d => {
      if (mounted) {
        if (d && d.summary) setIntelData({ ...conversationData, ...d.summary });
        else if (d) setIntelData({ ...conversationData, ...d });
        setLoadingIntel(false);
      }
    });

    fetchStrategy().then(d => {
      if (mounted) {
        if (d) setStrategyData(d);
        setLoadingStrategy(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  const handleGenerate = async () => {
    setLoadingEmail(true);
    const res = await fetchEmail({ tone, type: emailType });
    if (res && res.email) {
      setEmailData({ subject: res.email.subject || 'Generated Email', content: res.email.body || res.email, type: emailType, tone });
    } else if (res) {
      setEmailData({ subject: 'Generated Email', content: typeof res === 'string' ? res : JSON.stringify(res), type: emailType, tone });
    }
    setLoadingEmail(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(emailData.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-success/10 text-success border-success/30';
      case 'medium': return 'bg-warning/10 text-warning border-warning/30';
      default: return 'bg-red-500/10 text-red-500 border-red-500/30';
    }
  };

  return (
    <Card className="glass luxury-panel border-[#2a2a2a] p-6 rounded-xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-[#1a1a1a] border border-[#2a2a2a] p-1 rounded-lg">
          <TabsTrigger
            value="intel"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            📊 Intel
          </TabsTrigger>
          <TabsTrigger
            value="generate"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            ✨ Generate
          </TabsTrigger>
          <TabsTrigger
            value="strategy"
            className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
          >
            🎯 Strategy
          </TabsTrigger>
        </TabsList>

        {/* Intel Tab */}
        <TabsContent value="intel" className="space-y-4 mt-6">
          {loadingIntel ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <h4 className="text-sm font-semibold text-white">Acme Corp - Account Summary</h4>
                  <p className="text-xs text-[#888] mt-1">Last interaction: {intelData?.lastInteractionDate || '2 days ago'}</p>
                </div>
                <Badge className={`${getEngagementColor(intelData?.engagementLevel || 'high')} border`}>
                  {(intelData?.engagementLevel || 'high') === 'high' ? '🔥 High Engagement' : 'Medium Engagement'}
                </Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                    Buying Signals Detected ({intelData?.buyingSignals?.length || 0})
                  </h5>
                  <div className="space-y-2">
                    {(intelData?.buyingSignals || []).map((signal: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm text-[#b3b3b3] p-2 rounded-lg bg-white/[0.02] border border-success/20"
                      >
                        <span className="text-success">✓</span>
                        {signal}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                    Key Discussion Points
                  </h5>
                  <div className="space-y-2">
                    {(intelData?.keyPoints || []).map((point: string, idx: number) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-sm text-[#b3b3b3] p-2 rounded-lg bg-white/[0.02]"
                      >
                        <span className="text-primary flex-shrink-0 mt-0.5">•</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                    <div className="text-xs text-[#888] mb-1">Email Interactions</div>
                    <div className="text-xl font-bold text-white">{intelData?.emailCount || 8}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                    <div className="text-xs text-[#888] mb-1">Days Since Last Touch</div>
                    <div className="text-xl font-bold text-white">{intelData?.daysSinceLastTouch || 2}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Generate Tab */}
        <TabsContent value="generate" className="space-y-4 mt-6">
          <div className="space-y-3 mb-4">
            <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block">
              Email Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['follow-up', 'cold-outreach', 'meeting-recap', 'proposal', 're-engagement'].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  className={`text-xs border-white/20 ${
                    emailType === type
                      ? 'bg-primary/20 border-primary/50 text-primary'
                      : 'text-[#888] hover:bg-white/5'
                  }`}
                  onClick={() => setEmailType(type)}
                >
                  {type.replace('-', ' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block">
              Tone
            </label>
            <div className="flex gap-2">
              {(['formal', 'friendly', 'persuasive'] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  onClick={() => setTone(t)}
                  className={`text-xs ${
                    tone === t
                      ? 'bg-white/10 border-white/30 text-white'
                      : 'bg-white/5 border-white/10 text-[#888] hover:bg-white/10'
                  }`}
                  variant="outline"
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block">
              Email Subject
            </label>
            <input
              type="text"
              value={emailData.subject}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-primary/50"
              readOnly
            />
          </div>

          <div className="space-y-3 relative">
            <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider block">
              Email Content
            </label>
            <div className="relative">
              {loadingEmail && (
                <div className="absolute inset-0 z-10 bg-[#121212]/50 flex items-center justify-center rounded-md backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <Textarea
                value={emailData.content}
                readOnly
                className="min-h-48 bg-white/5 border border-white/10 text-white text-sm resize-none relative z-0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleCopy}
              className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Copied!' : 'Copy Email'}
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={loadingEmail} className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <RotateCw className={`w-4 h-4 ${loadingEmail ? 'animate-spin' : ''}`} />
              Generate
            </Button>
            <Button size="sm" className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white">
              <Save className="w-4 h-4" />
              Save Template
            </Button>
          </div>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy" className="space-y-4 mt-6">
          {loadingStrategy ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-success/10 border border-success/30">
                <h4 className="text-sm font-semibold text-success mb-2">🎯 AI Recommendation</h4>
                <p className="text-sm text-[#b3b3b3]">
                  {strategyData?.recommendation || 'Send follow-up email now. High engagement signals detected. Decision maker (CFO Sarah Johnson) has shown strong interest in enterprise plan. Probability of close: 72%'}
                </p>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                  Suggested Email Objective
                </h5>
                <div className="p-3 rounded-lg bg-white/[0.02] border border-white/10">
                  <p className="text-sm text-[#b3b3b3]">
                    {strategyData?.objective || 'Request meeting to present custom deployment options and address technical requirements'}
                  </p>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-2">
                  Suggested Email Outline
                </h5>
                <ol className="space-y-2 text-sm text-[#b3b3b3]">
                  {(strategyData?.steps || [
                    'Acknowledge previous conversation & their requirements',
                    'Highlight custom deployment options matching their SLA',
                    'Mention Q2 2026 timeline alignment',
                    'Call-to-action: Request 20-min call this week'
                  ]).map((step: string, index: number) => (
                    <li key={index} className="flex gap-2">
                      <span className="text-primary flex-shrink-0">{index + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="pt-2">
                <Badge className="bg-success/10 text-success border-success/30 border">
                  ⚡ Priority: {strategyData?.priority || 'High (Close probability: 72%)'}
                </Badge>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
}
