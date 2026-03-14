import { UploadPortal } from '@/components/upload/upload-portal';
import { Upload, FileText, Zap, Shield } from 'lucide-react';

export const metadata = {
  title: 'Data Upload — SalesPulse',
  description: 'Import CRM exports, pipeline data, and client interaction logs',
};

export default function UploadPage() {
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
      <div className="fixed bottom-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-accent/6 blur-[120px] pointer-events-none lux-orb" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 py-10">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20">
              <Upload className="w-5 h-5 text-accent" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Data Ingestion</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">Data Upload</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Import your CRM exports, pipeline data, and client interaction logs. Our AI processes and enriches everything automatically.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-3 gap-4 mb-10 animate-fade-up-soft" style={{ animationDelay: '0.1s' }}>
          {[
            { icon: FileText, title: 'Multi-Format Support', desc: 'CSV, Excel, JSON, and direct CRM API connectors', color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
            { icon: Zap, title: 'Instant AI Processing', desc: 'Data is enriched, scored, and analyzed within seconds', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20' },
            { icon: Shield, title: 'Secure & Encrypted', desc: 'End-to-end encryption with SOC 2 Type II compliance', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
          ].map((f, i) => (
            <div key={i} className={`glass rounded-xl p-5 border ${f.border} flex items-start gap-4 lift-hover animate-fade-up-soft`} style={{ animationDelay: `${0.16 + i * 0.06}s` }}>
              <div className={`p-2.5 rounded-lg ${f.bg} flex-shrink-0`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Portal */}
        <div className="max-w-3xl animate-fade-up-soft" style={{ animationDelay: '0.28s' }}>
          <UploadPortal />
        </div>

      </div>
    </div>
  );
}
