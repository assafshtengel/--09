import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      // Increase stale time to reduce unnecessary refetches
      staleTime: 10 * 60 * 1000, // 10 minutes
      // Increase cache time
      gcTime: 60 * 60 * 1000, // 1 hour
      networkMode: 'offlineFirst',
      refetchOnMount: false,
    },
  },
});