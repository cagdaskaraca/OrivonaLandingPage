"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  EventOsNeedPlan,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import {
  createPlaylistItem,
  deletePlaylistItem,
  fetchEventPlanPlaylist,
  updatePlaylistItem,
} from "@/src/lib/api/eventPlaylist";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { PlaylistItem, PlaylistItemFormPayload } from "@/src/lib/api/types";
import {
  PLAYLIST_MOMENT_OPTIONS,
  defaultPlaylistForm,
  playlistMomentLabel,
  playlistTrackTitle,
} from "@/src/lib/playlist";
import { useToast } from "@/src/contexts/ToastContext";
import { btnPrimary, btnSecondary, glassCard, inputClass, selectClass } from "@/src/lib/ui";

export function EventPlaylistSection() {
  const { selectedPlanId } = useEventOs();

  return (
    <div className={glassCard}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Müzik Tercihleri</h2>
          <p className="mt-1 text-sm text-zinc-500">
            DJ veya orkestra için parça listesi oluşturun; teklif aşamasında
            paylaşılır.
          </p>
        </div>
        <EventOsPlanPicker className="min-w-[200px] flex-1 sm:max-w-xs" />
      </div>

      <EventOsNeedPlan>
        {(planId) => (
          <EventPlaylistPlanContent
            key={String(planId)}
            planId={planId}
            reloadKey={selectedPlanId}
          />
        )}
      </EventOsNeedPlan>
    </div>
  );
}

function EventPlaylistPlanContent({
  planId,
  reloadKey,
}: {
  planId: string | number;
  reloadKey: string | number | null;
}) {
  const toast = useToast();
  const [items, setItems] = useState<PlaylistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(defaultPlaylistForm);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchEventPlanPlaylist(planId);
      setItems(list);
    } catch (err) {
      logApiError("Event plan playlist", err);
      setItems([]);
      setError(formatUiErrorMessage(err, "Playlist yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void load();
  }, [load, reloadKey]);

  function cancelEdit() {
    setEditingId(null);
    setForm(defaultPlaylistForm());
  }

  function startEdit(item: PlaylistItem) {
    if (item.id == null) return;
    setEditingId(item.id);
    setForm({
      trackTitle: playlistTrackTitle(item),
      artist: item.artist ?? "",
      link: item.link ?? "",
      moment: item.moment ?? PLAYLIST_MOMENT_OPTIONS[4].value,
      note: item.note ?? "",
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trackTitle.trim()) {
      setError("Parça adı zorunludur.");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: PlaylistItemFormPayload = {
      trackTitle: form.trackTitle.trim(),
      artist: form.artist.trim(),
      link: form.link.trim(),
      moment: form.moment,
      note: form.note.trim(),
    };
    try {
      if (editingId != null) {
        await updatePlaylistItem(planId, editingId, payload);
        toast.success("Parça güncellendi.");
      } else {
        await createPlaylistItem(planId, payload);
        toast.success("Parça eklendi.");
      }
      cancelEdit();
      await load();
    } catch (err) {
      logApiError("Save playlist item", err);
      setError(formatUiErrorMessage(err, "Kayıt başarısız."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: PlaylistItem) {
    if (item.id == null) return;
    if (!window.confirm(`"${playlistTrackTitle(item)}" silinsin mi?`)) return;
    setDeletingId(item.id);
    try {
      await deletePlaylistItem(planId, item.id);
      toast.success("Parça silindi.");
      if (editingId === item.id) cancelEdit();
      await load();
    } catch (err) {
      logApiError("Delete playlist item", err);
      toast.error(formatUiErrorMessage(err, "Silinemedi."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="mb-8 space-y-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.04] p-4"
      >
        <h3 className="text-sm font-semibold text-violet-100">
          {editingId != null ? "Parçayı düzenle" : "Yeni parça ekle"}
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Parça adı</span>
            <input
              className={inputClass}
              value={form.trackTitle}
              onChange={(e) =>
                setForm((f) => ({ ...f, trackTitle: e.target.value }))
              }
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Sanatçı</span>
            <input
              className={inputClass}
              value={form.artist}
              onChange={(e) =>
                setForm((f) => ({ ...f, artist: e.target.value }))
              }
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Link</span>
            <input
              type="url"
              className={inputClass}
              value={form.link}
              onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
              placeholder="https://..."
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">
              Kullanılacağı an
            </span>
            <select
              className={selectClass}
              value={form.moment}
              onChange={(e) =>
                setForm((f) => ({ ...f, moment: e.target.value }))
              }
            >
              {PLAYLIST_MOMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Not</span>
            <textarea
              className={`${inputClass} min-h-[64px] resize-y`}
              value={form.note}
              onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            />
          </label>
        </div>
        {error ? (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving
              ? "Kaydediliyor…"
              : editingId != null
                ? "Güncelle"
                : "Parça ekle"}
          </button>
          {editingId != null ? (
            <button
              type="button"
              className={btnSecondary}
              onClick={cancelEdit}
              disabled={saving}
            >
              İptal
            </button>
          ) : null}
          <button
            type="button"
            className={`${btnSecondary} text-xs`}
            onClick={() => void load()}
            disabled={loading}
          >
            Yenile
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-sm text-zinc-500">Playlist yükleniyor…</p>
      ) : items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-violet-400/25 px-4 py-8 text-center text-sm text-zinc-500">
          Henüz parça eklenmedi. Yukarıdaki formdan ekleyebilirsiniz.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={String(item.id)}
              className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-white">
                    {playlistTrackTitle(item)}
                  </p>
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
                      className="mt-2 inline-block text-xs text-violet-300 hover:text-violet-100"
                    >
                      {item.link.trim()}
                    </a>
                  ) : null}
                  {item.note?.trim() ? (
                    <p className="mt-2 text-xs text-zinc-500">{item.note}</p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={`${btnSecondary} px-3 py-1.5 text-xs`}
                    onClick={() => startEdit(item)}
                    disabled={deletingId === item.id}
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    className={`${btnSecondary} px-3 py-1.5 text-xs`}
                    onClick={() => void handleDelete(item)}
                    disabled={deletingId === item.id}
                  >
                    {deletingId === item.id ? "Siliniyor…" : "Sil"}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
