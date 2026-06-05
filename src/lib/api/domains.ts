import {
  apiDeleteRaw,
  apiGetPublicRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
  withOptionalNotFound,
} from "@/src/lib/api/client";
import { extractInvitationFields } from "@/src/lib/api/invitationDesigns";
import { extractPlaylistFields } from "@/src/lib/api/eventPlaylist";
import { vendorGetWithRetry } from "@/src/lib/api/vendorDashboardFetch";
import { flattenAvailabilityPayload } from "@/src/lib/availability";
import { CUSTOMER_DEFAULT_ZERO_SUMMARY } from "@/src/lib/customerDashboard";
import {
  recordBool,
  recordId,
  recordNum,
  recordStr,
} from "@/src/lib/normalize";
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminService,
  AdminUser,
  AdminVendor,
  VendorServicePayload,
  AiDetectedEvent,
  AiEventPlanRequest,
  AiEventPlanResult,
  AiRecommendationItem,
  ApiEnvelope,
  AcceptCustomerOfferPayload,
  CancelCustomerOfferPayload,
  AppNotification,
  ChatMessage,
  Conversation,
  CreateConversationPayload,
  CreateOfferRequestPayload,
  CreateVendorAvailabilityPayload,
  CreateServiceReviewPayload,
  SendChatMessagePayload,
  CreateReservationPayload,
  VendorAvailability,
  ServiceReview,
  ServiceReviewsData,
  DashboardSummary,
  FavoriteItem,
  OfferRequest,
  RejectCustomerOfferPayload,
  Reservation,
  SendVendorOfferPayload,
  ServiceImage,
  ServiceImagePayload,
} from "@/src/lib/api/types";

function assertSuccess(envelope: ApiEnvelope): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

function toList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "data",
      "months",
      "favorites",
      "offerRequests",
      "reservations",
      "vendors",
      "services",
      "images",
      "notifications",
      "conversations",
      "messages",
      "availability",
      "reviews",
      "categories",
      "users",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as unknown[];
    }
  }
  return [];
}

function normalizeSummary(raw: unknown): DashboardSummary {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const o = raw as Record<string, unknown>;
  const out: DashboardSummary = {};
  for (const [k, v] of Object.entries(o)) {
    if (typeof v === "number" || typeof v === "string") out[k] = v;
  }
  return out;
}

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

export async function fetchVendorDashboardSummary(): Promise<DashboardSummary> {
  const body = await vendorGetWithRetry("/vendor/dashboard/summary", {
    sectionKey: "summary",
    allowNotFound: true,
  });
  return normalizeSummary(body.data);
}

export async function fetchCustomerDashboardSummary(): Promise<DashboardSummary> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/customer/dashboard-summary");
      assertSuccess(body);
      const payload = extractPayload(body.data) ?? body.data;
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return CUSTOMER_DEFAULT_ZERO_SUMMARY;
      }
      const o = payload as Record<string, unknown>;
      return {
        totalOfferRequests:
          recordNum(o, "totalRequestCount", "TotalRequestCount") ?? 0,
        pendingOfferRequests:
          recordNum(o, "pendingOfferCount", "PendingOfferCount") ?? 0,
        totalReservations:
          recordNum(o, "totalReservationCount", "TotalReservationCount") ?? 0,
        upcomingReservations:
          recordNum(o, "upcomingReservationCount", "UpcomingReservationCount") ?? 0,
        totalFavorites: recordNum(o, "favoriteCount", "FavoriteCount") ?? 0,
      };
    },
    CUSTOMER_DEFAULT_ZERO_SUMMARY,
    "Customer summary endpoint not available yet",
  );
}

export async function fetchAdminDashboardSummary(): Promise<DashboardSummary> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/dashboard/summary");
  assertSuccess(body);
  return normalizeSummary(body.data);
}

function normalizeFavorite(raw: unknown): FavoriteItem {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const service = o.service ?? o.Service ?? o.vendorService ?? o.VendorService;
  const s =
    service && typeof service === "object"
      ? (service as Record<string, unknown>)
      : o;
  return {
    id: recordId(o),
    vendorServiceId:
      recordId(o, "vendorServiceId", "VendorServiceId") ??
      recordId(s, "id", "Id"),
    serviceTitle:
      recordStr(s, "title", "Title") ??
      recordStr(s, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(s, "vendorName", "VendorName"),
    city: recordStr(s, "city", "City"),
    district: recordStr(s, "district", "District"),
    basePrice: recordNum(s, "basePrice", "BasePrice"),
    coverImageUrl:
      recordStr(s, "coverImageUrl", "CoverImageUrl") ??
      recordStr(s, "imageUrl", "ImageUrl"),
    categoryName: recordStr(s, "categoryName", "CategoryName"),
  };
}

export async function fetchFavorites(): Promise<FavoriteItem[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/favorites");
      assertSuccess(body);
      return toList(body.data).map(normalizeFavorite);
    },
    [],
    "Customer favorites endpoint not available yet",
  );
}

export async function addFavorite(
  vendorServiceId: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/favorites/${vendorServiceId}`,
    {},
  );
  assertSuccess(body);
}

export async function removeFavorite(
  vendorServiceId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/favorites/${vendorServiceId}`);
  assertSuccess(body);
}

function nestedOfferRecord(
  o: Record<string, unknown>,
): Record<string, unknown> | undefined {
  const single =
    o.offer ?? o.Offer ?? o.vendorOffer ?? o.VendorOffer;
  if (single && typeof single === "object" && !Array.isArray(single)) {
    return single as Record<string, unknown>;
  }
  const list = o.offers ?? o.Offers;
  if (Array.isArray(list) && list[0] && typeof list[0] === "object") {
    return list[0] as Record<string, unknown>;
  }
  return undefined;
}

/** Vendor offer id for POST /api/offers/{offerId}/accept|reject — never the offer-request id. */
function extractVendorOfferId(
  o: Record<string, unknown>,
  requestId?: string | number,
): string | number | undefined {
  const nested = nestedOfferRecord(o);
  if (nested) {
    const nestedId = recordId(nested);
    if (nestedId != null) return nestedId;
  }

  const topOfferId =
    recordId(o, "offerId", "OfferId") ??
    recordId(o, "vendorOfferId", "VendorOfferId");
  if (topOfferId != null && topOfferId !== requestId) return topOfferId;

  return undefined;
}

