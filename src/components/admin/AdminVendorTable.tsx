"use client";

import type { AdminVendor } from "@/src/lib/api/types";
import {
  formatAdminDate,
  vendorApprovalLabel,
  vendorCanModerate,
} from "@/src/lib/adminDashboard";
import { btnPrimary, skeletonClass } from "@/src/lib/ui";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none";

type AdminVendorTableProps = {
  vendors: AdminVendor[];
  loading?: boolean;
  actionVendorId?: string | number | null;
  onApprove: (id: string | number) => void;
  onReject: (id: string | number) => void;
};

export function AdminVendorTable({
  vendors,
  loading,
  actionVendorId,
  onApprove,
  onReject,
}: AdminVendorTableProps) {
  if (loading) {
    return <div className={`${skeletonClass} mt-4 h-48`} />;
  }

  if (vendors.length === 0) {
    return (
      <p className="mt-4 text-sm text-zinc-500">Kayıtlı işletme bulunamadı.</p>
    );
  }

  const sorted = [...vendors].sort((a, b) => {
    const aPending = vendorCanModerate(a) ? 0 : 1;
    const bPending = vendorCanModerate(b) ? 0 : 1;
    if (aPending !== bPending) return aPending - bPending;
    return (a.businessName ?? "").localeCompare(b.businessName ?? "", "tr");
  });

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">İşletme</th>
            <th className="px-4 py-3 font-medium">E-posta</th>
            <th className="px-4 py-3 font-medium">Konum</th>
            <th className="px-4 py-3 font-medium">Durum</th>
            <th className="px-4 py-3 font-medium">Kayıt</th>
            <th className="px-4 py-3 text-right font-medium">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {sorted.map((v) => {
            const id = v.id;
            const busy = id != null && actionVendorId === id;
            const canModerate = vendorCanModerate(v);
            const statusLabel = vendorApprovalLabel(v);
            const statusClass =
              v.isApproved === true
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                : statusLabel === "Reddedildi"
                  ? "border-red-400/30 bg-red-500/15 text-red-200"
                  : "border-amber-400/30 bg-amber-500/15 text-amber-100";

            return (
              <tr
                key={String(id ?? v.email)}
                className="bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3 font-medium text-white">
                  {v.businessName ?? "—"}
                </td>
                <td className="px-4 py-3 text-zinc-300">{v.email ?? "—"}</td>
                <td className="px-4 py-3 text-zinc-400">
                  {[v.city, v.district].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
                  >
                    {statusLabel}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {formatAdminDate(v.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {canModerate && id != null ? (
                      <>
                        <button
                          type="button"
                          className={`${btnPrimary} !px-4 !py-1.5 text-xs`}
                          disabled={busy}
                          onClick={() => onApprove(id)}
                        >
                          {busy ? "…" : "Onayla"}
                        </button>
                        <button
                          type="button"
                          className={btnDanger}
                          disabled={busy}
                          onClick={() => onReject(id)}
                        >
                          Reddet
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-zinc-500">—</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
