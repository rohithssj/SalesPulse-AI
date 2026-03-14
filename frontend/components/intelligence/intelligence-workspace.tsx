'use client';

import { useState } from 'react';
import { Brain, Zap, Target, Lightbulb } from 'lucide-react';

type Tab = 'intel' | 'score' | 'generate' | 'strategy';

interface IntelligenceData {
  title: string;
  score: number;
  message: string;
  status: 'healthy' | 'moderate' | 'risk';
}

export function IntelligenceWorkspace() {
  const [activeTab, setActiveTab] = useState<Tab>('intel');
  const [isTyping, setIsTyping] = useState(true);

  const tabs = [
    { id: 'intel', label: 'Intelligence', icon: <Brain className="w-4 h-4" /> },
    { id: 'score', label: 'Deal Score', icon: <Zap className="w-4 h-4" /> },
    { id: 'generate', label: 'Generate', icon: <Lightbulb className="w-4 h-4" /> },
    { id: 'strategy', label: 'Strategy', icon: <Target className="w-4 h-4" /> },
  ];

  const getIntelData = (): IntelligenceData => {
    const data: Record<Tab, IntelligenceData> = {
      intel: {
        title: 'Market Intelligence',
        score: 87,
        message: 'Analyzing market trends and competitive landscape for optimal positioning...',
        status: 'healthy',
      },
      score: {
        title: 'Pipeline Score',
        score: 92,
        message: 'Deal quality assessment based on historical conversion rates and engagement patterns...',
        status: 'healthy',
      },
      generate: {
        title: 'Content Generation',
        score: 78,
        message: 'Generating personalized outreach messages and proposal content recommendations...',
        status: 'moderate',
      },
      strategy: {
        title: 'Strategic Insights',
        score: 85,
        message: 'Developing negotiation strategies and timeline optimization recommendations...',
        status: 'healthy',
      },
    };
    return data[activeTab];
  };

  const data = getIntelData();
  const statusColor =
    data.status === 'healthy' ? 'text-success' : data.status === 'moderate' ? 'text-warning' : 'text-destructive';

  return (
    <div className="glass luxury-panel rounded-xl p-6 border-glow-secondary h-full flex flex-col">
      {/* Header with Tabs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-secondary" />
          <h2 className="text-lg font-semibold text-gradient-primary">AI Intelligence</h2>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-300 text-sm font-medium ${
                activeTab === tab.id
                  ? 'glass glow-secondary-strong bg-secondary/10 border border-secondary/50'
                  : 'hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Score Meter */}
        <div className="mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">{data.title}</span>
            <span className={`text-2xl font-bold ${statusColor}`}>{data.score}%</span>
          </div>

          {/* Circular Progress */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                {/* Progress circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="url(#progress-gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 45 * (data.score / 100)} ${2 * Math.PI * 45}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <defs>
                  <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="rgba(0, 217, 255, 1)" />
                    <stop offset="100%" stopColor="rgba(157, 78, 221, 1)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-gradient-primary">{data.score}</span>
              </div>
            </div>

            {/* Status Indicators */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Signal Strength</span>
                <span className="text-primary font-semibold">Strong</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: '85%' }} />
              </div>

              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-muted-foreground">Confidence</span>
                <span className={statusColor}>{data.status.charAt(0).toUpperCase() + data.status.slice(1)}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary to-accent" style={{ width: `${data.score}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* AI Response Area */}
        <div className="flex-1 p-4 rounded-lg bg-white/3 border border-white/5 overflow-y-auto">
          <div className="text-sm leading-relaxed">
            <span className="text-primary font-semibold">▶ Processing: </span>
            <span className="text-foreground/80">{data.message}</span>
            {isTyping && (
              <span className="inline-block ml-1 text-primary animate-blink-cursor border-r-2 border-primary">
                ▌
              </span>
            )}
          </div>

          {/* Timeline Actions */}
          <div className="mt-6 space-y-3">
            {['Identify key blockers', 'Prepare negotiation points', 'Schedule follow-up call'].map(
              (action, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-2 rounded bg-white/5 border border-white/5 hover:border-primary/30 transition-all duration-300 animate-slide-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-success mt-2 flex-shrink-0" />
                  <span className="text-xs text-foreground/70">{action}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
