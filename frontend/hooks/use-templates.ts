import { useState, useEffect } from 'react';

export interface EmailTemplate {
  id: string;
  name: string;
  category: 'follow-up' | 'outreach' | 'closing' | 'general';
  subject: string;
  preview: string;
  usageCount: number;
  lastUsed: string | null;
  successRate: number;
  createdAt?: string;
}

const DEFAULT_TEMPLATES: EmailTemplate[] = [
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
  }
];

const STORAGE_KEY = 'salespulse_templates';

export function useTemplates() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_TEMPLATES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_TEMPLATES;
    } catch {
      return DEFAULT_TEMPLATES;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [templates]);

  const addTemplate = (newTemplate: Partial<EmailTemplate>) => {
    const template: EmailTemplate = {
      id: `tmpl_${Date.now()}`,
      name: newTemplate.name || 'New Template',
      category: newTemplate.category || 'general',
      subject: newTemplate.subject || '',
      preview: newTemplate.preview || '',
      createdAt: new Date().toISOString(),
      usageCount: 0,
      successRate: 0,
      lastUsed: null,
      ...newTemplate,
    };
    setTemplates(prev => [template, ...prev]);
    return template;
  };

  const updateTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setTemplates(prev =>
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    );
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  const incrementUsage = (id: string) => {
    setTemplates(prev =>
      prev.map(t => t.id === id
        ? { ...t, usageCount: (t.usageCount || 0) + 1, lastUsed: new Date().toLocaleDateString() }
        : t
      )
    );
  };

  return { templates, addTemplate, updateTemplate, deleteTemplate, incrementUsage };
}
