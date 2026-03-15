'use client';

import { Bell, Search, User, Zap, Cloud } from 'lucide-react';
import { useDataSource } from '@/context/DataSourceContext';

interface CommandBarProps {
  statusMessage?: string;
}

export function CommandBar({ statusMessage = 'System Ready' }: CommandBarProps) {
  const { isUploadMode, globalData, switchToSalesforce } = useDataSource();

  return (
    <div className="fixed top-0 left-64 right-0 z-40">
      <div className="glass border-b border-border px-8 py-4 backdrop-blur-xl">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Search & Time */}
          <div className="flex items-center gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search deals, clients..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Right Section - Status & Actions */}
          <div className="flex items-center gap-6 ml-8">
            {/* Salesforce Switcher (Upload Mode Only) */}
            {isUploadMode && (
              <button
                onClick={() => {
                  if (window.confirm('Switch back to Salesforce data? Your uploaded data will be cleared.')) {
                    switchToSalesforce();
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all text-xs font-bold uppercase tracking-tight"
              >
                <Cloud className="w-4 h-4" />
                Use Salesforce Data
              </button>
            )}

            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isUploadMode ? 'bg-accent' : 'bg-success'} animate-pulse`} />
              <span className="text-xs font-mono text-muted-foreground">
                {isUploadMode ? 'Local Data Active' : statusMessage}
              </span>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold text-gradient-primary">
                Active Deals: {isUploadMode ? globalData?.summary.activeDeals : 24}
              </span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group">
              <Bell className="w-5 h-5 text-primary group-hover:glow-primary" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent animate-pulse" />
            </button>

            {/* User Profile */}
            <button className="p-2 rounded-lg hover:bg-white/5 transition-all duration-300 group">
              <User className="w-5 h-5 text-secondary group-hover:text-secondary-light" />
            </button>
          </div>
        </div>
      </div>

      {/* Upload Mode Banner */}
      {isUploadMode && (
        <div className="bg-primary/10 border-b border-primary/20 px-8 py-2 flex items-center justify-between backdrop-blur-md">
          <p className="text-[11px] text-primary-light font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            USING UPLOADED DATA: <strong className="uppercase">{globalData?.rawFileName}</strong> 
            <span className="mx-2 opacity-50">•</span>
            {globalData?.summary.activeDeals} DEALS, {globalData?.summary.totalAccounts} ACCOUNTS DETECTED
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
            Uploaded {globalData?.uploadedAt ? new Date(globalData.uploadedAt).toLocaleTimeString() : ''}
          </p>
        </div>
      )}
    </div>
  );
}
