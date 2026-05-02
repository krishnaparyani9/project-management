import axios from "axios";
import api from "./api";

const documentApi = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5501/api",
	withCredentials: true
});

export const documentService = {
	// Upload a document
	uploadDocument: async (
		groupId: string,
		file: File,
		description: string,
		documentType: "project" | "report" | "presentation" | "other"
	) => {
		const formData = new FormData();
		formData.append("file", file);
		formData.append("groupId", groupId);
		formData.append("description", description);
		formData.append("documentType", documentType);

		const response = await documentApi.post("/documents/upload", formData, {
			headers: {
				"Content-Type": "multipart/form-data"
			}
		});

		return response.data;
	},

	// Get documents for a specific group
	getGroupDocuments: async (groupId: string) => {
		const response = await api.get(`/documents/group/${groupId}`);
		return response.data;
	},

	// Get all accessible documents for current user
	getAllDocuments: async () => {
		const response = await api.get("/documents");
		return response.data;
	},

	// Delete a document
	deleteDocument: async (documentId: string) => {
		const response = await api.delete(`/documents/${documentId}`);
		return response.data;
	},

	// Get download URL for a document
	getDownloadUrl: async (documentId: string) => {
		const response = await api.get(`/documents/download/${documentId}`);
		return response.data;
	}
};
