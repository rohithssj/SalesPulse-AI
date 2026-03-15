'use client';

import { useState } from 'react';
import { Copy, Edit, Trash2, Plus, Tag, Check, X } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAccount } from '@/context/account-context';
import { generateAIContent } from '@/lib/aiGenerator';
import { GeneratedContentModal } from './generated-content-modal';
import { useTemplates, EmailTemplate } from '@/hooks/use-templates';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';

export function TemplatesPanel() {
  const { accounts, selectedAccountId } = useAccount();
  const selectedAccount = accounts.find(a => a.Id === selectedAccountId);
  const { templates, addTemplate, updateTemplate, deleteTemplate, incrementUsage } = useTemplates();
  const { copied: libraryCopied, copy: copyTemplate } = useCopyToClipboard();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  const categories = ['all', 'follow-up', 'outreach', 'closing', 'general'] as const;

  const handleUse = async (template: EmailTemplate) => {
    incrementUsage(template.id);
    setModalTitle(`Personalizing ${template.name}`);
    setModalContent('');
    setIsGenerating(true);
    setModalOpen(true);

    try {
      const content = await generateAIContent({
        type: 'email',
        accountId: selectedAccountId || undefined,
        accountName: selectedAccount?.Name || 'Account',
        stage: 'Evaluation',
        tone: 'Friendly',
        context: `Use the "${template.name}" email template as a base structure.
          Personalize it for ${selectedAccount?.Name || 'the account'}.
          Replace all placeholder variables: 
          [Name] → ${selectedAccount?.Name || 'Contact'},
          [Company] → ${selectedAccount?.Name || 'Company'},
          [Product] → SalesPulse AI platform.
          Template base: ${template.preview}.
          Adapt the tone to be friendly and make it feel genuinely written for this specific account.
          Reference their industry (${selectedAccount?.Industry || 'technology'}) if relevant.`
      });

      setModalContent(content || template.preview);
    } catch (err) {
      setModalContent('Failed to personalize template. Using default preview.\n\n' + template.preview);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate({ ...template });
    setEditModalOpen(true);
  };

  const handleNew = () => {
    setEditingTemplate({
      id: '',
      name: '',
      category: 'general',
      subject: '',
      preview: '',
      usageCount: 0,
      lastUsed: 'Never',
      successRate: 0
    });
    setEditModalOpen(true);
  };

  const handleSave = () => {
    if (editingTemplate) {
      if (editingTemplate.id) {
        updateTemplate(editingTemplate.id, editingTemplate);
      } else {
        addTemplate(editingTemplate);
      }
      setEditModalOpen(false);
      setEditingTemplate(null);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'follow-up': return 'bg-primary/10 text-primary border-primary/30';
      case 'outreach': return 'bg-secondary/10 text-secondary border-secondary/30';
      case 'closing': return 'bg-success/10 text-success border-success/30';
      default: return 'bg-white/10 text-[#a3a3a3] border-white/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Email Templates Library</h3>
          <p className="text-sm text-[#888] mt-1">{templates.length} templates in your library</p>
        </div>
        <Button onClick={handleNew} className="gap-2 bg-primary hover:bg-primary/90 text-white">
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
            {templates
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
                          <span>Last: {template.lastUsed || 'Never'}</span>
                          <span className="text-success font-semibold">
                            ✓ {template.successRate}% success rate
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUse(template)}
                            className="gap-1 bg-white/10 hover:bg-white/20 text-[#a3a3a3] border border-white/20"
                          >
                            <Copy className="w-3 h-3" />
                            Use
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => copyTemplate(template.preview)}
                            className="gap-1 bg-white/10 hover:bg-white/20 text-[#a3a3a3] border border-white/20"
                          >
                            <Copy className="w-3 h-3" />
                            {libraryCopied ? '✓ Copied!' : 'Copy'}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEdit(template)}
                            className="gap-1 bg-white/10 hover:bg-white/20 text-[#a3a3a3] border border-white/20"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
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

      {/* Basic Edit Modal */}
      {editModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a2e] border border-white/10 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
              <h3 className="text-lg font-bold text-white">{editingTemplate.id ? 'Edit Template' : 'New Template'}</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditModalOpen(false)} className="text-[#888] hover:text-white">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1 block">Name</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  placeholder="Template Name"
                  value={editingTemplate.name}
                  onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1 block">Category</label>
                <select 
                  className="w-full bg-[#1a1a2e] border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  value={editingTemplate.category}
                  onChange={e => setEditingTemplate({...editingTemplate, category: e.target.value as any})}
                >
                  <option value="follow-up">Follow-up</option>
                  <option value="outreach">Outreach</option>
                  <option value="closing">Closing</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1 block">Subject</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                  placeholder="Email Subject"
                  value={editingTemplate.subject}
                  onChange={e => setEditingTemplate({...editingTemplate, subject: e.target.value})}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#a3a3a3] uppercase tracking-wider mb-1 block">Content</label>
                <textarea 
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white min-h-[150px] focus:outline-none focus:border-primary/50 resize-none"
                  placeholder="Hi [Name], ..."
                  value={editingTemplate.preview}
                  onChange={e => setEditingTemplate({...editingTemplate, preview: e.target.value})}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold">Save Template</Button>
              <Button onClick={() => setEditModalOpen(false)} className="flex-1 bg-white/5 hover:bg-white/10 text-white border border-white/10">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      <GeneratedContentModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        content={modalContent}
        isLoading={isGenerating}
      />

      <Card className="glass rounded-xl p-6 border border-white/10 bg-white/[0.01]">
        <h4 className="text-sm font-semibold text-white mb-4">Template Performance</h4>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{templates.length}</div>
            <p className="text-xs text-[#888] mt-2">Total Templates</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success">
              {templates.reduce((acc, t) => acc + (t.usageCount || 0), 0)}
            </div>
            <p className="text-xs text-[#888] mt-2">Total Uses</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">
              {templates.length > 0 ? Math.round(templates.reduce((acc, t) => acc + (t.successRate || 0), 0) / templates.length) : 0}%
            </div>
            <p className="text-xs text-[#888] mt-2">Avg Success Rate</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">
              {templates.length > 0 ? templates.reduce((max, t) => t.usageCount > max.usageCount ? t : max, templates[0]).name.split(' ')[0] : '-'}
            </div>
            <p className="text-xs text-[#888] mt-2">Top Performer</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
