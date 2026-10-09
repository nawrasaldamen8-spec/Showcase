import { MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { extractApiErrorMessage } from "@shared/api/index.ts";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      skipGlobalToast?: boolean;
    };
  }
}

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.skipGlobalToast) {
        return;
      }
      const message = extractApiErrorMessage(error);
      toast.error(message);
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
      retry: (failureCount, error) => {
        if (failureCount >= 2) return false;
        // Do not retry client errors (4xx)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const status = (error as any)?.response?.status;
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return true;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
    },
  },
});
