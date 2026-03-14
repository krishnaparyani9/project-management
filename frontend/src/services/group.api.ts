import api from "./api";
import type { ProjectGroup } from "../types/group.types";

interface ApiResponse<T> {
	success: boolean;
	message: string;
	data: T;
}

export const fetchMyGroup = () => api.get<ApiResponse<ProjectGroup | null>>("/groups/my");
