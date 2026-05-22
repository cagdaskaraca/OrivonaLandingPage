"use client";

import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  approveAdminVendor,
  featureAdminService,
  fetchAdminDashboardSummary,
  fetchAdminPendingVendors,
  fetchAdminServices,
  fetchAdminVendors,
  rejectAdminVendor,
  unfeatureAdminService,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  AdminService,
  AdminVendor,
  DashboardSummary,
} from "@/src/lib/api/types";
import { useAuth } from "@/src/contexts/AuthContext";
import { useToast } from "@/src/contexts/ToastContext";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import { btnSecondary, glassCard } from "@/src/lib/ui";

function DashboardContent() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pending, setPending] = useState<AdminVendor[]>([]);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [s, p, v, svc] = await Promise.all([
        fetchAdminDashboardSummary(),
        fetchAdminPendingVendors(),
        fetchAdminVendors(),
        fetchAdminServices(),
      ]);
      setSummary(s);
      setPending(p);
      setVendors(v);
      setServices(svc);
    } catch (e) {
      if (e instanceof ApiError) console.log("Admin dashboard failed", e.body);
      toast.error(formatApiErrorMessage(e, "Admin verisi yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <DemoShell
      title="Yönetici Paneli"
      subtitle="Platform özeti, işletme onayları ve hizmet yönetimi."
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
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Hesabım</h2>
        <p className="mt-2 text-sm text-zinc-400">{user?.email ?? "—"}</p>
      </div>

      <SummaryCards summary={summary} loading={loading} />

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Onay bekleyen işletmeler</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-sm text-zinc-500">Bekleyen işletme yok.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {pending.map((v) => (
              <li
                key={String(v.id)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
              >
                <span className="text-white">{v.businessName ?? v.email}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs`}
                    onClick={async () => {
                      if (v.id == null) return;
                      try {
                        await approveAdminVendor(v.id);
                        toast.success("İşletme onaylandı.");
                        load();
                      } catch (e) {
                        toast.error(formatApiErrorMessage(e, "Onaylanamadı."));
                      }
                    }}
                  >
                    Onayla
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} text-xs`}
                    onClick={async () => {
                      if (v.id == null) return;
                      try {
                        await rejectAdminVendor(v.id);
                        toast.success("İşletme reddedildi.");
                        load();
                      } catch (e) {
                        toast.error(formatApiErrorMessage(e, "Reddedilemedi."));
                      }
                    }}
                  >
                    Reddet
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Tüm işletmeler</h2>
        <ul className="mt-4 space-y-2 text-sm text-zinc-400">
          {vendors.map((v) => (
            <li key={String(v.id)}>
              {v.businessName} · {v.city} ·{" "}
              {v.isApproved ? "Onaylı" : "Bekliyor"}
            </li>
          ))}
        </ul>
      </div>

      <div className={glassCard}>
        <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {services.map((s) => (
            <li
              key={String(s.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 px-3 py-2"
            >
              <span className="text-white">
                {s.title} · {s.vendorName}
              </span>
              <button
                type="button"
                className={`${btnSecondary} text-xs`}
                onClick={async () => {
                  if (s.id == null) return;
                  try {
                    if (s.isFeatured) {
                      await unfeatureAdminService(s.id);
                      toast.success("Öne çıkarma kaldırıldı.");
                    } else {
                      await featureAdminService(s.id);
                      toast.success("Öne çıkarıldı.");
                    }
                    load();
                  } catch (e) {
                    toast.error(formatApiErrorMessage(e, "İşlem başarısız."));
                  }
                }}
              >
                {s.isFeatured ? "Öne çıkarmayı kaldır" : "Öne çıkar"}
              </button>
            </li>
          ))}
        </ul>
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
