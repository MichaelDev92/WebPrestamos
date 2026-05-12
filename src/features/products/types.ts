import type { ProductType } from "@/features/product-types/types";

export interface Product {
  id: string;
  name: string;
  code: string;
  salePrice: number;
  costPrice?: number | null;
  stock: number;
  productType: ProductType;
  barcode?: string | null;
  brand?: string | null;
  model?: string | null;
  description?: string | null;
  imageUrls?: string[] | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListProductsParams {
  page: number;
  limit: number;
  search?: string;
  productType?: string;
}

export interface ProductPayload {
  name: string;
  code: string;
  salePrice: number;
  costPrice?: number;
  stock: number;
  productType: string;
  barcode?: string;
  brand?: string;
  model?: string;
  description?: string;
  imageUrls?: string[];
}

export interface UpdateProductPayload extends ProductPayload {
  id: string;
}
