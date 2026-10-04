import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes cache validity
      gcTime: 1000 * 60 * 10, // 10 minutes garbage collection (reclaims inactive cache memory)
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
