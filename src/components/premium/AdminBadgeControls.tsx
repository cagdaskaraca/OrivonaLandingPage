"use client";

import { useEffect, useState } from "react";
import {
  assignAdminServiceBadge,
  assignAdminVendorBadge,
  fetchBadgeCatalog,
  removeAdminServiceBadge,
  removeAdminVendorBadge,
} from "@/src/lib/api/premiumSaas";
import { formatBadgeLabel } from "@/src/lib/premiumLabels";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { btnPrimary, selectClass } from "@/src/lib/ui";

type AdminBadgeControlsProps = {
  entityType: "vendor" | "service";
  entityId: string | number;
  currentBadges?: string[];
  onUpdated?: () => void;
};

export function AdminBadgeControls({
  entityType,
  entityId,
  currentBadges = [],
  onUpdated,
}: AdminBadgeControlsProps) {
  const [catalog, setCatalog] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        ]),
      );
  }, []);

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
    try {
      if (entityType === "vendor") {
        await removeAdminVendorBadge(entityId, badgeType);
      } else {
        await removeAdminServiceBadge(entityId, badgeType);
      }
      onUpdated?.();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Rozet kaldırılamadı."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2 space-y-2 border-t border-white/10 pt-2">
      <div className="flex flex-wrap gap-1">
        {currentBadges.map((b) => (
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
      <div className="flex flex-wrap gap-2">
        <select
          className={`${selectClass} !py-1.5 text-xs`}
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Rozet seç</option>
          {catalog.map((b) => (
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
