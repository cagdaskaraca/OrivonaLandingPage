"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getCurrentUser,
  getDashboardPathForRole,
  getHesabimPath,
  getRoleFromUser,
  getToken,
  logout as clearAuthToken,
} from "@/src/lib/auth";
import { ApiError } from "@/src/lib/api/client";
import type { AuthUser, UserRole } from "@/src/lib/api/types";

type AuthContextValue = {
  user: AuthUser | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
  hesabimPath: string;
  dashboardPath: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
      setRole(getRoleFromUser(me));
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        clearAuthToken();
      }
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role,
      loading,
      isAuthenticated: Boolean(user && role),
      refresh,
      logout,
      hesabimPath: getHesabimPath(role),
      dashboardPath: role ? getDashboardPathForRole(role) : "/login",
    }),
    [user, role, loading, refresh, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
