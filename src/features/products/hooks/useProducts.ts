"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/productsApi";
import type {
  ListProductsParams,
  PaginatedResponse,
  Product,
  ProductPayload,
  UpdateProductPayload,
} from "@/features/products/types";

const PRODUCTS_BASE_KEY = ["products"] as const;

export function productsListKey(params: ListProductsParams) {
  return [...PRODUCTS_BASE_KEY, "list", params] as const;
}

export function useProductsQuery(params: ListProductsParams) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: productsListKey(params),
    queryFn: () => productsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => productsApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_BASE_KEY });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductPayload) => productsApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_BASE_KEY });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productsApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCTS_BASE_KEY });
    },
  });
}
