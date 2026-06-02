import {
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
} from "@/src/lib/api/client";
import { recordId, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  PlaylistItem,
  PlaylistItemFormPayload,
} from "@/src/lib/api/types";

function assertSuccess(envelope: ApiEnvelope): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["items", "results", "data", "playlist", "tracks"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

export function normalizePlaylistItem(raw: unknown): PlaylistItem {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id:
      recordId(o, "id", "Id") ??
      recordId(o, "playlistItemId", "PlaylistItemId"),
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    trackTitle:
      recordStr(o, "trackTitle", "TrackTitle") ||
      recordStr(o, "songTitle", "SongTitle") ||
      recordStr(o, "title", "Title"),
    artist:
      recordStr(o, "artist", "Artist") ||
      recordStr(o, "artistName", "ArtistName"),
    link:
      recordStr(o, "link", "Link") ||
      recordStr(o, "url", "Url") ||
      recordStr(o, "trackUrl", "TrackUrl"),
    moment:
      recordStr(o, "moment", "Moment") ||
      recordStr(o, "usageMoment", "UsageMoment") ||
      recordStr(o, "usedAt", "UsedAt"),
    note: recordStr(o, "note", "Note") || recordStr(o, "notes", "Notes"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

function normalizePlaylistFromNested(
  parent: Record<string, unknown>,
): PlaylistItem[] | undefined {
  const nested =
    parent.playlist ??
    parent.Playlist ??
    parent.playlistItems ??
    parent.PlaylistItems;
  if (!nested) return undefined;
  return toList(nested).map(normalizePlaylistItem);
}

export function extractPlaylistFields(raw: unknown): {
  playlist?: PlaylistItem[];
} {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return { playlist: normalizePlaylistFromNested(o) };
}

function buildPlaylistBody(payload: PlaylistItemFormPayload) {
  return {
    trackTitle: payload.trackTitle.trim(),
    songTitle: payload.trackTitle.trim(),
    title: payload.trackTitle.trim(),
    artist: payload.artist.trim(),
    artistName: payload.artist.trim(),
    link: payload.link.trim() || null,
    url: payload.link.trim() || null,
    moment: payload.moment,
    usageMoment: payload.moment,
    usedAt: payload.moment,
    note: payload.note?.trim() ?? "",
    notes: payload.note?.trim() ?? "",
  };
}

export async function fetchEventPlanPlaylist(
  eventPlanId: string | number,
): Promise<PlaylistItem[]> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/playlist`,
  );
  assertSuccess(body);
  return toList(body.data).map(normalizePlaylistItem);
}

export async function createPlaylistItem(
  eventPlanId: string | number,
  payload: PlaylistItemFormPayload,
): Promise<PlaylistItem> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/playlist`,
    buildPlaylistBody(payload),
  );
  assertSuccess(body);
  return normalizePlaylistItem(body.data ?? {});
}

export async function updatePlaylistItem(
  eventPlanId: string | number,
  playlistItemId: string | number,
  payload: PlaylistItemFormPayload,
): Promise<PlaylistItem> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/playlist/${playlistItemId}`,
    buildPlaylistBody(payload),
  );
  assertSuccess(body);
  return normalizePlaylistItem(body.data ?? {});
}

export async function deletePlaylistItem(
  eventPlanId: string | number,
  playlistItemId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/playlist/${playlistItemId}`,
  );
  assertSuccess(body);
}

export async function attachPlaylistToEventRequest(
  requestId: string | number,
  eventPlanId?: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-requests/${requestId}/attach-playlist`,
    eventPlanId != null ? { eventPlanId } : {},
  );
  assertSuccess(body);
}
