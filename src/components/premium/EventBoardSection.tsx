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

  return (
    <div className="grid gap-4 overflow-x-auto pb-2 lg:grid-cols-5">
      {columns.map((col) => (
        <div
          key={col.value}
          className={`${glassCard} min-w-[12rem] !p-4`}
        >
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-violet-300/90">
            {col.label}
            <span className="ml-1 text-zinc-600">({col.items.length})</span>
          </h3>
          <ul className="space-y-2">
            {col.items.length === 0 ? (
              <li className="text-xs text-zinc-600">Boş</li>
            ) : (
              col.items.map((item) => (
                <li
                  key={String(item.id)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3"
                >
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
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
      {items.length === 0 ? (
        <p className="col-span-full text-center text-sm text-zinc-500">
          Panoda henüz görev yok.
        </p>
      ) : null}
    </div>
  );
}
