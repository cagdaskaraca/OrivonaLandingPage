"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchMobileHome } from "@/src/lib/api/premiumSaas";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import { glassCard } from "@/src/lib/ui";

type MobileHomeSummaryProps = {
  onNavigate?: (sectionId: string) => void;
};

export function MobileHomeSummary({ onNavigate }: MobileHomeSummaryProps) {
  const [data, setData] = useState<{
    unreadMessages?: number;
    pendingOffers?: number;
    upcomingReservations?: number;
    latestNotifications?: number;
  } | null>(null);
  const [hidden, setHidden] = useState(false);

  const load = useCallback(async () => {
    try {
      const summary = await fetchMobileHome();
      if (!summary) {
        setHidden(true);
        return;
      }
      setData(summary);
      setHidden(false);
    } catch (err) {
      logApiError("Mobile home", err);
      if (isApiNotFound(err)) setHidden(true);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (hidden || !data) return null;

  const cards = [
    {
      label: "Okunmamış mesaj",
      value: data.unreadMessages ?? 0,
      section: "dashboard-messages",
    },
    {
      label: "Bekleyen teklif",
      value: data.pendingOffers ?? 0,
      section: "dashboard-offers",
    },
    {
      label: "Yaklaşan rezervasyon",
      value: data.upcomingReservations ?? 0,
      section: "dashboard-reservations",
    },
    {
      label: "Bildirim",
      value: data.latestNotifications ?? 0,
      section: "dashboard-notifications",
    },
  ];

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:hidden">
      {cards.map((c) => (
        <button
          key={c.section}
          type="button"
          className={`${glassCard} text-left transition hover:border-violet-300/25`}
          onClick={() => {
            onNavigate?.(c.section);
            document.getElementById(c.section)?.scrollIntoView({ behavior: "smooth" });
          }}
        >
          <p className="text-2xl font-semibold text-violet-100">{c.value}</p>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
            {c.label}
          </p>
        </button>
      ))}
    </div>
  );
}
