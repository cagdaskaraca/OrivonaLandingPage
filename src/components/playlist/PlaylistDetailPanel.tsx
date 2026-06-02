"use client";

import type { PlaylistItem } from "@/src/lib/api/types";
import {
  playlistMomentLabel,
  playlistTrackTitle,
} from "@/src/lib/playlist";
import { glassCard } from "@/src/lib/ui";

type PlaylistDetailPanelProps = {
  items?: PlaylistItem[];
  variant: "customer" | "vendor";
};

export function PlaylistDetailPanel({
  items = [],
  variant,
}: PlaylistDetailPanelProps) {
  const list = items.filter((i) => i.id != null || playlistTrackTitle(i) !== "Parça");

  return (
    <div className={`${glassCard} mt-4 border-violet-400/20 !p-4`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-300/90">
        Müzik tercihleri
      </p>

      {list.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">
          {variant === "vendor"
            ? "Müşteri henüz playlist eklememiş."
            : "Henüz parça eklenmemiş."}
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {list.map((item) => (
            <li
              key={String(item.id ?? `${item.trackTitle}-${item.artist}`)}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm"
            >
              <p className="font-medium text-white">{playlistTrackTitle(item)}</p>
              {item.artist?.trim() ? (
                <p className="mt-0.5 text-zinc-400">{item.artist}</p>
              ) : null}
              <p className="mt-1 text-xs text-violet-300/90">
                {playlistMomentLabel(item.moment)}
              </p>
              {item.link?.trim() ? (
                <a
                  href={item.link.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-violet-300 underline-offset-2 hover:text-violet-100 hover:underline"
                >
                  Linki aç
                </a>
              ) : null}
              {item.note?.trim() ? (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  {item.note}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
