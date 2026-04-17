export type UserRole = "student" | "guide" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hasCreatedGroup: boolean;
  branch?: string;
  division?: string;
  rollNo?: string;
  teachingSubjectIds: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
