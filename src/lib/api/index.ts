import {
  apiGet,
  apiGetOptional,
  apiGetPublic,
  apiGetPublicRaw,
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
  apiPost,
  apiPostPublic,
  apiPostPublicRaw,
  buildQuery,
} from "@/src/lib/api/client";
import {
  normalizeEventRequest,
  type AdminSummary,
  type AiRecommendationItem,
  type AiRecommendationsApiResponse,
  type AiRecommendationRequest,
  type CreateEventRequestPayload,
  type EventRequest,
  type EventRequestApiResponse,
  type EventRequestsListApiResponse,
  type UpdateEventRequestPayload,
  type MarketplaceFilters,
  type MarketplaceItem,
  type ServicesListApiResponse,
  type VendorProfile,
  type VendorService,
} from "@/src/lib/api/types";

function toList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "vendors",
      "services",
      "data",
      "eventRequests",
      "recommendations",
    ]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

export type MarketplaceHttpResponse = {
  data: ServicesListApiResponse;
};

export function normalizeMarketplaceItem(item: unknown): MarketplaceItem {
  if (!item || typeof item !== "object") return {};
  const o = item as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" || typeof v === "number" ? String(v) : undefined;
  };
  const num = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "number" ? v : undefined;
  };
  const vendor = o.vendor;
  const vendorName =
    str("vendorName", "VendorName") ??
    (vendor &&
    typeof vendor === "object" &&
    "name" in vendor &&
    typeof (vendor as { name: unknown }).name === "string"
      ? (vendor as { name: string }).name
      : undefined);

  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    vendorId: (o.vendorId ?? o.VendorId) as string | number | undefined,
    vendorName,
    serviceTitle:
      str("serviceTitle", "ServiceTitle") ??
      str("title", "Title") ??
      str("name", "Name"),
    title: str("title", "Title") ?? str("name", "Name"),
    description:
      typeof o.description === "string"
        ? o.description
        : typeof o.Description === "string"
          ? o.Description
          : undefined,
    city: str("city", "City"),
    district: str("district", "District"),
    category:
      str("category", "Category") ??
      str("categoryName", "CategoryName") ??
      str("categoryId", "CategoryId"),
    price: num("price", "Price") ?? num("minPrice", "MinPrice"),
    minPrice: num("minPrice", "MinPrice"),
    maxPrice: num("maxPrice", "MaxPrice"),
    rating: num("rating", "Rating") ?? num("averageRating", "AverageRating"),
    averageRating: num("averageRating", "AverageRating"),
    guestCapacity: num("guestCapacity", "GuestCapacity"),
    imageUrl: str("imageUrl", "ImageUrl"),
  };
}

/** Reads services from `response.data.data` or `response.data.data.items`. */
export function extractMarketplaceItems(
  response: MarketplaceHttpResponse,
): MarketplaceItem[] {
  const payload = response.data.data;
  if (Array.isArray(payload)) {
    return payload.map(normalizeMarketplaceItem);
  }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items.map(normalizeMarketplaceItem);
    }
    return toList<unknown>(payload).map(normalizeMarketplaceItem);
  }
  return [];
}

export async function fetchMarketplace(
  filters: MarketplaceFilters,
): Promise<{
  response: MarketplaceHttpResponse;
  items: MarketplaceItem[];
}> {
  const query = buildQuery({
    city: filters.city,
    district: filters.district,
    categoryId: filters.categoryId,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    minRating: filters.minRating,
    guestCount: filters.guestCount,
    keyword: filters.keyword,
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy,
  });
  const body = await apiGetPublicRaw<ServicesListApiResponse>(
    `/services${query}`,
  );
  const response: MarketplaceHttpResponse = { data: body };
  return {
    response,
    items: extractMarketplaceItems(response),
  };
}

/** Axios-shaped wrapper so consumers can use `response.data.data.recommendations`. */
export type AiRecommendationsHttpResponse = {
  data: AiRecommendationsApiResponse;
};

