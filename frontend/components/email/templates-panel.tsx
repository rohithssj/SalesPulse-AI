'use client';

import { Copy, Edit, Trash2, Plus, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmailTemplate {
  id: string;
  name: string;
  category: 'follow-up' | 'outreach' | 'closing' | 'general';
  subject: string;
  preview: string;
  usageCount: number;
  lastUsed: string;
  successRate: number;
}

const emailTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Enterprise Follow-up',
    category: 'follow-up',
    subject: 'Quick Follow-up: Enterprise Plan Details',
    preview: 'Hi [Name], I wanted to follow up on your interest in our enterprise plan...',
    usageCount: 24,
    lastUsed: '2 days ago',
    successRate: 78
  },
  {
    id: '2',
    name: 'Cold Outreach - Tech',
    category: 'outreach',
    subject: 'Quick Question About Tech Stack',
    preview: 'Hi [Name], I noticed [Company] is scaling their engineering team...',
    usageCount: 15,
    lastUsed: '4 days ago',
    successRate: 42
  },
  {
    id: '3',
    name: 'Closing Proposal',
    category: 'closing',
    subject: 'Your Custom Solution Ready - Next Steps',
    preview: 'Hi [Name], We\'ve prepared your custom solution package...',
    usageCount: 8,
    lastUsed: '1 week ago',
    successRate: 85
  },
  {
    id: '4',
    name: 'Meeting Recap',
    category: 'general',
    subject: 'Thank You - Meeting Recap & Action Items',
    preview: 'Hi [Name], Thank you for taking the time to meet...',
    usageCount: 31,
    lastUsed: 'today',
    successRate: 92
  },
  {
    id: '5',
    name: 'Re-engagement Campaign',
    category: 'follow-up',
    subject: 'We Miss You - Special Offer Inside',
    preview: 'Hi [Name], It\'s been a while since we last spoke...',
    usageCount: 12,
    lastUsed: '3 days ago',
    successRate: 58
  },
  {
    id: '6',
    name: 'Pricing Discussion',
    category: 'outreach',
    subject: 'Pricing Options That Fit Your Budget',
    preview: 'Hi [Name], Based on your requirements, here are pricing options...',
    usageCount: 19,
    lastUsed: '5 days ago',
    successRate: 72
  }
];

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'follow-up':
      return 'bg-primary/10 text-primary border-primary/30';
    case 'outreach':
      return 'bg-secondary/10 text-secondary border-secondary/30';
    case 'closing':
      return 'bg-success/10 text-success border-success/30';
    default:
      return 'bg-white/10 text-[#a3a3a3] border-white/30';
  }
};

export function TemplatesPanel() {
  const categories = ['all', 'follow-up', 'outreach', 'closing', 'general'];
  const active = 'all';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Templates Library</h3>
          <p className="text-sm text-[#888] mt-1">6 templates in your library</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#1a1a1a] border border-[#2a2a2a] p-1 rounded-lg">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat}
              value={cat}
              className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-3 mt-6">
            {emailTemplates
              .filter((template) => cat === 'all' || template.category === cat)
              .map((template) => (
                <Card
                  key={template.id}
                  className="glass luxury-panel border-[#2a2a2a] hover:border-white/30 p-4 transition-all duration-300 group lift-hover"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-white">{template.name}</h4>
                          <p className="text-xs text-[#a3a3a3] mt-1 font-medium">{template.subject}</p>
                          <p className="text-xs text-[#888] mt-1 line-clamp-1">{template.preview}</p>
                        </div>
                        <Badge className={`flex-shrink-0 text-xs ${getCategoryColor(template.category)} border`}>
                          <Tag className="w-3 h-3 mr-1" />
                          {template.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-3">
                        <div className="flex items-center gap-4 text-xs text-[#888]">
                          <span>📊 Used {template.usageCount}x</span>
                          <span>Last: {template.lastUsed}</span>
                          <span className="text-success font-semibold">
                            ✓ {template.successRate}% success rate
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-1 bg-white/10 hover:bg-white/20 text-[#a3a3a3] border border-white/20"
                          >
                            <Copy className="w-3 h-3" />
                            Use
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 bg-white/10 hover:bg-white/20 text-[#a3a3a3] border border-white/20"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
          </TabsContent>
        ))}
      </Tabs>

      <Card className="glass rounded-xl p-6 border border-white/10 bg-white/[0.01]">
        <h4 className="text-sm font-semibold text-white mb-4">Template Performance</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">6</div>
            <p className="text-xs text-[#888] mt-2">Total Templates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">109</div>
            <p className="text-xs text-[#888] mt-2">Total Uses</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">72%</div>
            <p className="text-xs text-[#888] mt-2">Avg Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">3</div>
            <p className="text-xs text-[#888] mt-2">Most Used</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
