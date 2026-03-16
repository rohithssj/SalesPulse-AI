'use client';

import { useState, useEffect } from 'react';
import { Copy, RotateCw, WandIcon, Download, Save, Loader2 } from 'lucide-react';
import { fetchAccountBrief } from '@/lib/api';
import { generateAIContent, GenerationType } from '@/lib/aiGenerator';
import { useAccount } from '@/context/AccountContext';
import { useDataSource } from '@/context/DataSourceContext';
import { GeneratedContentModal } from './generated-content-modal';
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

import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

const CONTENT_LABELS: Record<string, { title: string; subtitle: (name: string) => string }> = {
  'follow-up': {
    title: '📧 Follow-up Email',
    subtitle: (name) => `Personalized follow-up for ${name}`
  },
  'cold-outreach': {
    title: '🌐 Cold Outreach',
    subtitle: (name) => `Strategic outreach to ${name}`
  },
  'meeting-recap': {
    title: '📋 Meeting Summary',
    subtitle: (name) => `Meeting recap document for ${name}`
  },
  'proposal': {
    title: '📄 Sales Proposal',
    subtitle: (name) => `Custom proposal for ${name}`
  },
  're-engagement': {
    title: '🔄 Re-engagement Email',
    subtitle: (name) => `Re-engagement outreach for ${name}`
  }
};