function normalizeOffer(raw: unknown): OfferRequest {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const requestId =
    recordId(o, "offerRequestId", "OfferRequestId") ?? recordId(o);
  const nested = nestedOfferRecord(o);
  const vendorOfferId = extractVendorOfferId(o, requestId);

  const nestedListPrice =
    nested ? recordNum(nested, "price", "Price") : undefined;
  const nestedOriginal =
    nested ? recordNum(nested, "originalPrice", "OriginalPrice") : undefined;
  const nestedFinal =
    nested
      ? recordNum(nested, "finalPrice", "FinalPrice") ??
        recordNum(nested, "discountedPrice", "DiscountedPrice")
      : undefined;
  const nestedDisplay =
    nested ? recordNum(nested, "displayPrice", "DisplayPrice") : undefined;

  const vendorOfferPrice =
    recordNum(o, "vendorOfferPrice", "VendorOfferPrice") ??
    nestedOriginal ??
    nestedListPrice ??
    recordNum(o, "offeredPrice", "OfferedPrice") ??
    recordNum(o, "price", "Price");
  const vendorOfferDescription =
    recordStr(o, "vendorOfferDescription", "VendorOfferDescription") ??
    (nested
      ? recordStr(nested, "description", "Description") ??
        recordStr(nested, "responseDescription", "ResponseDescription")
      : undefined) ??
    recordStr(o, "responseDescription", "ResponseDescription") ??
    recordStr(o, "description", "Description");
  const validUntil =
    recordStr(o, "validUntil", "ValidUntil") ??
    (nested ? recordStr(nested, "validUntil", "ValidUntil") : undefined);

  const invitation = extractInvitationFields(extractPayload(o) ?? o);
  const playlistFields = extractPlaylistFields(o);

  return {
    id: requestId,
    offerId: vendorOfferId,
    eventRequestId:
      recordId(o, "eventRequestId", "EventRequestId") ?? requestId,
    vendorServiceId: recordId(o, "vendorServiceId", "VendorServiceId"),
    serviceTitle: recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    customerName: recordStr(o, "customerName", "CustomerName"),
    message: recordStr(o, "message", "Message"),
    guestCount: recordNum(o, "guestCount", "GuestCount"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    status: recordStr(o, "status", "Status"),
    category: recordStr(o, "category", "Category"),
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    vendorOfferPrice,
    vendorOfferDescription,
    offeredPrice: vendorOfferPrice,
    price: vendorOfferPrice,
    responseDescription: vendorOfferDescription,
    description: vendorOfferDescription,
    validUntil,
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
    originalPrice:
      recordNum(o, "originalPrice", "OriginalPrice") ??
      nestedOriginal ??
      vendorOfferPrice,
    finalPrice:
      recordNum(o, "finalPrice", "FinalPrice") ??
      recordNum(o, "discountedPrice", "DiscountedPrice") ??
      nestedFinal,
    discountedPrice:
      recordNum(o, "discountedPrice", "DiscountedPrice") ??
      recordNum(o, "finalPrice", "FinalPrice") ??
      nestedFinal,
    displayPrice:
      recordNum(o, "displayPrice", "DisplayPrice") ?? nestedDisplay,
    hasDiscount:
      recordBool(o, "hasDiscount", "HasDiscount") ??
      (nested ? recordBool(nested, "hasDiscount", "HasDiscount") : undefined),
    discountAmount:
      recordNum(o, "discountAmount", "DiscountAmount") ??
      (nested ? recordNum(nested, "discountAmount", "DiscountAmount") : undefined),
    discountPercent:
      recordNum(o, "discountPercent", "DiscountPercent") ??
      (nested ? recordNum(nested, "discountPercent", "DiscountPercent") : undefined),
    couponCode:
      recordStr(o, "couponCode", "CouponCode") ??
      (nested ? recordStr(nested, "couponCode", "CouponCode") : undefined),
    ...invitation,
    ...playlistFields,
  };
}

function toEventDateIso(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes("T")) return trimmed;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return `${trimmed}T00:00:00`;
  return trimmed;
}

export async function createOfferRequest(
  payload: CreateOfferRequestPayload,
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>("/offer-requests", {
    vendorServiceId: payload.vendorServiceId,
    message: payload.message,
    eventDate: toEventDateIso(payload.eventDate),
    guestCount: payload.guestCount,
    eventPlanId: payload.eventPlanId ?? null,
    category: payload.category ?? null,
    city: payload.city ?? null,
    district: payload.district ?? null,
    budgetMin: payload.budgetMin ?? null,
    budgetMax: payload.budgetMax ?? null,
    note: payload.note ?? payload.message ?? null,
    couponCode: payload.couponCode?.trim().toUpperCase() || null,
  });
  assertSuccess(body);
  return normalizeOffer(body.data ?? payload);
}

export async function fetchMyOfferRequests(): Promise<OfferRequest[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/offer-requests/my");
      assertSuccess(body);
      const payload = extractPayload(body.data) ?? body.data;
      return toList(payload).map(normalizeOffer);
    },
    [],
    "Customer offer requests endpoint not available yet",
  );
}

export async function fetchVendorOfferRequests(): Promise<OfferRequest[]> {
  const body = await vendorGetWithRetry("/vendor/offer-requests", {
    sectionKey: "offers",
    devLogLabel: "Vendor offers response",
    allowNotFound: true,
  });
  const payload = extractPayload(body.data) ?? body.data;
  return toList(payload).map(normalizeOffer);
}

export async function sendVendorOffer(
  requestId: string | number,
  payload: SendVendorOfferPayload,
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/offer-requests/${requestId}/send-offer`,
    {
      price: payload.price,
      description: payload.description,
      validUntil: payload.validUntil || null,
    },
  );
  assertSuccess(body);
  return normalizeOffer(body.data ?? payload);
}

export async function rejectVendorOfferRequest(
  requestId: string | number,
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/offer-requests/${requestId}/reject`,
    {},
  );
  assertSuccess(body);
  return normalizeOffer(body.data);
}

export async function acceptCustomerOffer(
  offerId: string | number,
  payload: AcceptCustomerOfferPayload = {
    paymentMode: "Demo",
    note: "Demo ödeme ile kabul edildi",
  },
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(`/offers/${offerId}/accept`, {
    paymentMode: payload.paymentMode,
    note: payload.note,
    couponCode: payload.couponCode?.trim().toUpperCase() || null,
  });
  assertSuccess(body);
  return normalizeOffer(body.data);
}

export async function rejectCustomerOffer(
  offerId: string | number,
  payload: RejectCustomerOfferPayload = {
    reason: "Müşteri tarafından reddedildi",
  },
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(`/offers/${offerId}/reject`, {
    reason: payload.reason,
  });
  assertSuccess(body);
  return normalizeOffer(body.data);
}

export async function cancelCustomerOffer(
  offerId: string | number,
  payload: CancelCustomerOfferPayload = {},
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(`/offers/${offerId}/cancel`, {
    reason: payload.reason?.trim() || "Müşteri tarafından iptal edildi",
  });
  assertSuccess(body);
  return normalizeOffer(body.data);
}

