export interface MockCrudConfig<T extends { id: string }> {
  storageKey: string;
  defaultData: T[];
  delay?: number;
  prependOnCreate?: boolean;
}

function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function createMockCrud<T extends { id: string }>(config: MockCrudConfig<T>) {
  const getItems = (): T[] => {
    if (typeof window === "undefined") return config.defaultData;
    try {
      const raw = localStorage.getItem(config.storageKey);
      if (raw) return JSON.parse(raw) as T[];
    } catch {
      // fallback to default
    }
    try {
      localStorage.setItem(config.storageKey, JSON.stringify(config.defaultData));
    } catch {
      // fallback to default
    }
    return config.defaultData;
  };

  const saveItems = (items: T[]) => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(items));
      } catch {
        // fallback
      }
    }
  };

  const simulateDelay = (ms = config.delay ?? 150) => new Promise((resolve) => setTimeout(resolve, ms));

  return {
    getAll: async (): Promise<T[]> => {
      await simulateDelay();
      return getItems();
    },
    getById: async (id: string): Promise<T | null> => {
      await simulateDelay();
      return getItems().find((item) => item.id === id) || null;
    },
    create: async (data: Omit<T, "id" | "createdAt"> & { createdAt?: string }): Promise<T> => {
      await simulateDelay();
      const items = getItems();
      const now = new Date().toISOString();
      const newItem = {
        ...data,
        id: generateUuid(),
        createdAt: "createdAt" in (data as object) ? (data as Record<string, unknown>).createdAt : now,
      } as unknown as T;
      saveItems(config.prependOnCreate ? [newItem, ...items] : [...items, newItem]);
      return newItem;
    },
    update: async (id: string, data: Partial<T>): Promise<T> => {
      await simulateDelay();
      const items = getItems();
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) throw new Error(`Entity not found: ${id}`);
      const updated = { ...items[index], ...data };
      items[index] = updated;
      saveItems(items);
      return updated;
    },
    delete: async (id: string): Promise<void> => {
      await simulateDelay();
      const items = getItems();
      saveItems(items.filter((item) => item.id !== id));
    },
  };
}
