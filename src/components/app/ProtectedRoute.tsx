"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, getRoleFromUser, getToken } from "@/src/lib/auth";
import type { UserRole } from "@/src/lib/api/types";

type ProtectedRouteProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

export function ProtectedRoute({
  allowedRoles,
  children,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const rolesKey = allowedRoles.join(",");

  useEffect(() => {
    let cancelled = false;

    async function verify() {
      if (!getToken()) {
        router.replace("/login");
        return;
      }
      try {
        const user = await getCurrentUser();
        const role = getRoleFromUser(user);
        if (!role || !allowedRoles.includes(role)) {
          router.replace("/login");
          return;
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) router.replace("/login");
      }
    }

    verify();
    return () => {
      cancelled = true;
    };
  }, [rolesKey, router, allowedRoles]);

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-400">Oturum doğrulanıyor…</p>
      </div>
    );
  }

  return <>{children}</>;
}
