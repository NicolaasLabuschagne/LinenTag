import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { readCache, writeCache } from './cache';

/**
 * Load data whenever the screen gains focus. With a cacheKey, the last good result
 * renders immediately and is kept when the network is unavailable.
 */
export function useLoader<T>(load: () => Promise<T>, deps: unknown[], cacheKey?: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasData = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    if (cacheKey && !hasData.current) {
      const cached = await readCache<T>(cacheKey);
      if (cached && !hasData.current) {
        hasData.current = true;
        setData(cached);
      }
    }
    try {
      const fresh = await load();
      hasData.current = true;
      setData(fresh);
      setError(null);
      if (cacheKey) void writeCache(cacheKey, fresh);
    } catch (err) {
      setError(err as Error);
    }
  }, deps);

  useFocusEffect(
    useCallback(() => {
      void run();
    }, [run]),
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await run();
    setRefreshing(false);
  }, [run]);

  return { data, error, refreshing, refresh, setData };
}
