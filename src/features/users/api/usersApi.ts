import { httpClient } from "@/shared/lib/http/client";
import type {
  User,
  ListUsersParams,
  PaginatedResponse,
  UserPayload,
  UpdateUserPayload,
} from "@/features/users/types";

const BASE = "/users";

/**
 * OBS-1: la API de `users` espera `?data=<base64(JSON)>` (list/find) y `?id=` (update).
 * Formato NO REST; pendiente de refactor a query params/path (ver MIGRACION-WEB.md).
 * Encoder unicode-safe para no romper con acentos en el navegador.
 */
function encodeData(payload: unknown): string {
  const json = JSON.stringify(payload);
  if (typeof window === "undefined") {
    return Buffer.from(json, "utf8").toString("base64");
  }
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export const usersApi = {
  list: async (params: ListUsersParams): Promise<PaginatedResponse<User>> => {
    const body: { page: number; limit: number; terms?: { fullName: string } } = {
      page: params.page,
      limit: params.limit,
    };
    if (params.search) body.terms = { fullName: params.search };
    const response = await httpClient.get<PaginatedResponse<User>>(BASE, {
      params: { data: encodeData(body) },
    });
    return response.data;
  },

  create: async (payload: UserPayload): Promise<User> => {
    const response = await httpClient.post<User>(BASE, payload);
    return response.data;
  },

  update: async ({ id, ...payload }: UpdateUserPayload): Promise<User> => {
    const response = await httpClient.put<User>(BASE, payload, { params: { id } });
    return response.data;
  },

  remove: async (id: string): Promise<void> => {
    await httpClient.delete(`${BASE}/${id}`);
  },

  /** Reactiva/desactiva un usuario (endpoint REST dedicado, sin base64). */
  setStatus: async (id: string, active: number): Promise<User> => {
    const response = await httpClient.put<User>(`${BASE}/${id}/status`, { active });
    return response.data;
  },
};
