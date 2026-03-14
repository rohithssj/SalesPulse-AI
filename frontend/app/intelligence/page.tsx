import { IntelligenceWorkspace } from '@/components/intelligence/intelligence-workspace';
import { DealAlerts } from '@/components/alerts/deal-alerts';
import { AnalyticsPanel } from '@/components/analytics/analytics-panel';
import { Brain } from 'lucide-react';

export const metadata = {
  title: 'AI Intelligence — SalesPulse',
  description: 'AI-powered deal scoring, strategy generation, and market insights',
};

export default function IntelligencePage() {
  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '86px 86px',
        }}
      />
      {/* Ambient glow */}
      <div className="fixed top-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-secondary/6 blur-[120px] pointer-events-none lux-orb" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 py-10">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-secondary/10 border border-secondary/20">
              <Brain className="w-5 h-5 text-secondary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Neural Engine</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-secondary to-secondary-light bg-clip-text text-transparent">AI Intelligence</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            GPT-powered deal scoring, personalized strategy generation, and real-time market positioning insights for every opportunity.
          </p>
        </div>

        {/* Intelligence Workspace + Side Panel */}
        <div className="grid grid-cols-2 gap-6 mb-8 animate-fade-up-soft" style={{ animationDelay: '0.1s' }}>
          <div className="min-h-[520px] lift-hover">
            <IntelligenceWorkspace />
          </div>
          <div className="flex flex-col gap-6">
            <div className="lift-hover">
              <DealAlerts />
            </div>
            <div className="lift-hover">
              <AnalyticsPanel />
            </div>
          </div>
        </div>

        {/* Feature Callouts */}
        <div className="grid grid-cols-4 gap-4 animate-fade-up-soft" style={{ animationDelay: '0.2s' }}>
          {[
            { title: 'Deal Scoring', desc: 'ML model trained on 10K+ historical deals', value: '92%', label: 'accuracy' },
            { title: 'Win Probability', desc: 'Bayesian inference based on deal signals', value: '87%', label: 'confidence' },
            { title: 'Strategy Engine', desc: 'Generates custom negotiation playbooks', value: '3s', label: 'response time' },
            { title: 'Market Intel', desc: 'Competitive landscape analysis in real time', value: '24/7', label: 'monitoring' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-xl p-5 border border-secondary/15 hover:border-secondary/40 transition-all duration-300 lift-hover animate-fade-up-soft" style={{ animationDelay: `${0.24 + i * 0.06}s` }}>
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary mb-3">{f.title}</p>
              <p className="text-3xl font-bold text-foreground mb-1">{f.value}</p>
              <p className="text-xs text-muted-foreground mb-3">{f.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
