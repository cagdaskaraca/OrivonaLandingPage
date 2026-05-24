"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchVendorPromotions, type Promotion } from "@/src/lib/api/commerce";
import { promotionTypeLabel } from "@/src/lib/commerceUi";
import { logApiError } from "@/src/lib/api/client";
import { EmptyState } from "@/src/components/ui/EmptyState";
import { glassCard } from "@/src/lib/ui";

export function VendorPromotionsSection() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchVendorPromotions());
    } catch (err) {
      logApiError("Vendor promotions", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className={`${glassCard} space-y-4`}>
      <div>
        <h3 className="text-lg font-semibold text-white">Aktif tanıtımlar</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Hizmetleriniz için ORIVONA tarafından tanımlanan sponsorlu / öne çıkan
          görünürlükler (bilgi amaçlı).
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Yükleniyor…</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon="✨"
          title="Aktif tanıtım yok"
          description="Öne çıkan veya sponsorlu görünürlük tanımlandığında burada listelenir."
        />
      ) : (
        <ul className="space-y-2">
          {items.map((p) => (
            <li
              key={String(p.id)}
              className="rounded-xl border border-violet-400/20 bg-violet-500/[0.06] px-4 py-3"
            >
              <p className="font-medium text-white">
                {p.serviceTitle ?? `Hizmet #${p.serviceId}`}
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                {promotionTypeLabel(p.promotionType)} ·{" "}
                {p.startDate ?? "—"} – {p.endDate ?? "—"}
                {p.isActive === false ? " · Pasif" : " · Aktif"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
