'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Settings, Key, Bell, Users, Plug, Shield, ChevronRight } from 'lucide-react';

const settingsSections = [
  {
    id: 'integrations',
    icon: Key,
    title: 'API & Integrations',
    description: 'Connect your CRM, email, and third-party tools',
    items: ['Salesforce CRM', 'HubSpot', 'Gmail / Outlook', 'Slack Notifications'],
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'Notifications',
    description: 'Configure alert thresholds and delivery channels',
    items: ['Deal risk alerts', 'Win opportunity alerts', 'Pipeline changes', 'Weekly digest'],
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  {
    id: 'team',
    icon: Users,
    title: 'Team & Permissions',
    description: 'Manage team members and access control',
    items: ['Invite team members', 'Role management', 'Data visibility rules', 'Activity audit log'],
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
  {
    id: 'ai',
    icon: Plug,
    title: 'AI Preferences',
    description: 'Tune scoring models and intelligence settings',
    items: ['Deal scoring model', 'Win probability weights', 'Alert sensitivity', 'Language model'],
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Security & Privacy',
    description: 'Data protection, SSO, and compliance settings',
    items: ['Two-factor authentication', 'SSO configuration', 'Data retention policy', 'Audit logs'],
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
];

export function SettingsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');

  const initialSection = useMemo(() => {
    const match = settingsSections.find((section) => section.id === queryTab);
    return match?.id ?? 'integrations';
  }, [queryTab]);

  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeItem, setActiveItem] = useState('Salesforce CRM');

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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px] pointer-events-none lux-orb" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 py-10">

        {/* Page Header */}
        <div className="mb-10 animate-fade-up-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-white/10 border border-white/15">
              <Settings className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Configuration</span>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="text-foreground">Settings</span>
          </h1>
          <p className="text-base text-muted-foreground max-w-xl">
            Configure integrations, tune AI preferences, and manage team access. Full control over your SalesPulse experience.
          </p>
        </div>

        {/* Layout: Sidebar + Content */}
        <div className="grid grid-cols-5 gap-6">

          {/* Sidebar Navigation */}
          <div className="col-span-2">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? `${section.bg} ${section.border} border`
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? section.color : 'text-muted-foreground group-hover:text-foreground'}`} />
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-medium ${isActive ? section.color : 'text-foreground'}`}>{section.title}</p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                      {isActive && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content Area */}
          <div className="col-span-3">
            {settingsSections.map((section) => {
              if (activeSection !== section.id) return null;
              const Icon = section.icon;
              return (
                <div key={section.id} className="animate-fade-up-soft">
                  <div className={`${section.bg} ${section.border} border rounded-lg p-6 mb-6`}>
                    <div className="flex items-start gap-3">
                      <Icon className={`w-8 h-8 ${section.color} mt-1`} />
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2">
                    {section.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveItem(item)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                          activeItem === item
                            ? `${section.bg} ${section.border} border`
                            : 'bg-white/3 border border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className={`text-sm font-medium ${activeItem === item ? section.color : 'text-foreground'}`}>{item}</span>
                        <ChevronRight className={`w-4 h-4 transition-transform ${activeItem === item ? section.color : 'text-muted-foreground'}`} />
                      </button>
                    ))}
                  </div>

                  {/* Placeholder Details */}
                  {activeItem && (
                    <div className="mt-8 p-6 bg-white/3 border border-white/10 rounded-lg">
                      <h3 className="text-sm font-semibold text-foreground mb-2">Configure {activeItem}</h3>
                      <p className="text-xs text-muted-foreground mb-4">Settings for {activeItem} integration will appear here.</p>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors">
                        Configure
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
