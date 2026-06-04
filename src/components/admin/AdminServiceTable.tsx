"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import { useAdminPagination } from "@/src/components/admin/useAdminPagination";
import { AdminBadgeControls } from "@/src/components/premium/AdminBadgeControls";
import type { AdminService } from "@/src/lib/api/types";
import { btnPrimary, btnSecondary, skeletonClass } from "@/src/lib/ui";

function filterService(service: AdminService, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    service.title,
    service.vendorName,
    service.categoryName,
    service.city,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

type AdminServiceTableProps = {
  services: AdminService[];
  loading?: boolean;
  actionServiceId?: string | number | null;
  onToggleFeature: (service: AdminService) => void;
  onPromote?: (service: AdminService) => void;
};

export function AdminServiceTable({
  services,
  loading,
  actionServiceId,
  onToggleFeature,
  onPromote,
}: AdminServiceTableProps) {
  if (loading) {
    return <div className={`${skeletonClass} mt-4 h-48`} />;
  }

  if (services.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-500">Kayıtlı hizmet bulunamadı.</p>
    );
  }

  const sorted = useMemo(
    () =>
      [...services].sort((a, b) => {
        const aFeat = a.isFeatured ? 0 : 1;
        const bFeat = b.isFeatured ? 0 : 1;
        if (aFeat !== bFeat) return aFeat - bFeat;
        return (a.title ?? "").localeCompare(b.title ?? "", "tr");
      }),
    [services],
  );

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    pageItems,
    totalPages,
    totalCount,
  } = useAdminPagination(sorted, { filterFn: filterService });

  return (
    <div className="mt-4">
      <AdminPaginationBar
        page={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Hizmet ara..."
      />
      <div className="orivona-scroll-x rounded-xl border border-white/10 pb-0.5">
      <table className="w-full min-w-[800px] text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">Hizmet</th>
            <th className="px-4 py-3 font-medium">İşletme</th>
            <th className="px-4 py-3 font-medium">Kategori</th>
            <th className="px-4 py-3 font-medium">Şehir</th>
            <th className="px-4 py-3 font-medium">Fiyat</th>
            <th className="px-4 py-3 font-medium">Durum</th>
            <th className="px-4 py-3 font-medium">Öne çıkan</th>
            <th className="px-4 py-3 text-right font-medium">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {pageItems.map((s) => {
            const id = s.id;
            const busy = id != null && actionServiceId === id;
            const active = s.isActive !== false;

            return (
              <>
              <tr
                key={String(id ?? s.title)}
                className="bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {id != null ? (
                    <Link
                      href={`/services/${encodeURIComponent(String(id))}`}
                      className="hover:text-violet-200"
                    >
                      {s.title ?? "—"}
                    </Link>
                  ) : (
                    (s.title ?? "—")
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-300">{s.vendorName ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{s.categoryName ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-400">{s.city ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-200">
                  {s.basePrice != null
                    ? `${s.basePrice.toLocaleString("tr-TR")} ₺`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      active
                        ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                        : "border-zinc-500/30 bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {active ? "Aktif" : "Pasif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      s.isFeatured
                        ? "border-violet-400/30 bg-violet-500/15 text-violet-100"
                        : "border-white/10 bg-white/[0.04] text-zinc-500"
                    }`}
                  >
                    {s.isFeatured ? "Evet" : "Hayır"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {id != null ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      {onPromote ? (
                        <button
                          type="button"
                          className={`${btnSecondary} !px-3 !py-1.5 text-xs`}
                          disabled={busy}
                          onClick={() => onPromote(s)}
                        >
                          Tanıt
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className={`${s.isFeatured ? btnSecondary : btnPrimary} !px-4 !py-1.5 text-xs`}
                        disabled={busy}
                        onClick={() => onToggleFeature(s)}
                      >
                        {busy
                          ? "…"
                          : s.isFeatured
                            ? "Öne çıkarmayı kaldır"
                            : "Öne çıkar"}
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-500">—</span>
                  )}
                </td>
              </tr>
              {id != null ? (
                <tr key={`${String(id)}-badges`} className="bg-white/[0.01]">
                  <td colSpan={8} className="px-4 py-2">
                    <AdminBadgeControls entityType="service" entityId={id} />
                  </td>
                </tr>
              ) : null}
              </>
            );
          })}
        </tbody>
      </table>
      </div>
      {pageItems.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
      ) : null}
    </div>
  );
}
