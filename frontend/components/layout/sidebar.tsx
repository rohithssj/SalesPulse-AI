'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, Zap, BarChart3, Briefcase, Mail, Settings, LogOut, Radar, Upload, Activity, ChevronDown, Menu, X, Cloud } from 'lucide-react';
import { useAccount } from '@/context/AccountContext';
import { useDataSource } from '@/context/DataSourceContext';

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
  const { 
    isUploadMode, globalData, selectedAccount, setSelectedAccount, 
    getAccounts, switchToSalesforce 
  } = useDataSource();

  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

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
    <>
      {/* Mobile Header / Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass z-[60] flex items-center justify-between px-6 border-b border-white/10">
        <div className="text-xl font-bold text-white tracking-tight">SalesPulse</div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop (Mobile Only) */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container - Requirement 10: responsive breakpoints */}
      <div className={`
        glass fixed left-0 top-0 h-screen border-r border-white/10 flex flex-col p-4 lg:p-6 backdrop-blur-xl z-[58]
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20 lg:w-64 shadow-2xl md:shadow-none'}
      `}>
        {/* Logo */}
        <div className={`mb-6 hidden ${isOpen ? 'block' : 'lg:block md:hidden'}`}>
          <div className="text-2xl font-bold text-white tracking-tight">
            SalesPulse
          </div>
          <div className="text-xs text-[#888] mt-1">AI Revenue Intelligence</div>
        </div>
        
        {/* Small Logo for Tablet */}
        {!isOpen && (
          <div className="hidden md:block lg:hidden mb-10 text-center">
            <div className="text-xl font-bold text-primary">SP</div>
          </div>
        )}

        {/* Account Selector */}
        <div className={`mb-6 mt-12 lg:mt-0 ${!isOpen && 'md:hidden lg:block'}`}>
          {!isUploadMode ? (
            <>
              <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-2 block">
                Salesforce Account
              </label>
              <div className="relative group">
                <select
                  value={selectedAccountId || ''}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  disabled={loading}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-primary/50 transition-all hover:bg-white/10 pr-10"
                >
                  {loading ? (
                    <option>Loading...</option>
                  ) : (
                    accounts.map((acc: any) => (
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
            </>
          ) : (
            <>
              <label className="text-[10px] font-bold text-[#666] uppercase tracking-widest mb-1 block">
                📂 UPLOADED DATA
              </label>
              <div className="relative group">
                <select
                  value={selectedAccount?.id || ''}
                  onChange={(e) => {
                    const acc = getAccounts().find(a => a.id === e.target.value);
                    setSelectedAccount(acc || null);
                  }}
                  className="w-full bg-[#1e3a5f]/30 border border-blue-500/30 rounded-lg px-3 py-2.5 text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 transition-all hover:bg-blue-500/10 pr-10"
                >
                  <option value="" className="bg-[#0f172a]">All Accounts ({getAccounts().length})</option>
                  {getAccounts().map((acc) => (
                    <option key={acc.id} value={acc.id} className="bg-[#0f172a]">
                      {acc.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar pr-1">
          {items.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/');
            return (
              <Link key={item.href} href={item.href}>
                <button
                  title={item.label}
                  className={`w-full flex items-center gap-3 p-3 lg:px-4 lg:py-3 rounded-lg transition-all duration-300 ${
                    isActive
                      ? 'glass bg-white/10 border border-white/20 text-white'
                      : 'hover:bg-white/5 border border-transparent text-[#a3a3a3] hover:text-white'
                  }`}
                >
                  <span className={`${item.color} flex-shrink-0`}>{item.icon}</span>
                  <span className={`text-sm font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-100 md:opacity-0 w-0 lg:w-auto overflow-hidden'}`}>{item.label}</span>
                  {item.badge && isOpen && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                      {item.badge}
                    </span>
                  )}
                  {item.badge && !isOpen && (
                    <span className="hidden lg:inline ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-warning/20 text-warning">
                      {item.badge}
                    </span>
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 border-t border-white/10 pt-4 mt-auto">
          {isUploadMode && (
            <button 
              onClick={() => {
                if (window.confirm('Switch back to Salesforce?\nAll uploaded data will be cleared.')) switchToSalesforce();
              }}
              title="Salesforce"
              className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all duration-300"
            >
              <Cloud className="w-5 h-5 flex-shrink-0" />
              <span className={`text-sm font-semibold transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-100 md:opacity-0 w-0 lg:w-auto overflow-hidden'}`}>Salesforce</span>
            </button>
          )}
          <button className="w-full flex items-center justify-center lg:justify-start gap-3 p-3 lg:px-4 lg:py-3 rounded-lg hover:bg-white/5 border border-transparent transition-all duration-300 text-[#a3a3a3] hover:text-white">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={`text-sm font-medium transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-100 md:opacity-0 w-0 lg:w-auto overflow-hidden'}`}>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
