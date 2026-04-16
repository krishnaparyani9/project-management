import { Link } from "react-router-dom";
import Button from "../components/Button";

const CourseProjectPage = () => {
  return (
    <div className="space-y-6">
      <section className="reveal-up delay-1 lit-card rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-card">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-medium">Course Project</p>
        <h2 className="mt-2 text-3xl font-bold text-[var(--text-strong)]">CP</h2>
        <p className="mt-3 max-w-3xl text-sm text-[var(--text-muted)] md:text-base">
          This page is the course project workspace for planning, delivery, and coordination. Use it as a dedicated area for CP-related work while keeping your group setup in the Groups section.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/groups"><Button>Open Groups</Button></Link>
          <Link to="/dashboard"><Button variant="secondary">Back to Dashboard</Button></Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-medium">Focus</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Course project milestones, coordination, and review readiness.</p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-medium">Group Rule</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">The same one-group limit applies to student accounts.</p>
        </article>
        <article className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-500 font-medium">Next Step</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">Use the dashboard to switch between project areas.</p>
        </article>
      </section>
    </div>
  );
};

export default CourseProjectPage;