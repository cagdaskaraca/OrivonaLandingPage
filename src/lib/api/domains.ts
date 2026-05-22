import {
  apiDeleteRaw,
  apiGetPublicRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
  withOptionalNotFound,
} from "@/src/lib/api/client";
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
  AiEventPlanRequest,
  AiEventPlanResult,
  ApiEnvelope,
  AcceptCustomerOfferPayload,
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

export async function fetchVendorDashboardSummary(): Promise<DashboardSummary> {
  const body = await apiGetRaw<ApiEnvelope>("/vendor/dashboard/summary");
  assertSuccess(body);
  return normalizeSummary(body.data);
}

export async function fetchCustomerDashboardSummary(): Promise<DashboardSummary> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/customer/dashboard/summary");
      assertSuccess(body);
      return normalizeSummary(body.data);
    },
    {},
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

  const vendorOfferPrice =
    recordNum(o, "vendorOfferPrice", "VendorOfferPrice") ??
    (nested ? recordNum(nested, "price", "Price") : undefined) ??
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

  return {
    id: requestId,
    offerId: vendorOfferId,
    vendorServiceId: recordId(o, "vendorServiceId", "VendorServiceId"),
    serviceTitle: recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    customerName: recordStr(o, "customerName", "CustomerName"),
    message: recordStr(o, "message", "Message"),
    guestCount: recordNum(o, "guestCount", "GuestCount"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    status: recordStr(o, "status", "Status"),
    vendorOfferPrice,
    vendorOfferDescription,
    offeredPrice: vendorOfferPrice,
    price: vendorOfferPrice,
    responseDescription: vendorOfferDescription,
    description: vendorOfferDescription,
    validUntil,
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

export async function createOfferRequest(
  payload: CreateOfferRequestPayload,
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>("/offer-requests", {
    vendorServiceId: payload.vendorServiceId,
    message: payload.message,
    eventDate: payload.eventDate || null,
    guestCount: payload.guestCount,
  });
  assertSuccess(body);
  return normalizeOffer(body.data ?? payload);
}

export async function fetchMyOfferRequests(): Promise<OfferRequest[]> {
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<ApiEnvelope>("/offer-requests/my");
      assertSuccess(body);
      return toList(body.data).map(normalizeOffer);
    },
    [],
    "Customer offer requests endpoint not available yet",
  );
}

