import { useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerRequest } from "../services/auth.api";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/user.types";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [branch, setBranch] = useState("");
  const [division, setDivision] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Name should be at least 2 characters.");
      return;
    }

    if (role === "student") {
      if (!branch.trim()) {
        setError("Branch is required for student signup.");
        return;
      }
      if (!division.trim()) {
        setError("Division is required for student signup.");
        return;
      }
      if (!rollNo.trim()) {
        setError("Roll number is required for student signup.");
        return;
      }
    }

    setIsLoading(true);
    try {
      const response = await registerRequest({
        name,
        email,
        password,
        role,
        branch: role === "student" ? branch.trim() : undefined,
        division: role === "student" ? division.trim() : undefined,
        rollNo: role === "student" ? rollNo.trim() : undefined
      });
      const { user } = response.data.data;
      signIn(user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? "Registration failed. Please check your details.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <h2 className="mb-1 text-2xl font-bold text-[var(--text-strong)]">Create Account</h2>
      <p className="mb-6 text-sm text-slate-400">Register as student or guide.</p>

      <form className="space-y-4" onSubmit={onSubmit}>
        <label htmlFor="role" className="block">
          <span className="mb-1 block text-sm font-medium text-[var(--text-body)]">Role</span>
          <select
            id="role"
            className="w-full rounded-lg border border-slate-700 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="student">Student</option>
            <option value="guide">Guide</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <Input id="name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {role === "student" ? (
          <>
            <label htmlFor="branch" className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-body)]">Branch</span>
              <select
                id="branch"
                className="w-full rounded-lg border border-slate-700 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              >
                <option value="">Select Branch</option>
                <option value="Computer Engineering">Computer Engineering</option>
              </select>
            </label>
            <label htmlFor="division" className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-body)]">Division</span>
              <select
                id="division"
                className="w-full rounded-lg border border-slate-700 bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-blue-400 transition focus:border-blue-400 focus:ring"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                required
              >
                <option value="">Select Division</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </label>
            <Input id="rollNo" label="Roll Number" value={rollNo} onChange={(e) => setRollNo(e.target.value)} required />
          </>
        ) : null}

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-sm text-slate-400">
          Already have an account? <Link className="font-semibold text-brand-700 hover:underline" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
