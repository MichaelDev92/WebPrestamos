"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientsApi } from "@/features/clients/api/clientsApi";
import type {
  Client,
  DocumentType,
  ListClientsParams,
  PaginatedResponse,
  ClientPayload,
  UpdateClientPayload,
} from "@/features/clients/types";

const CLIENTS_BASE_KEY = ["clients"] as const;
const DOC_TYPES_KEY = ["clients", "docTypes"] as const;

export function clientsListKey(params: ListClientsParams) {
  return [...CLIENTS_BASE_KEY, "list", params] as const;
}

export function useClientsQuery(params: ListClientsParams) {
  return useQuery<PaginatedResponse<Client>>({
    queryKey: clientsListKey(params),
    queryFn: () => clientsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useDocTypesQuery() {
  return useQuery<DocumentType[]>({
    queryKey: DOC_TYPES_KEY,
    queryFn: () => clientsApi.docTypes(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientPayload) => clientsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_BASE_KEY });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateClientPayload) => clientsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_BASE_KEY });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CLIENTS_BASE_KEY });
    },
  });
}
