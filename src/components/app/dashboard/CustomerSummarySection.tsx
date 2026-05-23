"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCustomerDashboardSummary } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { DashboardSummary } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import { CUSTOMER_EMPTY_DATA_MESSAGE } from "@/src/lib/customerDashboard";
import { skeletonClass } from "@/src/lib/ui";

export function CustomerSummarySection() {
  const toast = useToast();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setUnavailable(false);
    try {
      const data = await fetchCustomerDashboardSummary();
      setSummary(data);
      setUnavailable(Object.keys(data).length === 0);
    } catch (e) {
      logApiError("Customer dashboard summary", e);
      setSummary({});
      setUnavailable(true);
      if (!isApiNotFound(e)) toast.error("Özet verisi yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className={`${skeletonClass} h-24`} />;
  if (unavailable) {
    return (
      <p className="text-sm text-zinc-500">{CUSTOMER_EMPTY_DATA_MESSAGE}</p>
    );
  }

  return (
    <SummaryCards
      summary={summary}
      loading={false}
      className="mb-0"
      emptyMessage={CUSTOMER_EMPTY_DATA_MESSAGE}
    />
  );
}
