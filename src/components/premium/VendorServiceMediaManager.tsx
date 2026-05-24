"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addVendorServiceMedia,
  deleteVendorServiceMedia,
  fetchServiceMedia,
  type ServiceMediaItem,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

type VendorServiceMediaManagerProps = {
  serviceId: string | number;
};

export function VendorServiceMediaManager({
  serviceId,
}: VendorServiceMediaManagerProps) {
  const [items, setItems] = useState<ServiceMediaItem[]>([]);
  const [url, setUrl] = useState("");
  const [mediaType, setMediaType] = useState("Image");
  const [isCover, setIsCover] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchServiceMedia(serviceId));
    } catch (err) {
      logApiError("Vendor media list", err);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await addVendorServiceMedia(serviceId, {
        url: url.trim(),
        mediaType,
        isCover,
        sortOrder,
      });
      setUrl("");
      await load();
    } catch (err) {
      logApiError("Add media", err);
      setError(formatUiErrorMessage(err, "Medya eklenemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(mediaId: string | number) {
    if (!confirm("Bu medyayı silmek istiyor musunuz?")) return;
    try {
      await deleteVendorServiceMedia(serviceId, mediaId);
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Medya silinemedi."));
    }
  }

  return (
    <div className={`${glassCard} mt-4 space-y-4`}>
      <h4 className="text-sm font-semibold text-violet-200">Medya yönetimi</h4>
      {loading ? (
        <p className="text-xs text-zinc-500">Yükleniyor…</p>
      ) : (
        <ul className="space-y-2 text-xs text-zinc-400">
          {items.map((m) => (
            <li
              key={String(m.id)}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/10 px-2 py-1.5"
            >
              <span className="truncate">
                {m.mediaType} {m.isCover ? "(kapak)" : ""} — {m.url}
              </span>
              <button
                type="button"
                className="shrink-0 text-red-300 hover:text-red-200"
                onClick={() => void handleDelete(m.id)}
              >
                Sil
              </button>
            </li>
          ))}
          {items.length === 0 ? <li>Medya yok</li> : null}
        </ul>
      )}
      <form onSubmit={(e) => void handleAdd(e)} className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1 text-xs text-zinc-500">URL</span>
          <input
            className={inputClass}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 text-xs text-zinc-500">Tür</span>
          <select
            className={selectClass}
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
          >
            <option value="Image">Görsel</option>
            <option value="Video">Video</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1 text-xs text-zinc-500">Sıra</span>
          <NumericInput value={sortOrder} onChange={setSortOrder} />
        </label>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={isCover}
            onChange={(e) => setIsCover(e.target.checked)}
          />
          Kapak medyası
        </label>
        <button type="submit" className={btnPrimary} disabled={saving}>
          {saving ? "Ekleniyor…" : "Medya ekle"}
        </button>
      </form>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
    </div>
  );
}
