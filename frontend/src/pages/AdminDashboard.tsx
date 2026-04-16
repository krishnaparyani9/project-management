import { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, Plus, Trash2, Users } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { fetchAllSubjects, createSubject, deleteSubject, type Subject } from "../services/subject.api";
import { fetchAllGroups } from "../services/group.api";
import type { ProjectGroup } from "../types/group.types";

const AdminDashboard = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
	const [groups, setGroups] = useState<ProjectGroup[]>([]);
	const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);

	const [isAdding, setIsAdding] = useState(false);
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			const [subsRes, groupsRes] = await Promise.all([
				fetchAllSubjects(),
				fetchAllGroups()
			]);
			setSubjects(subsRes.data.data);
			setGroups(groupsRes.data.data);
		} catch (err) {
			console.error("Failed to load dashboard data", err);
		}
	};

	const handleAddSubject = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);
		try {
			await createSubject({ name, description });
			setIsAdding(false);
			setName("");
			setDescription("");
			loadData();
		} catch (err) {
			if (axios.isAxiosError(err)) {
				setError((err.response?.data as any)?.message || "Failed to add subject");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteSubject = async (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		if (!confirm("Are you sure you want to delete this subject?")) return;
		try {
			await deleteSubject(id);
			if (activeSubjectId === id) setActiveSubjectId(null);
			loadData();
		} catch (err) {
			console.error("Failed to delete", err);
		}
	};

	const togglePreview = (id: string) => {
		setActiveSubjectId(curr => curr === id ? null : id);
	};

	return (
		<div className="space-y-6">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<div>
					<h2 className="text-2xl font-bold text-[var(--text-strong)]">Admin Dashboard</h2>
					<p className="text-sm text-slate-400 mt-1">Manage course project subjects and view participating groups.</p>
				</div>
				<Button onClick={() => setIsAdding(!isAdding)} className="flex items-center gap-2">
					<Plus size={16} /> {isAdding ? "Cancel" : "Add Subject"}
				</Button>
			</header>

			{isAdding && (
				<form onSubmit={handleAddSubject} className="reveal-down rounded-xl border border-[var(--border-base)] bg-[var(--bg-1)] p-5 shadow-card max-w-xl">
					<h3 className="text-lg font-bold text-[var(--text-strong)] mb-4">New Subject</h3>
					<div className="space-y-4">
						<Input 
							id="name" 
							label="Subject Name" 
							value={name} 
							onChange={(e) => setName(e.target.value)} 
							placeholder="e.g. Software Engineering"
							required 
						/>
						<div>
                            <label htmlFor="desc" className="block text-sm font-medium text-[var(--text-body)] mb-1">Description</label>
                            <textarea 
                                id="desc"
                                className="w-full rounded-lg border border-slate-700 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring min-h-[80px]"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description..."
                            />
                        </div>
						{error && <p className="text-sm text-red-500">{error}</p>}
						<Button type="submit" disabled={isLoading}>
							{isLoading ? "Saving..." : "Save Subject"}
						</Button>
					</div>
				</form>
			)}

			<div className="grid gap-4">
				{subjects.length === 0 && !isAdding && (
					<div className="text-center py-12 rounded-xl border border-dashed border-slate-700 text-slate-500">
						<BookOpen size={32} className="mx-auto mb-3 opacity-50" />
						<p>No subjects have been configured yet.</p>
					</div>
				)}

				{subjects.map(subject => {
					// We filter groups where group.subject strictly equals the subject's name, 
					// or generally fall back to showing generic ones if they are universal pending specific student input.
					const subjectGroups = groups.filter(g => g.subject?.trim().toLowerCase() === subject.name.trim().toLowerCase());
					const isExpanded = activeSubjectId === subject.id;

					return (
						<div key={subject.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] shadow-card overflow-hidden transition-all duration-300">
							<div 
								onClick={() => togglePreview(subject.id)}
								className="p-5 flex justify-between items-center cursor-pointer hover:bg-[var(--bg-1)] transition-colors"
							>
								<div className="flex items-center gap-4">
									<div className="bg-blue-500/10 p-3 rounded-lg text-blue-500">
										<BookOpen size={20} />
									</div>
									<div>
										<h3 className="text-lg font-bold text-[var(--text-strong)]">{subject.name}</h3>
										{subject.description && <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">{subject.description}</p>}
									</div>
								</div>
								<div className="flex items-center gap-4">
									<div className="flex items-center gap-2 text-sm text-slate-400">
										<Users size={16} />
										<span className="font-medium">{subjectGroups.length} Groups</span>
									</div>
									<button onClick={(e) => handleDeleteSubject(subject.id, e)} className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition">
										<Trash2 size={16} />
									</button>
								</div>
							</div>

							{isExpanded && (
								<div className="border-t border-[var(--border)] p-5 bg-[var(--bg-0)]/50">
									<h4 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">Registered Groups</h4>
									{subjectGroups.length === 0 ? (
										<p className="text-sm text-slate-400 italic">No student groups are currently registered under this specific subject.</p>
									) : (
										<div className="grid gap-3 md:grid-cols-2">
											{subjectGroups.map(group => (
												<div key={group.id} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-1)] flex justify-between items-start">
													<div>
														<p className="font-bold text-[var(--text-strong)]">{group.name}</p>
														<p className="text-xs text-slate-400 mt-1">Owner: {group.owner?.name}</p>
													</div>
													<span className="text-xs font-semibold px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded">
														{group.members?.length || 0} Members
													</span>
												</div>
											))}
										</div>
									)}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default AdminDashboard;