export async function cancelCustomerOfferRequest(
  requestId: string | number,
  payload: CancelCustomerOfferPayload = {},
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/offer-requests/${requestId}/cancel`,
    {
      reason: payload.reason?.trim() || "Müşteri tarafından iptal edildi",
    },
  );
  assertSuccess(body);
  return normalizeOffer(body.data);
}

function normalizeReservation(raw: unknown): Reservation {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    vendorServiceId: recordId(o, "vendorServiceId", "VendorServiceId"),
    serviceTitle: recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    customerName: recordStr(o, "customerName", "CustomerName"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    guestCount: recordNum(o, "guestCount", "GuestCount"),
    totalPrice: recordNum(o, "totalPrice", "TotalPrice"),
    status: recordStr(o, "status", "Status"),
    notes: recordStr(o, "notes", "Notes"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

export async function createReservation(
  payload: CreateReservationPayload,
): Promise<Reservation> {
  const body = await apiPostRaw<ApiEnvelope>("/reservations", payload);
  assertSuccess(body);
  return normalizeReservation(body.data ?? payload);
}

export async function fetchMyReservations(): Promise<Reservation[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/reservations/my");
      assertSuccess(body);
      return toList(body.data).map(normalizeReservation);
    },
    [],
    "Customer reservations endpoint not available yet",
  );
}

export async function fetchVendorReservations(): Promise<Reservation[]> {
  const body = await vendorGetWithRetry("/vendor/reservations", {
    sectionKey: "reservations",
    devLogLabel: "Vendor reservations response",
    allowNotFound: true,
  });
  return toList(body.data).map(normalizeReservation);
}

export async function cancelReservation(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/reservations/${id}/cancel`, {});
  assertSuccess(body);
}

export async function confirmVendorReservation(
  id: string | number,
): Promise<Reservation> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/reservations/${id}/confirm`,
    {},
  );
  assertSuccess(body);
  return normalizeReservation(body.data);
}

export async function completeVendorReservation(
  id: string | number,
): Promise<Reservation> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/reservations/${id}/complete`,
    {},
  );
  assertSuccess(body);
  return normalizeReservation(body.data);
}

function normalizeServiceImage(raw: unknown): ServiceImage {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const url = recordStr(o, "url", "Url") ?? recordStr(o, "imageUrl", "ImageUrl");
  return {
    id: recordId(o),
    url,
    imageUrl: url,
    isCover: recordBool(o, "isCover", "IsCover"),
    sortOrder: recordNum(o, "sortOrder", "SortOrder"),
  };
}

export async function fetchServiceImages(
  serviceId: string | number,
): Promise<ServiceImage[]> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/vendor/services/${serviceId}/images`,
  );
  assertSuccess(body);
  return toList(body.data).map(normalizeServiceImage);
}

export async function addServiceImage(
  serviceId: string | number,
  payload: ServiceImagePayload,
): Promise<ServiceImage> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/services/${serviceId}/images`,
    payload,
  );
  assertSuccess(body);
  return normalizeServiceImage(body.data ?? payload);
}

export async function updateServiceImage(
  serviceId: string | number,
  imageId: string | number,
  payload: ServiceImagePayload,
): Promise<ServiceImage> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/vendor/services/${serviceId}/images/${imageId}`,
    payload,
  );
  assertSuccess(body);
  return normalizeServiceImage(body.data ?? payload);
}

export async function deleteServiceImage(
  serviceId: string | number,
  imageId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/vendor/services/${serviceId}/images/${imageId}`,
  );
  assertSuccess(body);
}

function normalizeAiRecommendation(raw: unknown): AiRecommendationItem {
  if (!raw || typeof raw !== "object") return {};
  const item = raw as Record<string, unknown>;
  const serviceId =
    recordId(item, "serviceId", "ServiceId") ??
    recordId(item, "vendorServiceId", "VendorServiceId");
  const reasonsRaw = item.reasons ?? item.Reasons;
  const title =
    recordStr(item, "serviceTitle", "ServiceTitle") ??
    recordStr(item, "title", "Title");
  const price =
    recordNum(item, "price", "Price") ??
    recordNum(item, "basePrice", "BasePrice") ??
    recordNum(item, "estimatedPrice", "EstimatedPrice");
  return {
    vendorName: recordStr(item, "vendorName", "VendorName"),
    serviceTitle: title,
    title,
    categoryName:
      recordStr(item, "categoryName", "CategoryName") ??
      recordStr(item, "category", "Category"),
    category: recordStr(item, "category", "Category"),
    city: recordStr(item, "city", "City"),
    district: recordStr(item, "district", "District"),
    price,
    basePrice: price,
    estimatedPrice: recordNum(item, "estimatedPrice", "EstimatedPrice") ?? price,
    rating:
      recordNum(item, "rating", "Rating") ??
      recordNum(item, "averageRating", "AverageRating"),
    averageRating: recordNum(item, "averageRating", "AverageRating"),
    reviewCount: recordNum(item, "reviewCount", "ReviewCount"),
    score: recordNum(item, "score", "Score"),
    serviceId,
    vendorServiceId: serviceId,
    vendorId: recordId(item, "vendorId", "VendorId"),
    coverImageUrl: recordStr(item, "coverImageUrl", "CoverImageUrl"),
    imageUrl: recordStr(item, "imageUrl", "ImageUrl"),
    reasons: Array.isArray(reasonsRaw)
      ? reasonsRaw.map(String)
      : typeof reasonsRaw === "string"
        ? reasonsRaw
        : undefined,
  };
}

function normalizeAiDetected(raw: unknown): AiDetectedEvent | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const d = raw as Record<string, unknown>;
  const guest =
    recordNum(d, "guestCount", "GuestCount") ??
    recordNum(d, "guests", "Guests");
  const budgetMin =
    recordNum(d, "budgetMin", "BudgetMin") ??
    recordNum(d, "minBudget", "MinBudget");
  const budgetMax =
    recordNum(d, "budgetMax", "BudgetMax") ??
    recordNum(d, "maxBudget", "MaxBudget");
  const budget =
    recordNum(d, "budget", "Budget") ?? recordNum(d, "totalBudget", "TotalBudget");
  return {
    eventType:
      recordStr(d, "eventType", "EventType") ??
      recordStr(d, "type", "Type"),
    city: recordStr(d, "city", "City"),
    district: recordStr(d, "district", "District"),
    guestCount: guest,
    budgetMin: budgetMin ?? budget,
    budgetMax: budgetMax ?? budget,
    budget,
    style:
      recordStr(d, "style", "Style") ?? recordStr(d, "eventStyle", "EventStyle"),
    theme:
      recordStr(d, "theme", "Theme") ?? recordStr(d, "eventTheme", "EventTheme"),
  };
}

