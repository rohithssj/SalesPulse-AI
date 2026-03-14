'use client';

import { DealDetailPanel } from '@/components/deals/deal-detail-panel';

export default function DealDetailPage() {
  return (
    <main className="min-h-screen bg-black pt-[67px] p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Deal Details</h1>
            <p className="text-sm text-[#888] mt-2">
              Comprehensive deal information, timeline, team members, and AI-powered recommendations
            </p>
          </div>

          {/* Deal Panel */}
          <DealDetailPanel />
        </div>
    </main>
  );
}
