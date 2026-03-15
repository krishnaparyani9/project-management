import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/Button";

const DashboardLayout = () => {
  const { user, signOut } = useAuth();

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    [
      "block rounded-md px-3 py-2 transition font-medium",
      isActive
        ? "bg-white/15 text-white"
        : "text-slate-300 hover:bg-white/10 hover:text-white"
    ].join(" ");

  return (
    <div className="min-h-screen bg-gray-100 md:grid md:grid-cols-[280px_1fr]">
      <aside className="border-b border-slate-700 bg-slate-800 p-4 md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r md:border-slate-700 md:p-7">
        <div className="flex h-full flex-col">
          <header className="mb-8 rounded-xl border border-slate-700 bg-slate-700/50 p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-blue-300">Academic PM</p>
            <h1 className="mt-2 text-xl font-semibold leading-tight text-white">Project Workspace</h1>
            <p className="mt-2 text-sm text-slate-300">{user?.role === "guide" ? "Guide panel" : "Student panel"}</p>
          </header>

          <p className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-400">Workspace</p>
          <nav className="space-y-1 text-sm">
            <NavLink className={navItemClass} to="/dashboard">Dashboard</NavLink>
            <NavLink className={navItemClass} to="/groups">Groups</NavLink>
            <NavLink className={navItemClass} to="/tasks">Tasks</NavLink>
          </nav>

          <div className="mt-6 space-y-4 md:mt-auto">
            <div className="rounded-xl border border-slate-700 bg-slate-700/50 p-3">
              <p className="text-xs text-slate-400">Signed in as</p>
              <p className="mt-1 truncate text-sm font-medium text-white">{user?.name ?? "Student"}</p>
              <p className="truncate text-xs text-slate-400">{user?.email ?? ""}</p>
            </div>

            <Button className="w-full" variant="secondary" onClick={signOut}>Sign Out</Button>
          </div>
        </div>
      </aside>

      <main className="p-4 md:p-6">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
