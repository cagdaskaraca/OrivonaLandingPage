"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteVendorServiceMedia,
  fetchServiceMedia,
  setVendorServiceMediaCover,
  uploadVendorServiceMedia,
} from "@/src/lib/api";
import type { ServiceMediaItem } from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { btnPrimary, btnSecondary, glassCard } from "@/src/lib/ui";

type VendorServiceMediaPanelProps = {
  serviceId: string | number;
};

export function VendorServiceMediaPanel({ serviceId }: VendorServiceMediaPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ServiceMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchServiceMedia(serviceId));
    } catch (err) {
      logApiError("Service media list", err);
      setError(formatUiErrorMessage(err, "Medya yüklenemedi."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        await uploadVendorServiceMedia(serviceId, file);
      }
      await load();
    } catch (err) {
      logApiError("Media upload", err);
      setError(formatUiErrorMessage(err, "Yükleme başarısız."));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleSetCover(mediaId: string | number) {
    setBusyId(mediaId);
    try {
      await setVendorServiceMediaCover(serviceId, mediaId);
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Kapak ayarlanamadı."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(mediaId: string | number) {
    if (!confirm("Bu medyayı silmek istiyor musunuz?")) return;
    setBusyId(mediaId);
    try {
      await deleteVendorServiceMedia(serviceId, mediaId);
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Medya silinemedi."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`${glassCard} mt-4 space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-violet-200">Medya galerisi</h4>
          <p className="mt-1 text-xs text-zinc-500">
            Görsel veya video yükleyin; kapak görseli marketplace kartında kullanılır.
          </p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            className={btnPrimary}
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Yükleniyor…" : "Dosya yükle"}
          </button>
          <button type="button" className={btnSecondary} onClick={() => void load()}>
            Yenile
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-xl bg-white/[0.06]"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="🖼️"
          title="Henüz medya yok"
          description="İlk görselinizi veya videonuzu yükleyerek galeriyi oluşturun."
          actionLabel="Dosya yükle"
          onAction={() => fileRef.current?.click()}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((m) => {
            const isVideo = m.mediaType.toLowerCase().includes("video");
            const busy = busyId === m.id;
            return (
              <div
                key={String(m.id)}
                className={`relative overflow-hidden rounded-xl border ${
                  m.isCover
                    ? "border-violet-400/50 ring-1 ring-violet-400/30"
                    : "border-white/10"
                }`}
              >
                <div className="relative aspect-square bg-[#0a0612]">
                  {isVideo ? (
                    <video
                      src={m.url}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                    />
                  ) : (
                    <Image
                      src={m.url}
                      alt=""
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {m.isCover ? (
                    <span className="absolute left-2 top-2 rounded-full bg-violet-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
                      Kapak
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-1 border-t border-white/10 p-2">
                  {!m.isCover ? (
                    <button
                      type="button"
                      className={`${btnSecondary} !px-2 !py-1 text-[10px]`}
                      disabled={busy}
                      onClick={() => void handleSetCover(m.id)}
                    >
                      Kapak yap
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-full border border-red-400/30 bg-red-500/10 px-2 py-1 text-[10px] text-red-200 hover:bg-red-500/20 disabled:opacity-50"
                    disabled={busy}
                    onClick={() => void handleDelete(m.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
