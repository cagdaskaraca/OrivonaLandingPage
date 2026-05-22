import {
  ApiError,
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
import { formatCityForApi } from "@/src/lib/turkish";
import {
  normalizeEventRequest,
  type AdminSummary,
  type AiRecommendationItem,
  type AiRecommendationsApiResponse,
  type AiRecommendationRequest,
  type ApiEnvelope,
  type Category,
  type CreateEventRequestPayload,
  type EventRequest,
  type EventRequestApiResponse,
  type EventRequestsListApiResponse,
  type UpdateEventRequestPayload,
  type MarketplaceFilters,
  type MarketplaceItem,
  type ServicesListApiResponse,
  type AccountProfile,
  type VendorProfile,
  type VendorService,
  type VendorServicePayload,
  VENDOR_CATEGORY_NAMES,
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
    price:
      num("price", "Price") ??
      num("basePrice", "BasePrice") ??
      num("minPrice", "MinPrice"),
    basePrice: num("basePrice", "BasePrice"),
    minPrice: num("minPrice", "MinPrice"),
    maxPrice: num("maxPrice", "MaxPrice"),
    rating: num("rating", "Rating") ?? num("averageRating", "AverageRating"),
    averageRating: num("averageRating", "AverageRating"),
    guestCapacity:
      num("guestCapacity", "GuestCapacity") ??
      num("capacityMax", "CapacityMax"),
    capacityMin: num("capacityMin", "CapacityMin"),
    capacityMax: num("capacityMax", "CapacityMax"),
    imageUrl: str("imageUrl", "ImageUrl"),
    coverImageUrl:
      str("coverImageUrl", "CoverImageUrl") ?? str("imageUrl", "ImageUrl"),
    reviewCount: num("reviewCount", "ReviewCount"),
    isFeatured: o.isFeatured === true || o.IsFeatured === true,
    isFavorite: o.isFavorite === true || o.IsFavorite === true,
    vendorServiceId:
      (o.vendorServiceId ?? o.VendorServiceId ?? o.id ?? o.Id) as
        | string
        | number
        | undefined,
    badges: Array.isArray(o.badges)
      ? (o.badges as unknown[]).map(String)
      : Array.isArray(o.Badges)
        ? (o.Badges as unknown[]).map(String)
        : undefined,
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

/** Query params for GET /services — omits empty optional filters. */
export function buildMarketplaceQueryParams(
  filters: MarketplaceFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const city = filters.city?.trim();
  if (city) params.city = formatCityForApi(city);
  const district = filters.district?.trim();
  if (district) params.district = district;
  const categoryId = filters.categoryId?.trim();
  if (categoryId) params.categoryId = categoryId;
  const minPrice = filters.minPrice?.trim();
  if (minPrice) params.minPrice = minPrice;
  const maxPrice = filters.maxPrice?.trim();
  if (maxPrice) params.maxPrice = maxPrice;
  const minRating = filters.minRating?.trim();
  if (minRating) params.minRating = minRating;
  const guestCount = filters.guestCount?.trim();
  if (guestCount) params.guestCount = guestCount;
  const keyword = filters.keyword?.trim();
  if (keyword) params.keyword = keyword;
  if (filters.page?.trim()) params.page = filters.page.trim();
  if (filters.pageSize?.trim()) params.pageSize = filters.pageSize.trim();
  if (filters.sortBy?.trim()) params.sortBy = filters.sortBy.trim();
  return params;
}

export async function fetchMarketplace(
  filters: MarketplaceFilters,
): Promise<{
  response: MarketplaceHttpResponse;
  items: MarketplaceItem[];
  queryParams: Record<string, string | number>;
}> {
  const queryParams = buildMarketplaceQueryParams(filters);
  const query = buildQuery(queryParams);
  const body = await apiGetPublicRaw<ServicesListApiResponse>(
    `/services${query}`,
  );
  const response: MarketplaceHttpResponse = { data: body };
  return {
    response,
    items: extractMarketplaceItems(response),
    queryParams,
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

function assertApiEnvelopeSuccess(envelope: ApiEnvelope): void {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "İstek başarısız.",
    );
  }
}

function extractEnvelopeList(envelope: ApiEnvelope): unknown[] {
  assertApiEnvelopeSuccess(envelope);
  return toList(envelope.data);
}

export function normalizeVendorProfile(raw: unknown): VendorProfile {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "number" ? v : undefined;
  };
  const bool = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    if (typeof v === "boolean") return v;
    return undefined;
  };
  const categoriesRaw = o.categories ?? o.Categories;
  const categories = Array.isArray(categoriesRaw)
    ? categoriesRaw.map(String)
    : undefined;

  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    businessName: str("businessName", "BusinessName"),
    description: str("description", "Description"),
    city: str("city", "City"),
    district: str("district", "District"),
    categories,
    rating: num("rating", "Rating"),
    isApproved:
      bool("isApproved", "IsApproved") ?? bool("approved", "Approved"),
    isActive: bool("isActive", "IsActive"),
  };
}

