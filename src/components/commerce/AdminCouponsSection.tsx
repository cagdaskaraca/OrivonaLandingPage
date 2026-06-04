"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  fetchAdminCoupons,
  updateAdminCoupon,
  type Coupon,
} from "@/src/lib/api/commerce";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { AdminPaginatedList } from "@/src/components/admin/AdminPaginatedList";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { PaymentComingSoonNotice } from "@/src/components/commerce/PaymentComingSoonNotice";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

function emptyForm(): Omit<Coupon, "id"> {
  return {
    code: "",
    discountType: "Percentage",
    value: 10,
    startDate: "",
    endDate: "",
    usageLimit: 500,
    isActive: true,
  };
}

export function AdminCouponsSection() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCoupons(await fetchAdminCoupons());
    } catch (err) {
      logApiError("Admin coupons", err);
      setError(formatUiErrorMessage(err, "Kuponlar yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId != null) await updateAdminCoupon(editingId, form);
      else await createAdminCoupon(form);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Kayıt başarısız."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-zinc-500">Platform veya hizmet bazlı kuponlar.</p>
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
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      {showForm ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2"
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
            <span className="mb-1 text-xs text-zinc-500">Tür</span>
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
              value={form.value}
              onChange={(value) => setForm((f) => ({ ...f, value }))}
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
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              Kaydet
            </button>
          </div>
        </form>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : coupons.length === 0 ? (
        <EmptyState title="Kupon yok" description="Platform kuponu ekleyin." />
      ) : (
        <AdminPaginatedList
          items={coupons}
          getItemKey={(c) => String(c.id)}
          searchPlaceholder="Kupon ara..."
          filterItem={(c, q) =>
            (c.code ?? "").toLowerCase().includes(q.trim().toLowerCase())
          }
          listClassName="divide-y divide-white/10 rounded-xl border border-white/10"
          emptyMessage="Henüz kayıt yok."
          renderItem={(c) => (
            <div className="flex justify-between gap-2 px-4 py-3 text-sm">
              <span className="font-mono text-violet-200">{c.code}</span>
              <span className="text-zinc-500">
                {c.discountType === "FixedAmount" ? `${c.value}₺` : `%${c.value}`}
              </span>
              <button
                type="button"
                className="text-xs text-red-300"
                onClick={() => void deleteAdminCoupon(c.id).then(load)}
              >
                Sil
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
