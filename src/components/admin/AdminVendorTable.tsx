"use client";

import type { AdminVendor } from "@/src/lib/api/types";
import {
  activeStatusClass,
  formatAdminDate,
  vendorActiveLabel,
  vendorApprovalLabel,
  vendorCanModerate,
  vendorUserIsActive,
} from "@/src/lib/adminDashboard";
import { btnPrimary, skeletonClass } from "@/src/lib/ui";

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-100 transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-red-500/18 disabled:opacity-50 disabled:pointer-events-none";

const btnActivate =
  "inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/18 disabled:opacity-50";

const btnDeactivate =
  "inline-flex items-center justify-center rounded-full border border-zinc-400/30 bg-zinc-500/10 px-4 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-500/18 disabled:opacity-50";

type AdminVendorTableProps = {
  vendors: AdminVendor[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  actionVendorId?: string | number | null;
  onApprove: (id: string | number) => void;
  onRejectRequest: (vendor: AdminVendor) => void;
  onActivate: (id: string | number) => void;
  onDeactivate: (id: string | number) => void;
};

export function AdminVendorTable({
  vendors,
  loading,
  error,
  onRetry,
  actionVendorId,
  onApprove,
  onRejectRequest,
  onActivate,
  onDeactivate,
}: AdminVendorTableProps) {
  if (loading) {
    return <div className={`${skeletonClass} mt-4 h-48`} />;
  }

  if (error) {
    return (
      <div className="mt-4 text-center">
        <p className="text-sm text-red-300/90">{error}</p>
        {onRetry ? (
          <button
            type="button"
            className={`${btnPrimary} mt-3 !px-4 !py-1.5 text-xs`}
            onClick={onRetry}
          >
            Tekrar dene
          </button>
        ) : null}
      </div>
    );
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
    <div className="orivona-scroll-x mt-4 rounded-xl border border-white/10 pb-0.5">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide text-zinc-500">
          <tr>
            <th className="px-4 py-3 font-medium">İşletme</th>
            <th className="px-4 py-3 font-medium">Yetkili</th>
            <th className="px-4 py-3 font-medium">Konum</th>
            <th className="px-4 py-3 font-medium">Onay</th>
            <th className="px-4 py-3 font-medium">Hesap</th>
            <th className="px-4 py-3 font-medium">Kayıt</th>
            <th className="px-4 py-3 text-right font-medium">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.06]">
          {sorted.map((v) => {
            const id = v.id;
            const busy = id != null && actionVendorId === id;
            const canModerate = vendorCanModerate(v);
            const approvalLabel = vendorApprovalLabel(v);
            const approvalClass =
              v.isApproved === true
                ? "border-emerald-400/30 bg-emerald-500/15 text-emerald-100"
                : approvalLabel === "Reddedildi"
                  ? "border-red-400/30 bg-red-500/15 text-red-200"
                  : "border-amber-400/30 bg-amber-500/15 text-amber-100";
            const userActive = vendorUserIsActive(v);
            const showActivation = v.isApproved === true && id != null;
            const rejectionReason = v.rejectionReason?.trim();

            return (
              <tr
                key={String(id ?? v.email)}
                className="bg-white/[0.02] transition-colors hover:bg-white/[0.04]"
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-white">
                    {v.businessName ?? "—"}
                  </p>
                  {rejectionReason ? (
                    <p className="mt-1.5 rounded-lg border border-amber-500/25 bg-amber-500/10 px-2 py-1 text-xs text-amber-100/90">
                      Red gerekçesi: {rejectionReason}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-zinc-300">
                  {v.ownerName?.trim() || "—"}
                </td>
                <td className="px-4 py-3 text-zinc-400">
                  {[v.city, v.district].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${approvalClass}`}
                  >
                    {approvalLabel}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${activeStatusClass(userActive)}`}
                  >
                    {vendorActiveLabel(v)}
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
                          onClick={() => onRejectRequest(v)}
                        >
                          Reddet
                        </button>
                      </>
                    ) : null}
                    {showActivation ? (
                      userActive ? (
                        <button
                          type="button"
                          className={btnDeactivate}
                          disabled={busy}
                          onClick={() => onDeactivate(id)}
                        >
                          {busy ? "…" : "Pasifleştir"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={btnActivate}
                          disabled={busy}
                          onClick={() => onActivate(id)}
                        >
                          {busy ? "…" : "Aktifleştir"}
                        </button>
                      )
                    ) : null}
                    {!canModerate && !showActivation ? (
                      <span className="text-xs text-zinc-500">—</span>
                    ) : null}
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
