"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  activateAdminUser,
  deactivateAdminUser,
  fetchAdminUsers,
} from "@/src/lib/api";
import { formatApiErrorMessage } from "@/src/lib/api/client";
import type { AdminUser } from "@/src/lib/api/types";
import {
  activeStatusClass,
  userRoleLabel,
} from "@/src/lib/adminDashboard";
import { btnSecondary, skeletonClass } from "@/src/lib/ui";

const btnActivate =
  "inline-flex items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/18 disabled:opacity-50";

const btnDeactivate =
  "inline-flex items-center justify-center rounded-full border border-zinc-400/30 bg-zinc-500/10 px-4 py-1.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-500/18 disabled:cursor-not-allowed disabled:opacity-40";

type AdminUserManagementProps = {
  onToastSuccess: (msg: string) => void;
  onToastError: (msg: string) => void;
};

function isSameAdminUser(
  current: { id?: string; email?: string } | null,
  row: AdminUser,
): boolean {
  if (!current) return false;
  if (current.id != null && row.id != null && String(current.id) === String(row.id)) {
    return true;
  }
  const ce = current.email?.trim().toLowerCase();
  const re = row.email?.trim().toLowerCase();
  return Boolean(ce && re && ce === re);
}

export function AdminUserManagement({
  onToastSuccess,
  onToastError,
}: AdminUserManagementProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await fetchAdminUsers());
    } catch (e) {
      setError(formatApiErrorMessage(e, "Kullanıcılar yüklenemedi."));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleActivate(id: string | number) {
    setActionId(id);
    try {
      await activateAdminUser(id);
      onToastSuccess("Kullanıcı aktifleştirildi.");
      await load();
    } catch (e) {
      onToastError(formatApiErrorMessage(e, "Aktifleştirilemedi."));
    } finally {
      setActionId(null);
    }
  }

  async function handleDeactivate(id: string | number) {
    setActionId(id);
    try {
      await deactivateAdminUser(id);
      onToastSuccess("Kullanıcı pasifleştirildi.");
      await load();
    } catch (e) {
      onToastError(formatApiErrorMessage(e, "Pasifleştirilemedi."));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div>
      {loading ? (
        <div className={`${skeletonClass} mt-4 h-40`} />
      ) : error ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-300/90">{error}</p>
          <button
            type="button"
            className={`${btnSecondary} mt-3 text-xs`}
            onClick={() => void load()}
          >
            Tekrar dene
          </button>
        </div>
      ) : users.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Kayıtlı kullanıcı bulunamadı.</p>
      ) : (
        <div className="orivona-scroll-x mt-4 rounded-xl border border-white/10 pb-0.5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-3">Ad Soyad</th>
                <th className="px-4 py-3">E-posta</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06]">
              {users.map((u) => {
                const id = u.id;
                const busy = id != null && actionId === id;
                const isActive = u.isActive !== false;
                const isSelf = isSameAdminUser(currentUser, u);
                return (
                  <tr
                    key={String(id ?? u.email)}
                    className="bg-white/[0.02] hover:bg-white/[0.04]"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {u.fullName?.trim() || "—"}
                      {isSelf ? (
                        <span className="ml-2 text-xs text-violet-300/80">
                          (siz)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{u.email ?? "—"}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {userRoleLabel(u.role)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${activeStatusClass(u.isActive)}`}
                      >
                        {isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap justify-end gap-2">
                        {id != null ? (
                          isActive ? (
                            <button
                              type="button"
                              className={btnDeactivate}
                              disabled={busy || isSelf}
                              title={
                                isSelf
                                  ? "Kendi hesabınızı pasifleştiremezsiniz."
                                  : undefined
                              }
                              onClick={() => void handleDeactivate(id)}
                            >
                              {busy ? "…" : "Pasifleştir"}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className={btnActivate}
                              disabled={busy}
                              onClick={() => void handleActivate(id)}
                            >
                              {busy ? "…" : "Aktifleştir"}
                            </button>
                          )
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
      )}
    </div>
  );
}
