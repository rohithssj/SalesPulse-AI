'use client';

import { ComprehensiveAIWorkspace } from '@/components/ai-workspace/comprehensive-ai-workspace';

export default function AIWorkspacePage() {
  return (
    <main className="min-h-screen bg-black pt-[67px] p-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">AI Workspace</h1>
            <p className="text-sm text-[#888] mt-2">
              Multi-agent intelligence system: Intel discovery, Score analysis, Generate content, and Strategy recommendations
            </p>
          </div>

          {/* Main Content */}
          <ComprehensiveAIWorkspace />
        </div>
    </main>
  );
}