function normalizeAiPlan(raw: unknown): AiEventPlanResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const recs = o.recommendations ?? o.Recommendations;
  const budget = o.budgetBreakdown ?? o.BudgetBreakdown;
  const timeline = o.timeline ?? o.Timeline ?? o.planningTimeline;
  const concepts = o.conceptIdeas ?? o.ConceptIdeas ?? o.concepts;
  const checklist = o.checklist ?? o.Checklist ?? o.planningChecklist;
  const tipsRaw = o.aiTips ?? o.AiTips ?? o.tips ?? o.Tips;
  const detectedRaw =
    o.detected ??
    o.Detected ??
    o.parsedEvent ??
    o.ParsedEvent ??
    o.eventDetails ??
    o.EventDetails;

  const detected = normalizeAiDetected(detectedRaw);
  const guestCount =
    detected?.guestCount ??
    recordNum(o, "guestCount", "GuestCount") ??
    recordNum(o, "guests", "Guests");
  const budgetMin =
    detected?.budgetMin ??
    recordNum(o, "budgetMin", "BudgetMin") ??
    recordNum(o, "minBudget", "MinBudget");
  const budgetMax =
    detected?.budgetMax ??
    recordNum(o, "budgetMax", "BudgetMax") ??
    recordNum(o, "maxBudget", "MaxBudget");

  return {
    summary: recordStr(o, "summary", "Summary"),
    detected,
    eventType:
      detected?.eventType ??
      recordStr(o, "eventType", "EventType"),
    city: detected?.city ?? recordStr(o, "city", "City"),
    district: detected?.district ?? recordStr(o, "district", "District"),
    guestCount,
    budgetMin,
    budgetMax,
    style:
      detected?.style ??
      recordStr(o, "style", "Style") ??
      recordStr(o, "eventStyle", "EventStyle"),
    theme:
      detected?.theme ??
      recordStr(o, "theme", "Theme") ??
      recordStr(o, "eventTheme", "EventTheme"),
    totalEstimatedMin:
      recordNum(o, "totalEstimatedMin", "TotalEstimatedMin") ??
      recordNum(o, "totalMin", "TotalMin"),
    totalEstimatedMax:
      recordNum(o, "totalEstimatedMax", "TotalEstimatedMax") ??
      recordNum(o, "totalMax", "TotalMax"),
    budgetStatus: recordStr(o, "budgetStatus", "BudgetStatus"),
    budgetWarning: recordStr(o, "budgetWarning", "BudgetWarning"),
    recommendations: Array.isArray(recs)
      ? recs.map(normalizeAiRecommendation)
      : undefined,
    budgetBreakdown: Array.isArray(budget)
      ? budget.map((b) => {
          const line = b as Record<string, unknown>;
          const categoryName =
            recordStr(line, "categoryName", "CategoryName") ??
            recordStr(line, "name", "Name");
          const category = recordStr(line, "category", "Category");
          const estimatedMin =
            recordNum(line, "estimatedMin", "EstimatedMin") ??
            recordNum(line, "min", "Min");
          const estimatedMax =
            recordNum(line, "estimatedMax", "EstimatedMax") ??
            recordNum(line, "max", "Max");
          const suggestedBudget =
            recordNum(line, "suggestedBudget", "SuggestedBudget") ??
            recordNum(line, "amount", "Amount");
          return {
            categoryName,
            category: category ?? categoryName,
            amount: recordNum(line, "amount", "Amount") ?? suggestedBudget,
            estimatedMin,
            estimatedMax,
            suggestedBudget,
            percentage: recordNum(line, "percentage", "Percentage"),
          };
        })
      : undefined,
    checklist: Array.isArray(checklist)
      ? checklist.map((c) => {
          const row = c as Record<string, unknown>;
          return {
            categoryName:
              recordStr(row, "categoryName", "CategoryName") ??
              recordStr(row, "category", "Category"),
            title: recordStr(row, "title", "Title"),
            description: recordStr(row, "description", "Description"),
            priority: recordStr(row, "priority", "Priority"),
            status: recordStr(row, "status", "Status"),
          };
        })
      : undefined,
    timeline: Array.isArray(timeline)
      ? timeline.map((t) => {
          const step = t as Record<string, unknown>;
          const monthOffset =
            recordNum(step, "monthOffset", "MonthOffset") ??
            recordNum(step, "monthsBefore", "MonthsBefore");
          return {
            title: recordStr(step, "title", "Title"),
            description: recordStr(step, "description", "Description"),
            timing: recordStr(step, "timing", "Timing"),
            monthOffset,
          };
        })
      : undefined,
    aiTips: Array.isArray(tipsRaw)
      ? tipsRaw.map(String)
      : typeof tipsRaw === "string"
        ? [tipsRaw]
        : undefined,
    conceptIdeas: Array.isArray(concepts)
      ? concepts.map(String)
      : typeof concepts === "string"
        ? [concepts]
        : undefined,
  };
}

export async function fetchAiEventPlan(
  payload: AiEventPlanRequest,
): Promise<AiEventPlanResult> {
  const { apiPostPublicRaw } = await import("@/src/lib/api/client");
  const body = await apiPostPublicRaw<ApiEnvelope>("/ai/event-plan", payload);
  assertSuccess(body);
  return normalizeAiPlan(body.data);
}

