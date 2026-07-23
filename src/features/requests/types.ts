export type RequestStatus = "pending" | "approved" | "rejected";
export type RequestType = "PRODUCT_TYPE_CREATE";

export interface RequestUserRef {
  id: string;
  fullName?: string;
  email?: string;
}

export interface RequestResult {
  entity: string;
  entityId: string;
}

export interface AppRequest {
  id: string;
  type: RequestType;
  title: string;
  description: string | null;
  payload: Record<string, unknown>;
  status: RequestStatus;
  audience: string[];
  requestedBy: RequestUserRef | null;
  resolvedBy: RequestUserRef | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  responseTimeMs: number | null;
  result: RequestResult | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestsPage {
  data: AppRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateRequestInput {
  type: RequestType;
  title: string;
  description?: string;
  payload?: Record<string, unknown>;
}

/** Cuerpo de aprobación (para PRODUCT_TYPE_CREATE el aprobador aporta el `code`). */
export interface ApproveRequestInput {
  code?: string;
  name?: string;
  notes?: string;
  note?: string;
}

export interface RejectRequestInput {
  note?: string;
}
