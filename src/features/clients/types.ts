export interface DocumentType {
  id: string;
  description: string;
}

export interface Client {
  id: string;
  names: string;
  surnames: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthdate: string; // ISO 8601
  typeDocument: DocumentType;
  documentNumber: string;
  employmentStatus: string;
  employerName: string;
  monthlyIncome: number;
  creditScore: number;
  riskCategory: string;
  notes: string;
  createdBy?: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListClientsParams {
  page: number;
  limit: number;
  search?: string;
}

export interface ClientPayload {
  names: string;
  surnames: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthdate: string;
  typeDocument: string; // id del tipo de documento
  documentNumber: string;
  employmentStatus: string;
  employerName: string;
  monthlyIncome: number;
  creditScore: number;
  riskCategory: string;
  notes: string;
  active?: number;
}

export interface UpdateClientPayload extends ClientPayload {
  id: string;
}
