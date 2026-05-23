"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminCategoryManagement } from "@/src/components/admin/AdminCategoryManagement";
import { AdminServiceTable } from "@/src/components/admin/AdminServiceTable";
import { AdminSummaryCards } from "@/src/components/admin/AdminSummaryCards";
import { AdminUserManagement } from "@/src/components/admin/AdminUserManagement";
import { AdminVendorRejectModal } from "@/src/components/admin/AdminVendorRejectModal";
import { AdminVendorTable } from "@/src/components/admin/AdminVendorTable";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  activateAdminVendor,
  approveAdminVendor,
  deactivateAdminVendor,
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
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [vendorsLoading, setVendorsLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [actionVendorId, setActionVendorId] = useState<string | number | null>(
    null,
  );
  const [actionServiceId, setActionServiceId] = useState<string | number | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<AdminVendor | null>(null);

  const loadSummaryAndServices = useCallback(async () => {
    setSummaryLoading(true);
    setServicesLoading(true);
    try {
      const [s, svc] = await Promise.all([
        fetchAdminDashboardSummary(),
        fetchAdminServices(),
      ]);
      setSummary(s);
      setServices(svc);
    } catch (e) {
      if (e instanceof ApiError) console.log("Admin summary/services failed", e.body);
      toast.error(formatApiErrorMessage(e, "Özet veya hizmet verisi yüklenemedi."));
    } finally {
      setSummaryLoading(false);
      setServicesLoading(false);
    }
  }, [toast]);

  const loadVendors = useCallback(async () => {
    setVendorsLoading(true);
    setVendorsError(null);
    try {
      setVendors(await fetchAdminVendors());
    } catch (e) {
      if (e instanceof ApiError) console.log("Admin vendors failed", e.body);
      setVendorsError(formatApiErrorMessage(e, "İşletmeler yüklenemedi."));
      setVendors([]);
    } finally {
      setVendorsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummaryAndServices();
    loadVendors();
  }, [loadSummaryAndServices, loadVendors]);

  function refreshAll() {
    void loadSummaryAndServices();
    void loadVendors();
  }

  async function handleApprove(id: string | number) {
    setActionVendorId(id);
    try {
      await approveAdminVendor(id);
      toast.success("İşletme onaylandı.");
      await loadVendors();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Onaylanamadı."));
    } finally {
      setActionVendorId(null);
    }
  }

  async function handleConfirmReject(reason: string) {
    const id = rejectTarget?.id;
    if (id == null) return;
    setActionVendorId(id);
    try {
      await rejectAdminVendor(id, reason);
      toast.success("İşletme reddedildi.");
      setRejectTarget(null);
      await loadVendors();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Reddedilemedi."));
    } finally {
      setActionVendorId(null);
    }
  }

  async function handleActivateVendor(id: string | number) {
    setActionVendorId(id);
    try {
      await activateAdminVendor(id);
      toast.success("İşletme aktifleştirildi.");
      await loadVendors();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Aktifleştirilemedi."));
    } finally {
      setActionVendorId(null);
    }
  }

  async function handleDeactivateVendor(id: string | number) {
    setActionVendorId(id);
    try {
      await deactivateAdminVendor(id);
      toast.success("İşletme pasifleştirildi.");
      await loadVendors();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "Pasifleştirilemedi."));
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
      await loadSummaryAndServices();
    } catch (e) {
      toast.error(formatApiErrorMessage(e, "İşlem başarısız."));
    } finally {
      setActionServiceId(null);
    }
  }

  const pendingCount = vendors.filter(
    (v) => v.isApproved !== true && (v.status ?? "").toLowerCase() !== "rejected",
  ).length;

  const refreshing = summaryLoading || vendorsLoading || servicesLoading;

  return (
    <DemoShell
      title="Yönetici Paneli"
      subtitle="Kategori, işletme, kullanıcı ve hizmet yönetimi."
      stickyNav
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className={btnSecondary}
          onClick={refreshAll}
          disabled={refreshing}
        >
          {refreshing ? "Yenileniyor…" : "Yenile"}
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
        <AdminSummaryCards summary={summary} loading={summaryLoading} />
      </section>

      <section className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Kategori yönetimi</h2>
        <AdminCategoryManagement
          onToastSuccess={toast.success}
          onToastError={toast.error}
        />
      </section>

      <section className={`${glassCard} mb-8`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">İşletme yönetimi</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Onay, red ve hesap durumu. Onay bekleyenler üstte listelenir.
              {pendingCount > 0 ? ` ${pendingCount} onay bekliyor.` : ""}
            </p>
          </div>
        </div>
        <AdminVendorTable
          vendors={vendors}
          loading={vendorsLoading}
          error={vendorsError}
          onRetry={loadVendors}
          actionVendorId={actionVendorId}
          onApprove={handleApprove}
          onRejectRequest={setRejectTarget}
          onActivate={handleActivateVendor}
          onDeactivate={handleDeactivateVendor}
        />
        <AdminVendorRejectModal
          open={rejectTarget != null}
          businessName={rejectTarget?.businessName}
          loading={rejectTarget?.id != null && actionVendorId === rejectTarget.id}
          onClose={() => setRejectTarget(null)}
          onConfirm={handleConfirmReject}
        />
      </section>

      <section className={`${glassCard} mb-8`}>
        <h2 className="text-lg font-semibold text-white">Kullanıcı yönetimi</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Müşteri, işletme ve yönetici hesaplarının durumu.
        </p>
        <AdminUserManagement
          onToastSuccess={toast.success}
          onToastError={toast.error}
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
          loading={servicesLoading}
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
