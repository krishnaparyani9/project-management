import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="mx-auto mt-10 w-full max-w-md rounded-2xl border border-blue-100 bg-white p-6 shadow-md">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
