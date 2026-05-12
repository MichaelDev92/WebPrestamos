import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/shared/lib/http/errors";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry(failureCount, error) {
          if (isApiError(error)) {
            const status = error.status;
            if (status === 401 || status === 403 || status === 404 || status === 409) {
              return false;
            }
          }
          return failureCount < 2;
        },
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
