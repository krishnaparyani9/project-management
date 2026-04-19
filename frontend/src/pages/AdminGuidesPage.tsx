import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { fetchAllGuides } from "../services/group.api";
import type { GuideUser } from "../types/group.types";

function errMsg(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? "Something went wrong.";
  }
  return "Something went wrong.";
}

const AdminGuidesPage = () => {
  const { user } = useAuth();

  const [guides, setGuides] = useState<GuideUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setError("");
      try {
        const guideResponse = await fetchAllGuides();
        setGuides(guideResponse.data.data);
      } catch (err) {
        setError(errMsg(err));
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return guides;
    return guides.filter((guide) => guide.name.toLowerCase().includes(query) || guide.email.toLowerCase().includes(query));
  }, [guides, search]);

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (isLoading) {
    return <p className="text-sm text-[var(--text-muted)]">Loading guide directory...</p>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--primary)]">Admin Panel</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-strong)]">Guide Directory</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">Click a guide name to open the guide details page.</p>
        <div className="mt-4">
          <Link to="/admin/edi-guide-assignment">
            <Button variant="secondary">Open EDI Assignment</Button>
          </Link>
        </div>
      </header>

      {error ? <p className="rounded-lg border border-[var(--danger)]/35 bg-[var(--danger)]/10 px-4 py-3 text-sm text-[var(--danger)]">{error}</p> : null}

      <section className="mx-auto max-w-4xl">
        <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-4 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">All Guides</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{filteredGuides.length} of {guides.length} shown</p>
            </div>
            <label className="block w-full sm:max-w-sm">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.16em] text-[var(--text-muted)]">Search guide</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/70 px-4 py-3 text-sm text-[var(--text-body)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--primary)]/45 focus:ring-4 focus:ring-[color:var(--primary)]/10"
              />
            </label>
          </div>

          <div className="mt-4 space-y-2">
            {filteredGuides.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-1)]/50 px-4 py-4 text-sm text-[var(--text-muted)]">No guides match your search.</p>
            ) : (
              filteredGuides.map((guide) => (
                <Link
                  key={guide.id}
                  to={`/admin/guides/${guide.id}`}
                  className="block rounded-xl border border-[var(--border)] bg-[var(--bg-1)]/60 px-4 py-4 text-base font-semibold text-[var(--text-strong)] transition hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/10"
                >
                  {guide.name}
                </Link>
              ))
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

export default AdminGuidesPage;
