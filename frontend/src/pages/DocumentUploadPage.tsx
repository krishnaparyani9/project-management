import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";
import { documentService } from "../services/document.api";
import { fetchGroupById } from "../services/group.api";
import type { ProjectGroup } from "../types/group.types";
import { formatDate } from "../utils/helpers";

interface Document {
	_id: string;
	groupId: string;
	uploadedBy: {
		_id: string;
		name: string;
		email: string;
	};
	fileName: string;
	originalFileName: string;
	fileSize: number;
	fileType: string;
	filePath: string;
	description: string;
	documentType: "project" | "report" | "presentation" | "other";
	createdAt: string;
	updatedAt: string;
}

const DocumentUploadPage = () => {
	const { groupId } = useParams<{ groupId: string }>();
	const { user } = useAuth();

	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const [group, setGroup] = useState<ProjectGroup | null>(null);
	const [documents, setDocuments] = useState<Document[]>([]);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [description, setDescription] = useState("");
	const [documentType, setDocumentType] = useState<"project" | "report" | "presentation" | "other">("project");
	const [uploading, setUploading] = useState(false);

	// Load group and documents
	useEffect(() => {
		const loadData = async () => {
			try {
				setIsLoading(true);
				if (groupId) {
					const groupData = await fetchGroupById(groupId);
					setGroup(groupData.data.data);

					const docsData = await documentService.getGroupDocuments(groupId);
					setDocuments(docsData.data || []);
				}
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load data");
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [groupId]);

	const handleUpload = async () => {
		if (!selectedFile || !groupId) {
			setError("Please select a file");
			return;
		}

		try {
			setUploading(true);
			setError("");

			await documentService.uploadDocument(
				groupId,
				selectedFile,
				description,
				documentType
			);

			// Reload documents
			const docsData = await documentService.getGroupDocuments(groupId);
			setDocuments(docsData.data || []);

			// Reset form
			setSelectedFile(null);
			setDescription("");
			setDocumentType("project");
			setShowUploadModal(false);
			setSuccessMessage("Document uploaded successfully!");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Upload failed");
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (documentId: string) => {
		if (!confirm("Are you sure you want to delete this document?")) return;

		try {
			await documentService.deleteDocument(documentId);
			setDocuments(documents.filter(d => d._id !== documentId));
			setSuccessMessage("Document deleted successfully!");
			setTimeout(() => setSuccessMessage(""), 3000);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Delete failed");
		}
	};

	const handleDownload = async (document: Document) => {
		try {
			const response = await documentService.getDownloadUrl(document._id);
			// Open the URL in a new tab
			window.open(response.data.data.url, "_blank");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Download failed");
		}
	};

	const canUpload = user && group && (
		group.owner.id === user.id ||
		group.members.some((member) => member.id === user.id)
	);

	if (isLoading) return <Loader />;

	if (!group) {
		return <Navigate to="/dashboard" replace />;
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">
						{group.name} - Documents
					</h1>
					<p className="text-purple-200">Subject: {group.subject}</p>
				</div>

				{/* Messages */}
				{error && (
					<div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-300">
						{error}
					</div>
				)}
				{successMessage && (
					<div className="mb-4 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300">
						{successMessage}
					</div>
				)}

				{/* Upload Section */}
				{canUpload ? (
					<section className="mb-8 rounded-3xl border border-purple-500/20 bg-white/5 p-6 shadow-card">
						<h2 className="text-xl font-semibold text-white mb-4">Upload Document</h2>
						<div className="grid gap-4">
							<div>
								<label className="block text-sm font-medium text-white mb-2">Select File *</label>
								<input
									type="file"
									onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
									className="w-full rounded-2xl border border-purple-400/30 bg-slate-950/70 px-4 py-3 text-sm text-white"
								/>
								{selectedFile && (
									<p className="mt-2 text-sm text-purple-300">
										{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium text-white mb-2">Document Type</label>
								<select
									value={documentType}
									onChange={(e) => setDocumentType(e.target.value as any)}
									className="w-full rounded-2xl border border-purple-400/30 bg-slate-950/70 px-4 py-3 text-sm text-white"
								>
									<option value="project">Project</option>
									<option value="report">Report</option>
									<option value="presentation">Presentation</option>
									<option value="other">Other</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-white mb-2">Description</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									placeholder="Enter document description..."
									rows={4}
									className="w-full rounded-2xl border border-purple-400/30 bg-slate-950/70 px-4 py-3 text-sm text-white"
								/>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
								<button
									onClick={handleUpload}
									disabled={!selectedFile || uploading}
									className="rounded-2xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:bg-gray-600"
								>
									{uploading ? "Uploading..." : "Upload Document"}
								</button>
							</div>
						</div>
					</section>
				) : (
					<div className="mb-8 rounded-3xl border border-purple-500/20 bg-white/5 p-6 text-sm text-purple-200">
						You need to be a member of this group to upload documents.
					</div>
				)}

				{/* Documents Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{documents.length === 0 ? (
						<div className="col-span-full text-center py-12">
							<p className="text-purple-300 text-lg">No documents uploaded yet</p>
						</div>
					) : (
						documents.map(doc => (
							<div
								key={doc._id}
								className="bg-white/5 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm hover:border-purple-400/60 transition-all duration-300"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<h3 className="font-semibold text-white truncate">
											{doc.originalFileName}
										</h3>
										<p className="text-sm text-purple-300 mt-1">
											{doc.documentType.charAt(0).toUpperCase() + doc.documentType.slice(1)}
										</p>
									</div>
									<span className="ml-2 px-2 py-1 bg-purple-600/20 text-purple-200 text-xs rounded">
										{(doc.fileSize / 1024 / 1024).toFixed(2)} MB
									</span>
								</div>

								{doc.description && (
									<p className="text-sm text-gray-300 mb-4 line-clamp-2">
										{doc.description}
									</p>
								)}

								<div className="space-y-2 mb-4 text-xs text-gray-400">
									<p>Uploaded by: {doc.uploadedBy.name}</p>
									<p>Date: {formatDate(doc.createdAt)}</p>
								</div>

								<div className="flex gap-2">
									<button
										onClick={() => handleDownload(doc)}
										className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors"
									>
										Download
									</button>
									{(user?.id === doc.uploadedBy._id || user?.role === "admin") && (
										<button
											onClick={() => handleDelete(doc._id)}
											className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
										>
											Delete
										</button>
									)}
								</div>
							</div>
						))
					)}
				</div>

				{/* Upload Modal */}
				<Modal
					open={showUploadModal}
					onClose={() => {
						setShowUploadModal(false);
						setSelectedFile(null);
						setDescription("");
						setDocumentType("project");
						setError("");
					}}
					title="Upload Document"
				>
					<div className="space-y-4">
						{/* File Input */}
						<div>
							<label className="block text-sm font-medium text-white mb-2">
								Select File *
							</label>
							<input
								type="file"
								onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
								className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
							/>
							{selectedFile && (
								<p className="text-sm text-purple-300 mt-2">
									{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
								</p>
							)}
						</div>

						{/* Document Type */}
						<div>
							<label className="block text-sm font-medium text-white mb-2">
								Document Type
							</label>
							<select
								value={documentType}
								onChange={(e) => setDocumentType(e.target.value as any)}
								className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
							>
								<option value="project">Project</option>
								<option value="report">Report</option>
								<option value="presentation">Presentation</option>
								<option value="other">Other</option>
							</select>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-white mb-2">
								Description
							</label>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Enter document description..."
								className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-gray-400 focus:border-purple-400 focus:outline-none resize-none"
								rows={3}
							/>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-3 pt-4">
							<button
								onClick={handleUpload}
								disabled={!selectedFile || uploading}
								className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors"
							>
								{uploading ? "Uploading..." : "Upload"}
							</button>
							<button
								onClick={() => {
									setShowUploadModal(false);
									setSelectedFile(null);
									setDescription("");
									setDocumentType("project");
									setError("");
								}}
								className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				</Modal>
			</div>
		</div>
	);
};

export default DocumentUploadPage;
