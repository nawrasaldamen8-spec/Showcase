import { useCallback, useEffect, useRef, useState } from "react";

export interface UseAsyncDataResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useAsyncData<T>(
  fetchFn: () => Promise<T>
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFnRef = useRef(fetchFn);
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  });

  const cancelledRef = useRef(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchFnRef.current();
      if (cancelledRef.current) return;
      setData(result);
    } catch (err) {
      if (cancelledRef.current) return;
      const message = err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      if (!cancelledRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    cancelledRef.current = false;
    void Promise.resolve().then(async () => {
      if (cancelledRef.current) return;
      await reload();
    });
    return () => {
      cancelledRef.current = true;
    };
  }, [reload]);

  return { data, isLoading, error, reload, setData };
}
