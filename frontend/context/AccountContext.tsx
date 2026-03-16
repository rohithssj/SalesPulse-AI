'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAccounts } from '@/lib/api';

interface Account {
  Id: string;
  Name: string;
  Industry?: string;
  AnnualRevenue?: number;
}

interface AccountContextType {
  accounts: Account[];
  selectedAccount: Account | null;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  loading: boolean;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAccounts() {
      try {
        const data = await fetchAccounts();
        if (data && Array.isArray(data)) {
          setAccounts(data);
          if (data.length > 0 && !selectedAccountId) {
            setSelectedAccountId(data[0].Id);
          }
        }
      } catch (error) {
        console.error('Failed to load accounts', error);
      } finally {
        setLoading(false);
      }
    }
    loadAccounts();
  }, [selectedAccountId]);

  const selectedAccount = accounts.find(a => a.Id === selectedAccountId) || accounts[0] || null;

  return (
    <AccountContext.Provider value={{ 
      accounts, 
      selectedAccount,
      selectedAccountId: selectedAccountId || (accounts[0]?.Id || ''), 
      setSelectedAccountId, 
      loading 
    }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}
