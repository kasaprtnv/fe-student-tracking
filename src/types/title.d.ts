export interface ITitle {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITitleCreateDTO {
  name: string;
  description?: string;
}

export interface TitleState {
  // Data
  titleMap: Record<string, ITitle>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
