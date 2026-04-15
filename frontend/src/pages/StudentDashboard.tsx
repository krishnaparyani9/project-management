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
        setGroup(groupResponse.data.data[0] ?? null);
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

  const taskNotifications = useMemo(
    () => [...tasks]
      .filter((task) => task.status !== "done")
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5),
    [tasks]
  );

  const recentActivity = useMemo(
    () => progressUpdates.slice(0, 3).map((update) => `${update.summary} (${formatDate(update.createdAt)})`),
    [progressUpdates]
  );

  const quickStats = [
    { label: "Active Tasks", value: String(activeTasksCount), tone: "text-blue-600" },
    { label: "Due This Week", value: String(dueThisWeekCount), tone: "text-amber-500" },
    { label: "Progress Submitted", value: String(progressSubmittedCount), tone: "text-emerald-600" },
    { label: "Team Members", value: String(group?.members.length ?? 0), tone: "text-violet-600" }
  ];

  if (isLoading) {
    return <div className="text-sm text-slate-500">Loading student dashboard...</div>;
  }

  if (error) {
    return <div className="text-sm text-rose-600">{error}</div>;
  }

  return (
    <div className="grid gap-6 md:gap-8">
      <section className="rounded-xl border border-blue-400/20 bg-[var(--bg-1)]/80 shadow-lg p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-500 font-medium">Overview</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--text-strong)] md:text-3xl">Student Dashboard</h2>
        <p className="mt-3 max-w-3xl text-sm text-slate-400 md:text-base">
          Track assigned tasks, submit weekly progress updates, and keep your project documentation aligned with guide expectations.
        </p>
      </section>

      <section className="grid gap-6 md:gap-8 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-lg border border-blue-400/20 bg-[var(--bg-2)]/80 p-5 shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-blue-500">Group Details</p>
          {group ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">Group Name</p>
                <p className="mt-1 text-lg font-semibold text-slate-800">{group.name}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-blue-400/10 bg-[var(--bg-0)]/80 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Members</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-body)]">{group.members.length} / 4</p>
                </div>
                <div className="rounded-md border border-blue-400/10 bg-[var(--bg-0)]/80 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-400">Guide</p>
                  <p className="mt-1 text-sm font-medium text-[var(--text-body)]">{group.guide?.name ?? "Not assigned"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No group details available yet.</p>
          )}
        </article>

        <article className="rounded-lg border border-blue-400/20 bg-[var(--bg-2)]/80 p-5 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-strong)]">Notifications</h3>
            <span className="rounded-full bg-blue-200/20 px-2 py-1 text-xs text-blue-400">Assigned by Guide</span>
          </div>
          <ul className="mt-4 space-y-2">
            {taskNotifications.map((task) => (
              <li key={task.id} className="rounded-md border border-blue-400/10 bg-[var(--bg-0)]/80 p-3">
                <p className="text-sm font-medium text-[var(--text-strong)]">New task assigned: {task.title}</p>
                <p className="mt-1 text-xs text-slate-400">Due {formatDate(task.dueDate)} · Priority {task.priority}</p>
              </li>
            ))}
            {taskNotifications.length === 0 ? (
              <li className="text-xs text-slate-400">No new task notifications.</li>
            ) : null}
          </ul>
        </article>
      </section>

      <section className="grid gap-6 md:gap-8 sm:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((item) => (
          <article key={item.label} className="rounded-lg border border-blue-400/20 bg-[var(--bg-1)]/80 p-4 shadow-md transition hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-lg">
            <p className="text-xs uppercase tracking-wider text-slate-400">{item.label}</p>
            <p className={`mt-2 text-3xl font-bold ${item.tone}`}>{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 md:gap-8 lg:grid-cols-[1.3fr_1fr]">
        <article className="rounded-lg border border-blue-400/20 bg-[var(--bg-2)]/80 p-5 shadow-md">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-[var(--text-strong)]">Upcoming Deadlines</h3>
            <span className="rounded-full bg-blue-200/20 px-2 py-1 text-xs text-blue-400">Sprint 3</span>
          </div>

          <ul className="space-y-3">
            {upcomingTasks.map((task) => (
              <li key={task.title} className="rounded-md border border-blue-400/10 bg-[var(--bg-0)]/80 p-3 transition hover:border-blue-400">
                <p className="text-sm font-medium text-[var(--text-strong)]">{task.title}</p>
                <p className="mt-1 text-xs text-slate-400">Due: {formatDate(task.dueDate)}</p>
                <p className="mt-2 inline-block rounded bg-blue-200/20 px-2 py-1 text-xs text-blue-400">
                  Status: {task.status} | Priority: {task.priority}
                </p>
              </li>
            ))}
            {upcomingTasks.length === 0 ? <li className="text-xs text-slate-400">No tasks assigned yet.</li> : null}
          </ul>
        </article>

        <article className="rounded-lg border border-blue-400/20 bg-[var(--bg-2)]/80 p-5 shadow-md">
          <h3 className="text-base font-semibold text-[var(--text-strong)]">Recent Activity</h3>
          <ul className="mt-4 space-y-3">
            {recentActivity.map((activity) => (
              <li key={activity} className="rounded-md border border-blue-400/10 bg-[var(--bg-0)]/80 p-3 text-sm text-[var(--text-body)] transition hover:border-blue-400">
                {activity}
              </li>
            ))}
            {recentActivity.length === 0 ? <li className="text-xs text-slate-400">No recent progress updates.</li> : null}
          </ul>
        </article>
      </section>

      <section className="rounded-lg border border-blue-400/20 bg-[var(--bg-1)]/80 p-5 shadow-md">
        <h3 className="text-base font-semibold text-[var(--text-strong)]">Progress Snapshot</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-sm text-[var(--text-body)]">
            <span>Overall completion</span>
            <span>{averageCompletion}%</span>
          </div>
          <div className="h-2 rounded-full bg-blue-200/20">
            <div
              className="h-2 rounded-full bg-blue-500"
              style={{ width: `${averageCompletion}%` }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;