function normalizeAdminVendor(raw: unknown): AdminVendor {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    businessName: recordStr(o, "businessName", "BusinessName"),
    legalBusinessName: recordStr(
      o,
      "legalBusinessName",
      "LegalBusinessName",
    ),
    companyType: recordStr(o, "companyType", "CompanyType"),
    taxNumber: recordStr(o, "taxNumber", "TaxNumber"),
    nationalId:
      recordStr(o, "nationalId", "NationalId") ??
      recordStr(o, "nationalID", "NationalID") ??
      recordStr(o, "tcKimlikNo", "TcKimlikNo"),
    identityVerificationStatus: recordStr(
      o,
      "identityVerificationStatus",
      "IdentityVerificationStatus",
    ),
    ownerName:
      recordStr(o, "ownerName", "OwnerName") ??
      recordStr(o, "fullName", "FullName") ??
      recordStr(o, "contactName", "ContactName"),
    email: recordStr(o, "email", "Email"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    isApproved: recordBool(o, "isApproved", "IsApproved"),
    isUserActive:
      recordBool(o, "isUserActive", "IsUserActive") ??
      recordBool(o, "isActive", "IsActive"),
    rejectionReason:
      recordStr(o, "rejectionReason", "RejectionReason") ??
      recordStr(o, "rejectReason", "RejectReason"),
    status:
      recordStr(o, "status", "Status") ??
      recordStr(o, "approvalStatus", "ApprovalStatus"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

function normalizeAdminCategory(raw: unknown): AdminCategory {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    name: recordStr(o, "name", "Name") ?? recordStr(o, "title", "Title"),
    slug: recordStr(o, "slug", "Slug"),
    description: recordStr(o, "description", "Description"),
    isActive: recordBool(o, "isActive", "IsActive") ?? true,
    serviceCount:
      recordNum(o, "serviceCount", "ServiceCount") ??
      recordNum(o, "servicesCount", "ServicesCount"),
  };
}

function normalizeAdminUser(raw: unknown): AdminUser {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    fullName:
      recordStr(o, "fullName", "FullName") ?? recordStr(o, "name", "Name"),
    email: recordStr(o, "email", "Email"),
    role: recordStr(o, "role", "Role"),
    isActive: recordBool(o, "isActive", "IsActive") ?? true,
  };
}

function buildAdminCategoryBody(payload: AdminCategoryPayload) {
  const body: Record<string, unknown> = {
    name: payload.name.trim(),
    description: payload.description?.trim() ?? "",
    isActive: payload.isActive,
  };
  const slug = payload.slug?.trim();
  if (slug) body.slug = slug;
  return body;
}

function normalizeAdminService(raw: unknown): AdminService {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    vendorId:
      recordId(o, "vendorId", "VendorId") ??
      recordId(o, "vendorProfileId", "VendorProfileId"),
    title:
      recordStr(o, "title", "Title") ??
      recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    categoryName: recordStr(o, "categoryName", "CategoryName"),
    categoryId: recordId(o, "categoryId", "CategoryId"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    isFeatured: recordBool(o, "isFeatured", "IsFeatured"),
    isActive: recordBool(o, "isActive", "IsActive"),
    basePrice: recordNum(o, "basePrice", "BasePrice"),
  };
}

function buildAdminServiceBody(
  vendorId: string | number,
  payload: VendorServicePayload,
) {
  const categoryId = payload.categoryId;
  if (categoryId == null || String(categoryId).trim() === "") {
    throw new Error("Geçerli bir kategori seçin.");
  }
  const price = payload.basePrice;
  return {
    vendorId,
    categoryId,
    title: payload.title.trim(),
    description: payload.description.trim(),
    basePrice: price,
    price,
    city: payload.city.trim(),
    district: payload.district.trim(),
    capacityMin: payload.capacityMin,
    capacityMax: payload.capacityMax,
    isActive: payload.isActive,
  };
}

export async function fetchAdminVendors(): Promise<AdminVendor[]> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/vendors");
  assertSuccess(body);
  return toList(body.data).map(normalizeAdminVendor);
}

export async function fetchAdminPendingVendors(): Promise<AdminVendor[]> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/vendors/pending");
  assertSuccess(body);
  return toList(body.data).map(normalizeAdminVendor);
}

export async function approveAdminVendor(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/admin/vendors/${id}/approve`, {});
  assertSuccess(body);
}

export async function rejectAdminVendor(
  id: string | number,
  reason?: string,
): Promise<void> {
  const payload: Record<string, unknown> = {};
  const trimmed = reason?.trim();
  if (trimmed) payload.reason = trimmed;
  const body = await apiPostRaw<ApiEnvelope>(
    `/admin/vendors/${id}/reject`,
    payload,
  );
  assertSuccess(body);
}

export async function activateAdminVendor(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/admin/vendors/${id}/activate`,
    {},
  );
  assertSuccess(body);
}

export async function deactivateAdminVendor(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/admin/vendors/${id}/deactivate`,
    {},
  );
  assertSuccess(body);
}

export async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/categories");
  assertSuccess(body);
  return toList(body.data)
    .map(normalizeAdminCategory)
    .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", "tr"));
}

export async function createAdminCategory(
  payload: AdminCategoryPayload,
): Promise<AdminCategory> {
  const body = await apiPostRaw<ApiEnvelope>(
    "/admin/categories",
    buildAdminCategoryBody(payload),
  );
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeAdminCategory(data);
  }
  return normalizeAdminCategory(payload);
}

export async function updateAdminCategory(
  id: string | number,
  payload: AdminCategoryPayload,
): Promise<AdminCategory> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/admin/categories/${id}`,
    buildAdminCategoryBody(payload),
  );
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeAdminCategory(data);
  }
  return normalizeAdminCategory({ ...payload, id });
}

export async function deleteAdminCategory(id: string | number): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/admin/categories/${id}`);
  assertSuccess(body);
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/users");
  assertSuccess(body);
  return toList(body.data)
    .map(normalizeAdminUser)
    .sort((a, b) => (a.fullName ?? a.email ?? "").localeCompare(
      b.fullName ?? b.email ?? "",
      "tr",
    ));
}

export async function activateAdminUser(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/admin/users/${id}/activate`, {});
  assertSuccess(body);
}

export async function deactivateAdminUser(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/admin/users/${id}/deactivate`, {});
  assertSuccess(body);
}

export async function fetchAdminServices(): Promise<AdminService[]> {
  const body = await apiGetRaw<ApiEnvelope>("/admin/services");
  assertSuccess(body);
  return toList(body.data).map(normalizeAdminService);
}

export async function createAdminService(
  vendorId: string | number,
  payload: VendorServicePayload,
): Promise<AdminService> {
  const body = await apiPostRaw<ApiEnvelope>(
    "/admin/services",
    buildAdminServiceBody(vendorId, payload),
  );
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeAdminService(data);
  }
  return normalizeAdminService(payload);
}

export async function updateAdminService(
  id: string | number,
  vendorId: string | number,
  payload: VendorServicePayload,
): Promise<AdminService> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/admin/services/${id}`,
    buildAdminServiceBody(vendorId, payload),
  );
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeAdminService(data);
  }
  return normalizeAdminService({ ...payload, id });
}

export async function deleteAdminService(id: string | number): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/admin/services/${id}`);
  assertSuccess(body);
}

export async function featureAdminService(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/admin/services/${id}/feature`,
    {},
  );
  assertSuccess(body);
}

export async function unfeatureAdminService(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/admin/services/${id}/unfeature`,
    {},
  );
  assertSuccess(body);
}

function normalizeNotification(raw: unknown): AppNotification {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const readAt = recordStr(o, "readAt", "ReadAt");
  const isReadExplicit = recordBool(o, "isRead", "IsRead");
  const isRead =
    isReadExplicit === true ||
    (isReadExplicit !== false && Boolean(readAt?.trim()));

  return {
    id: recordId(o),
    type:
      recordStr(o, "type", "Type") ??
      recordStr(o, "notificationType", "NotificationType"),
    title: recordStr(o, "title", "Title"),
    message:
      recordStr(o, "message", "Message") ??
      recordStr(o, "body", "Body") ??
      recordStr(o, "content", "Content"),
    createdAt:
      recordStr(o, "createdAt", "CreatedAt") ??
      recordStr(o, "sentAt", "SentAt"),
    isRead,
    readAt,
    actionUrl:
      recordStr(o, "actionUrl", "ActionUrl") ??
      recordStr(o, "action_url", "action_url") ??
      recordStr(o, "url", "Url") ??
      recordStr(o, "link", "Link"),
  };
}

export async function fetchNotifications(): Promise<AppNotification[]> {
  const body = await apiGetRaw<ApiEnvelope>("/notifications");
  assertSuccess(body);
  return toList(body.data).map(normalizeNotification);
}

export async function markNotificationRead(
  id: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/notifications/${id}/read`, {});
  assertSuccess(body);
}

