"use client";

import { useCallback, useState } from "react";

export interface PaginationState {
  page: number;
  limit: number;
}

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination({ initialPage = 1, initialLimit = 10 }: UsePaginationOptions = {}) {
  const [state, setState] = useState<PaginationState>({
    page: initialPage,
    limit: initialLimit,
  });

  const setPage = useCallback((page: number) => {
    setState((prev) => ({ ...prev, page: Math.max(1, page) }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setState({ page: 1, limit });
  }, []);

  const reset = useCallback(() => {
    setState({ page: initialPage, limit: initialLimit });
  }, [initialPage, initialLimit]);

  return { ...state, setPage, setLimit, reset };
}
