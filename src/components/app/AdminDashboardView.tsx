"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import { fetchAdminSummary } from "@/src/lib/api";
import type { AdminSummary, AuthUser } from "@/src/lib/api/types";
import { getCurrentUser, logout } from "@/src/lib/auth";
import { btnSecondary, glassCard } from "@/src/lib/ui";

function DashboardContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [summary, setSummary] = useState<AdminSummary | null | undefined>(
    undefined,
  );

  useEffect(() => {
    getCurrentUser().then(setUser);
    fetchAdminSummary().then(setSummary);
  }, []);

  const entries =
    summary && typeof summary === "object"
      ? Object.entries(summary).filter(
          ([, v]) => typeof v === "number" || typeof v === "string",
        )
      : [];

  return (
    <DemoShell
      title="Yönetici Paneli"
      subtitle="Platform özeti ve operasyon metrikleri."
    >
      <div className="mb-6">
        <button
          type="button"
          className={btnSecondary}
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          Çıkış
        </button>
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Hesabım</h2>
        <p className="mt-3 text-sm text-zinc-400">
          {user?.email ?? user?.fullName ?? "Yükleniyor…"}
        </p>
      </div>

      <div className={glassCard}>
        <h2 className="text-lg font-semibold text-white">Özet</h2>
        {summary === undefined ? (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        ) : summary === null ? (
          <p className="mt-3 text-sm text-zinc-500">
            /admin/summary uç noktası henüz mevcut değil.
          </p>
        ) : entries.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Özet verisi boş.</p>
        ) : (
          <dl className="mt-4 grid gap-4 sm:grid-cols-2">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <dt className="text-xs uppercase tracking-wide text-zinc-500">
                  {key}
                </dt>
                <dd className="mt-1 text-xl font-semibold text-white">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </DemoShell>
  );
}

export function AdminDashboardView() {
  return (
    <ProtectedRoute allowedRoles={["Admin"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
