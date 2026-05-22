"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import type { UserRole } from "@/src/lib/api/types";
import { getToken } from "@/src/lib/auth";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { loading, role } = useAuth();
  const [ready, setReady] = useState(false);
  const rolesKey = allowedRoles.join(",");

  useEffect(() => {
    setReady(false);
    if (loading) return;

    if (!getToken()) {
      router.replace("/login");
      return;
    }
    if (!role || !allowedRoles.includes(role)) {
      router.replace("/login?unauthorized=1");
      return;
    }
    setReady(true);
  }, [loading, role, rolesKey, router, allowedRoles]);

  if (loading || !ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Oturum doğrulanıyor…</p>
      </div>
    );
  }

  return <>{children}</>;
}
