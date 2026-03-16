'use client';

import Link from 'next/link';
import { Radar, BarChart3, Brain, Upload, Settings, ArrowRight, Mail, Zap, Briefcase } from 'lucide-react';
import { StatsBar } from '@/components/layout/stats-bar';
import { DealAlerts } from '@/components/alerts/deal-alerts';
import { EmailAlertsPanel } from '@/components/email/email-alerts-panel';

const sections = [
  {
    href: '/ai-workspace',
    icon: Brain,
    label: 'AI Workspace',
    description: 'Multi-agent intelligence: Intel discovery, scoring, content generation, and strategy',
    color: 'from-primary to-primary-light',
    border: 'border-primary/20 hover:border-primary/50',
    glow: 'hover:shadow-[0_0_24px_rgba(0,217,255,0.15)]',
    badge: '4 Agents',
  },
  {
    href: '/signals',
    icon: Zap,
    label: 'Buying Signals',
    description: 'AI-detected buying intent signals with confidence scoring and advanced filtering',
    color: 'from-warning to-accent',
    border: 'border-warning/20 hover:border-warning/50',
    glow: 'hover:shadow-[0_0_24px_rgba(255,183,0,0.15)]',
    badge: '6 Signals',
  },
  {
    href: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Deep-dive performance metrics, engagement trends, and revenue forecasting',
    color: 'from-secondary to-secondary-light',
    border: 'border-secondary/20 hover:border-secondary/50',
    glow: 'hover:shadow-[0_0_24px_rgba(157,78,221,0.15)]',
    badge: '+12.5%',
  },
  {
    href: '/deals',
    icon: Briefcase,
    label: 'Deal Details',
    description: 'Comprehensive deal information, timeline, team, and AI-powered recommendations',
    color: 'from-primary to-primary-light',
    border: 'border-primary/20 hover:border-primary/50',
    glow: 'hover:shadow-[0_0_24px_rgba(0,217,255,0.15)]',
    badge: '34 Active',
  },
  {
    href: '/email',
    icon: Mail,
    label: 'Email Command',
    description: 'AI-powered email generation, engagement tracking, and follow-up management',
    color: 'from-accent to-accent-light',
    border: 'border-accent/20 hover:border-accent/50',
    glow: 'hover:shadow-[0_0_24px_rgba(255,0,110,0.15)]',
    badge: '11 Alerts',
  },
  {
    href: '/radar',
    icon: Radar,
    label: 'Deal Radar',
    description: 'Real-time pipeline visualization with AI-powered deal health scoring',
    color: 'from-primary to-primary-light',
    border: 'border-primary/20 hover:border-primary/50',
    glow: 'hover:shadow-[0_0_24px_rgba(0,217,255,0.15)]',
    badge: '5 Active',
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
      {/* Soft white ambient gradients */}
      <div className="fixed top-1/4 right-1/4 w-[520px] h-[520px] rounded-full bg-white/[0.05] blur-[130px] pointer-events-none lux-orb" />
      <div className="fixed bottom-1/3 left-1/4 w-[420px] h-[420px] rounded-full bg-white/[0.04] blur-[110px] pointer-events-none lux-orb" style={{ animationDelay: '1.8s' }} />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 sm:px-8 py-8 md:py-12">

        {/* Hero Section */}
        <div className="mb-12 md:mb-16 max-w-3xl animate-fade-up-soft">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 animate-float-slow">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] sm:text-xs font-medium text-[#b3b3b3]">Ranked #1 AI sales platform for modern teams</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.1] md:leading-[1.05] tracking-tight mb-6 text-white animate-fade-up-soft" style={{ animationDelay: '0.08s' }}>
            Sales intelligence,
            <br />
            <span className="display-italic text-white/95">without</span> the guesswork.
          </h1>
          <p className="text-base sm:text-lg text-[#a3a3a3] leading-relaxed max-w-xl animate-fade-up-soft" style={{ animationDelay: '0.16s' }}>
            AI-powered deal management that tracks your pipeline in real time, scores opportunities, and tells you exactly where to focus.
          </p>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mt-8 animate-fade-up-soft" style={{ animationDelay: '0.24s' }}>
            <Link
              href="/radar"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-white/90 transition-colors lift-hover luxury-button w-full sm:w-auto"
            >
              Open Command Center
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/analytics"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors lift-hover luxury-button w-full sm:w-auto"
            >
              View Analytics
            </Link>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-12 animate-fade-up-soft" style={{ animationDelay: '0.3s' }}>
          <StatsBar />
        </div>

        {/* Section Grid */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-2">Command Center</h2>
          <p className="text-sm text-[#888] mb-6">Navigate to any module below</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map((section, idx) => (
              <Link
                key={section.href}
                href={section.href}
                className={`group glass luxury-panel rounded-xl p-5 border ${section.border} transition-colors duration-200 flex flex-col gap-4 cursor-pointer hover:bg-[#151515] lift-hover animate-fade-up-soft`}
                style={{ animationDelay: `${0.34 + idx * 0.07}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <section.icon className="w-5 h-5 text-[#b3b3b3] group-hover:text-white transition-colors" />
                  </div>
                  {section.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-[#a3a3a3]">
                      {section.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">
                    {section.label}
                  </h3>
                  <p className="text-xs text-[#888] leading-relaxed">{section.description}</p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-[#b3b3b3] group-hover:text-white transition-colors mt-auto">
                  Open
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Section: Alerts + Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-1 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-2">Live Alerts</h2>
            <p className="text-sm text-[#888] mb-4">Real-time deal intelligence notifications</p>
            <DealAlerts />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white mb-2">System Status</h2>
            <p className="text-sm text-[#888] mb-4">AI engine health overview</p>
            <div className="glass luxury-panel rounded-xl p-6 border border-white/10 space-y-4 animate-fade-up-soft" style={{ animationDelay: '0.5s' }}>
              {[
                { label: 'Deal Scoring Engine', status: 'Operational', ok: true },
                { label: 'Market Intelligence', status: 'Operational', ok: true },
                { label: 'CRM Sync', status: 'Syncing...', ok: null },
                { label: 'Data Pipeline', status: 'Operational', ok: true },
                { label: 'Alert System', status: 'Operational', ok: true },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-sm text-white">{s.label}</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${s.ok === true ? 'bg-success' : s.ok === false ? 'bg-destructive' : 'bg-warning animate-pulse'}`} />
                    <span className={`text-xs font-medium ${s.ok === true ? 'text-success' : s.ok === false ? 'text-destructive' : 'text-warning'}`}>{s.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Email Alerts Section */}
        <div>
          <h2 className="text-xl font-bold text-white mb-2">Email Follow-up Queue</h2>
          <p className="text-sm text-[#888] mb-4">AI-powered email management and engagement tracking</p>
          <EmailAlertsPanel />
        </div>

      </div>
    </div>
  );
}
