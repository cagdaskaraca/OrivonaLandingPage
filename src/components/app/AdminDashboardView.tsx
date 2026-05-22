"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminServiceTable } from "@/src/components/admin/AdminServiceTable";
import { AdminSummaryCards } from "@/src/components/admin/AdminSummaryCards";
import { AdminVendorTable } from "@/src/components/admin/AdminVendorTable";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  approveAdminVendor,
  featureAdminService,
  fetchAdminDashboardSummary,
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
import { btnSecondary, glassCard } from "@/src/lib/ui";

function DashboardContent() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionVendorId, setActionVendorId] = useState<string | number | null>(
    null,
  );
  const [actionServiceId, setActionServiceId] = useState<string | number | null>(
    null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [s, v, svc] = await Promise.all([
        fetchAdminDashboardSummary(),
        fetchAdminVendors(),
        fetchAdminServices(),
      ]);
      setSummary(s);
      setVendors(v);
      setServices(svc);
    } catch (e) {
      if (e instanceof ApiError) console.log("Admin dashboard failed", e.body);
      toast.error(formatApiErrorMessage(e, "Admin verisi yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(id: string | number) {
    setActionVendorId(id);
    try {
      await approveAdminVendor(id);
      toast.success("İşletme onaylandı.");
      await load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Onaylanamadı."));
    } finally {
      setActionVendorId(null);
    }
  }

  async function handleReject(id: string | number) {
    setActionVendorId(id);
    try {
      await rejectAdminVendor(id);
      toast.success("İşletme reddedildi.");
      await load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Reddedilemedi."));
    } finally {
      setActionVendorId(null);
    }
  }

  async function handleToggleFeature(service: AdminService) {
    const id = service.id;
    if (id == null) return;
    setActionServiceId(id);
    try {
      if (service.isFeatured) {
        await unfeatureAdminService(id);
        toast.success("Öne çıkarma kaldırıldı.");
      } else {
        await featureAdminService(id);
        toast.success("Hizmet öne çıkarıldı.");
      }
      await load();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "İşlem başarısız."));
    } finally {
      setActionServiceId(null);
    }
  }

  const pendingCount = vendors.filter(
    (v) => v.isApproved !== true && (v.status ?? "").toLowerCase() !== "rejected",
  ).length;

  return (
    <DemoShell
      title="Yönetici Paneli"
      subtitle="Platform özeti, işletme onayları ve hizmet yönetimi."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnSecondary}
          onClick={load}
          disabled={loading}
        >
          {loading ? "Yenileniyor…" : "Yenile"}
        </button>
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

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Platform özeti</h2>
        <AdminSummaryCards summary={summary} loading={loading} />
      </section>

      <section className={`${glassCard} mb-8`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">İşletmeler</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Tüm kayıtlı işletmeler. Onay bekleyenler üstte listelenir.
              {pendingCount > 0 ? ` ${pendingCount} onay bekliyor.` : ""}
            </p>
          </div>
        </div>
        <AdminVendorTable
          vendors={vendors}
          loading={loading}
          actionVendorId={actionVendorId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </section>

      <section className={glassCard}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Marketplace hizmetleri — öne çıkanları yönetin.
            </p>
          </div>
        </div>
        <AdminServiceTable
          services={services}
          loading={loading}
          actionServiceId={actionServiceId}
          onToggleFeature={handleToggleFeature}
        />
      </section>
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
