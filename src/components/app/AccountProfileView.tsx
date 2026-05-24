"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import { ProtectedRoute } from "@/src/components/app/ProtectedRoute";
import {
  fetchAccountProfile,
  updateAccountProfile,
} from "@/src/lib/api";
import { ApiError, formatUiErrorMessage } from "@/src/lib/api/client";
import type { AccountProfile } from "@/src/lib/api/types";
import { getRoleFromUser, normalizeRole } from "@/src/lib/auth";
import { useAuth } from "@/src/contexts/AuthContext";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { PhoneField } from "@/src/components/ui/PhoneField";
import { isValidStoredPhone } from "@/src/lib/contactValidation";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

function preferredTypesToString(value: AccountProfile["preferredEventTypes"]): string {
  if (Array.isArray(value)) return value.join(", ");
  return value ?? "";
}

function preferredTypesFromString(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function AccountForm() {
  const { user, role, dashboardPath } = useAuth();
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [phoneValid, setPhoneValid] = useState(true);

  const effectiveRole =
    role ??
    normalizeRole(profile?.role) ??
    getRoleFromUser(user);
  const isVendor = effectiveRole === "Vendor";
  const isCustomer = effectiveRole === "Customer";

  useEffect(() => {
    fetchAccountProfile()
      .then(setProfile)
      .catch((err) => {
        console.log("Account profile fetch failed", err);
        if (err instanceof ApiError) console.log("Backend error response", err.body);
        setError(formatUiErrorMessage(err, "Profil yüklenemedi."));
      })
      .finally(() => setLoading(false));
  }, []);

  function updateField<K extends keyof AccountProfile>(
    key: K,
    value: AccountProfile[K],
  ) {
    setProfile((p) => ({ ...(p ?? {}), [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setShowValidation(true);
    const phoneValue = profile.phoneNumber ?? profile.phone ?? "";
    if (!isValidStoredPhone(phoneValue, false)) {
      return;
    }
    setSaving(true);
    setSuccess(null);
    setError(null);
    const payload: AccountProfile = {
      ...profile,
      phoneNumber: phoneValue.trim() || undefined,
      phone: phoneValue.trim() || undefined,
      preferredEventTypes: isCustomer
        ? preferredTypesFromString(
            preferredTypesToString(profile.preferredEventTypes),
          )
        : profile.preferredEventTypes,
    };
    try {
      const updated = await updateAccountProfile(payload);
      setProfile(updated);
      setSuccess("Profiliniz kaydedildi.");
    } catch (err) {
      console.log("Account profile save failed", err);
      if (err instanceof ApiError) console.log("Backend error response", err.body);
      setError(formatUiErrorMessage(err, "Profil kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DemoShell
      title="Hesabım"
      subtitle="Kişisel ve işletme bilgilerinizi güncelleyin."
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Link href={dashboardPath} className={btnSecondary}>
          Panele dön
        </Link>
        {isVendor ? (
          <Link href="/vendor/dashboard" className={btnSecondary}>
            Hizmet yönetimi
          </Link>
        ) : null}
      </div>

      {success ? (
        <p className="mb-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </p>
      ) : null}
      {error ? (
        <p className="mb-4 whitespace-pre-line rounded-xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Profil yükleniyor…</p>
      ) : profile ? (
        <form onSubmit={handleSubmit} className={`${glassCard} space-y-4`}>
          <h2 className="text-lg font-semibold text-white">Profil bilgileri</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1.5 block text-xs text-zinc-400">Ad Soyad</span>
              <input
                className={inputClass}
                value={profile.fullName ?? ""}
                onChange={(e) => updateField("fullName", e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">E-posta</span>
              <input
                className={`${inputClass} opacity-70`}
                value={profile.email ?? user?.email ?? ""}
                readOnly
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-xs text-zinc-400">Telefon</span>
              <PhoneField
                value={profile.phoneNumber ?? profile.phone ?? ""}
                onChange={(e164) => {
                  updateField("phoneNumber", e164);
                  updateField("phone", e164);
                }}
                showValidation={showValidation}
                onValidityChange={setPhoneValid}
              />
            </label>
          </div>

          {isVendor ? (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-violet-100">İşletme bilgileri</h3>
              {profile.isApproved === false ? (
                <p className="text-sm text-amber-200">
                  İşletme profiliniz henüz doğrulanmadı. Hizmetleriniz marketplace&apos;te
                  görünmeyebilir.
                </p>
              ) : (
                <p className="text-sm text-emerald-200">
                  İşletme profiliniz doğrulandı. Aktif hizmetleriniz marketplace&apos;te
                  görüntülenebilir.
                </p>
              )}
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">İşletme adı</span>
                <input
                  className={inputClass}
                  value={profile.businessName ?? ""}
                  onChange={(e) => updateField("businessName", e.target.value)}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
                <textarea
                  className={`${inputClass} min-h-[80px] resize-y`}
                  value={profile.description ?? ""}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
                  <input
                    className={inputClass}
                    value={profile.city ?? ""}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
                  <input
                    className={inputClass}
                    value={profile.district ?? ""}
                    onChange={(e) => updateField("district", e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Web sitesi</span>
                  <input
                    className={inputClass}
                    value={profile.websiteUrl ?? ""}
                    onChange={(e) => updateField("websiteUrl", e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Instagram</span>
                  <input
                    className={inputClass}
                    value={profile.instagramUrl ?? ""}
                    onChange={(e) => updateField("instagramUrl", e.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          {isCustomer ? (
            <div className="space-y-4 border-t border-white/10 pt-4">
              <h3 className="text-sm font-semibold text-violet-100">Tercihler</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
                  <input
                    className={inputClass}
                    value={profile.city ?? ""}
                    onChange={(e) => updateField("city", e.target.value)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
                  <input
                    className={inputClass}
                    value={profile.district ?? ""}
                    onChange={(e) => updateField("district", e.target.value)}
                  />
                </label>
              </div>
              <label className="block text-sm">
                <span className="mb-1.5 block text-xs text-zinc-400">
                  Tercih edilen etkinlik türleri (virgülle)
                </span>
                <input
                  className={inputClass}
                  value={preferredTypesToString(profile.preferredEventTypes)}
                  onChange={(e) =>
                    updateField("preferredEventTypes", e.target.value)
                  }
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Min bütçe (₺)</span>
                  <NumericInput
                    value={profile.budgetMin ?? 0}
                    onChange={(budgetMin) => updateField("budgetMin", budgetMin)}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-xs text-zinc-400">Max bütçe (₺)</span>
                  <NumericInput
                    value={profile.budgetMax ?? 0}
                    onChange={(budgetMax) => updateField("budgetMax", budgetMax)}
                  />
                </label>
              </div>
            </div>
          ) : null}

          <button
            type="submit"
            className={btnPrimary}
            disabled={saving || !phoneValid || !profile.fullName?.trim()}
          >
            {saving ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-500">Profil bilgisi bulunamadı.</p>
      )}
    </DemoShell>
  );
}

export function AccountProfileView() {
  return (
    <ProtectedRoute allowedRoles={["Customer", "Vendor", "Admin"]}>
      <AccountForm />
    </ProtectedRoute>
  );
}
