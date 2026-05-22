import {
  apiDeleteRaw,
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
  AdminService,
  AdminVendor,
  AiEventPlanRequest,
  AiEventPlanResult,
  ApiEnvelope,
  CreateOfferRequestPayload,
  CreateReservationPayload,
  DashboardSummary,
  FavoriteItem,
  OfferRequest,
  Reservation,
  RespondOfferPayload,
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

function normalizeOffer(raw: unknown): OfferRequest {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    vendorServiceId: recordId(o, "vendorServiceId", "VendorServiceId"),
    serviceTitle: recordStr(o, "serviceTitle", "ServiceTitle"),
    vendorName: recordStr(o, "vendorName", "VendorName"),
    customerName: recordStr(o, "customerName", "CustomerName"),
    message: recordStr(o, "message", "Message"),
    guestCount: recordNum(o, "guestCount", "GuestCount"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    status: recordStr(o, "status", "Status"),
    offeredPrice:
      recordNum(o, "offeredPrice", "OfferedPrice") ??
      recordNum(o, "price", "Price"),
    price: recordNum(o, "price", "Price") ?? recordNum(o, "offeredPrice", "OfferedPrice"),
    responseDescription:
      recordStr(o, "responseDescription", "ResponseDescription") ??
      recordStr(o, "description", "Description"),
    description:
      recordStr(o, "description", "Description") ??
      recordStr(o, "responseDescription", "ResponseDescription"),
    validUntil: recordStr(o, "validUntil", "ValidUntil"),
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

export async function respondVendorOffer(
  id: string | number,
  payload: RespondOfferPayload,
): Promise<OfferRequest> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/vendor/offer-requests/${id}/respond`,
    {
      price: payload.price,
      description: payload.description,
      validUntil: payload.validUntil || null,
      accept: payload.accept,
      offeredPrice: payload.price,
      responseDescription: payload.description,
    },
  );
  assertSuccess(body);
  return normalizeOffer(body.data ?? payload);
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
    email: recordStr(o, "email", "Email"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    isApproved: recordBool(o, "isApproved", "IsApproved"),
    status:
      recordStr(o, "status", "Status") ??
      recordStr(o, "approvalStatus", "ApprovalStatus"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
  };
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

export async function rejectAdminVendor(id: string | number): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(`/admin/vendors/${id}/reject`, {});
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
