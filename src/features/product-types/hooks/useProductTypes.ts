"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productTypesApi } from "@/features/product-types/api/productTypesApi";
import type {
  CreateProductTypeRequest,
  ProductType,
  UpdateProductTypeRequest,
} from "@/features/product-types/types";

export const PRODUCT_TYPES_KEY = ["product-types"] as const;

export function useProductTypesQuery() {
  return useQuery<ProductType[]>({
    queryKey: PRODUCT_TYPES_KEY,
    queryFn: productTypesApi.list,
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProductTypeRequest) => productTypesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCT_TYPES_KEY });
    },
  });
}

export function useUpdateProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProductTypeRequest) => productTypesApi.update(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCT_TYPES_KEY });
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => productTypesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PRODUCT_TYPES_KEY });
    },
  });
}
