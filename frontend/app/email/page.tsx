'use client';

import { Mail, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailAlertsPanel } from '@/components/email/email-alerts-panel';
import { AIWorkspacePanel } from '@/components/email/ai-workspace-panel';
import { SignalsPanel } from '@/components/email/signals-panel';
import { TemplatesPanel } from '@/components/email/templates-panel';
import { DealDetailEmailPanel } from '@/components/email/deal-detail-email-panel';
import { EmailAnalyticsPanel } from '@/components/email/email-analytics-panel';

export default function EmailWorkspacePage() {
  return (
    <main className="pt-[67px] min-h-screen">
      <div className="relative min-h-screen">
        {/* Background Grid & Orbs */}
        <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '80px 80px' }} />
        <div className="fixed top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-white/[0.05] blur-[130px] pointer-events-none lux-orb" />
        <div className="fixed bottom-1/3 left-1/4 w-[420px] h-[420px] rounded-full bg-white/[0.04] blur-[110px] pointer-events-none lux-orb" style={{ animationDelay: '1.8s' }} />

        {/* Main Content */}
        <div className="relative z-10 max-w-screen-2xl mx-auto px-8 py-12">
          {/* Page Header */}
          <div className="mb-12 max-w-3xl animate-fade-up-soft">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-6 h-6 text-primary" />
              <h1 className="text-4xl font-bold text-white">Email Command Center</h1>
            </div>
            <p className="text-lg text-[#a3a3a3] leading-relaxed">
              AI-powered email generation, engagement tracking, and intelligent follow-up management for your entire pipeline
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-[#0f0f0f] border border-[#2a2a2a] p-1 rounded-lg mb-8 sticky top-[75px] z-30">
              <TabsTrigger
                value="dashboard"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                📋 Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="workspace"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                ✨ AI Workspace
              </TabsTrigger>
              <TabsTrigger
                value="signals"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                🔥 Signals
              </TabsTrigger>
              <TabsTrigger
                value="templates"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                📁 Templates
              </TabsTrigger>
              <TabsTrigger
                value="deal-detail"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                💼 Deal Details
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="text-xs font-semibold data-[state=active]:bg-white/10 data-[state=active]:text-white text-[#888]"
              >
                📊 Analytics
              </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="dashboard" className="animate-fade-up-soft">
              <EmailAlertsPanel />
            </TabsContent>

            <TabsContent value="workspace" className="animate-fade-up-soft">
              <AIWorkspacePanel />
            </TabsContent>

            <TabsContent value="signals" className="animate-fade-up-soft">
              <SignalsPanel />
            </TabsContent>

            <TabsContent value="templates" className="animate-fade-up-soft">
              <TemplatesPanel />
            </TabsContent>

            <TabsContent value="deal-detail" className="animate-fade-up-soft">
              <DealDetailEmailPanel />
            </TabsContent>

            <TabsContent value="analytics" className="animate-fade-up-soft">
              <EmailAnalyticsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
