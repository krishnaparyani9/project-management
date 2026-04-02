export type UserRole = "student" | "guide" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  branch?: string;
  division?: string;
  rollNo?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
