import api from "./api";

interface AR<T> { success: boolean; message: string; data: T; }

export interface Subject {
	id: string;
	name: string;
	description?: string;
}

export const fetchAllSubjects = () =>
	api.get<AR<Subject[]>>("/subjects");

export const createSubject = (data: { name: string; description?: string }) =>
	api.post<AR<Subject>>("/subjects", data);

export const deleteSubject = (id: string) =>
	api.delete<AR<null>>(`/subjects/${id}`);
