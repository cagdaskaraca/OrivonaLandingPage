"use client";

import { useState } from "react";
import {
  createVendorCoupon,
  deleteVendorCoupon,
  fetchVendorCoupons,
  mapCouponDiscountTypeFromApi,
  updateVendorCoupon,
  type Coupon,
} from "@/src/lib/api/commerce";
import { formatUiErrorMessage } from "@/src/lib/api/client";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { VendorSectionState } from "@/src/components/vendor/VendorSectionState";
import { useVendorSectionLoad } from "@/src/hooks/useVendorSectionLoad";
import { PaymentComingSoonNotice } from "@/src/components/commerce/PaymentComingSoonNotice";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

function emptyForm(): Omit<Coupon, "id"> {
  return {
    code: "",
    discountType: "Percentage",
    value: 10,
    startDate: "",
    endDate: "",
    usageLimit: 100,
    isActive: true,
  };
}

function couponToForm(c: Coupon): Omit<Coupon, "id"> {
  return {
    code: c.code,
    discountType: mapCouponDiscountTypeFromApi(c.discountType),
    value: c.value,
    startDate: c.startDate ?? "",
    endDate: c.endDate ?? "",
    usageLimit: c.usageLimit,
    isActive: c.isActive,
  };
}

export function VendorCouponsSection() {
  const {
    data,
    loading,
    error: loadError,
    reload: load,
  } = useVendorSectionLoad(fetchVendorCoupons);
  const coupons = data ?? [];
  const [formError, setFormError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingId != null) {
        await updateVendorCoupon(editingId, form);
      } else {
        await createVendorCoupon(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setFormError(formatUiErrorMessage(err, "Kupon kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string | number) {
    if (!confirm("Bu kuponu silmek istiyor musunuz?")) return;
    try {
      await deleteVendorCoupon(id);
      await load();
    } catch (err) {
      setFormError(formatUiErrorMessage(err, "Kupon silinemedi."));
    }
  }

  return (
    <div className={`${glassCard} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">İndirim kuponları</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Müşterileriniz teklif sürecinde kupon kodu kullanabilir (önizleme).
          </p>
        </div>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyForm());
          }}
        >
          Yeni kupon
        </button>
      </div>

      <PaymentComingSoonNotice compact />

      {formError ? <p className="text-sm text-red-300/90">{formError}</p> : null}

      {showForm ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-2"
        >
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-500">Kod</span>
            <input
              className={inputClass}
              value={form.code}
              onChange={(e) =>
                setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))
              }
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">İndirim türü</span>
            <select
              className={selectClass}
              value={form.discountType}
              onChange={(e) =>
                setForm((f) => ({ ...f, discountType: e.target.value }))
              }
            >
              <option value="Percentage">Yüzde (%)</option>
              <option value="FixedAmount">Sabit Tutar</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Değer</span>
            <NumericInput
              min={0}
              value={form.value}
              onChange={(value) => setForm((f) => ({ ...f, value }))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Başlangıç</span>
            <input
              type="date"
              className={inputClass}
              value={form.startDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Bitiş</span>
            <input
              type="date"
              className={inputClass}
              value={form.endDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Kullanım limiti</span>
            <NumericInput
              min={1}
              value={form.usageLimit ?? 0}
              onChange={(usageLimit) =>
                setForm((f) => ({ ...f, usageLimit }))
              }
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => setShowForm(false)}
            >
              İptal
            </button>
          </div>
        </form>
      ) : null}

      <VendorSectionState
        loading={loading}
        error={loadError}
        onRetry={load}
        isEmpty={!loading && !loadError && coupons.length === 0}
        empty={
          <EmptyState
            icon="🏷️"
            title="Kupon yok"
            description="İlk indirim kuponunuzu oluşturun."
            actionLabel="Yeni kupon"
            onAction={() => setShowForm(true)}
          />
        }
      >
        <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/10">
          {coupons.map((c) => (
            <li
              key={String(c.id)}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-mono font-semibold text-violet-200">{c.code}</p>
                <p className="text-xs text-zinc-500">
                  {c.discountType === "FixedAmount" ? `${c.value} ₺` : `%${c.value}`}
                  {c.startDate ? ` · ${c.startDate}` : ""}
                  {c.endDate ? ` – ${c.endDate}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  onClick={() => {
                    setEditingId(c.id);
                    setForm(couponToForm(c));
                    setShowForm(true);
                  }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="text-xs text-red-300 hover:text-red-200"
                  onClick={() => void handleDelete(c.id)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      </VendorSectionState>
    </div>
  );
}
