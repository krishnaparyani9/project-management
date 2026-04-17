import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";
import { BookOpen, FileText, Home, Settings2, Users, ListTodo, LogOut } from "lucide-react";

const DashboardLayout = () => {
  const { user, signOut } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "flex items-center gap-2 rounded-xl px-4 py-2 transition font-medium",
      isActive
        ? "bg-[var(--primary)]/10 text-[var(--primary)] shadow-card"
        : "text-[var(--text-muted)] hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
    ].join(" ");

  return (
    <div className="min-h-screen bg-[var(--bg-0)] text-[var(--text-body)] flex flex-col md:flex-row">
      <aside className="w-full md:w-[280px] bg-[var(--bg-2)]/90 backdrop-blur-xl border-r border-[var(--border)] p-4 md:sticky md:top-0 md:h-screen md:p-7 flex-shrink-0 shadow-card">
        <div className="flex h-full flex-col">
          <header className="mb-8 rounded-xl border border-[var(--border)] bg-[var(--bg-1)] p-4 shadow-soft">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">ACADEMIC PM</p>
            <h1 className="mt-2 text-xl font-bold leading-tight text-[var(--text-strong)]">Project Workspace</h1>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              {user?.role === "admin" ? "Admin panel" : user?.role === "guide" ? "Guide panel" : "Student panel"}
            </p>
          </header>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] font-semibold">Workspace</p>
          <nav className="space-y-1 text-sm">
            <NavLink className={navItemClass} to="/dashboard"><Home size={18} />Dashboard</NavLink>
            <NavLink className={navItemClass} to="/groups"><Users size={18} />Groups</NavLink>
            {user?.role === "student" && (
              <>
                <NavLink className={navItemClass} to="/student/edi-major-project"><BookOpen size={18} />EDI Major Project</NavLink>
                <NavLink className={navItemClass} to="/student/course-project"><FileText size={18} />Course Project</NavLink>
              </>
            )}
            {user?.role === "guide" && (
              <NavLink className={navItemClass} to="/guide/subjects"><Settings2 size={18} />My Subjects</NavLink>
            )}
            {user?.role !== "admin" && (
              <NavLink className={navItemClass} to="/tasks"><ListTodo size={18} />Tasks</NavLink>
            )}
          </nav>

          <div className="mt-6 space-y-4 md:mt-auto">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-1)] p-3 shadow-soft">
              <p className="text-xs text-[var(--text-muted)]">Signed in as</p>
              <p className="mt-1 truncate text-sm font-semibold text-[var(--text-strong)]">{user?.name ?? "Student"}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user?.email ?? ""}</p>
            </div>

            <Button className="w-full flex items-center justify-center gap-2" variant="secondary" onClick={signOut}><LogOut size={16} />Sign Out</Button>
          </div>
        </div>
      </aside>

      <main className="dashboard-ambient flex-1 p-4 md:p-8 bg-[var(--bg-0)] min-h-screen">
        <div className="dashboard-content mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
