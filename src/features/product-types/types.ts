export interface ProductType {
  id: string;
  name: string;
  code: string;
  notes?: string | null;
}

export interface CreateProductTypeRequest {
  name: string;
  code: string;
  notes?: string;
}

export interface UpdateProductTypeRequest extends CreateProductTypeRequest {
  id: string;
}
