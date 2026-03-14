'use client';

import { Bell, Search, User, Zap } from 'lucide-react';

interface CommandBarProps {
  statusMessage?: string;
}

export function CommandBar({ statusMessage = 'System Ready' }: CommandBarProps) {
  return (
    <div className="fixed top-0 left-64 right-0 glass border-b border-border px-8 py-4 backdrop-blur-xl">
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
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">{statusMessage}</span>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-gradient-primary">Active Deals: 24</span>
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
  );
}
