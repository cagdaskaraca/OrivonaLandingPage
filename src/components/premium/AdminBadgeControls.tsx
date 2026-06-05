"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  assignAdminServiceBadge,
  assignAdminVendorBadge,
  fetchBadgeCatalog,
  fetchServiceBadges,
  fetchVendorBadges,
  removeAdminServiceBadge,
  removeAdminVendorBadge,
} from "@/src/lib/api/premiumSaas";
import { mergeBadgeLists } from "@/src/lib/serviceBadges";
import { formatBadgeLabel } from "@/src/lib/premiumLabels";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, selectClass } from "@/src/lib/ui";

type AdminBadgeControlsProps = {
  entityType: "vendor" | "service";
  entityId: string | number;
  /** Service ise, ilgili işletmenin id'si varsa rozetler miras alınır. */
  vendorId?: string | number;
  /** Liste yanıtından gelen rozetler (varsa); API ile birleştirilir. */
  seedBadges?: string[];
  onUpdated?: () => void;
};

export function AdminBadgeControls({
  entityType,
  entityId,
  vendorId,
  seedBadges,
  onUpdated,
}: AdminBadgeControlsProps) {
  const stableSeedBadges = useMemo(
    () => seedBadges ?? [],
    [seedBadges],
  );

  const [catalog, setCatalog] = useState<string[]>([]);
  const [badges, setBadges] = useState<string[]>(stableSeedBadges);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBadges = useCallback(async () => {
    setLoadingList(true);
    try {
      if (entityType === "service") {
        const [fromService, fromVendor] = await Promise.all([
          fetchServiceBadges(entityId),
          vendorId != null ? fetchVendorBadges(vendorId) : Promise.resolve([]),
        ]);
        setBadges(mergeBadgeLists(stableSeedBadges, fromService, fromVendor));
      } else {
        const fromApi = await fetchVendorBadges(entityId);
        setBadges(mergeBadgeLists(stableSeedBadges, fromApi));
      }
    } catch {
      setBadges(mergeBadgeLists(stableSeedBadges));
    } finally {
      setLoadingList(false);
    }
  }, [entityId, entityType, stableSeedBadges, vendorId]);

  useEffect(() => {
    // SeedBadges değişirse hemen UI'ı güncelle (özellikle Admin tabloları yeniden render olunca).
    setBadges(stableSeedBadges);
  }, [stableSeedBadges]);

  useEffect(() => {
    fetchBadgeCatalog()
      .then(setCatalog)
      .catch(() =>
        setCatalog([
          "Verified",
          "PremiumPartner",
          "Popular",
          "FastResponse",
          "HighRating",
          "New",
          "Featured",
          "Sponsored",
        ]),
      );
  }, []);

  useEffect(() => {
    void loadBadges();
  }, [loadBadges]);

  async function assign() {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      if (entityType === "vendor") {
        await assignAdminVendorBadge(entityId, selected);
      } else {
        await assignAdminServiceBadge(entityId, selected);
      }
      setSelected("");
      await loadBadges();
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
      await loadBadges();
      onUpdated?.();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Rozet kaldırılamadı."));
    } finally {
      setLoading(false);
    }
  }

  const availableToAdd = catalog.filter(
    (c) => !badges.some((b) => b.toLowerCase() === c.toLowerCase()),
  );

  return (
    <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        Rozetler
        {entityType === "vendor"
          ? " (işletme — bu işletmenin tüm hizmetlerinde görünür)"
          : " (hizmet — yalnızca bu hizmet kartında)"}
      </p>
      {loadingList ? (
        <p className="text-[10px] text-zinc-500">Rozetler yükleniyor…</p>
      ) : badges.length === 0 ? (
        <p className="text-[10px] text-zinc-500">Henüz rozet atanmadı.</p>
      ) : (
        <div className="flex flex-wrap gap-1">
          {badges.map((b) => (
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
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <select
          className={`${selectClass} !py-1.5 text-xs`}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          disabled={loading || availableToAdd.length === 0}
        >
          <option value="">
            {availableToAdd.length === 0 ? "Eklenecek rozet yok" : "Rozet seç"}
          </option>
          {availableToAdd.map((b) => (
            <option key={b} value={b}>
              {formatBadgeLabel(b)}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={`${btnPrimary} !px-3 !py-1.5 text-xs`}
          disabled={loading || !selected}
          onClick={() => void assign()}
        >
          Ekle
        </button>
      </div>
      {error ? <p className="text-[10px] text-red-300">{error}</p> : null}
    </div>
  );
}
