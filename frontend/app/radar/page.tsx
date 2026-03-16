import { DealRadar } from '@/components/radar/deal-radar';
import { DealAlerts } from '@/components/alerts/deal-alerts';
import { DealCards } from '@/components/deals/deal-cards';
import { StatsBar } from '@/components/layout/stats-bar';
import { Radar } from 'lucide-react';

export const metadata = {
  title: 'Deal Radar — SalesPulse',
  description: 'Real-time pipeline visualization and deal health scoring',
};

export default function RadarPage() {
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
      <div className="fixed top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[140px] pointer-events-none lux-orb" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 md:py-12">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Radar className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Live Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Deal Radar</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
            Real-time pipeline visualization with AI-powered deal health scoring. See where every deal stands at a glance.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-8 animate-fade-up-soft" style={{ animationDelay: '0.08s' }}>
          <StatsBar />
        </div>

        {/* Main Grid - Standardized 3-state responsiveness */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-up-soft" style={{ animationDelay: '0.16s' }}>
          <div className="md:col-span-2 lg:col-span-2 min-h-[300px] sm:min-h-[460px] lift-hover">
            <DealRadar />
          </div>
          <div className="md:col-span-1 lg:col-span-1 lift-hover">
            <DealAlerts />
          </div>
        </div>

        {/* Pipeline */}
        <div className="animate-fade-up-soft" style={{ animationDelay: '0.24s' }}>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground">Active Pipeline</h2>
            <p className="text-sm text-muted-foreground mt-1">Top deals requiring your attention right now</p>
          </div>
          <DealCards />
        </div>

      </div>
    </div>
  );
}
