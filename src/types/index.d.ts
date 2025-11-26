export type StoreAction = 'none' | 'creating' | 'updating' | 'deleting';

export interface SelectOption {
  label: string;
  value: string;
  description?: string;
}

export interface IApiGetResponse<T> {
  data: T[];
  pageCount: number;
}

export interface IApiGetByIdResponse<T> {
  data: T;
}

export interface IApiPostResponse<T> {
  receivedData: T;
  success: boolean;
  message: string;
}

export interface IApiDeleteResponse {
  deletedId: string;
  success: boolean;
  message: string;
}

export interface IApiDeleteManyResponse {
  deletedIds: string[];
  success: boolean;
  message: string;
}

export interface IApiPatchResponse<T> {
  updatedFields: Partial<T>;
  success: boolean;
  message: string;
}
