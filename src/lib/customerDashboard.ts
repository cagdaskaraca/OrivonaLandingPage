import type { DashboardSummary } from "@/src/lib/api/types";

/** Friendly empty copy for optional customer dashboard sections. */
export const CUSTOMER_EMPTY_DATA_MESSAGE = "Henüz kayıtlı veri bulunmuyor.";

/** Shown when GET /customer/dashboard/summary is missing (404). */
export const CUSTOMER_DEFAULT_ZERO_SUMMARY: DashboardSummary = {
  totalOfferRequests: 0,
  pendingOfferRequests: 0,
  totalReservations: 0,
  upcomingReservations: 0,
  totalFavorites: 0,
};
