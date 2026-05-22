/**
 * Centralized backend API surface for ORIVONA demo pages.
 * Base URL: NEXT_PUBLIC_API_BASE_URL (default http://localhost:8080/api)
 */
export * from "@/src/lib/api/client";
export * from "@/src/lib/api/types";
export {
  createCustomerEventRequest,
  deleteCustomerEventRequest,
  extractAiRecommendations,
  extractEventRequest,
  normalizeEventRequest,
  fetchAdminSummary,
  fetchAiRecommendations,
  fetchCustomerEventRequests,
  fetchEventRequestById,
  extractMarketplaceItems,
  fetchMarketplace,
  normalizeMarketplaceItem,
  fetchVendorProfile,
  fetchVendorServices,
  updateCustomerEventRequest,
} from "@/src/lib/api/index";
export type { AiRecommendationsHttpResponse } from "@/src/lib/api/index";
