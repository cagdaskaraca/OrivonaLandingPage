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
  buildMarketplaceQueryParams,
  fetchAccountProfile,
  updateAccountProfile,
  normalizeAccountProfile,
  extractMarketplaceItems,
  fetchMarketplace,
  normalizeMarketplaceItem,
  createVendorService,
  deleteVendorService,
  fetchCategories,
  fetchVendorProfile,
  fetchVendorServices,
  normalizeVendorProfile,
  normalizeVendorService,
  updateCustomerEventRequest,
  updateVendorService,
} from "@/src/lib/api/index";
export type { AiRecommendationsHttpResponse } from "@/src/lib/api/index";
