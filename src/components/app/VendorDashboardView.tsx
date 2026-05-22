"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  createVendorService,
  deleteVendorService,
  fetchCategories,
  fetchVendorProfile,
  fetchVendorServices,
  updateVendorService,
} from "@/src/lib/api";
import { ApiError } from "@/src/lib/api/client";
import type {
  AuthUser,
  Category,
  VendorProfile,
  VendorService,
  VendorServicePayload,
} from "@/src/lib/api/types";
import { formatCityForApi } from "@/src/lib/turkish";
import { getCurrentUser, logout } from "@/src/lib/auth";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

function defaultForm(): VendorServicePayload {
  return {
    title: "",
    categoryName: "",
    description: "",
    basePrice: 0,
    city: "İzmir",
    district: "",
    capacityMin: 50,
    capacityMax: 300,
    isActive: true,
  };
}

function serviceToForm(
  service: VendorService,
  categories: Category[],
): VendorServicePayload {
  const categoryName =
    service.categoryName ?? service.category ?? "";
  const matched = categories.find(
    (c) => c.name === categoryName || String(c.id) === String(service.categoryId),
  );
  return {
    title: service.title ?? "",
    categoryName: matched?.name ?? categoryName,
    categoryId: matched?.id ?? service.categoryId,
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
  const [user, setUser] = useState<AuthUser | null>(null);
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
    getCurrentUser().then(setUser);
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
    setForm(serviceToForm(service, categories));
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

    const matchedCategory = categories.find((c) => c.name === form.categoryName);
    const payload: VendorServicePayload = {
      ...form,
      city: formatCityForApi(form.city),
      categoryName: form.categoryName,
      categoryId: matchedCategory?.id,
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
        setErrorMessage(err.message);
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

  return (
    <DemoShell
      title="İşletme Paneli"
      subtitle="Hizmetlerinizi yönetin ve marketplace'te yayınlayın."
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
        {!showForm ? (
          <button type="button" className={btnPrimary} onClick={openCreate}>
            Yeni Hizmet Ekle
          </button>
        ) : null}
      </div>

      {!profileLoading && profile && profile.isApproved === false ? (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          İşletmeniz henüz yönetici onayı bekliyor. Hizmet ekleyebilirsiniz; marketplace
          listesinde görünmek için onay gerekir.
        </div>
      ) : null}

      {!profileLoading && profile?.isApproved !== false ? (
        <div className="mb-6 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          İşletmeniz onaylı. Aktif hizmetleriniz şehir filtresiyle marketplace&apos;te
          listelenir.
        </div>
      ) : null}

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
      </div>

      <div className={`${glassCard} mb-8`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">Hizmetlerim</h2>
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
      </div>

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
              value={form.categoryName}
              onChange={(e) =>
                setForm((f) => ({ ...f, categoryName: e.target.value }))
              }
              required
            >
              <option value="">Seçin</option>
              {categories.map((c) => (
                <option key={String(c.id ?? c.name)} value={c.name ?? ""}>
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
        </form>
      ) : null}
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
