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
  withOptionalNotFound,
} from "@/src/lib/api/client";
import { extractInvitationFields } from "@/src/lib/api/invitationDesigns";
import { extractPlaylistFields } from "@/src/lib/api/eventPlaylist";
import {
  VendorSectionLoadError,
  vendorGetWithRetry,
} from "@/src/lib/api/vendorDashboardFetch";
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
  type ServiceGalleryImage,
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
  const vendorObj =
    vendor && typeof vendor === "object"
      ? (vendor as Record<string, unknown>)
      : undefined;
  const service = o.service ?? o.Service;
  const serviceObj =
    service && typeof service === "object"
      ? (service as Record<string, unknown>)
      : undefined;
  const vendorName =
    str("vendorName", "VendorName") ??
    str("businessName", "BusinessName") ??
    (vendorObj && typeof vendorObj.businessName === "string"
      ? vendorObj.businessName
      : vendorObj && typeof vendorObj.BusinessName === "string"
        ? vendorObj.BusinessName
        : vendorObj && typeof vendorObj.name === "string"
          ? vendorObj.name
          : undefined);
  const serviceTitleFromNested =
    serviceObj && typeof serviceObj.title === "string"
      ? serviceObj.title
      : serviceObj && typeof serviceObj.Title === "string"
        ? serviceObj.Title
        : serviceObj && typeof serviceObj.name === "string"
          ? serviceObj.name
          : undefined;
  const vendorPremium =
    o.isVendorPremium === true ||
    o.IsVendorPremium === true ||
    o.vendorIsPremium === true ||
    o.VendorIsPremium === true ||
    (vendorObj?.isPremium === true || vendorObj?.IsPremium === true);

  const rawBadges = Array.isArray(o.badges)
    ? (o.badges as unknown[]).map(String)
    : Array.isArray(o.Badges)
      ? (o.Badges as unknown[]).map(String)
      : undefined;

  return {
    id: (o.id ?? o.Id) as string | number | undefined,
    vendorId: (o.vendorId ?? o.VendorId) as string | number | undefined,
    vendorName,
    serviceTitle:
      str("serviceTitle", "ServiceTitle") ??
      str("title", "Title") ??
      str("name", "Name") ??
      serviceTitleFromNested,
    title:
      str("title", "Title") ??
      str("name", "Name") ??
      serviceTitleFromNested,
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
    categoryName:
      str("categoryName", "CategoryName") ?? str("category", "Category"),
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
    isSponsored:
      o.isSponsored === true ||
      o.IsSponsored === true ||
      o.isPromoted === true,
    promotionType: str("promotionType", "PromotionType"),
    isFavorite: o.isFavorite === true || o.IsFavorite === true,
    isVendorPremium:
      vendorPremium ||
      (rawBadges?.some((b) => b.toLowerCase().includes("premium")) ?? false),
    createdAt:
      typeof o.createdAt === "string"
        ? o.createdAt
        : typeof o.CreatedAt === "string"
          ? o.CreatedAt
          : undefined,
    vendorServiceId:
      (o.vendorServiceId ?? o.VendorServiceId ?? o.id ?? o.Id) as
        | string
        | number
        | undefined,
    badges: rawBadges,
    images: extractServiceGalleryImages(o),
  };
}

function extractServiceGalleryImages(
  o: Record<string, unknown>,
): ServiceGalleryImage[] {
  const raw =
    o.images ??
    o.Images ??
    o.gallery ??
    o.Gallery ??
    o.imageUrls ??
    o.ImageUrls;
  if (!Array.isArray(raw)) return [];
  const out: ServiceGalleryImage[] = [];
  for (const entry of raw) {
    if (typeof entry === "string" && entry.trim()) {
      out.push({ url: entry.trim() });
      continue;
    }
    if (entry && typeof entry === "object") {
      const img = entry as Record<string, unknown>;
      const url =
        typeof img.url === "string"
          ? img.url
          : typeof img.Url === "string"
            ? img.Url
            : typeof img.imageUrl === "string"
              ? img.imageUrl
              : typeof img.ImageUrl === "string"
                ? img.ImageUrl
                : undefined;
      if (url?.trim()) {
        out.push({
          url: url.trim(),
          isCover: img.isCover === true || img.IsCover === true,
        });
      }
    }
  }
  return out;
}

