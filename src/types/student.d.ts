export interface Student {
  id: string;
  stu_id: number;
  firstname: string;
  surname: string;
  createdAt?: string;
  updatedAt?: string;
  inactive?: boolean;
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
