'use client';

import { DealRadar } from '@/components/radar/deal-radar';
import { AnalyticsPanel } from '@/components/analytics/analytics-panel';
import { DealCards } from '@/components/deals/deal-cards';
import { DealAlerts } from '@/components/alerts/deal-alerts';
import { IntelligenceWorkspace } from '@/components/intelligence/intelligence-workspace';
import { UploadPortal } from '@/components/upload/upload-portal';

interface MainContentProps {
  viewType: string;
}

export function MainContent({ viewType }: MainContentProps) {
  switch (viewType) {
    case 'radar':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-6 h-96">
            <div className="col-span-2">
              <DealRadar />
            </div>
            <div>
              <DealAlerts />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gradient-primary">Active Pipeline</h2>
                <p className="text-xs text-muted-foreground mt-1">Top deals requiring attention</p>
              </div>
              <DealCards />
            </div>
            <div>
              <AnalyticsPanel />
            </div>
          </div>
        </div>
      );

    case 'upload':
      return (
        <div className="h-screen">
          <UploadPortal />
        </div>
      );

    case 'intelligence':
      return (
        <div className="grid grid-cols-2 gap-6">
          <IntelligenceWorkspace />
          <div className="flex flex-col gap-6">
            <DealAlerts />
            <AnalyticsPanel />
          </div>
        </div>
      );

    case 'analytics':
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <AnalyticsPanel />
            <DealRadar />
          </div>
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gradient-primary">Deal Pipeline</h2>
            </div>
            <DealCards />
          </div>
        </div>
      );

    case 'settings':
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="glass rounded-xl p-12 text-center border-glow-secondary max-w-md">
            <div className="mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">⚙</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gradient-primary mb-2">Settings</h2>
            <p className="text-muted-foreground text-sm">Configuration and preferences panel coming soon</p>
          </div>
        </div>
      );

    default:
      return null;
  }
}
