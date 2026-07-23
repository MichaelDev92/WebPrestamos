import { httpClient } from "@/shared/lib/http/client";
import type {
  Client,
  DocumentType,
  ListClientsParams,
  PaginatedResponse,
  ClientPayload,
  UpdateClientPayload,
} from "@/features/clients/types";

const BASE = "/clients";

export const clientsApi = {
  list: async (params: ListClientsParams): Promise<PaginatedResponse<Client>> => {
    const response = await httpClient.get<PaginatedResponse<Client>>(`${BASE}/all`, {
      params: {
        page: params.page,
        limit: params.limit,
        ...(params.search ? { search: params.search } : {}),
      },
    });
    return response.data;
  },

  docTypes: async (): Promise<DocumentType[]> => {
    const response = await httpClient.get<DocumentType[]>(`${BASE}/doctypes`);
    return response.data;
  },

  create: async (payload: ClientPayload): Promise<Client> => {
    const response = await httpClient.post<Client>(BASE, payload);
    return response.data;
  },

  update: async (payload: UpdateClientPayload): Promise<Client> => {
    const response = await httpClient.put<Client>(BASE, payload);
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE}/${id}`);
  },
};
