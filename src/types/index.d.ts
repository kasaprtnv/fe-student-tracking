export type StoreAction = 'none' | 'creating' | 'updating' | 'deleting';

export interface SelectOption {
  label: string;
  value: string;
}

export interface IApiGetResponse<T> {
  data: T[];
  pageCount: number;
}

export interface IApiPostResponse<T> {
  receivedData: T;
  success: boolean;
  message: string;
}

export interface IApiDeleteResponse {
  success: boolean;
  message: string;
}

export interface IApiPatchResponse<T> {
  updatedFields: Partial<T>;
  success: boolean;
  message: string;
}
