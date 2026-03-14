import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthState, User } from "../types/user.types";
import { logoutRequest, meRequest } from "../services/auth.api";

interface AuthContextValue extends AuthState {
  signIn: (user: User) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const response = await meRequest();
        setUser(response.data.data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void bootstrapAuth();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      signIn: (nextUser) => {
        setUser(nextUser);
      },
      signOut: async () => {
        try {
          await logoutRequest();
        } catch {
          // Ignore network failures and clear client state regardless.
        }
        setUser(null);
      }
    }),
    [isLoading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
