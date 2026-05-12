"use client";

import { useMemo } from "react";
import { useProductsQuery } from "@/features/products/hooks/useProducts";
import type { Product } from "@/features/products/types";

const OVERVIEW_LIMIT = 1000;

export interface ProductsByTypeBucket {
  typeId: string;
  typeName: string;
  count: number;
}

export interface OverviewMetrics {
  activeProducts: number;
  totalStock: number;
  inventoryValue: number;
  productsByType: ProductsByTypeBucket[];
}

const EMPTY_METRICS: OverviewMetrics = {
  activeProducts: 0,
  totalStock: 0,
  inventoryValue: 0,
  productsByType: [],
};

export function useOverviewData() {
  const query = useProductsQuery({ page: 1, limit: OVERVIEW_LIMIT });

  const metrics = useMemo<OverviewMetrics>(() => {
    if (!query.data) return EMPTY_METRICS;
    return buildMetrics(query.data.data);
  }, [query.data]);

  return {
    metrics,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}

function buildMetrics(products: Product[]): OverviewMetrics {
  const byType = new Map<string, ProductsByTypeBucket>();
  let totalStock = 0;
  let inventoryValue = 0;

  for (const product of products) {
    totalStock += product.stock;
    inventoryValue += (product.salePrice || 0) * (product.stock || 0);

    const typeId = product.productType?.id ?? "unknown";
    const typeName = product.productType?.name ?? "Sin tipo";
    const bucket = byType.get(typeId);
    if (bucket) {
      bucket.count += 1;
    } else {
      byType.set(typeId, { typeId, typeName, count: 1 });
    }
  }

  const productsByType = Array.from(byType.values()).sort((a, b) => b.count - a.count);

  return {
    activeProducts: products.length,
    totalStock,
    inventoryValue,
    productsByType,
  };
}
