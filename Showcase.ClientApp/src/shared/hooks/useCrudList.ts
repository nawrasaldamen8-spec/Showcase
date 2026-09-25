import { useCallback, useEffect, useState } from "react";

export interface UseCrudListConfig<T extends { id: string }> {
  fetchItems: () => Promise<T[]>;
}

export function useCrudList<T extends { id: string }>({ fetchItems }: UseCrudListConfig<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load records");
    } finally {
      setIsLoading(false);
    }
  }, [fetchItems]);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve().then(async () => {
      if (cancelled) return;
      await load();
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  return { items, setItems, isLoading, error, reload: load };
}
