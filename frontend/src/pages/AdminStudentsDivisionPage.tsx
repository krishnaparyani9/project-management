import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { fetchStudentDivisionDetails } from "../services/group.api";
import type { StudentDivisionDetails } from "../types/group.types";

const decodeParam = (value?: string) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const AdminStudentsDivisionPage = () => {
  const { user } = useAuth();
  const { branch: rawBranch, division: rawDivision } = useParams<{ branch: string; division: string }>();

  const branch = useMemo(() => decodeParam(rawBranch), [rawBranch]);
  const division = useMemo(() => decodeParam(rawDivision), [rawDivision]);

  const [details, setDetails] = useState<StudentDivisionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branch || !division) {
      setError("Invalid division path.");
      setIsLoading(false);
      return;
    }

    fetchStudentDivisionDetails(branch, division)
      .then((response) => setDetails(response.data.data))
      .catch(() => setError("Failed to load division details."))
      .finally(() => setIsLoading(false));
  }, [branch, division]);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading division details...</p>;
  }

  if (error || !details) {
    return <p className="text-sm text-[var(--danger)]">{error || "No data available."}</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Students Directory</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-strong)]">
              {details.branch} - Division {details.division}
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Complete breakdown of students in this division.
            </p>
          </div>
          <Link
            to="/admin/students-directory"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)] px-4 py-2 text-sm font-semibold text-[var(--text-body)] transition hover:border-[var(--primary)]/40 hover:text-[var(--primary)]"
          >
            Back to Students Directory
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Total Students</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--text-strong)]">{details.totalStudents}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">In Groups</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--ok)]">{details.studentsInGroupsCount}</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Not In Groups</p>
            <p className="mt-1 text-2xl font-semibold text-[var(--warn)]">{details.studentsNotInGroupsCount}</p>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Students In Groups</h3>
        {details.studentsInGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-muted)]">
            No students in groups in this division.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {details.studentsInGroups.map((student) => (
              <article key={student.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-card">
                <p className="font-semibold text-[var(--text-strong)]">{student.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{student.email}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Roll No: {student.rollNo ?? "-"}</p>
                <p className="mt-2 text-xs text-[var(--text-muted)]">
                  Group: <span className="font-medium text-[var(--text-body)]">{student.groupName ?? "-"}</span>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-[var(--text-strong)]">Students Not In Groups</h3>
        {details.studentsNotInGroups.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card-bg)] p-4 text-sm text-[var(--text-muted)]">
            All students in this division are already grouped.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {details.studentsNotInGroups.map((student) => (
              <article key={student.id} className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-card">
                <p className="font-semibold text-[var(--text-strong)]">{student.name}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{student.email}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">Roll No: {student.rollNo ?? "-"}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminStudentsDivisionPage;
