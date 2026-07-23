import { httpClient } from "@/shared/lib/http/client";
import type {
  AppRequest,
  ApproveRequestInput,
  CreateRequestInput,
  RejectRequestInput,
  RequestsPage,
  RequestStatus,
  RequestType,
} from "@/features/requests/types";

const BASE = "/requests";

interface ListParams {
  status?: RequestStatus;
  type?: RequestType;
  page?: number;
  limit?: number;
}

export const requestsApi = {
  create: async (input: CreateRequestInput): Promise<AppRequest> => {
    const response = await httpClient.post<AppRequest>(BASE, input);
    return response.data;
  },

  list: async (params: ListParams = {}): Promise<RequestsPage> => {
    const response = await httpClient.get<RequestsPage>(BASE, { params });
    return response.data;
  },

  pendingCount: async (): Promise<number> => {
    const response = await httpClient.get<{ count: number }>(`${BASE}/pending/count`);
    return response.data.count;
  },

  get: async (id: string): Promise<AppRequest> => {
    const response = await httpClient.get<AppRequest>(`${BASE}/${id}`);
    return response.data;
  },

  approve: async (id: string, input: ApproveRequestInput): Promise<AppRequest> => {
    const response = await httpClient.post<AppRequest>(`${BASE}/${id}/approve`, input);
    return response.data;
  },

  reject: async (id: string, input: RejectRequestInput): Promise<AppRequest> => {
    const response = await httpClient.post<AppRequest>(`${BASE}/${id}/reject`, input);
    return response.data;
  },
};