export async function markAllNotificationsRead(): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>("/notifications/read-all", {});
  assertSuccess(body);
}

function extractCustomerPartyFields(
  o: Record<string, unknown>,
): Pick<Conversation, "customerName" | "customerFullName" | "customerEmail"> {
  const customer = o.customer ?? o.Customer;
  let nestedFullName: string | undefined;
  let nestedName: string | undefined;
  let nestedEmail: string | undefined;
  if (customer && typeof customer === "object") {
    const c = customer as Record<string, unknown>;
    nestedFullName = recordStr(c, "fullName", "FullName");
    nestedName =
      recordStr(c, "name", "Name") ??
      recordStr(c, "userName", "UserName") ??
      recordStr(c, "username", "Username");
    nestedEmail = recordStr(c, "email", "Email");
  }
  const customerEmail =
    recordStr(o, "customerEmail", "CustomerEmail") ?? nestedEmail;
  const customerFullName =
    recordStr(o, "customerFullName", "CustomerFullName") ?? nestedFullName;
  const customerName =
    recordStr(o, "customerName", "CustomerName") ??
    recordStr(o, "customerUserName", "CustomerUserName") ??
    nestedName ??
    customerFullName;

  return {
    customerName,
    customerFullName: customerFullName ?? customerName,
    customerEmail,
  };
}

function nestedMessageText(o: Record<string, unknown>): string | undefined {
  const last = o.lastMessage ?? o.LastMessage;
  if (typeof last === "string") return last;
  if (last && typeof last === "object") {
    const m = last as Record<string, unknown>;
    return (
      recordStr(m, "messageText", "MessageText") ??
      recordStr(m, "content", "Content") ??
      recordStr(m, "message", "Message") ??
      recordStr(m, "body", "Body") ??
      recordStr(m, "text", "Text")
    );
  }
  return (
    recordStr(o, "lastMessagePreview", "LastMessagePreview") ??
    recordStr(o, "lastMessageText", "LastMessageText") ??
    recordStr(o, "lastMessageContent", "LastMessageContent")
  );
}

