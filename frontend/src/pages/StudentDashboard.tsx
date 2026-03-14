import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { fetchMyGroup } from "../services/group.api";
import { fetchMyProgressUpdates } from "../services/progress.api";
import { fetchMyTasks } from "../services/task.api";
import type { ProjectGroup } from "../types/group.types";
import type { ProgressUpdate } from "../types/progress.types";
import type { Task } from "../types/task.types";
import { formatDate } from "../utils/helpers";

const StudentDashboard = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [group, setGroup] = useState<ProjectGroup | null>(null);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError("");

      try {
        const [tasksResponse, groupResponse, progressResponse] = await Promise.all([
          fetchMyTasks(),
          fetchMyGroup(),
          fetchMyProgressUpdates()
        ]);

        setTasks(tasksResponse.data.data);
        setGroup(groupResponse.data.data);
        setProgressUpdates(progressResponse.data.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const message = (err.response?.data as { message?: string } | undefined)?.message;
          setError(message ?? "Failed to load dashboard data");
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    };

    void loadDashboard();
  }, []);

  const dueThisWeekCount = useMemo(() => {
    const now = new Date();
    const in7Days = new Date();
    in7Days.setDate(now.getDate() + 7);

    return tasks.filter((task) => {
      const due = new Date(task.dueDate);
      return due >= now && due <= in7Days;
    }).length;
  }, [tasks]);

  const activeTasksCount = useMemo(() => tasks.filter((task) => task.status !== "done").length, [tasks]);

  const progressSubmittedCount = progressUpdates.length;

  const averageCompletion = useMemo(() => {
    if (progressUpdates.length === 0) return 0;

    const total = progressUpdates.reduce((sum, item) => sum + item.completionPercent, 0);
    return Math.round(total / progressUpdates.length);
  }, [progressUpdates]);

  const upcomingTasks = useMemo(
    () => [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 3),
    [tasks]
  );

  const recentActivity = useMemo(
    () => progressUpdates.slice(0, 3).map((update) => `${update.summary} (${formatDate(update.createdAt)})`),
    [progressUpdates]
  );

  const quickStats = [
    { label: "Active Tasks", value: String(activeTasksCount), tone: "text-cyan-300" },
    { label: "Due This Week", value: String(dueThisWeekCount), tone: "text-amber-300" },
    { label: "Progress Submitted", value: String(progressSubmittedCount), tone: "text-emerald-300" },
    { label: "Team Members", value: String(group?.members.length ?? 0), tone: "text-fuchsia-300" }
  ];

  if (isLoading) {
    return <div className="text-sm text-slate-300">Loading student dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-300">{error}</div>;
  }

  return (
    <div className="space-y-6 md:space-y-7">
      <section className="rounded-2xl border border-slate-700/80 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 p-5 md:p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-300/80">Overview</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-100 md:text-3xl">Student Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-300 md:text-base">
          Track assigned tasks, submit weekly progress updates, and keep your project documentation aligned with guide expectations.
        </p>
        {group ? (
          <p className="mt-3 text-xs text-brand-200 md:text-sm">
            Group: {group.name} | Milestone: {group.milestone} | Guide: {group.guide.name}
          </p>
        ) : (
          <p className="mt-2 text-xs text-slate-400">No group assigned yet.</p>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => (
          <article key={item.label} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4 transition hover:-translate-y-0.5 hover:border-slate-600">
            <p className="text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100">Upcoming Deadlines</h3>
            <span className="rounded-full bg-brand-500/15 px-2 py-1 text-xs text-brand-200">Sprint 3</span>
          </div>

          <ul className="space-y-3">
            {upcomingTasks.map((task) => (
              <li key={task.title} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 transition hover:border-slate-600">
                <p className="text-sm font-medium text-slate-100">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">Due: {formatDate(task.dueDate)}</p>
                <p className="mt-2 inline-block rounded bg-slate-800 px-2 py-1 text-xs text-slate-300">
                  Status: {task.status} | Priority: {task.priority}
                </p>
              </li>
            ))}
            {upcomingTasks.length === 0 ? <li className="text-xs text-slate-400">No tasks assigned yet.</li> : null}
          </ul>
        </article>

        <article className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
          <h3 className="text-base font-semibold text-slate-100">Recent Activity</h3>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((activity) => (
              <li key={activity} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3 text-sm text-slate-300 transition hover:border-slate-600">
                {activity}
              </li>
            ))}
            {recentActivity.length === 0 ? <li className="text-xs text-slate-400">No recent progress updates.</li> : null}
          </ul>
        </article>
      </section>

      <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
        <h3 className="text-base font-semibold text-slate-100">Progress Snapshot</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>Overall completion</span>
            <span>{averageCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-700">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-brand-500 to-cyan-400"
              style={{ width: `${averageCompletion}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