export async function fetchServiceById(
  id: string | number,
): Promise<MarketplaceItem> {
  const body = await apiGetPublicRaw<ApiEnvelope>(`/services/${id}`);
  assertApiEnvelopeSuccess(body);
  const payload = body.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const item = normalizeMarketplaceItem(payload);
    const { resolveServiceDisplayBadges } = await import(
      "@/src/lib/serviceBadges"
    );
    const badges = await resolveServiceDisplayBadges(item);
    return { ...item, badges };
  }
  throw new Error("Hizmet detayı bulunamadı.");
}

/** Item has minimum fields required to render a marketplace card. */
export function isRenderableMarketplaceItem(item: MarketplaceItem): boolean {
  const id = item.vendorServiceId ?? item.id;
  if (id == null || id === "") return false;
  const title = (item.serviceTitle ?? item.title ?? "").trim();
  return title.length > 0;
}

/** Unwrap nested API envelopes until a services array is found. */
function unwrapMarketplaceListPayload(raw: unknown): unknown[] {
  let current: unknown = raw;
  const visited = new Set<unknown>();

  for (let depth = 0; depth < 8; depth++) {
    if (current == null) return [];
    if (Array.isArray(current)) return current;
    if (typeof current !== "object") return [];
    if (visited.has(current)) return [];
    visited.add(current);

    const direct = toList<unknown>(current);
    if (direct.length > 0) return direct;

    const o = current as Record<string, unknown>;
    const inner = o.data ?? o.Data;
    if (inner != null && inner !== current) {
      current = inner;
      continue;
    }
    break;
  }
  return [];
}

/** Reads services from `response.data`, `response.data.data`, or paginated `items`. */
export function extractMarketplaceItems(
  response: MarketplaceHttpResponse,
): MarketplaceItem[] {
  const body = response.data;
  if (!body || typeof body !== "object") return [];

  const envelope = body as Record<string, unknown>;
  if (envelope.success === false) return [];

  const roots: unknown[] = [
    envelope.data,
    envelope.Data,
    envelope,
  ];

  for (const root of roots) {
    const list = unwrapMarketplaceListPayload(root);
    if (list.length === 0) continue;
    return list
      .map(normalizeMarketplaceItem)
      .filter(isRenderableMarketplaceItem);
  }

  return [];
}

/** Query params for GET /services — omits empty optional filters. */
export function buildMarketplaceQueryParams(
  filters: MarketplaceFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const city = filters.city?.trim();
  if (city) params.city = city;
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
  return withOptionalNotFound(
    async () => {
      const body = await apiGetRaw<EventRequestsListApiResponse>(
        "/event-requests/my",
      );
      const response: EventRequestsListHttpResponse = { data: body };
      return extractMyEventRequests(response);
    },
    [],
    "Customer event requests endpoint not available yet",
  );
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
    return {
      ...normalizeEventRequest(payload),
      ...extractInvitationFields(payload),
      ...extractPlaylistFields(payload),
    };
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
    description: str("description", "Description"),
  };
}

export function extractVendorServices(envelope: ApiEnvelope): VendorService[] {
  if (envelope.success === false) return [];
  return toList(envelope.data).map(normalizeVendorService);
}

export function extractVendorService(envelope: ApiEnvelope): VendorService {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "Geçersiz hizmet yanıtı.",
    );
  }
  const payload = envelope.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    return normalizeVendorService(payload);
  }
  throw new Error("Geçersiz hizmet yanıtı.");
}

export async function fetchVendorProfile(): Promise<VendorProfile | null> {
  try {
    const body = await vendorGetWithRetry("/vendor/profile", {
      sectionKey: "profile",
      devLogLabel: "Vendor profile response",
      allowNotFound: true,
    });
    if (!body.data) return {};
    return normalizeVendorProfile(body.data);
  } catch (e) {
    if (e instanceof VendorSectionLoadError) throw e;
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      return null;
    }
    throw e;
  }
}

export async function fetchVendorServices(): Promise<VendorService[]> {
  const body = await vendorGetWithRetry("/vendor/services", {
    sectionKey: "services",
    devLogLabel: "Vendor services response",
    allowNotFound: true,
  });
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

function buildVendorServiceBody(payload: VendorServicePayload) {
  const categoryId = payload.categoryId;
  if (categoryId == null || String(categoryId).trim() === "") {
    throw new Error("Geçerli bir kategori seçin.");
  }
  const price = payload.basePrice;
  return {
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
