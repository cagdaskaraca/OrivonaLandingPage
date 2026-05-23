"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchCustomerDashboardSummary } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { DashboardSummary } from "@/src/lib/api/types";
import { SummaryCards } from "@/src/components/dashboard/SummaryCards";
import {
  CUSTOMER_DEFAULT_ZERO_SUMMARY,
  CUSTOMER_EMPTY_DATA_MESSAGE,
} from "@/src/lib/customerDashboard";
import { skeletonClass } from "@/src/lib/ui";

export function CustomerSummarySection() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCustomerDashboardSummary();
      setSummary(data);
    } catch (e) {
      if (isApiNotFound(e)) {
        console.warn("Customer dashboard summary unavailable (404).");
      } else {
        logApiError("Customer dashboard summary", e);
      }
      setSummary(CUSTOMER_DEFAULT_ZERO_SUMMARY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <div className={`${skeletonClass} h-24`} />;

  return (
    <SummaryCards
      summary={summary ?? CUSTOMER_DEFAULT_ZERO_SUMMARY}
      loading={false}
      className="mb-0"
      emptyMessage={CUSTOMER_EMPTY_DATA_MESSAGE}
    />
  );
}
