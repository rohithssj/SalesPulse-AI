'use client';

import { AnalyticsPage } from '@/components/analytics/analytics-page';

export default function AnalyticsPageComponent() {
  return (
    <main className="min-h-screen bg-black pt-[67px] p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Sales Analytics</h1>
          <p className="text-sm text-[#888] mb-8">Comprehensive performance metrics, pipeline insights, and engagement trends</p>
          <AnalyticsPage />
        </div>
    </main>
  );
}
