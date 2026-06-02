import type { PlaylistItem } from "@/src/lib/api/types";

export const PLAYLIST_MOMENT_OPTIONS = [
  { value: "Giriş", label: "Giriş" },
  { value: "İlk dans", label: "İlk dans" },
  { value: "Pasta kesimi", label: "Pasta kesimi" },
  { value: "After party", label: "After party" },
  { value: "Genel playlist", label: "Genel playlist" },
] as const;

const MUSIC_CATEGORY_KEYWORDS = [
  "dj",
  "orkestra",
  "orchestra",
  "canlı müzik",
  "canli muzik",
  "live music",
  "müzik",
  "muzik",
] as const;

export function isMusicCategory(value?: string | null): boolean {
  if (!value?.trim()) return false;
  const n = value.trim().toLowerCase();
  return MUSIC_CATEGORY_KEYWORDS.some((k) => n.includes(k));
}

export function playlistTrackTitle(item: PlaylistItem): string {
  return (
    item.trackTitle?.trim() ||
    item.songTitle?.trim() ||
    item.title?.trim() ||
    "Parça"
  );
}

export function playlistMomentLabel(moment?: string): string {
  if (!moment?.trim()) return "—";
  const found = PLAYLIST_MOMENT_OPTIONS.find((o) => o.value === moment);
  return found?.label ?? moment;
}

export function defaultPlaylistForm(): {
  trackTitle: string;
  artist: string;
  link: string;
  moment: string;
  note: string;
} {
  return {
    trackTitle: "",
    artist: "",
    link: "",
    moment: PLAYLIST_MOMENT_OPTIONS[4].value,
    note: "",
  };
}
