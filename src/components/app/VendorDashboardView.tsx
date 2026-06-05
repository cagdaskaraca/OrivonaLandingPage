"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ServiceImageManager,
  VendorReservationsPanel,
  VendorSummaryCards,
} from "@/src/components/app/dashboard/VendorExtras";
import { VendorAvailabilityPanel } from "@/src/components/availability/VendorAvailabilityPanel";
import { MessagingPanel } from "@/src/components/messaging/MessagingPanel";
import { DashboardPaginatedList } from "@/src/components/dashboard/DashboardPaginatedList";
import { VendorOfferRequestsPanel } from "@/src/components/offers/VendorOfferRequestsPanel";
import { DashboardLayout } from "@/src/components/dashboard/DashboardLayout";
import { DashboardSection } from "@/src/components/dashboard/DashboardSection";
import { NotificationsPanel } from "@/src/components/dashboard/NotificationsPanel";
import { VendorAnalyticsSection } from "@/src/components/vendor-intelligence/VendorAnalyticsSection";
import { VendorCrmSection } from "@/src/components/vendor-intelligence/VendorCrmSection";
import { VendorReviewIntelligenceSection } from "@/src/components/vendor-intelligence/VendorReviewIntelligenceSection";
import { VENDOR_DASHBOARD_NAV } from "@/src/lib/vendorDashboardNav";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  createVendorService,
  deleteVendorService,
  fetchCategories,
  fetchVendorProfile,
  fetchVendorServices,
  updateVendorService,
} from "@/src/lib/api";
import { ApiError, formatUiErrorMessage } from "@/src/lib/api/client";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { VENDOR_LOADING_MESSAGE } from "@/src/lib/api/vendorDashboardFetch";
import type {
  Category,
  VendorProfile,
  VendorService,
  VendorServicePayload,
} from "@/src/lib/api/types";
import { formatCityForApi } from "@/src/lib/turkish";
import { useAuth } from "@/src/contexts/AuthContext";
import { DashboardHelpPanel } from "@/src/components/help/DashboardHelpPanel";
import { useDashboardHashScroll } from "@/src/hooks/useDashboardHashScroll";
import { notifyDashboardLayoutReady } from "@/src/lib/scrollToDashboardSection";
import { ActivityFeedSection } from "@/src/components/premium/ActivityFeedSection";
import { AvailabilityHeatmapPanel } from "@/src/components/premium/AvailabilityHeatmapPanel";
import { MobileHomeSummary } from "@/src/components/premium/MobileHomeSummary";
import { PricingInsightsPanel } from "@/src/components/premium/PricingInsightsPanel";
import { QrCheckInSection } from "@/src/components/premium/QrCheckInSection";
import { VendorPipelineSection } from "@/src/components/premium/VendorPipelineSection";
import { VendorCouponsSection } from "@/src/components/commerce/VendorCouponsSection";
import { VendorPromotionsSection } from "@/src/components/commerce/VendorPromotionsSection";
import { VendorServiceMediaPanel } from "@/src/components/commerce/VendorServiceMediaPanel";
import { NumericInput } from "@/src/components/ui/NumericInput";
import {
  btnPrimary,
  btnSecondary,
  glassCard,
  inputClass,
  orivonaDashboardAnchor,
  selectClass,
} from "@/src/lib/ui";

function defaultForm(): VendorServicePayload {
  return {
    title: "",
    categoryId: "",
    description: "",
    basePrice: 0,
    city: "İzmir",
    district: "",
    capacityMin: 50,
    capacityMax: 300,
    isActive: true,
  };
}

function serviceToForm(service: VendorService): VendorServicePayload {
  return {
    title: service.title ?? "",
    categoryId: service.categoryId ?? "",
    description: service.description ?? "",
    basePrice: service.basePrice ?? service.price ?? 0,
    city: service.city ?? "",
    district: service.district ?? "",
    capacityMin: service.capacityMin ?? 0,
    capacityMax: service.capacityMax ?? 0,
    isActive: service.isActive ?? true,
  };
}