export function AIWorkspacePanel() {
  const { isUploadMode, globalData, selectedAccount, getSelectedAccountDeals, getSelectedAccountSignals, switchToSalesforce } = useDataSource();
  const selectedAccountId = selectedAccount?.id;
  const { copied, copy } = useCopyToClipboard();
  const [activeTab, setActiveTab] = useState('intel');
  
  const [tone, setTone] = useState<'formal' | 'friendly' | 'persuasive'>('formal');
  const [emailType, setEmailType] = useState('follow-up');

  // New state from prompt for Generate tab
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSubject, setGeneratedSubject] = useState('');
  const [generatedBody, setGeneratedBody] = useState('');
  const [emailData, setEmailData] = useState<any>({ subject: '', content: '' });

  const [intelData, setIntelData] = useState<any>(null);
  const [strategyData, setStrategyData] = useState<any>(null);
  
  const [loadingIntel, setLoadingIntel] = useState(true);
  const [loadingStrategy, setLoadingStrategy] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);

  useEffect(() => {
    if (!selectedAccountId || isUploadMode) {
      if (isUploadMode && globalData && selectedAccount) {
        setIntelData({
          lastInteractionDate: selectedAccount.lastActivity,
          emailCount: 5,
          daysSinceLastTouch: 1,
          engagementLevel: selectedAccount.engagementLevel.toLowerCase(),
          buyingSignals: selectedAccount.buyingSignals,
          keyPoints: ['Interest in Enterprise', 'Budget discussions']
        });
        setLoadingIntel(false);
      }
      return;
    }
    setLoadingIntel(true);
    fetchAccountBrief(selectedAccountId).then(d => {
      if (d) setIntelData(d);
      setLoadingIntel(false);
    });
  }, [selectedAccountId, isUploadMode, globalData, selectedAccount]);

  useEffect(() => {
    if (activeTab === 'strategy' && !strategyData && selectedAccountId) {
      setLoadingStrategy(true);
      
      const deals = getSelectedAccountDeals();
      const topDeal = deals[0];

      generateAIContent({ 
        type: 'strategy',
        accountId: selectedAccountId || undefined,
        accountName: selectedAccount?.name || 'Account',
        stage: topDeal?.stage || 'Qualification'
      }).then((content: string) => {
        setStrategyData({
          recommendation: content.substring(0, 150) + '...',
          winProbability: topDeal?.probability || 65,
          healthGrade: 'A',
          priorities: [
            { title: "Review AI Plan", desc: "Follow AI strategy guidance", badge: "🟡 High", color: "warning" }
          ],
          checklist: ['Execute strategy']
        });
        setLoadingStrategy(false);
      }).catch(err => {
        console.error("Strategy generation failed", err);
        setLoadingStrategy(false);
      });
    }
  }, [activeTab, selectedAccountId, strategyData, selectedAccount]);

  const emailTypeMap: Record<string, GenerationType> = {
    'follow-up':     'followup',
    'followup':      'followup',
    'cold-outreach': 'email',
    'meeting-recap': 'meetingPrep',
    'proposal':      'proposal',
    're-engagement': 'reengagement',
    'reengagement':  'reengagement',
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedSubject('');
    setGeneratedBody('');

    const deals   = getSelectedAccountDeals();
    const signals = getSelectedAccountSignals();
    const topDeal = deals[0];

    const genType: GenerationType =
      emailTypeMap[emailType?.toLowerCase() || 'followup'] || 'followup';

    console.log(`[EmailAIWorkspace] Generating ${genType} for ${selectedAccount?.name}`);

    try {
      const content = await generateAIContent({
        type:        genType,
        accountId:   selectedAccount?.id || selectedAccountId,
        accountName: selectedAccount?.name || 'Account',
        contactName: selectedAccount?.primaryContact || topDeal?.contact || 'Contact',
        stage:       topDeal?.stage || 'Qualification',
        value:       topDeal?.formattedValue || topDeal?.value?.toString() || '$0',
        probability: topDeal?.probability || 65,
        daysLeft:    topDeal?.daysLeft || 30,
        signals,
        industry:    selectedAccount?.industry || 'Technology',
        tone:        tone || 'Formal',
        dealName:    topDeal?.name || '',
      });

      console.log(`[EmailAIWorkspace] Got content length: ${content.length}`);

      const subjectMatch = content.match(/^Subject:\s*(.+)$/im);
      if (subjectMatch) {
        setGeneratedSubject(subjectMatch[1].trim());
        const bodyWithoutSubject = content
          .replace(/^Subject:\s*.+\n?/im, '')
          .trim();
        setGeneratedBody(bodyWithoutSubject);
      } else {
        const subjectMap: Record<string, string> = {
          followup:    `Following up — ${selectedAccount?.name || 'Account'}`,
          email:       `Connecting with ${selectedAccount?.name || 'Account'}`,
          proposal:    `Proposal for ${selectedAccount?.name || 'Account'}`,
          meetingPrep: `Meeting recap — ${selectedAccount?.name || 'Account'}`,
          reengagement:`Reconnecting — ${selectedAccount?.name || 'Account'}`,
        };
        setGeneratedSubject(subjectMap[genType] || `Email — ${selectedAccount?.name}`);
        setGeneratedBody(content);
      }
    } catch (err) {
      console.error('Email generation failed:', err);
      setGeneratedSubject('Generation Failed');
      setGeneratedBody('Failed to generate content. Please try again.');
    }

    setIsGenerating(false);
  };

  const onTypeChange = (type: string) => {
    setEmailType(type);
    setGeneratedSubject('');
    setGeneratedBody('');
  };

  const handleCopy = () => {
    copy(emailData.content);
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
          ) : !intelData ? (
             <p style={{ color: '#6b7280', fontSize: '13px' }}>
                Select an account to view intelligence.
             </p>
          ) : (
             <div>
                {/* Account header */}
                <div style={{ display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: '12px' }}>
                  <p style={{ color: '#f9fafb', fontSize: '14px',
                    fontWeight: 600, margin: 0 }}>
                    {selectedAccount?.name || "Account"}
                  </p>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    padding: '3px 10px', borderRadius: '20px',
                    background: (intelData.engagementLevel || 'high') === 'high'   ? '#14532d'
                      : (intelData.engagementLevel || 'high') === 'medium' ? '#92400e' : '#1e3a5f',
                    color: (intelData.engagementLevel || 'high') === 'high'   ? '#86efac'
                      : (intelData.engagementLevel || 'high') === 'medium' ? '#fde68a' : '#93c5fd',
                  }}>
                    {intelData.engagementLevel || 'high'} Engagement
                  </span>
                </div>

                {/* Summary */}
                <p style={{ color: '#d1d5db', fontSize: '13px',
                  lineHeight: '1.7', margin: '0 0 14px' }}>
                  {intelData.summary || `Last interaction was ${intelData.lastInteractionDate || 'recently'}. Mapped ${intelData.emailCount || 0} recent interactions highlighting key requirements.`}
                </p>

                {/* Buying signals */}
                {intelData.buyingSignals && intelData.buyingSignals.length > 0 && (
                  <div style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#6b7280', fontSize: '11px',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      margin: '0 0 6px', fontWeight: 600 }}>
                      BUYING SIGNALS DETECTED ({intelData.buyingSignals.length})
                    </p>
                    {intelData.buyingSignals.map((s: string, i: number) => (
                      <div key={i} style={{ display: 'flex',
                        alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                        <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>
                        <span style={{ color: '#d1d5db', fontSize: '13px' }}>{s}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key discussion points */}
                {intelData.keyPoints && intelData.keyPoints.length > 0 && (
                  <div>
                    <p style={{ color: '#6b7280', fontSize: '11px',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      margin: '0 0 6px', fontWeight: 600 }}>
                      KEY DISCUSSION POINTS
                    </p>
                    {intelData.keyPoints.map((p: string, i: number) => (
                      <div key={i} style={{ display: 'flex',
                        gap: '8px', marginBottom: '4px' }}>
                        <span style={{ color: '#6366f1', flexShrink: 0 }}>•</span>
                        <span style={{ color: '#d1d5db', fontSize: '13px' }}>{p}</span>
                      </div>
                    ))}
                  </div>
                )}
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
                  onClick={() => onTypeChange(type)}
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
              {CONTENT_LABELS[emailType]?.title || 'Generated Content'}
            </label>
            <p className="text-xs text-[#888] -mt-2">
              {CONTENT_LABELS[emailType]?.subtitle(selectedAccount?.name || 'Account') || 'AI generated content'}
            </p>
            <input
              type="text"
              value={generatedSubject}
              onChange={e => setGeneratedSubject(e.target.value)}
              placeholder="Subject will appear here..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-[#666] focus:outline-none focus:border-primary/50"
              readOnly={isGenerating}
            />
          </div>

          <div className="space-y-3 relative">
            <div className="relative">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-[#121212]/50 flex items-center justify-center rounded-md backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              )}
              <textarea
                value={generatedBody}
                onChange={e => setGeneratedBody(e.target.value)}
                placeholder={isGenerating
                  ? '⟳ Generating content...'
                  : 'Generated content will appear here...'}
                readOnly={isGenerating}
                className="w-full min-h-48 bg-white/5 border border-white/10 text-white text-sm resize-none rounded-lg p-3 focus:outline-none focus:border-primary/50 relative z-0"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => {
                const full = generatedSubject
                  ? `Subject: ${generatedSubject}\n\n${generatedBody}`
                  : generatedBody;
                navigator.clipboard.writeText(full);
                copy(full);
              }}
              disabled={!generatedBody}
              className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Copy className="w-4 h-4" />
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </Button>
            <Button size="sm" onClick={handleGenerate} disabled={isGenerating} className="flex-1 gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/20">
              <RotateCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? '⟳ Generating...' : '↻ Generate'}
            </Button>
            <Button 
              size="sm" 
              className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-white"
              disabled={!generatedBody}
              onClick={() => {
                if (!generatedBody) return;
                const key = 'salespulse_templates';
                const existing = JSON.parse(localStorage.getItem(key) || '[]');
                const newTemplate = {
                  id:          `tmpl_${Date.now()}`,
                  name:        generatedSubject || `${emailType} template`,
                  subject:     generatedSubject,
                  body:        generatedBody,
                  category:    emailType || 'general',
                  createdAt:   new Date().toISOString(),
                  usageCount:  0,
                };
                localStorage.setItem(key, JSON.stringify([newTemplate, ...existing]));
                alert('Template saved!');
              }}
            >
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
