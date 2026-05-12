import { httpClient } from "@/shared/lib/http/client";
import type {
  CreateProductTypeRequest,
  ProductType,
  UpdateProductTypeRequest,
} from "@/features/product-types/types";

const BASE = "/products/types";

export const productTypesApi = {
  list: async (): Promise<ProductType[]> => {
    const response = await httpClient.get<ProductType[]>(BASE);
    return response.data;
  },

  create: async (payload: CreateProductTypeRequest): Promise<ProductType> => {
    const response = await httpClient.post<ProductType>(BASE, payload);
    return response.data;
  },

  update: async (payload: UpdateProductTypeRequest): Promise<ProductType> => {
    const response = await httpClient.put<ProductType>(BASE, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE}/${id}`);
  },
};
