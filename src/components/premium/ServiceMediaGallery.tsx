"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import {
  fetchServiceMedia,
  type ServiceMediaItem,
} from "@/src/lib/api/premiumSaas";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import { glassCard } from "@/src/lib/ui";

type ServiceMediaGalleryProps = {
  serviceId: string | number;
};

export function ServiceMediaGallery({ serviceId }: ServiceMediaGalleryProps) {
  const [media, setMedia] = useState<ServiceMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ServiceMediaItem | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchServiceMedia(serviceId);
      setMedia(list);
      const cover = list.find((m) => m.isCover) ?? list[0] ?? null;
      setActive(cover);
    } catch (err) {
      logApiError("Service media", err);
      if (!isApiNotFound(err)) throw err;
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return null;
  if (media.length === 0) return null;

  const images = media.filter((m) => !m.mediaType.toLowerCase().includes("video"));
  const videos = media.filter((m) => m.mediaType.toLowerCase().includes("video"));

  return (
    <section className="mt-8">
      <h2 className="mb-1 text-lg font-semibold text-white">Medya galerisi</h2>
      <p className="mb-4 text-sm text-zinc-500">
        Kapak görseli ve ek fotoğraf/video içerikleri.
      </p>
      {active ? (
        <div
          className={`${glassCard} relative mb-4 aspect-video overflow-hidden !p-0 ring-1 ring-violet-400/20`}
        >
          {active.mediaType.toLowerCase().includes("video") ? (
            <video
              src={active.url}
              controls
              className="h-full w-full object-cover"
            />
          ) : (
            <Image
              src={active.url}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
      ) : null}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
        {[...images, ...videos].map((m) => (
          <button
            key={String(m.id)}
            type="button"
            className={`relative aspect-square overflow-hidden rounded-lg border ${
              active?.id === m.id
                ? "border-violet-400/50"
                : "border-white/10"
            }`}
            onClick={() => setActive(m)}
          >
            {m.mediaType.toLowerCase().includes("video") ? (
              <span className="flex h-full items-center justify-center bg-black/50 text-xs text-white">
                ▶
              </span>
            ) : (
              <Image
                src={m.url}
                alt=""
                fill
                className="object-cover"
                unoptimized
              />
            )}
          </button>
        ))}
      </div>
    </section>
  );
}
