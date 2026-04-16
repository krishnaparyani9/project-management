import { useState } from "react";
import axios from "axios";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import AuthLayout from "../layouts/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import { loginRequest, googleLoginRequest } from "../services/auth.api";
import type { UserRole } from "../types/user.types";

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTabChange = (role: UserRole) => {
    setActiveTab(role);
    setError("");
    setEmail("");
    setPassword("");
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
        setError(message ?? "Google Login failed.");
      } else {
        setError("Google Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await loginRequest({ email, password });
      const { user } = response.data.data;
      
      if (user.role !== activeTab) {
        throw new Error(`Invalid credentials for ${activeTab} role`);
      }
      
      signIn(user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const message = (err.response?.data as { message?: string } | undefined)?.message;
        setError(message ?? "Login failed. Please verify your credentials.");
      } else {
        setError(err.message ?? "Login failed. Please try again.");
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
      <h2 className="mb-1 text-[22px] font-semibold text-[var(--text-strong)] text-center">Login</h2>
      <p className="mb-6 text-sm text-slate-400 text-center">Access your academic project portal.</p>

      {/* Tabs */}
      <div className="flex bg-[var(--bg-1)] p-1 rounded-lg mb-6 border border-[var(--border-base)]">
        {(["admin", "guide", "student"] as UserRole[]).map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleTabChange(role)}
            className={`flex-1 text-sm py-2 rounded-md font-medium transition-colors ${
              activeTab === role
                ? "bg-blue-600 text-white shadow"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {role === "guide" ? "Project Guide" : role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-col items-center justify-center">
        <GoogleLogin
          onSuccess={onGoogleSuccess}
          onError={() => setError("Google login failed")}
          useOneTap={false}
          theme="filled_black"
          shape="rectangular"
          text="signin_with"
        />
      </div>
      
      <div className="flex items-center my-4">
        <div className="flex-grow border-t border-[var(--border-base)]"></div>
        <span className="mx-4 text-xs text-slate-500 uppercase">Or sign in with email</span>
        <div className="flex-grow border-t border-[var(--border-base)]"></div>
      </div>

      <form className="space-y-4" onSubmit={onSubmit}>
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error ? <p className="text-sm text-rose-600">{error}</p> : null}

        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        <p className="text-center text-sm text-slate-400">
          New here? <Link className="font-semibold text-brand-700 hover:underline" to="/signup">Create an account</Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
