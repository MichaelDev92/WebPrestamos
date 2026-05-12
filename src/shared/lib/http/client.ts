import axios, { type AxiosInstance } from "axios";
import { toApiError } from "./errors";

const PROXY_BASE_URL = "/api/proxy";

export const httpClient: AxiosInstance = axios.create({
  baseURL: PROXY_BASE_URL,
  headers: {
    "content-type": "application/json",
    accept: "application/json",
  },
  // Same-origin: cookies httpOnly viajan automáticamente al proxy.
  withCredentials: true,
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
);
