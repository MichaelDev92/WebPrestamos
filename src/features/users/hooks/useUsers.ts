"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usersApi } from "@/features/users/api/usersApi";
import type {
  User,
  ListUsersParams,
  PaginatedResponse,
  UserPayload,
  UpdateUserPayload,
} from "@/features/users/types";

const USERS_BASE_KEY = ["users"] as const;

export function usersListKey(params: ListUsersParams) {
  return [...USERS_BASE_KEY, "list", params] as const;
}

export function useUsersQuery(params: ListUsersParams) {
  return useQuery<PaginatedResponse<User>>({
    queryKey: usersListKey(params),
    queryFn: () => usersApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UserPayload) => usersApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_BASE_KEY });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateUserPayload) => usersApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_BASE_KEY });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_BASE_KEY });
    },
  });
}

export function useReactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.setStatus(id, 1),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: USERS_BASE_KEY });
    },
  });
}
