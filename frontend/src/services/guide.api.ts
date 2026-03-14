import api from "./api";
import type { ProjectGroup } from "../types/group.types";
import type { ProgressUpdate } from "../types/progress.types";
import type { Task } from "../types/task.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface GuideTask extends Task {
  assignee?: {
    name: string;
    email: string;
  };
  group?: {
    name: string;
  };
}

export interface GuideProgressUpdate extends ProgressUpdate {
  student?: {
    name: string;
    email: string;
  };
}

export const fetchGuideGroups = () => api.get<ApiResponse<ProjectGroup[]>>("/groups/guide");
export const fetchGuideTasks = () => api.get<ApiResponse<GuideTask[]>>("/tasks/guide");
export const fetchGuideProgressUpdates = () => api.get<ApiResponse<GuideProgressUpdate[]>>("/progress/guide");