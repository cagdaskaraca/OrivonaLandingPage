"use client";

import { useCallback, useEffect, useState } from "react";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import {
  fetchEventPlanBoard,
  updateEventBoardItemStatus,
  type EventBoardItem,
} from "@/src/lib/api/premiumSaas";
import { formatUiErrorMessage, isApiNotFound, logApiError } from "@/src/lib/api/client";
import { BOARD_STATUS_OPTIONS } from "@/src/lib/premiumLabels";
import { glassCard, selectClass } from "@/src/lib/ui";

function BoardColumnEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-8 text-center">
      <p className="text-xs text-zinc-500">Boş</p>
    </div>
  );
}

export function EventBoardSection() {
  const { selectedPlanId } = useEventOs();
  const [items, setItems] = useState<EventBoardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    if (selectedPlanId == null) return;
    setLoading(true);
    setError(null);
    setUnavailable(false);
    try {
      const board = await fetchEventPlanBoard(selectedPlanId);
      if (!board) {
        setUnavailable(true);
        setItems([]);
        return;
      }
      setItems(board.items);
    } catch (err) {
      logApiError("Event board", err);
      if (isApiNotFound(err)) {
        setUnavailable(true);
      } else {
        setError(formatUiErrorMessage(err, "Pano yüklenemedi."));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function changeStatus(item: EventBoardItem, status: string) {
    if (selectedPlanId == null) return;
    setUpdatingId(item.id);
    try {
      await updateEventBoardItemStatus(selectedPlanId, item.id, status);
      await load();
    } catch (err) {
      logApiError("Board status update", err);
      setError(formatUiErrorMessage(err, "Durum güncellenemedi."));
    } finally {
      setUpdatingId(null);
    }
  }

  if (selectedPlanId == null) {
    return (
      <p className="text-sm text-zinc-500">
        Pano için önce bir etkinlik planı seçin.
      </p>
    );
  }

  if (unavailable) {
    return <p className="text-sm text-zinc-500">Bu özellik hazırlanıyor.</p>;
  }

  if (loading) {
    return <p className="text-sm text-zinc-500">Pano yükleniyor…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-300/90">{error}</p>;
  }

  const columns = BOARD_STATUS_OPTIONS.map((col) => ({
    ...col,
    items: items.filter(
      (i) => i.status.toLowerCase() === col.value.toLowerCase(),
    ),
  }));

  const boardEmpty = items.length === 0;

  return (
    <div className="space-y-4">
      {boardEmpty ? (
        <div
          className={`${glassCard} border-violet-400/15 bg-violet-500/[0.04] py-8 text-center`}
        >
          <p className="text-sm text-zinc-400">Panoda henüz görev yok.</p>
          <p className="mt-1 text-xs text-zinc-600">
            Görevler eklendiğinde kolonlarda görünecek.
          </p>
        </div>
      ) : null}

      <div className="orivona-event-board" role="list" aria-label="Etkinlik panosu kolonları">
        {columns.map((col) => (
          <div
            key={col.value}
            role="listitem"
            className={`orivona-event-board-column ${glassCard} !flex !flex-col !p-4`}
          >
            <h3 className="mb-3 shrink-0 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
              {col.label}
              <span className="ml-1 font-normal text-zinc-600">
                ({col.items.length})
              </span>
            </h3>
            <ul className="flex min-h-0 flex-1 flex-col gap-2">
              {col.items.length === 0 ? (
                <li className="flex flex-1">
                  <BoardColumnEmpty />
                </li>
              ) : (
                col.items.map((item) => (
                  <li
                    key={String(item.id)}
                    className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    {item.description ? (
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {item.description}
                      </p>
                    ) : null}
                    <label className="mt-2 block text-[10px] text-zinc-500">
                      Durum
                      <select
                        className={`${selectClass} mt-1 text-xs`}
                        value={item.status}
                        disabled={updatingId === item.id}
                        onChange={(e) => void changeStatus(item, e.target.value)}
                      >
                        {BOARD_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </li>
                ))
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
