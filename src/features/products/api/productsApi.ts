import { httpClient } from "@/shared/lib/http/client";
import type {
  ListProductsParams,
  PaginatedResponse,
  Product,
  ProductPayload,
  UpdateProductPayload,
} from "@/features/products/types";

const BASE = "/products";

export const productsApi = {
  list: async (params: ListProductsParams): Promise<PaginatedResponse<Product>> => {
    const response = await httpClient.get<PaginatedResponse<Product>>(`${BASE}/all`, {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
        ...(params.productType ? { productType: params.productType } : {}),
      },
    });
    return response.data;
  },

  create: async (payload: ProductPayload): Promise<Product> => {
    const response = await httpClient.post<Product>(BASE, payload);
    return response.data;
  },

  update: async (payload: UpdateProductPayload): Promise<Product> => {
    const response = await httpClient.put<Product>(BASE, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE}/${id}`);
  },
};
