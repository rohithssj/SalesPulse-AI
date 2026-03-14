'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, Zap, BarChart3, Briefcase, Mail, Settings, LogOut, Radar, Upload, Activity, ChevronDown, Building2 } from 'lucide-react';
import { useAccount } from '@/context/account-context';

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  color: string;
  badge?: string;
}

export function Sidebar() {
  const pathname = usePathname();
  const { accounts, selectedAccountId, setSelectedAccountId, loading } = useAccount();

  const items: SidebarItem[] = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', href: '/', color: 'text-primary' },
    { icon: <Brain className="w-5 h-5" />, label: 'AI Workspace', href: '/ai-workspace', color: 'text-accent', badge: '4' },
    { icon: <Zap className="w-5 h-5" />, label: 'Buying Signals', href: '/signals', color: 'text-warning', badge: '6' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Analytics', href: '/analytics', color: 'text-secondary' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'Deals', href: '/deals', color: 'text-primary' },
    { icon: <Mail className="w-5 h-5" />, label: 'Email', href: '/email', color: 'text-blue-500' },
    { icon: <Activity className="w-5 h-5" />, label: 'Activity', href: '/activity', color: 'text-primary' },
    { icon: <Radar className="w-5 h-5" />, label: 'Deal Radar', href: '/radar', color: 'text-primary' },
    { icon: <Upload className="w-5 h-5" />, label: 'Data Upload', href: '/upload', color: 'text-secondary' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', href: '/settings', color: 'text-secondary' },
  ];

  return (
    <div className="glass fixed left-0 top-0 w-64 h-screen border-r border-white/10 flex flex-col p-6 backdrop-blur-xl z-50">
      {/* Logo */}
      <div className="mb-6">
        <div className="text-2xl font-bold text-white tracking-tight">
          SalesPulse
        </div>
        <div className="text-xs text-[#888] mt-1">AI Revenue Intelligence</div>
      </div>

      {/* Account Selector */}
      <div className="mb-6">
        <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2 block">
          Salesforce Account
        </label>
        <div className="relative group">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            disabled={loading}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-primary/50 transition-all hover:bg-white/10 pr-10"
          >
            {loading ? (
              <option>Loading accounts...</option>
            ) : (
              accounts.map((acc) => (
                <option key={acc.Id} value={acc.Id} className="bg-[#1a1a1a] text-white">
                  {acc.Name}
                </option>
              ))
            )}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#888] group-hover:text-white transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5">
        {items.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'glass bg-white/10 border border-white/20 text-white'
                    : 'hover:bg-white/5 border border-transparent text-[#a3a3a3] hover:text-white'
                }`}
              >
                <span className={item.color}>{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="space-y-2 border-t border-white/10 pt-4">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/5 border border-transparent transition-all duration-300 text-[#a3a3a3] hover:text-white">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
