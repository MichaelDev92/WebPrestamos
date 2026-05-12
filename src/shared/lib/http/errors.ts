import axios, { type AxiosError } from "axios";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;

  constructor(params: { status: number; message: string; code?: string; details?: unknown }) {
    super(params.message);
    this.name = "ApiError";
    this.status = params.status;
    this.code = params.code;
    this.details = params.details;
  }
}

interface ServerErrorPayload {
  message?: string | string[];
  error?: string;
  statusCode?: number;
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ServerErrorPayload>;
    const status = axiosErr.response?.status ?? 0;
    const payload = axiosErr.response?.data;

    const rawMessage = Array.isArray(payload?.message)
      ? payload.message.join(", ")
      : payload?.message ?? payload?.error ?? axiosErr.message;

    return new ApiError({
      status,
      message: rawMessage || "Error de red",
      code: payload?.error,
      details: payload,
    });
  }

  if (error instanceof Error) {
    return new ApiError({ status: 0, message: error.message });
  }

  return new ApiError({ status: 0, message: "Error desconocido" });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

/**
 * Mapea status HTTP a key del diccionario i18n para mensaje fallback.
 * Si la API devuelve message útil, ese se prefiere.
 */
export function defaultMessageKey(status: number): string {
  if (status === 401) return "auth.sessionExpired";
  if (status === 403) return "errors.forbidden";
  if (status === 404) return "errors.notFound";
  if (status === 409) return "errors.conflict";
  if (status >= 500) return "errors.server";
  if (status === 0) return "errors.network";
  return "errors.unknown";
}
