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
    return <div className="text-sm text-slate-300">Loading guide dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-300">{error}</div>;
  }

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300/80">Guide Command Center</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100 md:text-3xl">Guide Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          Monitor team health, review student progress, and track urgent delivery risks across all your groups.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-600">
          <p className="text-xs uppercase tracking-wider text-slate-400">Groups Mentored</p>
          <p className="mt-2 text-3xl font-bold text-cyan-300">{groups.length}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-600">
          <p className="text-xs uppercase tracking-wider text-slate-400">Students</p>
          <p className="mt-2 text-3xl font-bold text-fuchsia-300">{totalStudents}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-600">
          <p className="text-xs uppercase tracking-wider text-slate-400">Open Tasks</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">{openTasks}</p>
        </article>
        <article className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-600">
          <p className="text-xs uppercase tracking-wider text-slate-400">Average Progress</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">{avgProgress}%</p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <article className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h3 className="text-base font-semibold text-slate-100">My Groups</h3>
          <ul className="mt-4 space-y-3">
            {groups.map((group) => (
              <li key={group.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                <p className="text-sm font-medium text-slate-100">{group.name}</p>
                <p className="mt-1 text-xs text-slate-400">Milestone: {group.milestone}</p>
                <p className="mt-2 text-xs text-slate-300">Members: {group.members.length}</p>
              </li>
            ))}
            {groups.length === 0 ? <li className="text-xs text-slate-400">No groups assigned to you yet.</li> : null}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h3 className="text-base font-semibold text-slate-100">Urgent Tasks</h3>
          <ul className="mt-4 space-y-3">
            {urgentTasks.map((task) => (
              <li key={task.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
                <p className="font-medium text-slate-100">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">Group: {task.group?.name ?? "-"}</p>
                <p className="text-xs text-slate-400">Assignee: {task.assignee?.name ?? "-"}</p>
                <p className="mt-1 text-xs text-amber-300">Due: {formatDate(task.dueDate)}</p>
              </li>
            ))}
            {urgentTasks.length === 0 ? <li className="text-xs text-slate-400">No high-priority tasks right now.</li> : null}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="text-base font-semibold text-slate-100">Recent Student Updates</h3>
        <ul className="mt-4 space-y-3">
          {latestUpdates.map((update) => (
            <li key={update.id} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300">
              <p className="font-medium text-slate-100">{update.summary}</p>
              <p className="mt-1 text-xs text-slate-400">Student: {update.student?.name ?? "Unknown"}</p>
              <p className="text-xs text-slate-400">Submitted: {formatDate(update.createdAt)}</p>
              <p className="mt-1 text-xs text-brand-200">Completion: {update.completionPercent}%</p>
            </li>
          ))}
          {latestUpdates.length === 0 ? <li className="text-xs text-slate-400">No recent student updates.</li> : null}
        </ul>
      </section>
    </div>
  );
};

export default GuideDashboard;
