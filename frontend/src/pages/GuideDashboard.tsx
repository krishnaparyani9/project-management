import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { formatDate } from "../utils/helpers";
import type { ProjectGroup } from "../types/group.types";
import { fetchGuideGroups, fetchGuideProgressUpdates, fetchGuideTasks, type GuideProgressUpdate, type GuideTask } from "../services/guide.api";

const GuideDashboard = () => {
  const [groups, setGroups] = useState<ProjectGroup[]>([]);
  const [tasks, setTasks] = useState<GuideTask[]>([]);
  const [updates, setUpdates] = useState<GuideProgressUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadGuideDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [groupsRes, tasksRes, updatesRes] = await Promise.all([
          fetchGuideGroups(),
          fetchGuideTasks(),
          fetchGuideProgressUpdates()
        ]);

        setGroups(groupsRes.data.data);
        setTasks(tasksRes.data.data);
        setUpdates(updatesRes.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as { message?: string } | undefined)?.message;
          setError(message ?? "Failed to load guide dashboard data");
        } else {
          setError("Failed to load guide dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadGuideDashboard();
  }, []);

  const totalStudents = useMemo(() => groups.reduce((sum, group) => sum + group.members.length, 0), [groups]);
  const openTasks = useMemo(() => tasks.filter((task) => task.status !== "done").length, [tasks]);
  const avgProgress = useMemo(() => {
    if (!updates.length) return 0;
    const total = updates.reduce((sum, item) => sum + item.completionPercent, 0);
    return Math.round(total / updates.length);
  }, [updates]);

  const latestUpdates = useMemo(() => updates.slice(0, 5), [updates]);
  const urgentTasks = useMemo(() => tasks.filter((task) => task.priority === "high").slice(0, 5), [tasks]);

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading guide dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-600">{error}</div>;
  }

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="rounded-2xl border border-blue-200/30 bg-[var(--bg-2)]/80 backdrop-blur-md p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-medium">Guide Command Center</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--text-strong)] md:text-3xl">Guide Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-400 md:text-base">
          Monitor team health, review student progress, and track urgent delivery risks across all your groups.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-4 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500">Groups Mentored</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{groups.length}</p>
        </article>
        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-4 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500">Students</p>
          <p className="mt-2 text-3xl font-bold text-violet-600">{totalStudents}</p>
        </article>
        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-4 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500">Open Tasks</p>
          <p className="mt-2 text-3xl font-bold text-amber-500">{openTasks}</p>
        </article>
        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-4 shadow-xl transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-2xl">
          <p className="text-xs uppercase tracking-wider text-slate-500">Average Progress</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{avgProgress}%</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-5 shadow-xl">
          <h3 className="text-base font-semibold text-slate-800">My Groups</h3>
          <ul className="mt-4 space-y-3">
            {groups.map((group) => (
                  <li key={m.id} className="rounded-lg border border-blue-200/30 bg-[var(--bg-1)]/80 px-2 py-2 text-sm text-[var(--text-body)]">
                    <div className="flex items-center gap-2">
                      <Avatar name={m.name} />
                      <div>
                        <p className="text-sm font-medium text-[var(--text-strong)]">{m.name}</p>
                        <p className="text-xs text-slate-400">{m.email}</p>
                        <p className="text-xs text-slate-400">
                          Branch: {m.branch ?? "-"} · Division: {m.division ?? "-"} · Roll No: {m.rollNo ?? "-"}
                        </p>
                      </div>
                    </div>
                <p className="mt-2 text-xs text-slate-400">Members: {group.members.length}</p>
              </li>
            ))}
            {groups.length === 0 ? <li className="text-xs text-slate-400">No groups assigned to you yet.</li> : null}
          </ul>
        </article>

        <article className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-5 shadow-xl">
          <h3 className="text-base font-semibold text-slate-800">Urgent Tasks</h3>
          <ul className="mt-4 space-y-3">
            {urgentTasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-blue-200/30 bg-[var(--bg-1)]/80 p-3 text-sm text-[var(--text-body)]">
                <p className="font-medium text-[var(--text-strong)]">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">Group: {task.group?.name ?? "-"}</p>
                <p className="text-xs text-slate-400">Assignee: {task.assignee?.name ?? "-"}</p>
                <p className="mt-1 text-xs text-amber-400 font-medium">Due: {formatDate(task.dueDate)}</p>
              </li>
            ))}
            {urgentTasks.length === 0 ? <li className="text-xs text-slate-400">No high-priority tasks right now.</li> : null}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-blue-200/30 bg-[var(--bg-2)]/80 p-5 shadow-xl">
        <h3 className="text-base font-semibold text-[var(--text-strong)]">Recent Student Updates</h3>
        <ul className="mt-4 space-y-3">
          {latestUpdates.map((update) => (
            <li key={update.id} className="rounded-lg border border-blue-200/30 bg-[var(--bg-1)]/80 p-3 text-sm text-[var(--text-body)]">
              <p className="font-medium text-[var(--text-strong)]">{update.summary}</p>
              <p className="mt-1 text-xs text-slate-400">Student: {update.student?.name ?? "Unknown"}</p>
              <p className="text-xs text-slate-400">Submitted: {formatDate(update.createdAt)}</p>
              <p className="mt-1 text-xs text-blue-400 font-medium">Completion: {update.completionPercent}%</p>
            </li>
          ))}
          {latestUpdates.length === 0 ? <li className="text-xs text-slate-400">No recent student updates.</li> : null}
        </ul>
      </section>
    </div>
  );
};

export default GuideDashboard;
