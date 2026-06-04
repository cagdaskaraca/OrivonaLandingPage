"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assignAdminServiceBadge,
  assignAdminVendorBadge,
  fetchBadgeCatalog,
  fetchServiceBadges,
  fetchVendorBadges,
  removeAdminServiceBadge,
  removeAdminVendorBadge,
} from "@/src/lib/api/premiumSaas";
import { formatBadgeLabel } from "@/src/lib/premiumLabels";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, selectClass } from "@/src/lib/ui";

type AdminBadgeControlsProps = {
  entityType: "vendor" | "service";
  entityId: string | number;
  /** Required for service rows — assignable badges come from this vendor. */
  vendorId?: string | number | null;
  onUpdated?: () => void;
};

export function AdminBadgeControls({
  entityType,
  entityId,
  vendorId,
  onUpdated,
}: AdminBadgeControlsProps) {
  const [assigned, setAssigned] = useState<string[]>([]);
  const [catalog, setCatalog] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssigned = useCallback(async () => {
    if (entityType === "service") {
      return fetchServiceBadges(entityId);
    }
    return fetchVendorBadges(entityId);
  }, [entityType, entityId]);

  const loadCatalog = useCallback(async () => {
    if (entityType === "service") {
      if (vendorId == null || vendorId === "") return [];
      return fetchVendorBadges(vendorId);
    }
    const global = await fetchBadgeCatalog();
    if (global.length > 0) return global;
    return [
      "Verified",
      "PremiumPartner",
      "Popular",
      "FastResponse",
      "HighRating",
      "New",
      "Featured",
    ];
  }, [entityType, vendorId]);

  const refresh = useCallback(async () => {
    setLoadingMeta(true);
    setError(null);
    try {
      const [current, pool] = await Promise.all([loadAssigned(), loadCatalog()]);
      setAssigned(current);
      setCatalog(pool);
    } catch (err) {
      logApiError("Load badges", err);
      setAssigned([]);
      setCatalog([]);
    } finally {
      setLoadingMeta(false);
    }
  }, [loadAssigned, loadCatalog]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const assignable = catalog.filter(
    (b) => !assigned.some((a) => a.toLowerCase() === b.toLowerCase()),
  );

  async function assign() {
    if (!selected) return;
    if (entityType === "service" && (vendorId == null || vendorId === "")) {
      setError("İşletme bilgisi eksik; rozet atanamıyor.");
      return;
    }
    if (
      entityType === "service" &&
      !catalog.some((b) => b.toLowerCase() === selected.toLowerCase())
    ) {
      setError("Bu rozet işletmede tanımlı değil. Önce işletmeye rozet atayın.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (entityType === "vendor") {
        await assignAdminVendorBadge(entityId, selected);
      } else {
        await assignAdminServiceBadge(entityId, selected);
      }
      setSelected("");
      await refresh();
      onUpdated?.();
    } catch (err) {
      logApiError("Assign badge", err);
      setError(formatUiErrorMessage(err, "Rozet eklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  async function remove(badgeType: string) {
    setLoading(true);
    setError(null);
    try {
      if (entityType === "vendor") {
        await removeAdminVendorBadge(entityId, badgeType);
      } else {
        await removeAdminServiceBadge(entityId, badgeType);
      }
      await refresh();
      onUpdated?.();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Rozet kaldırılamadı."));
    } finally {
      setLoading(false);
    }
  }

  const serviceNeedsVendor =
    entityType === "service" && (vendorId == null || vendorId === "");

  return (
    <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
      <p className="text-[10px] text-zinc-500">
        {entityType === "service"
          ? "Bu hizmette görünecek rozetler — yalnızca işletmede tanımlı rozetlerden seçilir. Marketplace ve hizmet detayında gösterilir."
          : "İşletme rozetleri — bu işletmenin tüm hizmetlerine atanabilecek havuz."}
      </p>
      {loadingMeta ? (
        <p className="text-[10px] text-zinc-500">Rozetler yükleniyor…</p>
      ) : null}
      <div className="flex flex-wrap gap-1">
        {assigned.map((b) => (
          <span
            key={b}
            className="inline-flex items-center gap-1 rounded-full border border-violet-400/25 bg-violet-500/10 px-2 py-0.5 text-[10px] text-violet-100"
          >
            {formatBadgeLabel(b)}
            <button
              type="button"
              className="text-red-300 hover:text-red-200"
              disabled={loading}
              onClick={() => void remove(b)}
              aria-label={`${formatBadgeLabel(b)} kaldır`}
            >
              ×
            </button>
          </span>
        ))}
        {!loadingMeta && assigned.length === 0 ? (
          <span className="text-[10px] text-zinc-500">Atanmış rozet yok.</span>
        ) : null}
      </div>
      {serviceNeedsVendor ? (
        <p className="text-[10px] text-amber-200/90">
          İşletme kimliği bulunamadı; rozet atamak için satırda vendorId gerekir.
        </p>
      ) : entityType === "service" && catalog.length === 0 ? (
        <p className="text-[10px] text-amber-200/90">
          Bu işletmede henüz rozet yok. Önce İşletme yönetimi tablosundan işletmeye
          rozet ekleyin.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          <select
            className={`${selectClass} !py-1.5 text-xs`}
            value={selected}
            disabled={loading || loadingMeta || assignable.length === 0}
            onChange={(e) => setSelected(e.target.value)}
          >
            <option value="">
              {assignable.length === 0 ? "Eklenecek rozet kalmadı" : "Rozet seç"}
            </option>
            {assignable.map((b) => (
              <option key={b} value={b}>
                {formatBadgeLabel(b)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={`${btnPrimary} !px-3 !py-1.5 text-xs`}
            disabled={
              loading ||
              loadingMeta ||
              !selected ||
              serviceNeedsVendor ||
              assignable.length === 0
            }
            onClick={() => void assign()}
          >
            Ekle
          </button>
        </div>
      )}
      {error ? <p className="text-[10px] text-red-300">{error}</p> : null}
    </div>
  );
}