export async function fetchVendorOfferRequests(): Promise<OfferRequest[]> {
  const body = await apiGetRaw<ApiEnvelope>("/vendor/offer-requests");
  assertSuccess(body);
  return toList(body.data).map(normalizeOffer);
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
  const body = await apiGetRaw<ApiEnvelope>("/vendor/reservations");
  assertSuccess(body);
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

function normalizeAiPlan(raw: unknown): AiEventPlanResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const recs = o.recommendations ?? o.Recommendations;
  const budget = o.budgetBreakdown ?? o.BudgetBreakdown;
  const timeline = o.timeline ?? o.Timeline ?? o.planningTimeline;
  const concepts = o.conceptIdeas ?? o.ConceptIdeas ?? o.concepts;

  return {
    summary: recordStr(o, "summary", "Summary"),
    recommendations: Array.isArray(recs)
      ? (recs as unknown[]).map((r) => {
          if (!r || typeof r !== "object") return {};
          const item = r as Record<string, unknown>;
          const serviceId =
            recordId(item, "serviceId", "ServiceId") ??
            recordId(item, "vendorServiceId", "VendorServiceId");
          const reasonsRaw = item.reasons ?? item.Reasons;
          return {
            vendorName: recordStr(item, "vendorName", "VendorName"),
            serviceTitle: recordStr(item, "serviceTitle", "ServiceTitle"),
            score: recordNum(item, "score", "Score"),
            estimatedPrice: recordNum(item, "estimatedPrice", "EstimatedPrice"),
            serviceId,
            vendorServiceId: serviceId,
            vendorId: recordId(item, "vendorId", "VendorId"),
            reasons: Array.isArray(reasonsRaw)
              ? reasonsRaw.map(String)
              : typeof reasonsRaw === "string"
                ? reasonsRaw
                : undefined,
          };
        })
      : undefined,
    budgetBreakdown: Array.isArray(budget)
      ? budget.map((b) => {
          const line = b as Record<string, unknown>;
          const categoryName =
            recordStr(line, "categoryName", "CategoryName") ??
            recordStr(line, "name", "Name");
          const category = recordStr(line, "category", "Category");
          return {
            categoryName,
            category: category ?? categoryName,
            amount: recordNum(line, "amount", "Amount"),
            percentage: recordNum(line, "percentage", "Percentage"),
          };
        })
      : undefined,
    timeline: Array.isArray(timeline)
      ? timeline.map((t) => {
          const step = t as Record<string, unknown>;
          return {
            title: recordStr(step, "title", "Title"),
            description: recordStr(step, "description", "Description"),
            timing: recordStr(step, "timing", "Timing"),
          };
        })
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
    title:
      recordStr(o, "title", "Title") ??
      recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    categoryName: recordStr(o, "categoryName", "CategoryName"),
    city: recordStr(o, "city", "City"),
    isFeatured: recordBool(o, "isFeatured", "IsFeatured"),
    isActive: recordBool(o, "isActive", "IsActive"),
    basePrice: recordNum(o, "basePrice", "BasePrice"),
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

function nestedMessageText(o: Record<string, unknown>): string | undefined {
  const last = o.lastMessage ?? o.LastMessage;
  if (typeof last === "string") return last;
  if (last && typeof last === "object") {
    const m = last as Record<string, unknown>;
    return (
      recordStr(m, "content", "Content") ??
      recordStr(m, "message", "Message") ??
      recordStr(m, "body", "Body")
    );
  }
  return (
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

  return {
    id: recordId(o),
    vendorId: recordId(o, "vendorId", "VendorId"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    customerId: recordId(o, "customerId", "CustomerId"),
    customerName:
      recordStr(o, "customerName", "CustomerName") ??
      recordStr(o, "customerFullName", "CustomerFullName"),
    vendorServiceId:
      recordId(o, "vendorServiceId", "VendorServiceId") ??
      recordId(o, "serviceId", "ServiceId"),
    serviceTitle:
      recordStr(o, "serviceTitle", "ServiceTitle") ??
      recordStr(o, "title", "Title"),
    lastMessage: nestedMessageText(o),
    lastMessageAt,
    unreadCount:
      recordNum(o, "unreadCount", "UnreadCount") ??
      recordNum(o, "unreadMessagesCount", "UnreadMessagesCount"),
    updatedAt: recordStr(o, "updatedAt", "UpdatedAt"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
}

function normalizeChatMessage(raw: unknown): ChatMessage {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
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
    senderId: recordId(o, "senderId", "SenderId"),
    senderName: recordStr(o, "senderName", "SenderName"),
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
  const slice = raw.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(slice) ? slice : undefined;
}

function normalizeVendorAvailability(raw: unknown): VendorAvailability {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const dateRaw =
    recordStr(o, "date", "Date") ??
    recordStr(o, "availabilityDate", "AvailabilityDate") ??
    recordStr(o, "eventDate", "EventDate");
  const availableExplicit = recordBool(o, "isAvailable", "IsAvailable");
  const unavailable = recordBool(o, "isUnavailable", "IsUnavailable");
  let isAvailable = availableExplicit;
  if (isAvailable === undefined && unavailable === true) isAvailable = false;
  if (isAvailable === undefined && unavailable === false) isAvailable = true;

  return {
    id: recordId(o),
    date: normalizeAvailabilityDate(dateRaw),
    isAvailable,
    notes: recordStr(o, "notes", "Notes") ?? recordStr(o, "note", "Note"),
    vendorServiceId:
      recordId(o, "vendorServiceId", "VendorServiceId") ??
      recordId(o, "serviceId", "ServiceId"),
  };
}

export async function fetchVendorAvailability(): Promise<VendorAvailability[]> {
  const body = await apiGetRaw<ApiEnvelope>("/vendor/availability");
  assertSuccess(body);
  return toList(body.data)
    .map(normalizeVendorAvailability)
    .filter((a) => a.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
}

export async function createVendorAvailability(
  payload: CreateVendorAvailabilityPayload,
): Promise<VendorAvailability> {
  const body = await apiPostRaw<ApiEnvelope>("/vendor/availability", {
    date: payload.date,
    isAvailable: payload.isAvailable,
    notes: payload.notes?.trim() ?? "",
    ...(payload.vendorServiceId != null
      ? { vendorServiceId: payload.vendorServiceId }
      : {}),
  });
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
  return toList(body.data)
    .map(normalizeVendorAvailability)
    .filter((a) => a.date)
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
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