export function extractAiRecommendations(
  response: AiRecommendationsHttpResponse,
): AiRecommendationItem[] {
  const list = response.data.data?.recommendations;
  return Array.isArray(list) ? list : [];
}

export async function fetchAiRecommendations(
  payload: AiRecommendationRequest,
): Promise<{
  response: AiRecommendationsHttpResponse;
  recommendations: AiRecommendationItem[];
}> {
  const body = await apiPostPublicRaw<AiRecommendationsApiResponse>(
    "/ai/recommendations",
    payload,
  );
  const response: AiRecommendationsHttpResponse = { data: body };
  return {
    response,
    recommendations: extractAiRecommendations(response),
  };
}

export type EventRequestsListHttpResponse = {
  data: EventRequestsListApiResponse;
};

/** Reads list from `response.data.data` (standard API wrapper). */
export function extractMyEventRequests(
  response: EventRequestsListHttpResponse,
): EventRequest[] {
  const envelope = response.data;
  assertEnvelopeSuccess(envelope);
  const payload = envelope.data;
  const list = Array.isArray(payload)
    ? payload
    : toList<unknown>(payload);
  return list.map(normalizeEventRequest);
}

export async function fetchCustomerEventRequests(): Promise<EventRequest[]> {
  const body = await apiGetRaw<EventRequestsListApiResponse>(
    "/event-requests/my",
  );
  const response: EventRequestsListHttpResponse = { data: body };
  return extractMyEventRequests(response);
}

function buildEventRequestBody(payload: UpdateEventRequestPayload) {
  return {
    title: payload.title?.trim() ?? "",
    eventType: payload.eventType,
    eventDate: payload.eventDate || null,
    city: payload.city,
    district: payload.district,
    guestCount: payload.guestCount,
    budgetMin: payload.budgetMin,
    budgetMax: payload.budgetMax,
    notes: payload.notes ?? "",
    description: payload.notes ?? "",
    ...(payload.status ? { status: payload.status } : {}),
  };
}

export type EventRequestHttpResponse = {
  data: EventRequestApiResponse;
};

function assertEnvelopeSuccess(envelope: EventRequestApiResponse): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

export function extractEventRequest(
  response: EventRequestHttpResponse,
): EventRequest {
  const envelope = response.data;
  assertEnvelopeSuccess(envelope);
  const payload = envelope.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return normalizeEventRequest(payload);
  }
  throw new Error("Geçersiz etkinlik talebi yanıtı.");
}

export async function fetchEventRequestById(
  id: string | number,
): Promise<EventRequest> {
  const body = await apiGetRaw<EventRequestApiResponse>(
    `/event-requests/${id}`,
  );
  return extractEventRequest({ data: body });
}

export async function createCustomerEventRequest(
  payload: CreateEventRequestPayload,
): Promise<EventRequest> {
  const body = await apiPostRaw<EventRequestApiResponse>(
    "/event-requests",
    buildEventRequestBody(payload),
  );
  return extractEventRequest({ data: body });
}

export async function updateCustomerEventRequest(
  id: string | number,
  payload: UpdateEventRequestPayload,
): Promise<EventRequest> {
  const body = await apiPutRaw<EventRequestApiResponse>(
    `/event-requests/${id}`,
    buildEventRequestBody(payload),
  );
  return extractEventRequest({ data: body });
}

export async function deleteCustomerEventRequest(
  id: string | number,
): Promise<void> {
  await apiDeleteRaw<EventRequestApiResponse>(`/event-requests/${id}`);
}

export async function fetchVendorProfile(): Promise<VendorProfile | null> {
  return apiGetOptional<VendorProfile>("/vendor/profile");
}

export async function fetchVendorServices(): Promise<VendorService[] | null> {
  const data = await apiGetOptional<unknown>("/vendor/services");
  if (data === null) return null;
  return toList<VendorService>(data);
}

export async function fetchAdminSummary(): Promise<AdminSummary | null> {
  return apiGetOptional<AdminSummary>("/admin/summary");
}

export * from "@/src/lib/api/client";
export * from "@/src/lib/api/types";
