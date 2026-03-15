'use client';

import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Settings, Key, Bell, Users, Plug, Shield, 
  ChevronRight, Database, Monitor, KeyRound, 
  CloudSync, Sliders, Layout, History, RefreshCcw
} from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { SettingsToggle } from '@/components/settings/settings-toggle';
import { SettingsSlider } from '@/components/settings/settings-slider';
import { SettingsSelect } from '@/components/settings/settings-select';
import { SectionHeader } from '@/components/settings/section-header';
import { ComingSoonPanel } from '@/components/settings/coming-soon-panel';
import { useAccount } from '@/context/account-context';

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
    items: [],
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
  },
  {
    id: 'ai',
    icon: Plug,
    title: 'AI Preferences',
    description: 'Tune scoring models and intelligence settings',
    items: [],
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
  },
  {
    id: 'data-sync',
    icon: RefreshCcw,
    title: 'Data & Sync',
    description: 'Manage how and when your data synchronize',
    items: [],
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
  },
  {
    id: 'display',
    icon: Layout,
    title: 'Display Preferences',
    description: 'Customize your dashboard interface',
    items: [],
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/20',
  },
];

export function SettingsContent() {
  const searchParams = useSearchParams();
  const queryTab = searchParams.get('tab');
  const { selectedAccountId } = useAccount();
  const { settings, updateSetting, resetSettings } = useSettings();

  const initialSection = useMemo(() => {
    const match = settingsSections.find((section) => section.id === queryTab);
    return match?.id ?? 'integrations';
  }, [queryTab]);

  const [activeSection, setActiveSection] = useState(initialSection);
  const [activeItem, setActiveItem] = useState('Salesforce CRM');

  // Salesforce Connection Logic
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  
  const testSalesforceConnection = async () => {
    setConnectionStatus('testing');
    try {
      const res = await fetch('http://localhost:3001/api/accounts');
      if (res.ok) {
        setConnectionStatus('connected');
        updateSetting('salesforceConnected', true);
        updateSetting('salesforceLastSync', new Date().toISOString());
      } else {
        setConnectionStatus('failed');
        updateSetting('salesforceConnected', false);
      }
    } catch {
      setConnectionStatus('failed');
      updateSetting('salesforceConnected', false);
    }
  };

  const statusConfig = {
    idle:      { color: '#6b7280', dot: '#6b7280', label: 'Not tested' },
    testing:   { color: '#f59e0b', dot: '#f59e0b', label: 'Testing connection...' },
    connected: { color: '#22c55e', dot: '#22c55e', label: 'Connected' },
    failed:    { color: '#ef4444', dot: '#ef4444', label: 'Connection failed' },
  };

  // Data & Sync Logic
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; count?: number } | null>(null);

  const handleSyncNow = async () => {
    if (!selectedAccountId) return;
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch(
        `http://localhost:3001/api/completeData?accountId=${selectedAccountId}`
      );
      if (!res.ok) throw new Error('Sync failed');
      const data = await res.json();
      
      let recordCount = 0;
      if (data && typeof data === 'object') {
        if (data.opportunities) recordCount += data.opportunities.length;
        if (data.signals) recordCount += data.signals.length;
        if (data.activities) recordCount += data.activities.length;
        if (recordCount === 0) recordCount = Object.keys(data).length;
      }
      
      updateSetting('lastSyncTime', new Date().toISOString());
      updateSetting('totalRecordsSynced', recordCount);
      setSyncResult({ success: true, count: recordCount });
    } catch {
      setSyncResult({ success: false });
    } finally {
      setIsSyncing(false);
    }
  };

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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[140px] pointer-events-none lux-orb" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-8 py-10">
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
            Configure integrations, tune AI preferences, and manage synchronized data. Full control over your SalesPulse experience.
          </p>
        </div>

        <div className="grid grid-cols-5 gap-8">
          <div className="col-span-2 space-y-2">
            <nav className="space-y-2">
              {settingsSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                        setActiveSection(section.id);
                        if (section.id === 'integrations') setActiveItem('Salesforce CRM');
                        else setActiveItem('');
                    }}
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

          <div className="col-span-3 space-y-6">
            {activeSection === 'integrations' && (
              <div className="animate-fade-up-soft space-y-6">
                <SectionHeader title="API & Integrations" subtitle="Connect your CRM and ecosystem tools" />
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg bg-white/3 border border-white/10`}>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Database className="w-5 h-5 text-primary" />
                            <span className="text-sm font-bold">Salesforce CRM</span>
                        </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: '#0f172a', borderRadius: '8px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                        <div style={{
                          width: '10px', height: '10px', borderRadius: '50%',
                          backgroundColor: statusConfig[connectionStatus].dot,
                          boxShadow: `0 0 8px ${statusConfig[connectionStatus].dot}`,
                          animation: connectionStatus === 'connected' ? 'pulse 2s infinite' : 'none'
                        }} />
                        <span style={{ color: statusConfig[connectionStatus].color, fontSize: '13px', fontWeight: '600' }}>
                          {statusConfig[connectionStatus].label}
                        </span>
                      </div>

                      <div style={{ marginBottom: '12px' }}>
                        <p style={{ color: '#6b7280', fontSize: '11px', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Org URL</p>
                        <p style={{ color: '#d1d5db', fontSize: '13px', fontFamily: 'monospace', background: '#1f2937', padding: '8px 12px', borderRadius: '6px', border: '1px solid #374151', margin: 0 }}>
                          {settings.salesforceOrgUrl}
                        </p>
                      </div>

                      {settings.lastSyncTime && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ color: '#6b7280', fontSize: '11px', textTransform:'uppercase', letterSpacing:'0.05em', margin:'0 0 4px' }}>Last Synced</p>
                          <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>
                            {new Date(settings.lastSyncTime).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <button
                        onClick={testSalesforceConnection}
                        disabled={connectionStatus === 'testing'}
                        style={{
                          background: connectionStatus === 'connected' ? '#166534' : '#4338ca',
                          color: '#fff', border: 'none', borderRadius: '8px',
                          padding: '10px 20px', fontSize: '13px', fontWeight: '600',
                          cursor: connectionStatus === 'testing' ? 'not-allowed' : 'pointer',
                          opacity: connectionStatus === 'testing' ? 0.7 : 1,
                          width: '100%'
                        }}
                      >
                        {connectionStatus === 'testing' ? '⟳ Testing...'
                          : connectionStatus === 'connected' ? '✓ Connection Verified — Test Again'
                          : '⚡ Test Connection'}
                      </button>
                    </div>
                  </div>

                  <ComingSoonPanel name="HubSpot" description="Sync contacts, deals, and engagement data from HubSpot CRM" />
                  <ComingSoonPanel name="Gmail / Outlook" description="Connect your inbox to track email engagement and automate outreach" />
                  <ComingSoonPanel name="Slack Notifications" description="Receive buying signal alerts and deal updates directly in Slack" />
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="animate-fade-up-soft">
                <SectionHeader title="Notification Preferences" subtitle="Control how SalesPulse alerts you to important events" />
                
                <SettingsToggle
                  label="Buying Signal Alerts"
                  description="Get notified immediately when a buying signal is detected"
                  value={settings.buyingSignalAlerts}
                  onChange={(val) => updateSetting('buyingSignalAlerts', val)}
                />

                <SettingsToggle
                  label="Deal Expiry Warnings"
                  description="Alert when a deal is approaching its expected close date"
                  value={settings.dealExpiryWarnings}
                  onChange={(val) => updateSetting('dealExpiryWarnings', val)}
                />

                {settings.dealExpiryWarnings && (
                  <SettingsSlider
                    label="Warn me when deal closes in"
                    description="Number of days before close date to trigger the warning"
                    value={settings.dealExpiryDays}
                    onChange={(val) => updateSetting('dealExpiryDays', val)}
                    min={1} max={30} unit=" days"
                  />
                )}

                <SettingsToggle
                  label="High Engagement Alerts"
                  description="Notify when a contact opens emails multiple times or clicks CTA"
                  value={settings.highEngagementAlerts}
                  onChange={(val) => updateSetting('highEngagementAlerts', val)}
                />

                <SettingsToggle
                  label="Daily Pipeline Digest"
                  description="Receive a morning summary of your pipeline health and priorities"
                  value={settings.dailyPipelineDigest}
                  onChange={(val) => updateSetting('dailyPipelineDigest', val)}
                />

                <div style={{ marginTop: '24px', padding: '16px', background: '#0f172a', borderRadius: '8px', border: '1px solid #1e3a5f' }}>
                  <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 12px' }}>Active Alerts Preview</p>
                  {[
                    settings.buyingSignalAlerts && '⚡ Buying Signal Alerts — ON',
                    settings.dealExpiryWarnings && `⏰ Deal Expiry — ${settings.dealExpiryDays} days warning`,
                    settings.highEngagementAlerts && '🔥 High Engagement Alerts — ON',
                    settings.dailyPipelineDigest && '📊 Daily Digest — ON',
                  ].filter(Boolean).map((item, i) => (
                    <p key={i} style={{ color: '#22c55e', fontSize: '12px', margin: '4px 0' }}>✓ {item}</p>
                  ))}
                  {![settings.buyingSignalAlerts, settings.dealExpiryWarnings, settings.highEngagementAlerts, settings.dailyPipelineDigest].some(Boolean) && (
                    <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>All notifications are currently disabled</p>
                  )}
                </div>
              </div>
            )}

            {activeSection === 'ai' && (
              <div className="animate-fade-up-soft">
                <SectionHeader title="AI Intelligence Settings" subtitle="Tune how AI analyzes your pipeline and generates content" />

                <SettingsSelect
                  label="Default Generation Tone"
                  description="Used as the default tone for all AI-generated content"
                  value={settings.defaultTone}
                  onChange={(val) => updateSetting('defaultTone', val)}
                  options={['Formal', 'Friendly', 'Persuasive']}
                />

                <SettingsSelect
                  label="Buying Signal Sensitivity"
                  description="Higher sensitivity detects more signals but may include false positives"
                  value={settings.buyingSignalSensitivity}
                  onChange={(val) => updateSetting('buyingSignalSensitivity', val)}
                  options={['Low', 'Medium', 'High']}
                />

                <SettingsSelect
                  label="AI Response Length"
                  description="Controls how detailed AI-generated content should be"
                  value={settings.aiResponseLength}
                  onChange={(val) => updateSetting('aiResponseLength', val)}
                  options={['Concise', 'Detailed', 'Comprehensive']}
                />

                <SettingsToggle
                  label="Auto-Generate Suggestions"
                  description="Automatically generate AI tips when viewing deal cards"
                  value={settings.autoGenerateSuggestions}
                  onChange={(val) => updateSetting('autoGenerateSuggestions', val)}
                />

                <div style={{ padding: '16px 0' }}>
                  <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '600', margin: '0 0 4px' }}>Deal Health Scoring Weights</p>
                  <p style={{ color: '#6b7280', fontSize: '12px', margin: '0 0 20px' }}>Adjust how each factor contributes to the health score (Total must equal 100%)</p>

                  <SettingsSlider
                    label="Engagement Weight"
                    description="How much email opens, clicks, and activity matter"
                    value={settings.scoringWeightEngagement}
                    onChange={(val) => {
                      const remaining = 100 - val;
                      const ratio = settings.scoringWeightRecency / (settings.scoringWeightRecency + settings.scoringWeightValue) || 0.5;
                      updateSetting('scoringWeightEngagement', val);
                      updateSetting('scoringWeightRecency', Math.round(remaining * ratio));
                      updateSetting('scoringWeightValue', Math.max(0, 100 - val - Math.round(remaining * ratio)));
                    }}
                  />

                  <SettingsSlider label="Recency Weight" value={settings.scoringWeightRecency} onChange={(val) => updateSetting('scoringWeightRecency', val)} />
                  <SettingsSlider label="Deal Value Weight" value={settings.scoringWeightValue} onChange={(val) => updateSetting('scoringWeightValue', val)} />

                  {(() => {
                    const total = settings.scoringWeightEngagement + settings.scoringWeightRecency + settings.scoringWeightValue;
                    const isValid = total === 100;
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', marginTop: '8px', background: isValid ? '#14532d' : '#7f1d1d', border: `1px solid ${isValid ? '#22c55e' : '#ef4444'}` }}>
                        <span style={{ color: isValid ? '#86efac' : '#fca5a5', fontSize: '13px' }}>{isValid ? '✓ Weights balanced' : '⚠ Weights must equal 100%'}</span>
                        <span style={{ color: isValid ? '#22c55e' : '#ef4444', fontSize: '15px', fontWeight: '700' }}>{total}%</span>
                      </div>
                    );
                  })()}
                </div>

                <button onClick={() => resetSettings()} style={{ marginTop: '16px', background: 'transparent', color: '#6b7280', border: '1px solid #374151', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', cursor: 'pointer', width: '100%' }}>
                  Reset AI Preferences to Defaults
                </button>
              </div>
            )}

            {activeSection === 'data-sync' && (
              <div className="animate-fade-up-soft">
                <SectionHeader title="Data & Sync" subtitle="Manage your Salesforce CRM data synchronization" />

                <div style={{ padding: '20px', background: '#0f172a', borderRadius: '10px', border: '1px solid #1e3a5f', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div>
                      <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '600', margin: 0 }}>Salesforce CRM Sync</p>
                      <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0' }}>Last synced: {settings.lastSyncTime ? new Date(settings.lastSyncTime).toLocaleString() : 'Never'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ color: '#6b7280', fontSize: '11px', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Records</p>
                      <p style={{ color: '#6366f1', fontSize: '22px', fontWeight: '700', margin: 0 }}>{settings.totalRecordsSynced || '—'}</p>
                    </div>
                  </div>

                  {syncResult && (
                    <div style={{ padding: '10px 14px', borderRadius: '6px', marginBottom: '12px', background: syncResult.success ? '#14532d' : '#7f1d1d', border: `1px solid ${syncResult.success ? '#22c55e' : '#ef4444'}` }}>
                      <p style={{ color: syncResult.success ? '#86efac' : '#fca5a5', fontSize: '13px', margin: 0 }}>
                        {syncResult.success ? `✓ Sync complete — ${syncResult.count} records loaded` : '✗ Sync failed — check your connection'}
                      </p>
                    </div>
                  )}

                  <button onClick={handleSyncNow} disabled={isSyncing || !selectedAccountId} style={{ width: '100%', background: isSyncing ? '#1f2937' : '#4338ca', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: isSyncing || !selectedAccountId ? 'not-allowed' : 'pointer', opacity: !selectedAccountId ? 0.5 : 1 }}>
                    {isSyncing ? '⟳ Syncing...' : '↻ Sync Now'}
                  </button>
                </div>

                <SettingsToggle label="Auto-Sync" description="Automatically sync CRM data in the background" value={settings.autoSyncEnabled} onChange={(val) => updateSetting('autoSyncEnabled', val)} />
                <SettingsSelect label="Sync Frequency" value={settings.syncFrequency} onChange={(val) => updateSetting('syncFrequency', val)} options={['Every 15 minutes', 'Every 30 minutes', 'Every hour', 'Every 4 hours', 'Manual only']} />
              </div>
            )}

            {activeSection === 'display' && (
              <div className="animate-fade-up-soft">
                <SectionHeader title="Display Preferences" subtitle="Customize how your dashboard looks" />

                <SettingsSelect
                  label="Default Landing Page"
                  value={settings.defaultLandingPage}
                  onChange={(val) => updateSetting('defaultLandingPage', val)}
                  options={['Dashboard', 'Deal Radar', 'AI Workspace', 'Buying Signals', 'Email']}
                />

                <SettingsSelect label="Dashboard Density" value={settings.dashboardDensity} onChange={(val) => updateSetting('dashboardDensity', val)} options={['Compact', 'Comfortable', 'Spacious']} />
                <SettingsToggle label="Show Win Probability" value={settings.showWinProbability} onChange={(val) => updateSetting('showWinProbability', val)} />
                <SettingsToggle label="Show Buying Signal Badges" value={settings.showBuyingSignalBadges} onChange={(val) => updateSetting('showBuyingSignalBadges', val)} />

                <div style={{ marginTop: '32px', padding: '20px', background: '#0f172a', borderRadius: '10px', border: '1px solid #7f1d1d' }}>
                  <p style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '600', margin: '0 0 6px' }}>Reset All Settings</p>
                  <button onClick={() => { if (window.confirm('Reset all settings to defaults?')) resetSettings(); }} style={{ background: '#7f1d1d', color: '#fca5a5', border: '1px solid #ef4444', borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    ⚠ Reset All to Defaults
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
