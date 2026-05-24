"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  ServiceImageManager,
  VendorReservationsPanel,
  VendorSummaryCards,
} from "@/src/components/app/dashboard/VendorExtras";
import { VendorAvailabilityPanel } from "@/src/components/availability/VendorAvailabilityPanel";
import { MessagingPanel } from "@/src/components/messaging/MessagingPanel";
import { VendorOfferRequestsPanel } from "@/src/components/offers/VendorOfferRequestsPanel";
import { DashboardLayout } from "@/src/components/dashboard/DashboardLayout";
import { DashboardSection } from "@/src/components/dashboard/DashboardSection";
import { NotificationsPanel } from "@/src/components/dashboard/NotificationsPanel";
import { VendorAnalyticsSection } from "@/src/components/vendor-intelligence/VendorAnalyticsSection";
import { VendorCrmSection } from "@/src/components/vendor-intelligence/VendorCrmSection";
import { VendorReviewIntelligenceSection } from "@/src/components/vendor-intelligence/VendorReviewIntelligenceSection";
import type { DashboardNavItem } from "@/src/components/dashboard/DashboardSidebar";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  createVendorService,
  deleteVendorService,
  fetchCategories,
  fetchVendorProfile,
  fetchVendorServices,
  updateVendorService,
} from "@/src/lib/api";
import { ApiError, formatApiErrorMessage } from "@/src/lib/api/client";
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
import { ActivityFeedSection } from "@/src/components/premium/ActivityFeedSection";
import { AvailabilityHeatmapPanel } from "@/src/components/premium/AvailabilityHeatmapPanel";
import { MobileHomeSummary } from "@/src/components/premium/MobileHomeSummary";
import { PricingInsightsPanel } from "@/src/components/premium/PricingInsightsPanel";
import { QrCheckInSection } from "@/src/components/premium/QrCheckInSection";
import { VendorPipelineSection } from "@/src/components/premium/VendorPipelineSection";
import { VendorServiceMediaManager } from "@/src/components/premium/VendorServiceMediaManager";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

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
  useDashboardHashScroll();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<VendorService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<VendorServicePayload>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setServicesLoading(true);
    try {
      const list = await fetchVendorServices();
      setServices(list);
    } catch (err) {
      console.error("Vendor services fetch failed", err);
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Hizmetler yüklenemedi.");
      }
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const p = await fetchVendorProfile();
      setProfile(p);
    } catch (err) {
      console.error("Vendor profile fetch failed", err);
      if (err instanceof ApiError) {
        console.error("Backend error response", err.body);
      }
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
    loadServices();
    fetchCategories().then(setCategories);
  }, [loadProfile, loadServices]);

  function cancelForm() {
    setEditingId(null);
    setShowForm(false);
    setForm(defaultForm());
    setErrorMessage(null);
  }

  function openCreate() {
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditingId(null);
    setForm(defaultForm());
    setShowForm(true);
  }

  function openEdit(service: VendorService) {
    if (service.id == null) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    setEditingId(service.id);
    setForm(serviceToForm(service));
    setShowForm(true);
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
        setErrorMessage(formatApiErrorMessage(err, err.message));
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

  const navItems: DashboardNavItem[] = [
    { id: "dashboard-help", label: "Başlarken" },
    { id: "dashboard-account", label: "Hesabım" },
    { id: "dashboard-activity", label: "Son Aktiviteler" },
    { id: "dashboard-pipeline", label: "CRM Pipeline" },
    { id: "dashboard-analytics", label: "Analitik" },
    { id: "dashboard-crm", label: "CRM / Leadler" },
    { id: "dashboard-heatmap", label: "Yoğunluk" },
    { id: "dashboard-checkin", label: "QR Check-in" },
    { id: "dashboard-review-intel", label: "Yorum Özeti" },
    { id: "dashboard-profile", label: "İşletme Profili" },
    { id: "dashboard-services", label: "Hizmetlerim" },
    { id: "dashboard-offers", label: "Gelen Teklifler" },
    { id: "dashboard-reservations", label: "Rezervasyonlar" },
    { id: "dashboard-availability", label: "Müsaitlik Takvimi" },
    { id: "dashboard-messages", label: "Mesajlar" },
    { id: "dashboard-notifications", label: "Bildirimler" },
  ];

  const toolbar = (
    <>
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

  return (
    <DashboardLayout
      title="İşletme Paneli"
      subtitle="Hizmetlerinizi yönetin ve marketplace'te yayınlayın."
      navItems={navItems}
      toolbar={toolbar}
    >
      <MobileHomeSummary />

      <DashboardHelpPanel role="vendor" />

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

      <DashboardSection id="dashboard-activity" title="Son Aktiviteler">
        <ActivityFeedSection role="vendor" />
      </DashboardSection>

      <DashboardSection id="dashboard-pipeline" title="CRM Pipeline">
        <VendorPipelineSection />
      </DashboardSection>

      <DashboardSection id="dashboard-analytics" title="Analitik">
        <p className="mb-4 text-sm text-zinc-400">
          Marketplace Intelligence — görüntülenme, dönüşüm ve hizmet performansı.
        </p>
        <VendorAnalyticsSection />
      </DashboardSection>

      <DashboardSection id="dashboard-crm" title="İşletme CRM">
        <p className="mb-4 text-sm text-zinc-400">
          Lead listesi, durum güncelleme ve notlar. Müşteri adları gizlidir.
        </p>
        <VendorCrmSection />
      </DashboardSection>

      <DashboardSection id="dashboard-review-intel" title="Yorum özeti">
        <VendorReviewIntelligenceSection />
      </DashboardSection>

      <DashboardSection id="dashboard-account" title="Hesabım">
        {user ? (
          <p className="mt-3 text-sm text-zinc-400">
            {user.fullName ?? user.name ?? user.email}
          </p>
        ) : (
          <p className="mt-3 text-sm text-zinc-500">Yükleniyor…</p>
        )}
      </DashboardSection>

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

      <DashboardSection id="dashboard-services" title="Hizmetlerim">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {!showForm ? (
            <button type="button" className={`${btnSecondary} text-xs`} onClick={openCreate}>
              Yeni Hizmet Ekle
            </button>
          ) : null}
        </div>
        {servicesLoading ? (
          <p className="mt-3 text-sm text-zinc-500">Hizmetler yükleniyor…</p>
        ) : services.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">
            Henüz hizmet yok. &quot;Yeni Hizmet Ekle&quot; ile ilk hizmetinizi oluşturun.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {services.map((s) => (
              <li
                key={String(s.id)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
              >
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
              </li>
            ))}
          </ul>
        )}
      </DashboardSection>

      <section id="dashboard-offers" className="scroll-mt-24 mb-8">
        <VendorOfferRequestsPanel />
      </section>

      <section id="dashboard-reservations" className="scroll-mt-24 mb-8">
        <VendorReservationsPanel />
      </section>

      <section id="dashboard-availability" className="scroll-mt-24 mb-8">
        <VendorAvailabilityPanel />
      </section>

      <DashboardSection id="dashboard-heatmap" title="Yoğunluk takvimi">
        <AvailabilityHeatmapPanel variant="vendor" />
      </DashboardSection>

      <DashboardSection id="dashboard-checkin" title="QR Check-in">
        <QrCheckInSection />
      </DashboardSection>

      <section id="dashboard-messages" className="scroll-mt-24 mb-8">
        <MessagingPanel viewerRole="Vendor" />
      </section>

      <DashboardSection id="dashboard-notifications" title="Bildirimler">
        <NotificationsPanel />
      </DashboardSection>

      {showForm ? (
        <form onSubmit={handleSubmit} className={`${glassCard} space-y-4`}>
          <h2 className="text-lg font-semibold text-white">
            {editingId != null ? "Hizmeti düzenle" : "Yeni hizmet ekle"}
          </h2>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Hizmet başlığı</span>
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
            <span className="mb-1.5 block text-xs text-zinc-400">Başlangıç fiyatı (₺)</span>
            <input
              type="number"
              className={inputClass}
              value={form.basePrice || ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  basePrice: Number(e.target.value),
                }))
              }
              required
              min={1}
            />
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
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Minimum kapasite</span>
              <input
                type="number"
                className={inputClass}
                value={form.capacityMin}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacityMin: Number(e.target.value),
                  }))
                }
                min={0}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Maksimum kapasite</span>
              <input
                type="number"
                className={inputClass}
                value={form.capacityMax}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    capacityMax: Number(e.target.value),
                  }))
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
          {successMessage ? (
            <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {successMessage}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {errorMessage}
            </p>
          ) : null}
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
              <VendorServiceMediaManager serviceId={editingId} />
            </>
          ) : null}
        </form>
      ) : null}
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
