'use client';

import { useDataSource } from '@/context/DataSourceContext';
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
  const { isUploadMode, selectedAccount } = dataSource;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevSource = useRef<string>('');

  useEffect(() => {
    const sourceKey = `${isUploadMode}_${selectedAccount?.id}`;
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
    const endpoint = selectedAccount?.id
      ? `${sfEndpoint}${sfEndpoint.includes('?') ? '&' : '?'}accountId=${selectedAccount.id}`
      : sfEndpoint;

    apiGet<T>(endpoint)
      .then(result => { setData(result); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploadMode, selectedAccount?.id, ...deps]);

  return { data, loading, error, isUploadMode };
}
