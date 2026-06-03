"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchMyEventPlans } from "@/src/lib/api/eventPlans";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { EventPlan } from "@/src/lib/api/types";

type EventOsContextValue = {
  plans: EventPlan[];
  selectedPlanId: string | number | null;
  selectedPlan: EventPlan | null;
  loadingPlans: boolean;
  plansError: string | null;
  dataRefreshKey: number;
  selectPlan: (id: string | number | null) => void;
  refreshPlans: (options?: { silent?: boolean }) => Promise<void>;
  bumpDataRefresh: () => void;
};

const EventOsContext = createContext<EventOsContextValue | null>(null);

export function EventOsProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<EventPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | number | null>(
    null,
  );
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [dataRefreshKey, setDataRefreshKey] = useState(0);

  const bumpDataRefresh = useCallback(() => {
    setDataRefreshKey((k) => k + 1);
  }, []);

  const refreshPlans = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoadingPlans(true);
    setPlansError(null);
    try {
      const list = await fetchMyEventPlans();
      setPlans(list);
      setSelectedPlanId((prev) => {
        if (prev != null && list.some((p) => p.id === prev)) return prev;
        return list[0]?.id ?? null;
      });
    } catch (err) {
      logApiError("Event plans list", err);
      setPlans([]);
      setPlansError(
        formatUiErrorMessage(err, "Etkinlik planları yüklenemedi."),
      );
    } finally {
      setLoadingPlans(false);
    }
  }, []);

  useEffect(() => {
    void refreshPlans();
  }, [refreshPlans]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const value = useMemo(
    () => ({
      plans,
      selectedPlanId,
      selectedPlan,
      loadingPlans,
      plansError,
      dataRefreshKey,
      selectPlan: setSelectedPlanId,
      refreshPlans,
      bumpDataRefresh,
    }),
    [
      plans,
      selectedPlanId,
      selectedPlan,
      loadingPlans,
      plansError,
      dataRefreshKey,
      refreshPlans,
      bumpDataRefresh,
    ],
  );

  return (
    <EventOsContext.Provider value={value}>{children}</EventOsContext.Provider>
  );
}

export function useEventOs(): EventOsContextValue {
  const ctx = useContext(EventOsContext);
  if (!ctx) {
    throw new Error("useEventOs must be used within EventOsProvider");
  }
  return ctx;
}
