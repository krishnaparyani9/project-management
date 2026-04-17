import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Check, Search, BookMarked, RotateCcw } from "lucide-react";
import Button from "../components/Button";
import Input from "../components/Input";
import { useAuth } from "../hooks/useAuth";
import { updateProfileRequest } from "../services/auth.api";
import { fetchAllSubjects, type Subject } from "../services/subject.api";

function getErrorMessage(err: unknown, fallback = "Something went wrong.") {
	if (axios.isAxiosError(err)) {
		return (err.response?.data as { message?: string } | undefined)?.message ?? fallback;
	}

	return fallback;
}

const GuideSubjectsPage = () => {
	const { user, signIn } = useAuth();
	const [subjects, setSubjects] = useState<Subject[]>([]);
	const [selectedIds, setSelectedIds] = useState<string[]>(user?.teachingSubjectIds ?? []);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [error, setError] = useState("");

	if (user && user.role !== "guide") {
		return <Navigate to="/dashboard" replace />;
	}

	useEffect(() => {
		setSelectedIds(user?.teachingSubjectIds ?? []);
	}, [user]);

	useEffect(() => {
		const loadSubjects = async () => {
			setIsLoading(true);
			try {
				const response = await fetchAllSubjects();
				setSubjects(response.data.data);
			} catch (err) {
				setError(getErrorMessage(err, "Unable to load subjects."));
			} finally {
				setIsLoading(false);
			}
		};

		void loadSubjects();
	}, []);

	const filteredSubjects = useMemo(() => {
		const query = search.trim().toLowerCase();
		return subjects.filter((subject) => {
			if (!query) return true;
			return subject.name.toLowerCase().includes(query) || subject.description?.toLowerCase().includes(query) || false;
		});
	}, [search, subjects]);

	const toggleSubject = (subjectId: string) => {
		setMessage("");
		setError("");
		setSelectedIds((current) =>
			current.includes(subjectId)
				? current.filter((currentSubjectId) => currentSubjectId !== subjectId)
				: [...current, subjectId]
		);
	};

	const clearAll = () => {
		setMessage("");
		setError("");
		setSelectedIds([]);
	};

	const saveSubjects = async () => {
		setIsSaving(true);
		setMessage("");
		setError("");
		try {
			const response = await updateProfileRequest({ teachingSubjectIds: selectedIds });
			signIn(response.data.data.user);
			setMessage("Teaching subjects updated successfully.");
		} catch (err) {
			setError(getErrorMessage(err, "Unable to update teaching subjects."));
		} finally {
			setIsSaving(false);
		}
	};

	const selectedSubjects = subjects.filter((subject) => selectedIds.includes(subject.id));

	return (
		<div className="space-y-6">
			<section className="reveal-up delay-1 lit-card rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
				<p className="text-xs uppercase tracking-[0.2em] text-[var(--ok)] font-medium">Guide Settings</p>
				<h2 className="mt-2 text-3xl font-bold text-[var(--text-strong)]">Subjects You Teach</h2>
				<p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
					Choose the subjects you teach. Students will only see you when they pick one of these subjects for a course project.
				</p>
			</section>

			{message ? <p className="rounded-xl border border-[var(--ok)]/35 bg-[var(--ok)]/10 px-4 py-3 text-sm text-[var(--ok)]">{message}</p> : null}
			{error ? <p className="rounded-xl border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">{error}</p> : null}

			<div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
				<section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h3 className="text-lg font-bold text-[var(--text-strong)]">Select subjects</h3>
							<p className="text-sm text-[var(--text-muted)]">This list stays editable. Return here whenever your teaching load changes.</p>
						</div>
						<div className="flex gap-2">
							<Button variant="secondary" type="button" onClick={clearAll} disabled={isSaving || selectedIds.length === 0}>
								<RotateCcw size={16} /> Clear
							</Button>
							<Button type="button" onClick={() => void saveSubjects()} disabled={isSaving || isLoading}>
								{isSaving ? "Saving..." : "Save changes"}
							</Button>
						</div>
					</div>

					<div className="mt-5">
						<Input
							id="subject-search"
							label="Search subjects"
							value={search}
							onChange={(event) => setSearch(event.target.value)}
							placeholder="Search by subject name or description"
						/>
					</div>

					<div className="mt-5 grid gap-3 md:grid-cols-2">
						{isLoading ? (
							<p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-muted)]">Loading subjects...</p>
						) : filteredSubjects.length === 0 ? (
							<p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--text-muted)]">No subjects match your search.</p>
						) : (
							filteredSubjects.map((subject) => {
								const isSelected = selectedIds.includes(subject.id);
								return (
									<button
										key={subject.id}
										type="button"
										onClick={() => toggleSubject(subject.id)}
										className={`rounded-xl border p-4 text-left transition ${
											isSelected
												? "border-[var(--ok)]/40 bg-[var(--ok)]/10"
												: "border-[var(--border)] bg-[var(--bg-1)]/60 hover:border-[var(--primary)]/50 hover:bg-[var(--bg-1)]"
										}`}
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="font-semibold text-[var(--text-strong)]">{subject.name}</p>
												<p className="mt-1 text-xs text-[var(--text-muted)]">{subject.description || "No description provided."}</p>
											</div>
											<div className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full border ${isSelected ? "border-[var(--ok)] bg-[var(--ok)] text-white" : "border-[var(--border)] text-transparent"}`}>
												<Check size={14} />
											</div>
										</div>
									</button>
								);
							})
						)}
					</div>
				</section>

				<aside className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card">
					<div className="flex items-center gap-3">
						<div className="rounded-xl bg-[var(--ok)]/12 p-3 text-[var(--ok)]">
							<BookMarked size={20} />
						</div>
						<div>
								<p className="text-sm uppercase tracking-[0.18em] text-[var(--ok)]">Current selection</p>
							<h3 className="text-lg font-bold text-[var(--text-strong)]">{selectedIds.length} subject{selectedIds.length === 1 ? "" : "s"}</h3>
						</div>
					</div>

					<div className="mt-5 space-y-3">
						{selectedSubjects.length === 0 ? (
							<p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-5 text-sm text-[var(--text-muted)]">You have not selected any subjects yet.</p>
						) : (
							selectedSubjects.map((subject) => (
								<div key={subject.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 px-4 py-3">
									<p className="font-semibold text-[var(--text-strong)]">{subject.name}</p>
									<p className="mt-1 text-xs text-[var(--text-muted)]">Visible to students when they choose this subject.</p>
								</div>
							))
						)}
					</div>
				</aside>
			</div>
		</div>
	);
};

export default GuideSubjectsPage;