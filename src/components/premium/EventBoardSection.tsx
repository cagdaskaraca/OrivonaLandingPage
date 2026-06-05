"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EventOsError,
  EventOsPlanPicker,
} from "@/src/components/event-os/EventOsShared";
import { useEventOs } from "@/src/components/event-os/EventOsContext";
import { getEventPlanBoard } from "@/src/lib/api/eventPlans";
import type {
  EventPlanBoardColumn,
  EventPlanBoardItem,
} from "@/src/lib/api/types";
import {
  boardColumnHeading,
  boardItemStatusBadge,
  formatBoardDate,
  formatBoardPrice,
} from "@/src/lib/eventBoardUi";
import {
  offerPriceHasDiscount,
  resolveOfferDisplayPrice,
  resolveOfferOriginalPrice,
} from "@/src/lib/offerPricing";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { badgeClass, glassCard } from "@/src/lib/ui";

function BoardColumnEmpty() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-6 text-center">
      <p className="text-xs text-zinc-500">Boş</p>
    </div>
  );
}

function BoardItemCard({ item }: { item: EventPlanBoardItem }) {
  return (
    <li className="shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_4px_20px_-12px_rgba(109,40,217,0.35)]">
      <p className="text-sm font-medium leading-snug text-white">
        {item.title ?? "—"}
      </p>
      {item.category ? (
        <p className="mt-2 text-xs text-zinc-400">
          <span className="text-zinc-500">Kategori:</span> {item.category}
        </p>
      ) : null}
      {item.vendorName ? (
        <p className="mt-1 text-xs text-zinc-300">
          <span className="text-zinc-500">İşletme:</span> {item.vendorName}
        </p>
      ) : null}
      {resolveOfferDisplayPrice(item) > 0 ? (
        <p className="mt-1 text-xs font-medium text-violet-200">
          <span className="font-normal text-zinc-500">Teklif:</span>{" "}
          {offerPriceHasDiscount(item) ? (
            <>
              <span className="text-zinc-500 line-through">
                {formatBoardPrice(resolveOfferOriginalPrice(item) ?? 0)}
              </span>{" "}
            </>
          ) : null}
          {formatBoardPrice(resolveOfferDisplayPrice(item))}
        </p>
      ) : null}
      {item.status ? (
        <p className="mt-2">
          <span className={`${badgeClass} normal-case tracking-normal`}>
            Durum: {boardItemStatusBadge(item.status)}
          </span>
        </p>
      ) : null}
      {item.createdAt ? (
        <p className="mt-2 text-[10px] text-zinc-600">
          {formatBoardDate(item.createdAt)}
        </p>
      ) : null}
      {item.description ? (
        <p className="mt-2 line-clamp-2 text-xs text-zinc-500">
          {item.description}
        </p>
      ) : null}
    </li>
  );
}

function BoardColumn({ column }: { column: EventPlanBoardColumn }) {
  const items = column.items ?? [];
  const count = column.count ?? items.length;

  return (
    <div
      role="listitem"
      className={`orivona-event-board-column ${glassCard} !flex !flex-col !p-4`}
    >
      <h3 className="mb-3 shrink-0 text-xs font-semibold tracking-wider text-violet-300/90">
        {boardColumnHeading(column.title, count)}
      </h3>
      <ul className="flex min-h-0 flex-1 flex-col gap-2">
        {items.length === 0 ? (
          <li className="flex flex-1">
            <BoardColumnEmpty />
          </li>
        ) : (
          items.map((item) => (
            <BoardItemCard key={String(item.id)} item={item} />
          ))
        )}
      </ul>
    </div>
  );
}

export function EventBoardSection() {
  const { selectedPlanId } = useEventOs();
  const [columns, setColumns] = useState<EventPlanBoardColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (selectedPlanId == null) return;
    setLoading(true);
    setError(null);
    try {
      const board = await getEventPlanBoard(selectedPlanId);
      setColumns(board.columns ?? []);
    } catch (err) {
      logApiError("Event board", err);
      setColumns([]);
      setError(
        formatUiErrorMessage(err, "Etkinlik panosu yüklenemedi."),
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPlanId]);

  useEffect(() => {
    void load();
  }, [load]);

  const boardEmpty = useMemo(
    () =>
      columns.every(
        (col) => (col.count ?? col.items?.length ?? 0) === 0,
      ),
    [columns],
  );

  if (selectedPlanId == null) {
    return (
      <p className="text-sm text-zinc-500">
        Pano için önce bir etkinlik planı seçin.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <EventOsPlanPicker />

      {loading ? (
        <div
          className={`${glassCard} flex items-center justify-center py-12 text-sm text-zinc-500`}
        >
          Pano yükleniyor…
        </div>
      ) : null}

      {!loading && error ? (
        <EventOsError message={error} onRetry={() => void load()} />
      ) : null}

      {!loading && !error ? (
        <>
          {boardEmpty ? (
            <div
              className={`${glassCard} border-violet-400/15 bg-violet-500/[0.04] py-6 text-center`}
            >
              <p className="text-sm text-zinc-400">
                Panoda henüz görev yok. Teklifler ve checklist işlemleri burada
                görünecek.
              </p>
            </div>
          ) : null}

          <div
            className="orivona-event-board"
            role="list"
            aria-label="Etkinlik panosu kolonları"
          >
            {columns.map((col) => (
              <BoardColumn
                key={col.key ?? col.title ?? String(col.count)}
                column={col}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
