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
import {
  formatBadgeLabel,
  normalizeBadgeTypeForApi,
} from "@/src/lib/premiumLabels";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, selectClass } from "@/src/lib/ui";

type BadgeRow = {
  type: string;
  source: "service" | "vendor";
};

type AdminBadgeControlsProps = {
  entityType: "vendor" | "service";
  entityId: string | number;
  vendorId?: string | number;
  seedBadges?: string[];
  onUpdated?: () => void;
};

function badgeKey(type: string): string {
  return type.trim().toLowerCase();
}

function buildBadgeRows(
  serviceBadges: string[],
  vendorBadges: string[],
  entityType: "vendor" | "service",
): BadgeRow[] {
  const rows: BadgeRow[] = [];
  const seen = new Set<string>();

  const push = (type: string, source: BadgeRow["source"]) => {
    const key = badgeKey(type);
    if (!key || seen.has(key)) return;
    seen.add(key);
    rows.push({ type, source });
  };

  if (entityType === "vendor") {
    for (const type of vendorBadges) push(type, "vendor");
    return rows;
  }

  for (const type of serviceBadges) push(type, "service");
  for (const type of vendorBadges) push(type, "vendor");
  return rows;
}

export function AdminBadgeControls({
  entityType,
  entityId,
  vendorId,
  seedBadges,
  onUpdated,
}: AdminBadgeControlsProps) {
  const stableSeedBadges = useMemo(() => seedBadges ?? [], [seedBadges]);

  const [catalog, setCatalog] = useState<string[]>([]);
  const [serviceBadges, setServiceBadges] = useState<string[]>([]);
  const [vendorBadges, setVendorBadges] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayBadges = useMemo(
    () => buildBadgeRows(serviceBadges, vendorBadges, entityType),
    [entityType, serviceBadges, vendorBadges],
  );

  const allBadges = useMemo(
    () => displayBadges.map((row) => row.type),
    [displayBadges],
  );

  const loadBadges = useCallback(async () => {
    setLoadingList(true);
    setError(null);
    try {
      if (entityType === "service") {
        const [fromService, fromVendor] = await Promise.all([
          fetchServiceBadges(entityId),
          vendorId != null ? fetchVendorBadges(vendorId) : Promise.resolve([]),
        ]);
        setServiceBadges(mergeBadgeLists(stableSeedBadges, fromService));
        setVendorBadges(fromVendor);
      } else {
        const fromApi = await fetchVendorBadges(entityId);
        setServiceBadges([]);
        setVendorBadges(mergeBadgeLists(stableSeedBadges, fromApi));
      }
    } catch (err) {
      logApiError("Load badges", err);
      setServiceBadges(entityType === "service" ? mergeBadgeLists(stableSeedBadges) : []);
      setVendorBadges(
        entityType === "vendor" ? mergeBadgeLists(stableSeedBadges) : [],
      );
    } finally {
      setLoadingList(false);
    }
  }, [entityId, entityType, stableSeedBadges, vendorId]);

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
    const badgeType = normalizeBadgeTypeForApi(selected);
    setLoading(true);
    setError(null);
    try {
      if (entityType === "vendor") {
        await assignAdminVendorBadge(entityId, badgeType);
      } else {
        await assignAdminServiceBadge(entityId, badgeType);
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

  async function remove(row: BadgeRow) {
    const badgeType = normalizeBadgeTypeForApi(row.type);
    setLoading(true);
    setError(null);
    try {
      if (entityType === "vendor" || row.source === "vendor") {
        const targetVendorId = entityType === "vendor" ? entityId : vendorId;
        if (targetVendorId == null) {
          setError("İşletme rozeti kaldırmak için işletme bilgisi gerekli.");
          return;
        }
        await removeAdminVendorBadge(targetVendorId, badgeType);
      } else {
        await removeAdminServiceBadge(entityId, badgeType);
      }
      await loadBadges();
      onUpdated?.();
    } catch (err) {
      logApiError("Remove badge", err);
      setError(
        formatUiErrorMessage(
          err,
          row.source === "vendor"
            ? "İşletme rozeti kaldırılamadı."
            : "Hizmet rozeti kaldırılamadı.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const availableToAdd = catalog.filter(
    (c) => !allBadges.some((b) => badgeKey(b) === badgeKey(c)),
  );

  return (
    <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        Rozetler
        {entityType === "vendor"
          ? " (işletme — bu işletmenin tüm hizmetlerinde görünür)"
          : " (hizmet + işletmeden miras)"}
      </p>
      {loadingList ? (
        <p className="text-[10px] text-zinc-500">Rozetler yükleniyor…</p>
      ) : displayBadges.length === 0 ? (
        <p className="text-[10px] text-zinc-500">Henüz rozet atanmadı.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {displayBadges.map((row) => (
            <span
              key={`${row.source}-${row.type}`}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] text-violet-100 ${
                row.source === "vendor" && entityType === "service"
                  ? "border-fuchsia-400/30 bg-fuchsia-500/10"
                  : "border-violet-400/25 bg-violet-500/10"
              }`}
              title={
                row.source === "vendor" && entityType === "service"
                  ? "İşletme rozeti — tüm hizmetlerde görünür"
                  : undefined
              }
            >
              {formatBadgeLabel(row.type)}
              {row.source === "vendor" && entityType === "service" ? (
                <span className="text-[9px] text-fuchsia-200/70">işletme</span>
              ) : null}
              <button
                type="button"
                className="pointer-events-auto relative z-10 ml-0.5 inline-flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-base leading-none text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={loading}
                aria-label={`${formatBadgeLabel(row.type)} kaldır`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void remove(row);
                }}
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
