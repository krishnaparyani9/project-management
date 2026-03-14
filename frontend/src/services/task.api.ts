import api from "./api";
import type { Task } from "../types/task.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchMyTasks = () => api.get<ApiResponse<Task[]>>("/tasks/my");