function DashboardContent() {
  const { user, logout, loading: authLoading } = useAuth();
  const {
    data: profile,
    loading: profileLoading,
    reload: loadProfile,
  } = useVendorSectionLoad(fetchVendorProfile);
  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesLoadError,
    reload: loadServices,
  } = useVendorSectionLoad(fetchVendorServices);
  const services = servicesData ?? [];
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VendorServicePayload>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const serviceFormRef = useRef<HTMLFormElement>(null);

  const dashboardBootLoading =
    authLoading || profileLoading || servicesLoading;

  useDashboardHashScroll({
    isLoading: dashboardBootLoading,
  });

  useEffect(() => {
    if (!dashboardBootLoading) {
      notifyDashboardLayoutReady();
    }
  }, [dashboardBootLoading]);

  useEffect(() => {
    if (authLoading) return;
    void fetchCategories().then(setCategories);
  }, [authLoading]);

  function cancelForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(defaultForm());
    setErrorMessage(null);
  }

  function scrollToServiceForm() {
    requestAnimationFrame(() => {
      serviceFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function openCreate() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditingId(null);
    setForm(defaultForm());
    setShowForm(true);
    scrollToServiceForm();
  }

  function openEdit(service: VendorService) {
    if (service.id == null) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditingId(service.id);
    setForm(serviceToForm(service));
    setShowForm(true);
    scrollToServiceForm();
  }

  async function handleDelete(service: VendorService) {
    if (service.id == null) return;
    const label = service.title ?? "bu hizmet";
    if (!window.confirm(`"${label}" hizmetini silmek (pasife almak) istediğinize emin misiniz?`)) {
      return;
    }
    setDeletingId(service.id);
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await deleteVendorService(service.id);
      if (editingId === service.id) cancelForm();
      setSuccessMessage("Hizmet silindi (pasif).");
      await loadServices();
    } catch (err) {
      console.error("Vendor service delete failed", err);
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Hizmet silinemedi.");
      }
    } finally {
      setDeletingId(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const payload: VendorServicePayload = {
      ...form,
      city: formatCityForApi(form.city),
    };

    try {
      if (editingId != null) {
        await updateVendorService(editingId, payload);
        setSuccessMessage("Hizmet güncellendi.");
      } else {
        await createVendorService(payload);
        setSuccessMessage("Hizmet başarıyla eklendi.");
      }
      cancelForm();
      await loadServices();
    } catch (err) {
      console.error(
        editingId != null ? "Vendor service update failed" : "Vendor service create failed",
        err,
      );
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
        setErrorMessage(formatUiErrorMessage(err, "İşlem başarısız."));
      } else if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(
          editingId != null
            ? "Hizmet güncellenemedi."
            : "Hizmet oluşturulamadı.",
        );
      }
    } finally {
      setSaving(false);
    }
  }

  const isApproved = profile?.isApproved !== false;

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const toolbar = (
    <>
      <Link href="/account" className={btnSecondary}>
        Profil düzenle
      </Link>
      <Link href="/marketplace" className={btnSecondary}>
        Marketplace
      </Link>
      {!showForm ? (
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Yeni Hizmet Ekle
        </button>
      ) : null}
    </>
  );

  if (authLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="animate-pulse text-sm text-zinc-500">{VENDOR_LOADING_MESSAGE}</p>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="İşletme Paneli"
      subtitle="Hizmetlerinizi yönetin ve marketplace'te yayınlayın."
      navGroups={VENDOR_DASHBOARD_NAV}
      storageKey="vendor"
      onLogout={handleLogout}
      fullWidth
      toolbar={toolbar}
    >
      <MobileHomeSummary />

      {!profileLoading && profile && profile.isApproved === false ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          İşletme profiliniz henüz doğrulanmadı. Hizmetleriniz marketplace&apos;te
          görünmeyebilir.
        </div>
      ) : null}

      {!profileLoading && profile?.isApproved !== false ? (
        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          İşletme profiliniz doğrulandı. Aktif hizmetleriniz marketplace&apos;te
          görüntülenebilir.
        </div>
      ) : null}

      <section id="dashboard-summary" className="scroll-mt-24 mb-8">
        <VendorSummaryCards />
      </section>

      <DashboardHelpPanel role="vendor" />

      <DashboardSection id="dashboard-activity" title="Son Aktiviteler">
        <ActivityFeedSection role="vendor" paginate />
      </DashboardSection>

      <section id="dashboard-offers" className={`${orivonaDashboardAnchor} mb-8`}>
        <VendorOfferRequestsPanel />
      </section>

      <DashboardSection id="dashboard-pipeline" title="CRM Pipeline">
        <VendorPipelineSection />
      </DashboardSection>

      <section id="dashboard-reservations" className={`${orivonaDashboardAnchor} mb-8`}>
        <VendorReservationsPanel />
      </section>

      <DashboardSection id="dashboard-crm" title="İşletme CRM">
        <p className="mb-4 text-sm text-zinc-400">
          Lead listesi, durum güncelleme ve notlar. Müşteri adları gizlidir.
        </p>
        <VendorCrmSection />
      </DashboardSection>

      <DashboardSection id="dashboard-services" title="Hizmetlerim">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button type="button" className={btnPrimary} onClick={openCreate}>
            Yeni Hizmet Ekle
          </button>
        </div>

        {successMessage ? (
          <p className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {successMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {errorMessage}
          </p>
        ) : null}

        {showForm ? (
          <form
            ref={serviceFormRef}
            onSubmit={handleSubmit}
            className={`${glassCard} mt-4 space-y-4 scroll-mt-28`}
          >
            <h3 className="text-lg font-semibold text-white">
              {editingId != null ? "Hizmeti düzenle" : "Yeni hizmet ekle"}
            </h3>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Başlık</span>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Kategori</span>
              <select
                className={selectClass}
                value={String(form.categoryId ?? "")}
                onChange={(e) =>
                  setForm((f) => ({ ...f, categoryId: e.target.value }))
                }
                required
              >
                <option value="">Seçin</option>
                {categories.map((c) => (
                  <option key={String(c.id)} value={String(c.id ?? "")}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
                <input
                  className={inputClass}
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
                <input
                  className={inputClass}
                  value={form.district}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, district: e.target.value }))
                  }
                  required
                />
              </label>
            </div>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
              <textarea
                className={`${inputClass} min-h-[80px] resize-y`}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Fiyat (₺)</span>
              <NumericInput
                value={form.basePrice ?? 0}
                onChange={(basePrice) => setForm((f) => ({ ...f, basePrice }))}
                min={1}
                required
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">
                  Minimum kapasite
                </span>
                <NumericInput
                  value={form.capacityMin ?? 0}
                  onChange={(capacityMin) =>
                    setForm((f) => ({ ...f, capacityMin }))
                  }
                  min={0}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">
                  Maksimum kapasite
                </span>
                <NumericInput
                  value={form.capacityMax ?? 0}
                  onChange={(capacityMax) =>
                    setForm((f) => ({ ...f, capacityMax }))
                  }
                  min={0}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isActive: e.target.checked }))
                }
                className="rounded border-white/20"
              />
              Aktif (marketplace&apos;te göster)
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="submit" className={btnPrimary} disabled={saving}>
                {saving
                  ? "Kaydediliyor…"
                  : editingId != null
                    ? "Değişiklikleri Kaydet"
                    : "Hizmeti Oluştur"}
              </button>
              <button
                type="button"
                className={btnSecondary}
                onClick={cancelForm}
                disabled={saving}
              >
                İptal
              </button>
            </div>
            {editingId != null ? (
              <>
                <ServiceImageManager
                  service={services.find((s) => s.id === editingId) ?? { id: editingId }}
                />
                <PricingInsightsPanel
                  serviceId={editingId}
                  categoryId={form.categoryId}
                  city={form.city}
                  basePrice={form.basePrice}
                />
                <div className="scroll-mt-24">
                  <VendorServiceMediaPanel serviceId={editingId} />
                </div>
              </>
            ) : null}
          </form>
        ) : null}

        <VendorSectionState
          loading={servicesLoading}
          error={servicesLoadError}
          onRetry={loadServices}
          isEmpty={!servicesLoading && !servicesLoadError && services.length === 0}
          empty={
            <p className="mt-3 text-sm text-zinc-500">
              Henüz hizmet yok. &quot;Yeni Hizmet Ekle&quot; ile ilk hizmetinizi oluşturun.
            </p>
          }
        >
          <DashboardPaginatedList
            className="mt-4"
            items={services}
            listClassName="space-y-3"
            searchPlaceholder="Hizmet ara…"
            filterItem={(s, query) => {
              const q = query.trim().toLowerCase();
              if (!q) return true;
              const hay = [s.title, s.categoryName, s.category, s.city, s.district]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
              return hay.includes(q);
            }}
            getItemKey={(s) => String(s.id)}
            renderItem={(s) => (
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-white">{s.title ?? "Hizmet"}</p>
                    <p className="mt-1 text-zinc-400">
                      {s.categoryName ?? s.category ?? "—"}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {[s.city, s.district].filter(Boolean).join(" · ")}
                      {(s.basePrice ?? s.price) != null
                        ? ` · ${(s.basePrice ?? s.price)!.toLocaleString("tr-TR")} ₺`
                        : ""}
                      {s.capacityMin != null || s.capacityMax != null
                        ? ` · ${s.capacityMin ?? "—"}–${s.capacityMax ?? "—"} kişi`
                        : ""}
                    </p>
                    <p
                      className={`mt-1 text-xs ${s.isActive ? "text-emerald-300" : "text-zinc-500"}`}
                    >
                      {s.isActive ? "Aktif" : "Pasif"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`${btnSecondary} px-3 py-1 text-xs`}
                      onClick={() => openEdit(s)}
                      disabled={deletingId === s.id}
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      className={`${btnSecondary} px-3 py-1 text-xs`}
                      onClick={() => handleDelete(s)}
                      disabled={deletingId === s.id}
                    >
                      {deletingId === s.id ? "Siliniyor…" : "Sil"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </VendorSectionState>
      </DashboardSection>

      <section id="dashboard-availability" className={`${orivonaDashboardAnchor} mb-8`}>
        <VendorAvailabilityPanel />
      </section>

      <section id="dashboard-coupons" className="scroll-mt-24 mb-8">
        <VendorCouponsSection />
      </section>

      <DashboardSection id="dashboard-heatmap" title="Yoğunluk Takvimi">
        <AvailabilityHeatmapPanel variant="vendor" />
      </DashboardSection>

      <DashboardSection id="dashboard-analytics" title="Analitik">
        <p className="mb-4 text-sm text-zinc-400">
          Marketplace Intelligence — görüntülenme, dönüşüm ve hizmet performansı.
        </p>
        <VendorAnalyticsSection />
      </DashboardSection>

      <DashboardSection id="dashboard-checkin" title="QR Check-in">
        <QrCheckInSection />
      </DashboardSection>

      <section id="dashboard-messages" className={`${orivonaDashboardAnchor} mb-8`}>
        <MessagingPanel viewerRole="Vendor" />
      </section>

      <DashboardSection id="dashboard-profile" title="İşletme profili">
        {profileLoading ? (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        ) : profile ? (
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
            <div>
              <dt className="text-xs text-zinc-500">Onay durumu</dt>
              <dd className={isApproved ? "text-emerald-300" : "text-amber-300"}>
                {isApproved ? "Onaylı" : "Onay bekliyor"}
              </dd>
            </div>
            {profile.description ? (
              <div>
                <dt className="text-xs text-zinc-500">Açıklama</dt>
                <dd>{profile.description}</dd>
              </div>
            ) : null}
          </dl>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Profil yüklenemedi.</p>
        )}
      </DashboardSection>

      <DashboardSection id="dashboard-service-media" title="Galeri">
        <p className="text-sm text-zinc-400">
          Hizmet galerisi görsellerini &quot;Hizmetlerim&quot; bölümünden bir hizmeti
          düzenlerken yönetebilirsiniz.
        </p>
      </DashboardSection>

      <DashboardSection id="dashboard-review-intel" title="Yorum özeti">
        <VendorReviewIntelligenceSection />
      </DashboardSection>

      <section id="dashboard-promotions" className="scroll-mt-24 mb-8">
        <VendorPromotionsSection />
      </section>

      <DashboardSection id="dashboard-notifications" title="Bildirimler">
        <NotificationsPanel />
      </DashboardSection>

      <DashboardSection id="dashboard-account" title="Ayarlar">
        {user ? (
          <dl className="mt-4 space-y-2 text-sm text-zinc-400">
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Ad
              </dt>
              <dd className="text-white">
                {user.fullName ?? user.name ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                E-posta
              </dt>
              <dd className="text-white">{user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                İşletme adı
              </dt>
              <dd className="text-white">
                {profile?.businessName?.trim() || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-zinc-500">
                Onay durumu
              </dt>
              <dd className={isApproved ? "text-emerald-300" : "text-amber-300"}>
                {profileLoading
                  ? "…"
                  : isApproved
                    ? "Onaylı"
                    : "Onay bekliyor"}
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        )}
      </DashboardSection>

    </DashboardLayout>
  );
}

export function VendorDashboardView() {
  return (
    <ProtectedRoute allowedRoles={["Vendor"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
