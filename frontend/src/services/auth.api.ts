import api from "./api";
import type { User, UserRole } from "../types/user.types";

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch?: string;
  division?: string;
  rollNo?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

export const loginRequest = (payload: LoginPayload) => api.post<AuthResponse>("/auth/login", payload);
export const registerRequest = (payload: RegisterPayload) => api.post<AuthResponse>("/auth/register", payload);
export const googleLoginRequest = (payload: { credential: string; role: UserRole }) => api.post<AuthResponse>("/auth/google", payload);
export const meRequest = () => api.get<AuthResponse>("/auth/me");
export const updateProfileRequest = (payload: { teachingSubjectIds: string[] }) => api.patch<AuthResponse>("/auth/profile", payload);
export const logoutRequest = () => api.post<{ success: boolean; message: string }>("/auth/logout");
