"use client";

import { useCallback, useEffect, useState } from "react";
import {
  disableAdminPromotion,
  fetchAdminPromotions,
  type Promotion,
} from "@/src/lib/api/commerce";
import { promotionTypeLabel } from "@/src/lib/commerceUi";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { btnSecondary, glassCard } from "@/src/lib/ui";

export function AdminPromotionsSection() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await fetchAdminPromotions());
    } catch (err) {
      logApiError("Admin promotions", err);
      setError(formatUiErrorMessage(err, "Tanıtımlar yüklenemedi."));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleDisable(id: string | number) {
    if (!confirm("Bu tanıtımı devre dışı bırakmak istiyor musunuz?")) return;
    setBusyId(id);
    try {
      await disableAdminPromotion(id);
      await load();
    } catch (err) {
      setError(formatUiErrorMessage(err, "Tanıtım kapatılamadı."));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-500">
        Hizmet tablosundan &quot;Tanıt&quot; ile yeni kayıt ekleyin. Ödeme alınmaz.
      </p>
      {error ? <p className="text-sm text-red-300/90">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Tanıtım kaydı yok"
          description="Hizmetler bölümünden bir hizmeti tanıtabilirsiniz."
        />
      ) : (
        <ul className={`${glassCard} divide-y divide-white/[0.06] !p-0`}>
          {items.map((p) => (
            <li
              key={String(p.id)}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
            >
              <div>
                <p className="font-medium text-white">
                  {p.serviceTitle ?? `Hizmet #${p.serviceId}`}
                </p>
                <p className="text-xs text-zinc-500">
                  {promotionTypeLabel(p.promotionType)} · {p.startDate} – {p.endDate}
                </p>
              </div>
              {p.isActive !== false ? (
                <button
                  type="button"
                  className={`${btnSecondary} text-xs`}
                  disabled={busyId === p.id}
                  onClick={() => void handleDisable(p.id)}
                >
                  {busyId === p.id ? "…" : "Devre dışı"}
                </button>
              ) : (
                <span className="text-xs text-zinc-600">Pasif</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
