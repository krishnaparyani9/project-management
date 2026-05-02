import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Button from "../components/Button";
import Input from "../components/Input";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";
import { documentService } from "../services/document.api";
import { formatDate } from "../utils/helpers";

interface Document {
	_id: string;
	groupId: {
		_id: string;
		name: string;
	};
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

const DocumentsPage = () => {
	const { user } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");

	const [documents, setDocuments] = useState<Document[]>([]);
	const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState<"all" | "project" | "report" | "presentation" | "other">("all");

	// Load documents
	useEffect(() => {
		const loadDocuments = async () => {
			try {
				setIsLoading(true);
				const docsData = await documentService.getAllDocuments();
				setDocuments(docsData.data || []);
			} catch (err) {
				setError(err instanceof Error ? err.message : "Failed to load documents");
			} finally {
				setIsLoading(false);
			}
		};

		loadDocuments();
	}, []);

	// Filter documents
	useEffect(() => {
		let filtered = documents;

		// Search by file name or group name
		if (searchTerm) {
			filtered = filtered.filter(doc =>
				doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				(doc.groupId as any).name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Filter by type
		if (typeFilter !== "all") {
			filtered = filtered.filter(doc => doc.documentType === typeFilter);
		}

		setFilteredDocuments(filtered);
	}, [documents, searchTerm, typeFilter]);

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
			window.open(response.data.url, "_blank");
		} catch (err) {
			setError(err instanceof Error ? err.message : "Download failed");
		}
	};

	// Only admins and guides can access this page
	if (user && !["admin", "guide"].includes(user.role)) {
		return <Navigate to="/dashboard" replace />;
	}

	if (isLoading) return <Loader />;

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">
						Documents
					</h1>
					<p className="text-purple-200">
						{user?.role === "admin" ? "View all group documents" : "View documents from assigned groups"}
					</p>
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

				{/* Filters */}
				<div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Search
						</label>
						<Input
							type="text"
							placeholder="Search by file name or group..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Document Type
						</label>
						<select
							value={typeFilter}
							onChange={(e) => setTypeFilter(e.target.value as any)}
							className="w-full px-4 py-2 bg-white/10 border border-purple-400/30 rounded-lg text-white focus:border-purple-400 focus:outline-none"
						>
							<option value="all">All Types</option>
							<option value="project">Project</option>
							<option value="report">Report</option>
							<option value="presentation">Presentation</option>
							<option value="other">Other</option>
						</select>
					</div>
				</div>

				{/* Documents Table */}
				<div className="bg-white/5 border border-purple-400/30 rounded-lg overflow-hidden backdrop-blur-sm">
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-purple-400/30 bg-purple-900/30">
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										File Name
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										Group
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										Type
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										Uploaded By
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										Date
									</th>
									<th className="px-6 py-4 text-left text-sm font-semibold text-white">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{filteredDocuments.length === 0 ? (
									<tr>
										<td colSpan={6} className="px-6 py-12 text-center text-purple-300">
											No documents found
										</td>
									</tr>
								) : (
									filteredDocuments.map(doc => (
										<tr
											key={doc._id}
											className="border-b border-purple-400/20 hover:bg-purple-400/5 transition-colors"
										>
											<td className="px-6 py-4">
												<div>
													<p className="font-medium text-white truncate max-w-xs">
														{doc.originalFileName}
													</p>
													{doc.description && (
														<p className="text-sm text-gray-400 truncate max-w-xs">
															{doc.description}
														</p>
													)}
												</div>
											</td>
											<td className="px-6 py-4 text-white">
												{(doc.groupId as any).name}
											</td>
											<td className="px-6 py-4">
												<span className="px-3 py-1 bg-purple-600/20 text-purple-200 text-xs rounded-full">
													{doc.documentType}
												</span>
											</td>
											<td className="px-6 py-4 text-sm text-gray-300">
												<div>
													<p className="font-medium">{doc.uploadedBy.name}</p>
													<p className="text-xs text-gray-500">{doc.uploadedBy.email}</p>
												</div>
											</td>
											<td className="px-6 py-4 text-sm text-gray-300">
												{formatDate(doc.createdAt)}
											</td>
											<td className="px-6 py-4">
												<div className="flex gap-2">
													<button
														onClick={() => handleDownload(doc)}
														className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium transition-colors"
													>
														Download
													</button>
													{user?.role === "admin" && (
														<button
															onClick={() => handleDelete(doc._id)}
															className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm font-medium transition-colors"
														>
															Delete
														</button>
													)}
												</div>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Summary */}
				<div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
					<div className="bg-white/5 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
						<p className="text-purple-300 text-sm">Total Documents</p>
						<p className="text-3xl font-bold text-white mt-2">{documents.length}</p>
					</div>
					<div className="bg-white/5 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
						<p className="text-purple-300 text-sm">Projects</p>
						<p className="text-3xl font-bold text-white mt-2">
							{documents.filter(d => d.documentType === "project").length}
						</p>
					</div>
					<div className="bg-white/5 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
						<p className="text-purple-300 text-sm">Reports</p>
						<p className="text-3xl font-bold text-white mt-2">
							{documents.filter(d => d.documentType === "report").length}
						</p>
					</div>
					<div className="bg-white/5 border border-purple-400/30 rounded-lg p-6 backdrop-blur-sm">
						<p className="text-purple-300 text-sm">Presentations</p>
						<p className="text-3xl font-bold text-white mt-2">
							{documents.filter(d => d.documentType === "presentation").length}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default DocumentsPage;
