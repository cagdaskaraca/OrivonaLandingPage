"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import { fetchVendorProfile, fetchVendorServices } from "@/src/lib/api";
import type { AuthUser, VendorProfile, VendorService } from "@/src/lib/api/types";
import { getCurrentUser, logout } from "@/src/lib/auth";
import { btnSecondary, glassCard } from "@/src/lib/ui";

function DashboardContent() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<VendorProfile | null | undefined>(
    undefined,
  );
  const [services, setServices] = useState<VendorService[] | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
    fetchVendorProfile().then(setProfile);
    fetchVendorServices().then(setServices);
  }, []);

  return (
    <DemoShell
      title="İşletme Paneli"
      subtitle="Profiliniz ve yayınladığınız hizmetler."
    >
      <div className="mb-6 flex flex-wrap gap-3">
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
        <Link href="/marketplace" className={btnSecondary}>
          Marketplace
        </Link>
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Hesabım</h2>
        {user ? (
          <p className="mt-3 text-sm text-zinc-400">
            {user.fullName ?? user.name ?? user.email}
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        )}
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">İşletme profili</h2>
        {profile === undefined ? (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        ) : profile === null ? (
          <p className="mt-3 text-sm text-zinc-500">
            /vendor/profile uç noktası henüz mevcut değil.
          </p>
        ) : (
          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
            <div>
              <dt className="text-xs text-zinc-500">İşletme</dt>
              <dd className="text-white">{profile.businessName ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-zinc-500">Konum</dt>
              <dd className="text-white">
                {[profile.city, profile.district].filter(Boolean).join(" · ") ||
                  "—"}
              </dd>
            </div>
            {profile.description ? (
              <div>
                <dt className="text-xs text-zinc-500">Açıklama</dt>
                <dd>{profile.description}</dd>
              </div>
            ) : null}
          </dl>
        )}
      </div>

      <div className={glassCard}>
        <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
        {services === null ? (
          <p className="mt-3 text-sm text-zinc-500">
            /vendor/services uç noktası henüz mevcut değil.
          </p>
        ) : services.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Kayıtlı hizmet yok.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {services.map((s) => (
              <li
                key={String(s.id)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              >
                <p className="font-medium text-white">{s.title ?? "Hizmet"}</p>
                <p className="mt-1 text-zinc-400">
                  {s.category ?? "—"}
                  {s.price != null
                    ? ` · ${s.price.toLocaleString("tr-TR")} ₺`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DemoShell>
  );
}

export function VendorDashboardView() {
  return (
    <ProtectedRoute allowedRoles={["Vendor"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
