"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ADMIN_PAGE_SIZE_OPTIONS,
  type AdminPageSize,
} from "@/src/components/admin/useAdminPagination";
import { inputClass, selectClass } from "@/src/lib/ui";

type AdminPaginationBarProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: AdminPageSize;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: AdminPageSize) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  /** Show controls when count exceeds this (default 10). */
  minItemsForControls?: number;
};

const navBtn =
  "inline-flex items-center justify-center gap-1 rounded-full border border-violet-300/25 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-50 transition hover:bg-violet-500/18 disabled:pointer-events-none disabled:opacity-35";

export function AdminPaginationBar({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  minItemsForControls = 10,
}: AdminPaginationBarProps) {
  const showControls = totalCount > minItemsForControls || Boolean(searchQuery?.trim());
  const showSearch = onSearchChange != null;

  if (!showControls && !showSearch) return null;

  return (
    <div className="mt-4 space-y-3">
      {showSearch ? (
        <label className="block max-w-md">
          <span className="sr-only">Ara</span>
          <input
            type="search"
            className={inputClass}
            value={searchQuery ?? ""}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder ?? "Ara..."}
          />
        </label>
      ) : null}

      {showControls ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2.5">
          <p className="text-xs text-zinc-500">
            {totalCount} kayıt
            {searchQuery?.trim() ? " (filtrelenmiş)" : ""}
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-500">
              <span className="whitespace-nowrap">Sayfa boyutu</span>
              <select
                className={`${selectClass} !w-auto !min-w-[4.5rem] !py-1.5 !text-xs`}
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value) as AdminPageSize)
                }
              >
                {ADMIN_PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                className={navBtn}
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                aria-label="Önceki sayfa"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Önceki
              </button>
              <span className="min-w-[4.5rem] px-1 text-center text-xs font-medium text-violet-100">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                className={navBtn}
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
                aria-label="Sonraki sayfa"
              >
                Sonraki
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
