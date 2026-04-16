import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookOpen, AlertCircle } from "lucide-react";
import Button from "../components/Button";
import { fetchAllSubjects, type Subject } from "../services/subject.api";

const CourseProjectPage = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadData = async () => {
			try {
				const res = await fetchAllSubjects();
				setSubjects(res.data.data);
			} catch (err) {
				console.error("Failed to fetch subjects", err);
			} finally {
				setIsLoading(false);
			}
		};
		loadData();
	}, []);

  return (
    <div className="space-y-6">
      <section className="reveal-up delay-1 lit-card rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-medium">Course Project</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--text-strong)]">Subjects & Workspaces</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
          This page displays all active subjects defined by the administration. You can use these subjects to categorize your course project workflows while managing the group setup in the main Groups section.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/groups"><Button>Manage My Group</Button></Link>
          <Link to="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
        </div>
      </section>

      {isLoading ? (
		<div className="p-8 text-center text-slate-400">Loading subjects...</div>
	  ) : subjects.length === 0 ? (
		<div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-slate-500">
			<AlertCircle size={32} className="mx-auto mb-3 opacity-50" />
			<p>No course subjects have been published by the administration yet.</p>
		</div>
	  ) : (
		<section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{subjects.map((subject, idx) => (
				<article 
					key={subject.id} 
					className="reveal-up rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card hover:bg-[var(--bg-1)] transition-colors group cursor-default"
					style={{ animationDelay: `${(idx + 2) * 50}ms` }}
				>
					<div className="flex items-center gap-3 mb-3">
						<div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500 group-hover:scale-110 transition-transform">
							<BookOpen size={20} />
						</div>
						<h3 className="font-bold text-[var(--text-strong)]">{subject.name}</h3>
					</div>
					<p className="text-sm text-[var(--text-muted)]">
						{subject.description || "Course project guidelines and milestone submissions will be evaluated under this subject."}
					</p>
				</article>
			))}
      	</section>
	  )}
    </div>
  );
};

export default CourseProjectPage;