"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { requestsApi } from "@/features/requests/api/requestsApi";
import { PRODUCT_TYPES_KEY } from "@/features/product-types/hooks/useProductTypes";
import type {
  AppRequest,
  ApproveRequestInput,
  CreateRequestInput,
  RejectRequestInput,
  RequestsPage,
  RequestStatus,
} from "@/features/requests/types";

export const REQUESTS_KEY = ["requests"] as const;

export function useRequestsQuery(status?: RequestStatus, enabled = true) {
  return useQuery<RequestsPage>({
    queryKey: [...REQUESTS_KEY, "list", status ?? "all"],
    queryFn: () => requestsApi.list({ status, limit: 50 }),
    enabled,
  });
}

export function usePendingCountQuery(enabled = true) {
  return useQuery<number>({
    queryKey: [...REQUESTS_KEY, "pending-count"],
    queryFn: () => requestsApi.pendingCount(),
    enabled,
    refetchOnWindowFocus: true,
  });
}

export function useRequestQuery(id: string | null, enabled = true) {
  return useQuery<AppRequest>({
    queryKey: [...REQUESTS_KEY, "detail", id],
    queryFn: () => requestsApi.get(id as string),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateRequest() {
  return useMutation({
    mutationFn: (input: CreateRequestInput) => requestsApi.create(input),
  });
}

export function useApproveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveRequestInput }) =>
      requestsApi.approve(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
      void queryClient.invalidateQueries({ queryKey: PRODUCT_TYPES_KEY });
    },
  });
}

export function useRejectRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectRequestInput }) =>
      requestsApi.reject(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
    },
  });
}