function normalizeConversation(raw: unknown): Conversation {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const last = o.lastMessage ?? o.LastMessage;
  let lastMessageAt =
    recordStr(o, "lastMessageAt", "LastMessageAt") ??
    recordStr(o, "updatedAt", "UpdatedAt");
  if (last && typeof last === "object") {
    const m = last as Record<string, unknown>;
    lastMessageAt =
      recordStr(m, "createdAt", "CreatedAt") ?? lastMessageAt;
  }

  const vendorBusinessName =
    recordStr(o, "vendorBusinessName", "VendorBusinessName") ??
    recordStr(o, "businessName", "BusinessName");
  const vendorName =
    recordStr(o, "vendorName", "VendorName") ?? vendorBusinessName;
  const customerParty = extractCustomerPartyFields(o);

  return {
    id: recordId(o),
    vendorId: recordId(o, "vendorId", "VendorId"),
    vendorName,
    vendorBusinessName: vendorBusinessName ?? vendorName,
    businessName: recordStr(o, "businessName", "BusinessName") ?? vendorBusinessName,
    customerId: recordId(o, "customerId", "CustomerId"),
    customerName: customerParty.customerName,
    customerFullName: customerParty.customerFullName,
    customerEmail: customerParty.customerEmail,
    vendorServiceId:
      recordId(o, "vendorServiceId", "VendorServiceId") ??
      recordId(o, "serviceId", "ServiceId"),
    serviceTitle:
      recordStr(o, "serviceTitle", "ServiceTitle") ??
      recordStr(o, "title", "Title"),
    otherPartyName: recordStr(o, "otherPartyName", "OtherPartyName"),
    lastMessage:
      recordStr(o, "lastMessagePreview", "LastMessagePreview") ??
      nestedMessageText(o),
    lastMessageAt,
    unreadCount:
      recordNum(o, "unreadCount", "UnreadCount") ??
      recordNum(o, "unreadMessagesCount", "UnreadMessagesCount"),
    updatedAt: recordStr(o, "updatedAt", "UpdatedAt"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

function extractMessageSenderFields(
  o: Record<string, unknown>,
): Pick<
  ChatMessage,
  | "senderUserId"
  | "senderId"
  | "userId"
  | "senderName"
  | "senderFullName"
  | "senderEmail"
  | "senderBusinessName"
  | "customerName"
  | "customerFullName"
  | "customerEmail"
  | "vendorName"
  | "vendorBusinessName"
  | "businessName"
> {
  const sender = o.sender ?? o.Sender;
  let nestedId: string | number | undefined;
  let nestedName: string | undefined;
  let nestedFullName: string | undefined;
  let nestedBusinessName: string | undefined;
  let nestedEmail: string | undefined;
  if (sender && typeof sender === "object") {
    const s = sender as Record<string, unknown>;
    nestedId =
      recordId(s) ??
      recordId(s, "userId", "UserId") ??
      recordId(s, "id", "Id");
    nestedFullName = recordStr(s, "fullName", "FullName");
    nestedName =
      recordStr(s, "name", "Name") ??
      recordStr(s, "userName", "UserName") ??
      recordStr(s, "username", "Username") ??
      nestedFullName;
    nestedEmail = recordStr(s, "email", "Email");
    nestedBusinessName =
      recordStr(s, "businessName", "BusinessName") ??
      recordStr(s, "vendorBusinessName", "VendorBusinessName");
  }
  const customerParty = extractCustomerPartyFields(o);
  const senderUserId =
    recordId(o, "senderUserId", "SenderUserId") ?? nestedId;
  const senderId =
    recordId(o, "senderId", "SenderId") ?? senderUserId ?? nestedId;
  const userId = recordId(o, "userId", "UserId") ?? senderUserId ?? senderId;
  const senderFullName =
    recordStr(o, "senderFullName", "SenderFullName") ?? nestedFullName;
  const senderBusinessName =
    recordStr(o, "senderBusinessName", "SenderBusinessName") ??
    recordStr(o, "businessName", "BusinessName") ??
    nestedBusinessName;
  const senderEmail =
    recordStr(o, "senderEmail", "SenderEmail") ?? nestedEmail;
  const senderName =
    recordStr(o, "senderName", "SenderName") ??
    senderFullName ??
    nestedName ??
    senderBusinessName;
  return {
    senderUserId,
    senderId,
    userId,
    senderName,
    senderFullName,
    senderEmail,
    senderBusinessName,
    customerName: customerParty.customerName,
    customerFullName: customerParty.customerFullName,
    customerEmail: customerParty.customerEmail,
    vendorName:
      recordStr(o, "vendorName", "VendorName") ??
      recordStr(o, "vendorBusinessName", "VendorBusinessName"),
    vendorBusinessName:
      recordStr(o, "vendorBusinessName", "VendorBusinessName") ??
      recordStr(o, "businessName", "BusinessName"),
    businessName:
      recordStr(o, "businessName", "BusinessName") ??
      recordStr(o, "vendorBusinessName", "VendorBusinessName"),
  };
}

function normalizeChatMessage(raw: unknown): ChatMessage {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const senderFields = extractMessageSenderFields(o);
  return {
    id: recordId(o),
    conversationId:
      recordId(o, "conversationId", "ConversationId") ??
      recordId(o, "conversationID", "ConversationID"),
    content:
      recordStr(o, "content", "Content") ??
      recordStr(o, "messageText", "MessageText") ??
      recordStr(o, "message", "Message") ??
      recordStr(o, "body", "Body") ??
      recordStr(o, "text", "Text"),
    ...senderFields,
    otherPartyName: recordStr(o, "otherPartyName", "OtherPartyName"),
    senderRole: recordStr(o, "senderRole", "SenderRole"),
    isFromMe: recordBool(o, "isFromMe", "IsFromMe"),
    createdAt:
      recordStr(o, "createdAt", "CreatedAt") ??
      recordStr(o, "sentAt", "SentAt") ??
      recordStr(o, "timestamp", "Timestamp"),
  };
}

/** Unwraps messages from envelope.data, envelope.data.data, or .items. */
function extractMessageListRaw(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const o = payload as Record<string, unknown>;
  const nested = o.data ?? o.Data;
  if (Array.isArray(nested)) return nested;
  if (nested && typeof nested === "object") {
    const inner = nested as Record<string, unknown>;
    if (Array.isArray(inner.items)) return inner.items as unknown[];
    if (Array.isArray(inner.Items)) return inner.Items as unknown[];
    if (Array.isArray(inner.messages)) return inner.messages as unknown[];
    if (Array.isArray(inner.Messages)) return inner.Messages as unknown[];
    if (Array.isArray(inner.data)) return inner.data as unknown[];
    if (Array.isArray(inner.Data)) return inner.Data as unknown[];
  }

  return toList(payload);
}

function extractConversationMessages(envelope: ApiEnvelope): ChatMessage[] {
  assertSuccess(envelope);
  console.log("Messages response", { data: envelope.data });
  const raw = extractMessageListRaw(envelope.data);
  return raw
    .map(normalizeChatMessage)
    .filter((m) => Boolean(m.content?.trim()) || m.id != null);
}

function extractConversation(envelope: ApiEnvelope): Conversation {
  assertSuccess(envelope);
  const payload = envelope.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return normalizeConversation(payload);
  }
  throw new Error("Geçersiz konuşma yanıtı.");
}

export async function fetchConversations(): Promise<Conversation[]> {
  const body = await apiGetRaw<ApiEnvelope>("/conversations");
  assertSuccess(body);
  return toList(body.data).map(normalizeConversation);
}

export async function fetchConversationMessages(
  conversationId: string | number,
): Promise<ChatMessage[]> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/conversations/${conversationId}/messages`,
  );
  return extractConversationMessages(body);
}

export async function createConversation(
  payload: CreateConversationPayload,
): Promise<Conversation> {
  const body: Record<string, unknown> = {
    vendorServiceId: payload.vendorServiceId,
  };
  if (payload.vendorId != null) body.vendorId = payload.vendorId;
  const message = payload.message?.trim();
  if (message) {
    body.message = message;
    body.content = message;
  }
  const res = await apiPostRaw<ApiEnvelope>("/conversations", body);
  return extractConversation(res);
}

export async function sendConversationMessage(
  conversationId: string | number,
  payload: SendChatMessagePayload,
): Promise<ChatMessage> {
  const text = (payload.messageText ?? payload.message ?? "").trim();
  if (!text) {
    throw new Error("Mesaj metni boş.");
  }
  const body = await apiPostRaw<ApiEnvelope>(
    `/conversations/${conversationId}/messages`,
    { messageText: text },
  );
  assertSuccess(body);
  const data = body.data;
  let msg: ChatMessage = {
    conversationId,
    content: text,
    createdAt: new Date().toISOString(),
    isFromMe: true,
  };
  if (data && typeof data === "object") {
    if (Array.isArray(data) && data[0]) {
      msg = { ...normalizeChatMessage(data[0]), isFromMe: true };
    } else if (!Array.isArray(data)) {
      const o = data as Record<string, unknown>;
      const inner = o.data ?? o.Data ?? o.message ?? o.Message;
      if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        msg = {
          ...normalizeChatMessage(inner),
          content:
            normalizeChatMessage(inner).content?.trim() || text,
          isFromMe: true,
        };
      } else {
        msg = {
          ...normalizeChatMessage(data),
          content: normalizeChatMessage(data).content?.trim() || text,
          isFromMe: true,
        };
      }
    }
  }
  if (!msg.content?.trim()) msg.content = text;
  return msg;
}

function normalizeAvailabilityDate(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  const s = raw.trim();
  const slice = s.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(slice)) return slice;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseAvailabilityBool(value: unknown): boolean | undefined {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const lower = value.trim().toLowerCase();
    if (lower === "true" || lower === "1") return true;
    if (lower === "false" || lower === "0") return false;
  }
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  return undefined;
}

function resolveAvailabilityIsAvailable(
  o: Record<string, unknown>,
): boolean | undefined {
  const status =
    recordStr(o, "status", "Status") ??
    recordStr(o, "availabilityStatus", "AvailabilityStatus");
  const statusLower = status?.trim().toLowerCase();
  if (
    statusLower === "unavailable" ||
    statusLower === "full" ||
    statusLower === "dolu" ||
    statusLower === "busy" ||
    statusLower === "closed"
  ) {
    return false;
  }
  if (
    statusLower === "available" ||
    statusLower === "müsait" ||
    statusLower === "musait" ||
    statusLower === "open"
  ) {
    return true;
  }

  const explicit =
    parseAvailabilityBool(o.isAvailable ?? o.IsAvailable) ??
    recordBool(o, "isAvailable", "IsAvailable");
  const unavailable = parseAvailabilityBool(o.isUnavailable ?? o.IsUnavailable);
  if (explicit !== undefined) return explicit;
  if (unavailable === true) return false;
  if (unavailable === false) return true;
  return undefined;
}

function normalizeTimeSlots(raw: unknown): VendorAvailability["timeSlots"] {
  if (!Array.isArray(raw)) return undefined;
  const slots = raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const s = item as Record<string, unknown>;
      const startTime =
        recordStr(s, "startTime", "StartTime") ??
        recordStr(s, "start", "Start");
      const endTime =
        recordStr(s, "endTime", "EndTime") ?? recordStr(s, "end", "End");
      if (!startTime || !endTime) return null;
      const slotAvailable = resolveAvailabilityIsAvailable(s);
      return {
        startTime,
        endTime,
        isAvailable: slotAvailable !== false,
        status: recordStr(s, "status", "Status"),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x != null);
  return slots.length > 0 ? slots : undefined;
}

function normalizeVendorAvailability(raw: unknown): VendorAvailability {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const dateRaw =
    recordStr(o, "date", "Date") ??
    recordStr(o, "availabilityDate", "AvailabilityDate") ??
    recordStr(o, "eventDate", "EventDate");
  const isAvailable = resolveAvailabilityIsAvailable(o);
  const status = recordStr(o, "status", "Status");

  return {
    id: recordId(o),
    date: normalizeAvailabilityDate(dateRaw),
    isAvailable,
    status:
      status ??
      (isAvailable === false
        ? "unavailable"
        : isAvailable === true
          ? "available"
          : undefined),
    notes: recordStr(o, "notes", "Notes") ?? recordStr(o, "note", "Note"),
    vendorServiceId:
      recordId(o, "vendorServiceId", "VendorServiceId") ??
      recordId(o, "serviceId", "ServiceId"),
    timeSlots:
      normalizeTimeSlots(o.timeSlots ?? o.TimeSlots ?? o.slots ?? o.Slots),
  };
}

function parseAvailabilityList(data: unknown): VendorAvailability[] {
  return flattenAvailabilityPayload(data)
    .map(normalizeVendorAvailability)
    .filter((a) => a.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

export async function fetchVendorAvailability(): Promise<VendorAvailability[]> {
  const body = await vendorGetWithRetry("/vendor/availability", {
    sectionKey: "availability",
    devLogLabel: "Vendor availability response",
    allowNotFound: true,
  });
  return parseAvailabilityList(body.data);
}

export async function createVendorAvailability(
  payload: CreateVendorAvailabilityPayload,
): Promise<VendorAvailability> {
  const requestBody: Record<string, unknown> = {
    date: payload.date,
    isAvailable: payload.isAvailable,
    status:
      payload.status ??
      (payload.isAvailable ? "available" : "unavailable"),
    notes: payload.notes?.trim() ?? "",
    ...(payload.vendorServiceId != null
      ? { vendorServiceId: payload.vendorServiceId }
      : {}),
  };
  if (payload.timeSlots && payload.timeSlots.length > 0) {
    requestBody.timeSlots = payload.timeSlots.map((slot) => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: slot.isAvailable,
      status:
        slot.status ?? (slot.isAvailable ? "available" : "unavailable"),
    }));
  }
  const body = await apiPostRaw<ApiEnvelope>("/vendor/availability", requestBody);
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeVendorAvailability(data);
  }
  return normalizeVendorAvailability(payload);
}

export async function deleteVendorAvailability(
  id: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/vendor/availability/${id}`);
  assertSuccess(body);
}

