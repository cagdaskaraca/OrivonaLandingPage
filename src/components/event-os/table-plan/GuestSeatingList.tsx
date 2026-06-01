"use client";

import { useMemo, useState } from "react";
import type { TablePlanGuest } from "@/src/lib/api/types";
import { btnSecondary, glassCard, orivonaScrollX } from "@/src/lib/ui";

type GuestFilter = "all" | "assigned" | "unassigned";

type GuestSeatingListProps = {
  guests: TablePlanGuest[];
  busy: boolean;
  onUnassignGuest: (guest: TablePlanGuest) => void;
};

const PAGE_SIZES = [10, 20] as const;

export function GuestSeatingList({
  guests,
  busy,
  onUnassignGuest,
}: GuestSeatingListProps) {
  const [filter, setFilter] = useState<GuestFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const filtered = useMemo(() => {
    const sorted = [...guests].sort((a, b) =>
      (a.fullName ?? "").localeCompare(b.fullName ?? "", "tr"),
    );
    if (filter === "assigned") {
      return sorted.filter((g) => g.isAssigned);
    }
    if (filter === "unassigned") {
      return sorted.filter((g) => !g.isAssigned);
    }
    return sorted;
  }, [guests, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const filters: { id: GuestFilter; label: string }[] = [
    { id: "all", label: "Tümü" },
    { id: "assigned", label: "Atananlar" },
    { id: "unassigned", label: "Atanmayanlar" },
  ];

  return (
    <div className={`${glassCard} mt-6 !p-4 sm:!p-5`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-semibold text-white">
          Davetli oturma listesi
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filter === f.id
                  ? "bg-violet-500/25 text-violet-100 border border-violet-400/35"
                  : "border border-white/10 text-zinc-400 hover:text-zinc-200"
              }`}
              onClick={() => {
                setFilter(f.id);
                setPage(1);
              }}
            >
              {f.label}
            </button>
          ))}
          <label className="ml-auto flex items-center gap-2 text-xs text-zinc-500">
            Sayfa başına
            <select
              className="rounded-lg border border-white/10 bg-zinc-950/90 px-2 py-1 text-zinc-200"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value) as (typeof PAGE_SIZES)[number]);
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className={`${orivonaScrollX} overflow-x-auto`}>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-3 py-2 font-medium">Davetli adı</th>
              <th className="px-3 py-2 font-medium">Masa</th>
              <th className="px-3 py-2 font-medium">Sandalye</th>
              <th className="px-3 py-2 font-medium">Durum</th>
              <th className="px-3 py-2 font-medium">Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-zinc-500">
                  Bu filtrede kayıt yok.
                </td>
              </tr>
            ) : (
              slice.map((g) => (
                <tr
                  key={String(g.id)}
                  className="border-b border-white/5 text-zinc-300"
                >
                  <td className="px-3 py-2.5 text-white">{g.fullName}</td>
                  <td className="px-3 py-2.5">
                    {g.assignedTableName ?? "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {g.assignedSeatNumber != null
                      ? `Sandalye ${g.assignedSeatNumber}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        g.isAssigned
                          ? "text-violet-200"
                          : "text-zinc-500"
                      }
                    >
                      {g.isAssigned ? "Atandı" : "Atanmadı"}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    {g.isAssigned &&
                    g.assignedTableId != null &&
                    g.assignedSeatId != null ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-violet-300 hover:text-violet-100 disabled:opacity-50"
                        disabled={busy}
                        onClick={() => onUnassignGuest(g)}
                      >
                        Atamayı kaldır
                      </button>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`min-w-[2rem] rounded-lg px-2 py-1 text-sm ${
                safePage === n
                  ? "bg-violet-500/30 text-violet-100"
                  : "text-zinc-400 hover:bg-white/5"
              }`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
