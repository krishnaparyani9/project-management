import { useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerRequest, googleLoginRequest } from "../services/auth.api";
import { useAuth } from "../hooks/useAuth";
import type { UserRole } from "../types/user.types";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [branch, setBranch] = useState("");
  const [division, setDivision] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setError("");
  };

  const onGoogleSuccess = async (response: CredentialResponse) => {
    try {
      if (!response.credential) return;
      setIsLoading(true);
      setError("");
      
      const res = await googleLoginRequest({
        credential: response.credential,
        role: activeTab
      });
      
      const { user } = res.data.data;
      signIn(user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? "Google Sign-Up failed.");
      } else {
        setError("Google Sign-Up failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) {
      setError("Name should be at least 2 characters.");
      return;
    }

    if (activeTab === "student") {
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
        role: activeTab,
        branch: activeTab === "student" ? branch.trim() : undefined,
        division: activeTab === "student" ? division.trim() : undefined,
        rollNo: activeTab === "student" ? rollNo.trim() : undefined
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
      <h2 className="mb-1 text-[22px] font-semibold text-[var(--text-strong)] text-center">Create Account</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)] text-center">Join using your vit.edu email address.</p>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-1)] p-1 rounded-lg mb-6 border border-[var(--border)]">
        {(["admin", "guide", "student"] as UserRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleTabChange(role)}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              activeTab === role
                ? "bg-[var(--primary)] text-[#03101a] shadow"
                : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"
            }`}
          >
            {role === "guide" ? "Project Guide" : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col items-center justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => setError("Google sign up failed")}
          useOneTap={false}
          theme="filled_black"
          shape="rectangular"
          text="signup_with"
        />
      </div>
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-[var(--border)]"></div>
        <span className="mx-4 text-xs text-[var(--text-muted)] uppercase">Or register with email</span>
        <div className="flex-grow border-t border-[var(--border)]"></div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input id="name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
        <Input id="email" label="Email (@vit.edu)" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />

        {activeTab === "student" ? (
          <>
            <label htmlFor="branch" className="block">
              <span className="mb-1 block text-sm font-medium text-[var(--text-body)]">Branch</span>
              <select
                id="branch"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-[var(--focus)] transition focus:border-[var(--focus)] focus:ring"
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
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-0)] px-3 py-2 text-sm text-[var(--text-body)] shadow-sm outline-none ring-[var(--focus)] transition focus:border-[var(--focus)] focus:ring"
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

        {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Register"}
        </Button>

        <p className="text-center text-sm text-[var(--text-muted)]">
          Already have an account? <Link className="font-semibold text-[var(--primary)] hover:underline" to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