export async function fetchServiceAvailability(
  serviceId: string | number,
): Promise<VendorAvailability[]> {
  const body = await apiGetPublicRaw<ApiEnvelope>(
    `/services/${serviceId}/availability`,
  );
  assertSuccess(body);
  return parseAvailabilityList(body.data);
}

function normalizeServiceReview(raw: unknown): ServiceReview {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const rating =
    recordNum(o, "rating", "Rating") ??
    recordNum(o, "stars", "Stars") ??
    recordNum(o, "score", "Score");
  return {
    id: recordId(o),
    rating: rating != null ? Math.min(5, Math.max(1, Math.round(rating))) : undefined,
    comment:
      recordStr(o, "comment", "Comment") ??
      recordStr(o, "content", "Content") ??
      recordStr(o, "text", "Text"),
    customerName:
      recordStr(o, "customerName", "CustomerName") ??
      recordStr(o, "authorName", "AuthorName") ??
      recordStr(o, "userName", "UserName"),
    authorName: recordStr(o, "authorName", "AuthorName"),
    createdAt:
      recordStr(o, "createdAt", "CreatedAt") ??
      recordStr(o, "reviewedAt", "ReviewedAt"),
  };
}

function extractServiceReviews(body: ApiEnvelope): ServiceReviewsData {
  assertSuccess(body);
  const payload = body.data;
  let reviews: ServiceReview[] = [];
  let averageRating: number | undefined;
  let reviewCount: number | undefined;

  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const o = payload as Record<string, unknown>;
    reviews = toList(o.reviews ?? o.Reviews ?? o.items ?? o.Items).map(
      normalizeServiceReview,
    );
    averageRating =
      recordNum(o, "averageRating", "AverageRating") ??
      recordNum(o, "avgRating", "AvgRating") ??
      recordNum(o, "rating", "Rating");
    reviewCount =
      recordNum(o, "reviewCount", "ReviewCount") ??
      recordNum(o, "totalReviews", "TotalReviews") ??
      recordNum(o, "count", "Count");
  } else {
    reviews = toList(payload).map(normalizeServiceReview);
  }

  reviews = reviews
    .filter((r) => r.rating != null || r.comment?.trim())
    .sort((a, b) => {
      const ta = new Date(a.createdAt ?? 0).getTime();
      const tb = new Date(b.createdAt ?? 0).getTime();
      return tb - ta;
    });

  if (averageRating == null && reviews.length > 0) {
    const sum = reviews.reduce((s, r) => s + (r.rating ?? 0), 0);
    const rated = reviews.filter((r) => r.rating != null).length;
    if (rated > 0) averageRating = sum / rated;
  }
  if (reviewCount == null) reviewCount = reviews.length;

  return { reviews, averageRating, reviewCount };
}

export async function fetchServiceReviews(
  serviceId: string | number,
): Promise<ServiceReviewsData> {
  const body = await apiGetPublicRaw<ApiEnvelope>(
    `/services/${serviceId}/reviews`,
  );
  return extractServiceReviews(body);
}

export async function submitServiceReview(
  serviceId: string | number,
  payload: CreateServiceReviewPayload,
): Promise<ServiceReview> {
  const rating = Math.min(5, Math.max(1, Math.round(payload.rating)));
  const body = await apiPostRaw<ApiEnvelope>(`/services/${serviceId}/reviews`, {
    rating,
    stars: rating,
    comment: payload.comment.trim(),
    content: payload.comment.trim(),
  });
  assertSuccess(body);
  const data = body.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return normalizeServiceReview(data);
  }
  return { rating, comment: payload.comment.trim() };
}
