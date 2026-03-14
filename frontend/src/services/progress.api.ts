import api from "./api";
import type { ProgressUpdate } from "../types/progress.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchMyProgressUpdates = () => api.get<ApiResponse<ProgressUpdate[]>>("/progress/my");