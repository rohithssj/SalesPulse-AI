'use client';

import { useDataSource } from '@/context/DataSourceContext';
import { useAccount } from '@/context/AccountContext';
import { apiGet } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';

export function usePageData<T>(
  sfEndpoint: string,
  uploadSelector: (
    ctx: ReturnType<typeof useDataSource>
  ) => T,
  deps: unknown[] = []
) {
  const dataSource = useDataSource();
  const { isUploadMode, selectedAccount: uploadAccount } = dataSource;
  const { selectedAccountId: sfAccountId, loading: accountLoading } = useAccount();
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevSource = useRef<string>('');

  useEffect(() => {
    // 1. Guard: Wait for account state to initialize
    if (!isUploadMode && !sfAccountId && accountLoading) {
      return;
    }

    const activeAccountId = isUploadMode ? uploadAccount?.id : sfAccountId;
    
    // 2. Guard: If not in upload mode, we MUST have a SF account ID
    if (!isUploadMode && !activeAccountId) {
      setData(null);
      setLoading(false);
      return;
    }

    const sourceKey = `${isUploadMode}_${activeAccountId}`;
    
    if (prevSource.current === sourceKey && data !== null) return;
    prevSource.current = sourceKey;

    setLoading(true);
    setError(null);

    if (isUploadMode) {
      try {
        const result = uploadSelector(dataSource);
        setData(result);
      } catch (e) {
        setError('Failed to load uploaded data');
        console.error(e);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Salesforce path
    const endpoint = `${sfEndpoint}${sfEndpoint.includes('?') ? '&' : '?'}accountId=${activeAccountId}`;

    apiGet<T>(endpoint)
      .then(result => { setData(result); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploadMode, uploadAccount?.id, sfAccountId, accountLoading, ...deps]);

  return { data, loading, error, isUploadMode };
}
