import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-[var(--bg-0)] text-[var(--text-body)] p-6">
      <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-blue-200/30 bg-[var(--bg-2)]/80 backdrop-blur-md p-6 shadow-xl">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