export function normalizeVendorService(raw: unknown): VendorService {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "number" ? v : undefined;
  };
  const bool = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    if (typeof v === "boolean") return v;
    return undefined;
  };

  const categoryName =
    str("categoryName", "CategoryName") ?? str("category", "Category");
  const basePrice = num("basePrice", "BasePrice") ?? num("price", "Price");

  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    vendorId: (o.vendorId ?? o.VendorId) as string | number | undefined,
    title: str("title", "Title"),
    description: str("description", "Description"),
    category: categoryName,
    categoryName,
    categoryId: (o.categoryId ?? o.CategoryId) as string | number | undefined,
    basePrice,
    price: basePrice,
    city: str("city", "City"),
    district: str("district", "District"),
    capacityMin: num("capacityMin", "CapacityMin"),
    capacityMax: num("capacityMax", "CapacityMax"),
    guestCapacity: num("guestCapacity", "GuestCapacity"),
    isActive: bool("isActive", "IsActive") ?? true,
  };
}

export function normalizeCategory(raw: unknown): Category {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" ? v : undefined;
  };
  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    name: str("name", "Name") ?? str("title", "Title"),
    slug: str("slug", "Slug"),
  };
}

export function extractVendorServices(envelope: ApiEnvelope): VendorService[] {
  return extractEnvelopeList(envelope).map(normalizeVendorService);
}

export function extractVendorService(envelope: ApiEnvelope): VendorService {
  assertApiEnvelopeSuccess(envelope);
  const payload = envelope.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return normalizeVendorService(payload);
  }
  throw new Error("Geçersiz hizmet yanıtı.");
}

export async function fetchVendorProfile(): Promise<VendorProfile | null> {
  try {
    const body = await apiGetRaw<ApiEnvelope>("/vendor/profile");
    assertApiEnvelopeSuccess(body);
    if (!body.data) return {};
    return normalizeVendorProfile(body.data);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      return null;
    }
    throw e;
  }
}

export async function fetchVendorServices(): Promise<VendorService[]> {
  const body = await apiGetRaw<ApiEnvelope>("/vendor/services");
  return extractVendorServices(body);
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const body = await apiGetPublicRaw<ApiEnvelope>("/categories");
    const list = extractEnvelopeList(body);
    const categories = list.map(normalizeCategory).filter((c) => c.name);
    if (categories.length > 0) return categories;
  } catch (e) {
    console.log("Categories fetch failed", e);
  }
  return VENDOR_CATEGORY_NAMES.map((name, index) => ({
    id: index + 1,
    name,
  }));
}

function isGuidLike(value: string | number | undefined): boolean {
  if (value == null || value === "") return false;
  const s = String(value);
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

function buildVendorServiceBody(payload: VendorServicePayload) {
  if (!isGuidLike(payload.categoryId)) {
    throw new Error("Geçerli bir kategori seçin.");
  }
  return {
    categoryId: payload.categoryId,
    title: payload.title,
    description: payload.description,
    basePrice: payload.basePrice,
    city: payload.city,
    district: payload.district,
    capacityMin: payload.capacityMin,
    capacityMax: payload.capacityMax,
    isActive: payload.isActive,
  };
}

export function normalizeAccountProfile(raw: unknown): AccountProfile {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "number" ? v : undefined;
  };
  const bool = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    if (typeof v === "boolean") return v;
    return undefined;
  };
  const pet = o.preferredEventTypes ?? o.PreferredEventTypes;
  let preferredEventTypes: string[] | string | undefined;
  if (Array.isArray(pet)) {
    preferredEventTypes = pet.map(String);
  } else if (typeof pet === "string") {
    preferredEventTypes = pet;
  }

  return {
    fullName: str("fullName", "FullName"),
    email: str("email", "Email"),
    phoneNumber: str("phoneNumber", "PhoneNumber") ?? str("phone", "Phone"),
    role: str("role", "Role"),
    businessName: str("businessName", "BusinessName"),
    description: str("description", "Description"),
    city: str("city", "City"),
    district: str("district", "District"),
    phone: str("phone", "Phone") ?? str("phoneNumber", "PhoneNumber"),
    websiteUrl: str("websiteUrl", "WebsiteUrl"),
    instagramUrl: str("instagramUrl", "InstagramUrl"),
    isApproved: bool("isApproved", "IsApproved"),
    preferredEventTypes,
    budgetMin: num("budgetMin", "BudgetMin"),
    budgetMax: num("budgetMax", "BudgetMax"),
  };
}

export async function fetchAccountProfile(): Promise<AccountProfile> {
  const body = await apiGetRaw<ApiEnvelope>("/account/profile");
  assertApiEnvelopeSuccess(body);
  return normalizeAccountProfile(body.data);
}

export async function updateAccountProfile(
  payload: AccountProfile,
): Promise<AccountProfile> {
  const body = await apiPutRaw<ApiEnvelope>("/account/profile", payload);
  assertApiEnvelopeSuccess(body);
  return normalizeAccountProfile(body.data ?? payload);
}

export async function createVendorService(
  payload: VendorServicePayload,
): Promise<VendorService> {
  const body = await apiPostRaw<ApiEnvelope>(
    "/vendor/services",
    buildVendorServiceBody(payload),
  );
  return extractVendorService(body);
}

export async function updateVendorService(
  id: string | number,
  payload: VendorServicePayload,
): Promise<VendorService> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/vendor/services/${id}`,
    buildVendorServiceBody(payload),
  );
  return extractVendorService(body);
}

export async function deleteVendorService(id: string | number): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(`/vendor/services/${id}`);
  assertApiEnvelopeSuccess(body);
}

export async function fetchAdminSummary(): Promise<AdminSummary | null> {
  return apiGetOptional<AdminSummary>("/admin/summary");
}

export * from "@/src/lib/api/domains";
export * from "@/src/lib/api/client";
export * from "@/src/lib/api/types";
