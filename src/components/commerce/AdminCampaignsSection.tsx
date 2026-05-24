"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAdminCampaign,
  deleteAdminCampaign,
  fetchAdminCampaigns,
  updateAdminCampaign,
  type Campaign,
} from "@/src/lib/api/commerce";
import { CAMPAIGN_TARGET_OPTIONS } from "@/src/lib/commerceUi";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

function emptyCampaign(): Omit<Campaign, "id"> {
  return {
    title: "",
    bannerText: "",
    description: "",
    targetType: "All",
    startDate: "",
    endDate: "",
    isActive: true,
    ctaLabel: "Keşfet",
    ctaHref: "/marketplace",
  };
}

export function AdminCampaignsSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCampaign);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCampaigns(await fetchAdminCampaigns());
    } catch (err) {
      logApiError("Admin campaigns", err);
      setError(formatUiErrorMessage(err, "Kampanyalar yüklenemedi."));
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
      if (editingId != null) await updateAdminCampaign(editingId, form);
      else await createAdminCampaign(form);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyCampaign());
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Kampanya kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between gap-3">
        <p className="text-sm text-zinc-500">
          Ana sayfa ve marketplace üst banner kampanyaları.
        </p>
        <button
          type="button"
          className={btnPrimary}
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setForm(emptyCampaign());
          }}
        >
          Yeni kampanya
        </button>
      </div>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      {showForm ? (
        <form
          onSubmit={(e) => void handleSubmit(e)}
          className="grid gap-3 rounded-xl border border-white/10 p-4 sm:grid-cols-2"
        >
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-500">Başlık</span>
            <input
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-500">Banner metni</span>
            <input
              className={inputClass}
              value={form.bannerText ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, bannerText: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 text-xs text-zinc-500">Açıklama</span>
            <textarea
              className={`${inputClass} min-h-[72px]`}
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Hedef</span>
            <select
              className={selectClass}
              value={form.targetType ?? "All"}
              onChange={(e) =>
                setForm((f) => ({ ...f, targetType: e.target.value }))
              }
            >
              {CAMPAIGN_TARGET_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">Hedef ID (opsiyonel)</span>
            <input
              className={inputClass}
              value={form.targetId != null ? String(form.targetId) : ""}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  targetId: e.target.value || undefined,
                }))
              }
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
            <span className="mb-1 text-xs text-zinc-500">CTA metni</span>
            <input
              className={inputClass}
              value={form.ctaLabel ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, ctaLabel: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 text-xs text-zinc-500">CTA link</span>
            <input
              className={inputClass}
              value={form.ctaHref ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, ctaHref: e.target.value }))}
            />
          </label>
          <div className="sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button
              type="button"
              className={`${btnSecondary} ml-2`}
              onClick={() => setShowForm(false)}
            >
              İptal
            </button>
          </div>
        </form>
      ) : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : campaigns.length === 0 ? (
        <EmptyState
          title="Kampanya yok"
          description="Aktif banner için kampanya oluşturun."
        />
      ) : (
        <ul className="space-y-2">
          {campaigns.map((c) => (
            <li
              key={String(c.id)}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">{c.title}</p>
                <p className="text-xs text-zinc-500">
                  {c.targetType} · {c.startDate} – {c.endDate}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  onClick={() => {
                    setEditingId(c.id);
                    setForm({
                      title: c.title,
                      bannerText: c.bannerText,
                      description: c.description,
                      targetType: c.targetType,
                      targetId: c.targetId,
                      startDate: c.startDate,
                      endDate: c.endDate,
                      isActive: c.isActive,
                      ctaLabel: c.ctaLabel,
                      ctaHref: c.ctaHref,
                    });
                    setShowForm(true);
                  }}
                >
                  Düzenle
                </button>
                <button
                  type="button"
                  className="text-xs text-red-300"
                  onClick={() => void deleteAdminCampaign(c.id).then(load)}
                >
                  Sil
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
