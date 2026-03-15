'use client';

import React, {
  createContext, useContext, useState,
  useCallback, useEffect, ReactNode
} from 'react';

export type DataSource = 'salesforce' | 'upload';

export interface NormalizedDeal {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  value: number;
  formattedValue: string;
  stage: string;
  probability: number;
  closeDate: string;
  daysLeft: number;
  contact: string;
  owner: string;
  lastActivity: string;
  signals: string[];
  industry: string;
  email: string;
  phone: string;
}

export interface NormalizedAccount {
  id: string;
  name: string;
  industry: string;
  revenue: number;
  employees: number;
  primaryContact: string;
  email: string;
  phone: string;
  lastActivity: string;
  deals: NormalizedDeal[];
  buyingSignals: string[];
  engagementLevel: 'High' | 'Medium' | 'Low';
  // --- New fields from multi-sheet Excel ---
  city?: string;
  country?: string;
  website?: string;
  contactCount?: number;
  dealCount?: number;
  totalDealValue?: number;
  contacts?: Array<{
    id: string;
    name: string;
    title: string;
    email: string;
    phone: string;
  }>;
}

export interface NormalizedActivity {
  id: string;
  type: string;
  subject: string;
  accountName: string;
  date: string;
  description: string;
}

export interface GlobalData {
  deals: NormalizedDeal[];
  accounts: NormalizedAccount[];
  activities: NormalizedActivity[];
  summary: {
    totalPipelineValue: number;
    activeDeals: number;
    winRate: number;
    avgDealSize: number;
    totalAccounts: number;
    formattedPipelineValue: string;
  };
  rawFileName: string;
  uploadedAt: string;
}

interface DataSourceContextType {
  source: DataSource;
  globalData: GlobalData | null;
  selectedAccount: NormalizedAccount | null;
  setSelectedAccount: (a: NormalizedAccount | null) => void;
  switchToUpload: (data: GlobalData) => void;
  switchToSalesforce: () => void;
  isUploadMode: boolean;
  getDeals: () => NormalizedDeal[];
  getAccounts: () => NormalizedAccount[];
  getSelectedAccountDeals: () => NormalizedDeal[];
  getSelectedAccountSignals: () => string[];
  getPipelineSummary: () => GlobalData['summary'] | null;
}

const DataSourceContext = createContext<DataSourceContextType | null>(null);
const STORAGE_KEY = 'salespulse_uploaded_data';
const ACCOUNT_KEY = 'salespulse_selected_account';

const formatCurrency = (val: number): string => {
  if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

export function DataSourceProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<DataSource>('salesforce');
  const [globalData, setGlobalData] = useState<GlobalData | null>(null);
  const [selectedAccount, setSelectedAccountState] =
    useState<NormalizedAccount | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: GlobalData = JSON.parse(stored);
        setGlobalData(parsed);
        setSource('upload');

        // Restore selected account
        const storedAccount = localStorage.getItem(ACCOUNT_KEY);
        if (storedAccount) {
          setSelectedAccountState(JSON.parse(storedAccount));
        } else if (parsed.accounts.length > 0) {
          setSelectedAccountState(parsed.accounts[0]);
        }
      }
    } catch (e) {
      console.error('DataSource hydration error:', e);
    }
    setHydrated(true);
  }, []);

  const setSelectedAccount = useCallback((account: NormalizedAccount | null) => {
    setSelectedAccountState(account);
    if (account) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(ACCOUNT_KEY);
    }
  }, []);

  const switchToUpload = useCallback((data: GlobalData) => {
    // Add formatted values
    const enriched: GlobalData = {
      ...data,
      deals: data.deals.map(d => ({
        ...d,
        formattedValue: formatCurrency(d.value),
      })),
      summary: {
        ...data.summary,
        formattedPipelineValue: formatCurrency(data.summary.totalPipelineValue),
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enriched));
    setGlobalData(enriched);
    setSource('upload');
    if (enriched.accounts.length > 0) {
      setSelectedAccount(enriched.accounts[0]);
    }
    window.location.href = '/';
  }, [setSelectedAccount]);

  const switchToSalesforce = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACCOUNT_KEY);
    setGlobalData(null);
    setSource('salesforce');
    setSelectedAccountState(null);
    window.location.href = '/';
  }, []);

  // Helper: get all deals (filtered by selected account if set)
  const getDeals = useCallback((): NormalizedDeal[] => {
    if (!globalData) return [];
    return globalData.deals;
  }, [globalData]);

  const getAccounts = useCallback((): NormalizedAccount[] => {
    if (!globalData) return [];
    return globalData.accounts;
  }, [globalData]);

  const getSelectedAccountDeals = useCallback((): NormalizedDeal[] => {
    if (!globalData) return [];
    if (!selectedAccount) return globalData.deals;
    return globalData.deals.filter(
      d => d.accountId === selectedAccount.id ||
           d.accountName === selectedAccount.name
    );
  }, [globalData, selectedAccount]);

  const getSelectedAccountSignals = useCallback((): string[] => {
    if (!selectedAccount) return [];
    const deals = getSelectedAccountDeals();
    const signals = deals.flatMap(d => d.signals);
    return [...new Set(signals)];
  }, [selectedAccount, getSelectedAccountDeals]);

  const getPipelineSummary = useCallback(() => {
    return globalData?.summary || null;
  }, [globalData]);

  if (!hydrated) return null;

  return (
    <DataSourceContext.Provider value={{
      source, globalData, selectedAccount, setSelectedAccount,
      switchToUpload, switchToSalesforce,
      isUploadMode: source === 'upload',
      getDeals, getAccounts,
      getSelectedAccountDeals, getSelectedAccountSignals,
      getPipelineSummary,
    }}>
      {children}
    </DataSourceContext.Provider>
  );
}

export function useDataSource() {
  const ctx = useContext(DataSourceContext);
  if (!ctx) throw new Error('useDataSource must be inside DataSourceProvider');
  return ctx;
}
