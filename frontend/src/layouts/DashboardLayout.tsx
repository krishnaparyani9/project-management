import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

const DashboardLayout = () => {
  const { user, signOut } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block rounded-md px-3 py-2 transition",
      isActive
        ? "bg-brand-600/20 text-brand-200 border border-brand-500/40"
        : "text-slate-300 hover:bg-slate-800 hover:text-slate-100 border border-transparent"
    ].join(" ");

  return (
    <div className="min-h-screen bg-transparent md:grid md:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-800 bg-slate-950/90 p-4 backdrop-blur md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:p-7">
        <div className="flex h-full flex-col">
          <header className="mb-8 rounded-xl border border-slate-800/80 bg-slate-900/70 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-300/80">Academic PM</p>
            <h1 className="mt-2 text-xl font-semibold leading-tight text-slate-100">Project Workspace</h1>
            <p className="mt-2 text-sm text-slate-400">{user?.role === "guide" ? "Guide panel" : "Student panel"}</p>
          </header>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500">Workspace</p>
          <nav className="space-y-2 text-sm">
          <NavLink className={navItemClass} to="/dashboard">Dashboard</NavLink>
          <NavLink className={navItemClass} to="/groups">Groups</NavLink>
          <NavLink className={navItemClass} to="/tasks">Tasks</NavLink>
          </nav>

          <div className="mt-6 space-y-4 md:mt-auto">
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="mt-1 truncate text-sm font-medium text-slate-200">{user?.name ?? "Student"}</p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? ""}</p>
            </div>

            <Button className="w-full" variant="secondary" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </aside>

      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-slate-950/30 backdrop-blur md:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
