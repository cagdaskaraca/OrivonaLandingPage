"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  createOrUpdateEventPlanPublicPage,
  disableEventPlanPublicPage,
  fetchEventPlanPublicPage,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

export function PublicEventPageSection() {
  const { selectedPlanId } = useEventOs();
  const [description, setDescription] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (selectedPlanId == null) return;
    setLoading(true);
    try {
      const config = await fetchEventPlanPublicPage(selectedPlanId);
      if (!config) {
        setUnavailable(false);
        return;
      }
      setEnabled(config.enabled === true);
      setDescription(config.description ?? "");
      setDressCode(config.dressCode ?? "");
      const url =
        config.publicUrl ??
        (config.slug ? `/event/${config.slug}` : null);
      setPublicUrl(url);
    } catch (err) {
      logApiError("Public event page", err);
      if (isApiNotFound(err)) setUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handlePublish() {
    if (selectedPlanId == null) return;
    setError(null);
    setSuccess(null);
    try {
      const config = await createOrUpdateEventPlanPublicPage(selectedPlanId, {
        description,
        dressCode,
      });
      setEnabled(true);
      const url =
        config?.publicUrl ??
        (config?.slug ? `/event/${config.slug}` : null);
      setPublicUrl(url);
      setSuccess("Herkese açık sayfa yayınlandı.");
    } catch (err) {
      logApiError("Publish public page", err);
      setError(formatUiErrorMessage(err, "Sayfa oluşturulamadı."));
    }
  }

  async function handleDisable() {
    if (selectedPlanId == null) return;
    try {
      await disableEventPlanPublicPage(selectedPlanId);
      setEnabled(false);
      setSuccess("Herkese açık sayfa kapatıldı.");
    } catch (err) {
      setError(formatUiErrorMessage(err, "Sayfa kapatılamadı."));
    }
  }

  function copyLink() {
    if (!publicUrl) return;
    const full =
      typeof window !== "undefined"
        ? `${window.location.origin}${publicUrl.startsWith("/") ? publicUrl : `/${publicUrl}`}`
        : publicUrl;
    void navigator.clipboard?.writeText(full);
    setSuccess("Link kopyalandı.");
  }

  if (selectedPlanId == null) {
    return (
      <p className="text-sm text-zinc-500">Önce bir etkinlik planı seçin.</p>
    );
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>;
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Yükleniyor…</p>;
  }

  return (
    <div className={`${glassCard} space-y-4`}>
      <p className="text-sm text-zinc-400">
        Etkinliğiniz için herkese açık bir sayfa oluşturun.
      </p>
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">Açıklama</span>
        <textarea
          className={`${inputClass} min-h-[80px]`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">Kıyafet kodu</span>
        <input
          className={inputClass}
          value={dressCode}
          onChange={(e) => setDressCode(e.target.value)}
          placeholder="Smokin / gece elbisesi"
        />
      </label>
      {publicUrl ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm">
          <span className="text-zinc-500">URL: </span>
          <span className="text-violet-200">{publicUrl}</span>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btnPrimary} onClick={() => void handlePublish()}>
          {enabled ? "Güncelle" : "Yayınla"}
        </button>
        {publicUrl ? (
          <button type="button" className={btnSecondary} onClick={copyLink}>
            Linki kopyala
          </button>
        ) : null}
        {enabled ? (
          <button type="button" className={btnSecondary} onClick={() => void handleDisable()}>
            Kapat
          </button>
        ) : null}
      </div>
      {success ? <p className="text-sm text-emerald-300/90">{success}</p> : null}
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
    </div>
  );
}
