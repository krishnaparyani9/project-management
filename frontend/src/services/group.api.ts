export const fetchAllGroupNames = () =>
	api.get<AR<{ name: string; branch: string; division: string }[]>>("/groups/all-public");
import api from "./api";
import type { ProjectGroup, PendingInvite } from "../types/group.types";

interface AR<T> { success: boolean; message: string; data: T; }

export const fetchMyGroup       = () => api.get<AR<ProjectGroup[]>>("/groups/my");
export const fetchMyInvites     = () => api.get<AR<PendingInvite[]>>("/groups/invites");
export const fetchGuideGroups   = () => api.get<AR<ProjectGroup[]>>("/groups/guide");
export const fetchAllGroups     = () => api.get<AR<ProjectGroup[]>>("/groups/all");
export const fetchAllGuides     = () => api.get<AR<{ id: string; name: string; email: string }[]>>("/groups/guides-list");

export const createGroup = (data: { name: string; subject: string }) =>
	api.post<AR<ProjectGroup>>("/groups", data);

export const updateGroup = (id: string, data: { name?: string; subject?: string }) =>
	api.patch<AR<ProjectGroup>>(`/groups/${id}`, data);

export const deleteGroup = (id: string) =>
	api.delete<AR<null>>(`/groups/${id}`);

export const leaveGroup = (id: string) =>
	api.delete<AR<null>>(`/groups/${id}/leave`);

export const inviteStudent = (groupId: string, email: string) =>
	api.post<AR<ProjectGroup>>(`/groups/${groupId}/invites`, { email });

export const respondToInvite = (groupId: string, action: "accept" | "decline") =>
	api.post<AR<{ joined: boolean }>>(`/groups/${groupId}/invites/respond`, { action });

export const cancelInvite = (groupId: string, studentId: string) =>
	api.delete<AR<ProjectGroup>>(`/groups/${groupId}/invites/${studentId}`);

export const removeMember = (groupId: string, memberId: string) =>
	api.delete<AR<ProjectGroup>>(`/groups/${groupId}/members/${memberId}`);

export const assignGuide = (groupId: string, guideId: string | null) =>
	api.post<AR<ProjectGroup>>(`/groups/${groupId}/assign-guide`, { guideId });
