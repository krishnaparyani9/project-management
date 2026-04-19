import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStudentDivisionSummary } from "../services/group.api";
import type { StudentDivisionSummary } from "../types/group.types";

const AdminStudentsDirectoryPage = () => {
  const navigate = useNavigate();
  const [summaries, setSummaries] = useState<StudentDivisionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStudentDivisionSummary()
      .then((response) => setSummaries(response.data.data))
      .catch(() => setError("Failed to load student directory."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading students directory...</p>;
  }

  if (error) {
    return <p className="text-sm text-[var(--danger)]">{error}</p>;
  }

  const totalStudents = summaries.reduce((sum, item) => sum + item.totalStudents, 0);
  const totalNotInGroups = summaries.reduce((sum, item) => sum + item.studentsNotInGroups, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Admin Panel</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-strong)]">Students Directory</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Open any division tile to view complete student details, grouped students, and students still not in groups.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Students</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{totalStudents}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Students Not In Groups</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--warn)]">{totalNotInGroups}</p>
          </div>
        </div>
      </header>

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card-bg)] p-5 text-sm text-[var(--text-muted)]">
          No students found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaries.map((summary) => (
            <button
              key={summary.key}
              type="button"
              onClick={() =>
                navigate(
                  `/admin/students-directory/${encodeURIComponent(summary.branch)}/${encodeURIComponent(summary.division)}`
                )
              }
              className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 text-left shadow-card transition hover:border-[var(--primary)]/40 hover:-translate-y-0.5"
            >
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--primary)]">{summary.branch}</p>
              <h3 className="mt-1 text-lg font-semibold text-[var(--text-strong)]">Division {summary.division}</h3>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Total</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text-strong)]">{summary.totalStudents}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">In Groups</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--ok)]">{summary.studentsInGroups}</p>
                </div>
              </div>

              <p className="mt-3 text-sm text-[var(--text-muted)]">
                Not in groups: <span className="font-semibold text-[var(--warn)]">{summary.studentsNotInGroups}</span>
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminStudentsDirectoryPage;
