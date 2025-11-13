export interface Student {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  degree?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentState {
  // Data
  studentMap: Record<string, Student>;

  // UI States
  searchQuery: string;
  storeAction: StoreAction;
  loader: boolean;
  error: string | null;
}
