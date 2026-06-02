"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  createPublicPage,
  deletePublicPage,
  getPublicPage,
  publishPublicPage,
  updatePublicPage,
} from "@/src/lib/api/publicEventPages";
import { useToast } from "@/src/contexts/ToastContext";
import { ApiError, formatApiErrorMessage, formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { EventPlanPublicPage, EventPlanPublicPagePayload } from "@/src/lib/api/types";
import { Modal } from "@/src/components/ui/Modal";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

export function PublicEventPageSection() {
  const { selectedPlanId } = useEventOs();
  const toast = useToast();
  const [page, setPage] = useState<EventPlanPublicPage | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dressCode, setDressCode] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const load = useCallback(async () => {
    if (selectedPlanId == null) return;
    setLoading(true);
    try {
      const config = await getPublicPage(selectedPlanId);
      setPage(config);
      setTitle(config?.title ?? "");
      setDescription(config?.description ?? "");
      setDressCode(config?.dressCode ?? "");
      setNote(config?.note ?? "");
    } catch (err) {
      logApiError("Public event page", err);
      if (isApiNotFound(err)) setUnavailable(true);
      else setError(formatUiErrorMessage(err, "Sayfa yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    void load();
  }, [load]);

  function publicSlug(): string | undefined {
    return page?.publicSlug ?? page?.slug;
  }

  function getPublicUrl(): string | null {
    const slug = publicSlug();
    if (!slug) return null;
    return typeof window !== "undefined"
      ? `${window.location.origin}/e/${slug}`
      : `/e/${slug}`;
  }

  async function handleSave(isPublished: boolean) {
    if (selectedPlanId == null) return;
    setError(null);
    setSaving(true);
    try {
      const payload: EventPlanPublicPagePayload = {
        title: title.trim(),
        description: description.trim(),
        dressCode: dressCode.trim(),
        note: note.trim(),
        isPublished,
      };
      if (!payload.title) {
        setError("Sayfa başlığı zorunludur.");
        return;
      }
      let next: EventPlanPublicPage;
      if (page?.id != null) {
        next = await updatePublicPage(selectedPlanId, page.id, payload);
      } else {
        next = await createPublicPage(selectedPlanId, payload);
      }
      setPage(next);
      toast.success(isPublished ? "Sayfa yayınlandı." : "Taslak kaydedildi.");
    } catch (err) {
      if (err instanceof ApiError) console.log("Public page save failed", err.body);
      setError(formatApiErrorMessage(err, "Kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublishToggle(isPublished: boolean) {
    if (selectedPlanId == null || page?.id == null) return;
    setError(null);
    setPublishing(true);
    try {
      const next = await publishPublicPage(selectedPlanId, page.id, isPublished);
      setPage(next);
      toast.success(isPublished ? "Sayfa yayına alındı." : "Sayfa yayından kaldırıldı.");
    } catch (err) {
      if (err instanceof ApiError) console.log("Public page publish failed", err.body);
      setError(formatApiErrorMessage(err, "İşlem başarısız."));
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (selectedPlanId == null || page?.id == null) return;
    setError(null);
    setSaving(true);
    try {
      await deletePublicPage(selectedPlanId, page.id);
      setPage(null);
      setTitle("");
      setDescription("");
      setDressCode("");
      setNote("");
      toast.success("Sayfa silindi.");
      setDeleteOpen(false);
    } catch (err) {
      if (err instanceof ApiError) console.log("Public page delete failed", err.body);
      setError(formatApiErrorMessage(err, "Silinemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    const url = getPublicUrl();
    if (!url) return;
    try {
      await navigator.clipboard?.writeText(url);
      toast.success("Link kopyalandı.");
    } catch {
      toast.error("Link kopyalanamadı.");
    }
  }

  function openPreview() {
    const url = getPublicUrl();
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
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

  const url = getPublicUrl();
  const published = page?.isPublished === true;
  const hasPage = page?.id != null;

  return (
    <div className={`${glassCard} space-y-4`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Herkese Açık Etkinlik Sayfası</h3>
          <p className="mt-1 text-sm text-zinc-400">
            Bu sayfa linki bilen kişiler tarafından görüntülenebilir. Misafirlerinize etkinlik notlarını,
            kıyafet kodunu ve önemli bilgileri paylaşabilirsiniz.
          </p>
        </div>
        {hasPage ? (
          <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
              published
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                : "border-zinc-500/30 bg-zinc-500/15 text-zinc-200"
            }`}
          >
            {published ? "Yayında" : "Taslak"}
          </span>
        ) : null}
      </div>
      {hasPage ? (
        <div className="space-y-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-zinc-400">Public link</span>
            <span className="font-medium text-violet-200 break-all">{url ?? "—"}</span>
          </div>
          <div className="grid gap-1 text-xs text-zinc-500 sm:grid-cols-2">
            <span>Yayın tarihi: {page?.publishedAt ? new Date(page.publishedAt).toLocaleString("tr-TR") : "—"}</span>
            <span>Son güncelleme: {page?.updatedAt ? new Date(page.updatedAt).toLocaleString("tr-TR") : "—"}</span>
          </div>
        </div>
      ) : null}
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">Sayfa başlığı</span>
        <input
          className={inputClass}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Düğün - İstanbul"
        />
      </label>
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
      <label className="block text-sm">
        <span className="mb-1 text-xs text-zinc-500">Ek not</span>
        <textarea
          className={`${inputClass} min-h-[70px]`}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Örn. Saat 22:00 sonrası…"
        />
      </label>
      <div className="flex flex-wrap gap-2">
        {!hasPage ? (
          <>
            <button
              type="button"
              className={btnSecondary}
              disabled={saving}
              onClick={() => void handleSave(false)}
            >
              {saving ? "Kaydediliyor…" : "Taslak olarak kaydet"}
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={saving}
              onClick={() => void handleSave(true)}
            >
              {saving ? "Kaydediliyor…" : "Yayınla"}
            </button>
          </>
        ) : published ? (
          <>
            <button type="button" className={btnSecondary} onClick={copyLink} disabled={!url}>
              Linki kopyala
            </button>
            <button type="button" className={btnSecondary} onClick={openPreview} disabled={!url}>
              Önizle
            </button>
            <button type="button" className={btnSecondary} disabled={saving} onClick={() => void handleSave(true)}>
              {saving ? "Kaydediliyor…" : "Düzenle"}
            </button>
            <button
              type="button"
              className={btnSecondary}
              disabled={publishing}
              onClick={() => void handlePublishToggle(false)}
            >
              {publishing ? "…" : "Yayından kaldır"}
            </button>
            <button
              type="button"
              className="rounded-full border border-red-400/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setDeleteOpen(true)}
              disabled={saving}
            >
              Sil / Sıfırla
            </button>
          </>
        ) : (
          <>
            <button type="button" className={btnSecondary} disabled={saving} onClick={() => void handleSave(false)}>
              {saving ? "Kaydediliyor…" : "Düzenle"}
            </button>
            <button
              type="button"
              className={btnPrimary}
              disabled={publishing}
              onClick={() => void handlePublishToggle(true)}
            >
              {publishing ? "…" : "Yayınla"}
            </button>
            <button
              type="button"
              className="rounded-full border border-red-400/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none"
              onClick={() => setDeleteOpen(true)}
              disabled={saving}
            >
              Sil
            </button>
          </>
        )}
      </div>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}

      <Modal
        open={deleteOpen}
        title="Sayfayı sil"
        onClose={() => setDeleteOpen(false)}
      >
        <p className="text-sm text-zinc-300">
          Bu herkese açık sayfayı silmek istediğinize emin misiniz? Public link artık çalışmayacak.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-red-400/30 bg-red-500/10 px-6 py-2.5 text-sm font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none"
            onClick={() => void handleDelete()}
            disabled={saving}
          >
            {saving ? "Siliniyor…" : "Evet, sil"}
          </button>
          <button type="button" className={btnSecondary} onClick={() => setDeleteOpen(false)} disabled={saving}>
            Vazgeç
          </button>
        </div>
      </Modal>
    </div>
  );
}
