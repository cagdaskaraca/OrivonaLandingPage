import {
  apiDeleteRaw,
  apiGet,
  apiPost,
  apiPutRaw,
  buildQuery,
  getApiBaseUrl,
  withOptionalNotFound,
} from "@/src/lib/api/client";
import {
  envelopeToList,
  vendorGetWithRetry,
} from "@/src/lib/api/vendorDashboardFetch";
import { getToken } from "@/src/lib/auth";
import type { ServiceMediaItem } from "@/src/lib/api/premiumSaas";

function toRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function toList<T>(body: unknown, keys: string[] = ["items", "results", "data"]): T[] {
  if (Array.isArray(body)) return body as T[];
  const o = toRecord(body);
  for (const key of keys) {
    const v = o[key];
    if (Array.isArray(v)) return v as T[];
  }
  return [];
}

function pickStr(o: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const k of keys) {
    const v = o[k];
    if (v != null && String(v).trim()) return String(v);
  }
  return undefined;
}

function pickId(
  o: Record<string, unknown>,
  ...keys: string[]
): string | number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (v != null && (typeof v === "string" || typeof v === "number")) return v;
  }
  return undefined;
}

function pickNum(o: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (v != null && v !== "") {
      const n = Number(v);
      if (!Number.isNaN(n)) return n;
    }
  }
  return undefined;
}

function pickBool(o: Record<string, unknown>, ...keys: string[]): boolean | undefined {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "boolean") return v;
  }
  return undefined;
}

// —— Media (upload / cover) ——

function normalizeMediaItem(raw: unknown): ServiceMediaItem | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id", "mediaId");
  const url = pickStr(o, "url", "Url", "mediaUrl");
  if (id == null || !url) return null;
  return {
    id,
    url,
    mediaType: pickStr(o, "mediaType", "MediaType", "type") ?? "Image",
    isCover: o.isCover === true || o.IsCover === true,
    sortOrder: pickNum(o, "sortOrder", "SortOrder"),
  };
}

export async function uploadVendorServiceMedia(
  serviceId: string | number,
  file: File,
): Promise<ServiceMediaItem> {
  const form = new FormData();
  form.append("file", file);
  const mediaType = file.type.startsWith("video/") ? "Video" : "Image";
  form.append("mediaType", mediaType);

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(
    `${getApiBaseUrl()}/vendor/services/${serviceId}/media/upload`,
    { method: "POST", body: form, headers },
  );
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      pickStr(toRecord(body), "message", "Message", "title") ??
      `Yükleme başarısız (${res.status})`;
    throw new Error(msg);
  }
  const data = toRecord(body).data ?? body;
  const item = normalizeMediaItem(data);
  if (!item) throw new Error("Medya yanıtı işlenemedi.");
  return item;
}

export async function setVendorServiceMediaCover(
  serviceId: string | number,
  mediaId: string | number,
): Promise<void> {
  await apiPost(`/vendor/services/${serviceId}/media/${mediaId}/cover`, {});
}

// —— Promotions ——

export type PromotionType = "Featured" | "Homepage" | "CategoryBoost" | string;

export type Promotion = {
  id: string | number;
  serviceId?: string | number;
  serviceTitle?: string;
  promotionType?: PromotionType;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  status?: string;
};

function normalizePromotion(raw: unknown): Promotion | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id", "promotionId");
  if (id == null) return null;
  return {
    id,
    serviceId: pickId(o, "serviceId", "ServiceId", "vendorServiceId"),
    serviceTitle: pickStr(o, "serviceTitle", "ServiceTitle", "title"),
    promotionType: pickStr(o, "promotionType", "PromotionType", "type"),
    startDate: pickStr(o, "startDate", "StartDate", "startsAt"),
    endDate: pickStr(o, "endDate", "EndDate", "endsAt"),
    isActive: pickBool(o, "isActive", "IsActive") ?? o.status === "Active",
    status: pickStr(o, "status", "Status"),
  };
}

export async function fetchVendorPromotions(): Promise<Promotion[]> {
  const body = await vendorGetWithRetry("/vendor/promotions", {
    sectionKey: "promotions",
    devLogLabel: "Vendor promotions response",
    allowNotFound: true,
  });
  return envelopeToList(body.data)
    .map(normalizePromotion)
    .filter(Boolean) as Promotion[];
}

export async function fetchAdminPromotions(): Promise<Promotion[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/admin/promotions");
      return toList(raw).map(normalizePromotion).filter(Boolean) as Promotion[];
    },
    [],
  );
}

function buildPromotionRequestBody(payload: {
  promotionType: PromotionType;
  startDate: string;
  endDate: string;
}): Record<string, unknown> {
  const startsAt = toApiDateOrNull(payload.startDate);
  const endsAt = toApiDateOrNull(payload.endDate);
  return {
    type: payload.promotionType,
    startsAt,
    endsAt,
    // Legacy aliases — backend accepts these too
    promotionType: payload.promotionType,
    startDate: startsAt,
    endDate: endsAt,
  };
}

export async function promoteAdminService(
  serviceId: string | number,
  payload: {
    promotionType: PromotionType;
    startDate: string;
    endDate: string;
    categoryId?: string | number;
  },
): Promise<void> {
  await apiPost(
    `/admin/services/${serviceId}/promote`,
    buildPromotionRequestBody(payload),
  );
}

export async function disableAdminPromotion(id: string | number): Promise<void> {
  await apiPost(`/admin/promotions/${id}/disable`, {});
}

// —— Coupons ——

export type CouponDiscountType =
  | "Percentage"
  | "FixedAmount"
  | "Percent"
  | "Fixed"
  | string;

export type CouponFormInput = Omit<Coupon, "id">;

function toApiDateOrNull(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  return null;
}

/** Map UI / legacy values to backend enum strings. */
export function mapCouponDiscountTypeToApi(
  discountType?: string,
): "Percentage" | "FixedAmount" {
  const t = (discountType ?? "").toLowerCase();
  if (
    t === "fixedamount" ||
    t === "fixed" ||
    t.includes("sabit")
  ) {
    return "FixedAmount";
  }
  return "Percentage";
}

/** Map API enum to form select values. */
export function mapCouponDiscountTypeFromApi(
  discountType?: string,
): "Percentage" | "FixedAmount" {
  const t = (discountType ?? "").toLowerCase();
  if (t === "fixedamount" || t === "fixed") return "FixedAmount";
  return "Percentage";
}

function buildCouponRequestEnvelope(
  payload: Partial<CouponFormInput>,
): { request: Record<string, unknown> } {
  const code = payload.code?.trim().toUpperCase() ?? "";
  return {
    request: {
      code,
      discountType: mapCouponDiscountTypeToApi(payload.discountType),
      discountValue: payload.value ?? 0,
      startsAt: toApiDateOrNull(payload.startDate),
      endsAt: toApiDateOrNull(payload.endDate),
      usageLimit: payload.usageLimit ?? null,
    },
  };
}

export type Coupon = {
  id: string | number;
  code: string;
  discountType: CouponDiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  usageLimit?: number;
  usageCount?: number;
  vendorServiceId?: string | number;
  serviceTitle?: string;
  isActive?: boolean;
  description?: string;
};

export type CouponValidation = {
  valid: boolean;
  code?: string;
  discountType?: CouponDiscountType;
  value?: number;
  originalPrice?: number;
  discountAmount?: number;
  finalPrice?: number;
  message?: string;
};

function normalizeCoupon(raw: unknown): Coupon | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id");
  const code = pickStr(o, "code", "Code");
  if (id == null || !code) return null;
  const discountTypeRaw =
    pickStr(o, "discountType", "DiscountType", "type") ?? "Percentage";
  const discountType = mapCouponDiscountTypeFromApi(discountTypeRaw);
  const value = pickNum(o, "value", "Value", "discountValue", "DiscountValue") ?? 0;
  const startsAt = pickStr(o, "startsAt", "StartsAt", "startDate", "StartDate");
  const endsAt = pickStr(o, "endsAt", "EndsAt", "endDate", "EndDate");
  return {
    id,
    code,
    discountType,
    value,
    startDate: startsAt,
    endDate: endsAt,
    usageLimit: pickNum(o, "usageLimit", "UsageLimit"),
    usageCount: pickNum(o, "usageCount", "UsageCount"),
    vendorServiceId: pickId(o, "vendorServiceId", "VendorServiceId", "serviceId"),
    serviceTitle: pickStr(o, "serviceTitle", "ServiceTitle"),
    isActive: pickBool(o, "isActive", "IsActive") ?? true,
    description: pickStr(o, "description", "Description"),
  };
}

function normalizeCouponValidation(raw: unknown): CouponValidation {
  const o = toRecord(raw);
  const data = toRecord(o.data ?? raw);
  const valid =
    data.valid === true ||
    data.isValid === true ||
    data.IsValid === true ||
    o.valid === true;
  return {
    valid,
    code: pickStr(data, "code", "Code") ?? pickStr(o, "code", "Code"),
    discountType: pickStr(data, "discountType", "DiscountType"),
    value: pickNum(data, "value", "Value", "discountValue"),
    originalPrice: pickNum(data, "originalPrice", "OriginalPrice"),
    discountAmount: pickNum(data, "discountAmount", "DiscountAmount"),
    finalPrice:
      pickNum(data, "finalPrice", "FinalPrice") ??
      pickNum(data, "discountedPrice", "DiscountedPrice"),
    message: pickStr(data, "message", "Message") ?? pickStr(o, "message", "Message"),
  };
}

export async function validateCoupon(
  code: string,
  serviceId: string | number,
): Promise<CouponValidation> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(
        `/coupons/validate${buildQuery({ code: code.trim(), serviceId })}`,
      );
      return normalizeCouponValidation(raw);
    },
    { valid: false, message: "Kupon doğrulanamadı." },
  );
}

export async function fetchVendorCoupons(): Promise<Coupon[]> {
  const body = await vendorGetWithRetry("/vendor/coupons", {
    sectionKey: "coupons",
    devLogLabel: "Vendor coupons response",
    allowNotFound: true,
  });
  return envelopeToList(body.data)
    .map(normalizeCoupon)
    .filter(Boolean) as Coupon[];
}

export async function createVendorCoupon(
  payload: CouponFormInput,
): Promise<Coupon> {
  const raw = await apiPost<unknown>(
    "/vendor/coupons",
    buildCouponRequestEnvelope(payload),
  );
  const normalized = normalizeCoupon(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kupon yanıtı işlenemedi.");
  return normalized;
}

export async function updateVendorCoupon(
  id: string | number,
  payload: Partial<CouponFormInput>,
): Promise<Coupon> {
  const raw = await apiPutRaw<unknown>(
    `/vendor/coupons/${id}`,
    buildCouponRequestEnvelope(payload),
  );
  const normalized = normalizeCoupon(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kupon yanıtı işlenemedi.");
  return normalized;
}

export async function deleteVendorCoupon(id: string | number): Promise<void> {
  await apiDeleteRaw(`/vendor/coupons/${id}`);
}

export async function fetchAdminCoupons(): Promise<Coupon[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/admin/coupons");
      return toList(raw).map(normalizeCoupon).filter(Boolean) as Coupon[];
    },
    [],
  );
}

export async function createAdminCoupon(
  payload: CouponFormInput,
): Promise<Coupon> {
  const raw = await apiPost<unknown>(
    "/admin/coupons",
    buildCouponRequestEnvelope(payload),
  );
  const normalized = normalizeCoupon(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kupon yanıtı işlenemedi.");
  return normalized;
}

export async function updateAdminCoupon(
  id: string | number,
  payload: Partial<CouponFormInput>,
): Promise<Coupon> {
  const raw = await apiPutRaw<unknown>(
    `/admin/coupons/${id}`,
    buildCouponRequestEnvelope(payload),
  );
  const normalized = normalizeCoupon(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kupon yanıtı işlenemedi.");
  return normalized;
}

export async function deleteAdminCoupon(id: string | number): Promise<void> {
  await apiDeleteRaw(`/admin/coupons/${id}`);
}

// —— Campaigns ——

export type CampaignTarget = "All" | "Category" | "Vendor" | "Service" | string;

export type Campaign = {
  id: string | number;
  title: string;
  description?: string;
  bannerText?: string;
  targetType?: CampaignTarget;
  targetId?: string | number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
};

function normalizeCampaign(raw: unknown): Campaign | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id");
  const title = pickStr(o, "title", "Title", "name", "Name");
  if (id == null || !title) return null;
  return {
    id,
    title,
    description: pickStr(o, "description", "Description"),
    bannerText:
      pickStr(o, "bannerText", "BannerText", "headline") ?? title,
    targetType: pickStr(o, "targetType", "TargetType", "target"),
    targetId: pickId(o, "targetId", "TargetId", "categoryId", "vendorId"),
    startDate: pickStr(o, "startDate", "StartDate", "startsAt", "StartsAt"),
    endDate: pickStr(o, "endDate", "EndDate", "endsAt", "EndsAt"),
    isActive: pickBool(o, "isActive", "IsActive") ?? true,
    ctaLabel: pickStr(o, "ctaLabel", "CtaLabel"),
    ctaHref: pickStr(o, "ctaHref", "CtaHref", "linkUrl"),
  };
}

export async function fetchActiveCampaigns(): Promise<Campaign[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/campaigns/active");
      return toList(raw).map(normalizeCampaign).filter(Boolean) as Campaign[];
    },
    [],
  );
}

export async function fetchAdminCampaigns(): Promise<Campaign[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/admin/campaigns");
      return toList(raw).map(normalizeCampaign).filter(Boolean) as Campaign[];
    },
    [],
  );
}

function buildCampaignRequestBody(
  payload: Partial<Omit<Campaign, "id">>,
): Record<string, unknown> {
  const startsAt = toApiDateOrNull(payload.startDate);
  const endsAt = toApiDateOrNull(payload.endDate);
  return {
    title: payload.title?.trim() ?? "",
    description: payload.description?.trim() || null,
    bannerText: payload.bannerText?.trim() || payload.title?.trim() || null,
    targetType: payload.targetType ?? "All",
    targetId: payload.targetId ?? null,
    startsAt,
    endsAt,
    startDate: startsAt,
    endDate: endsAt,
    isActive: payload.isActive ?? true,
    ctaLabel: payload.ctaLabel?.trim() || null,
    ctaHref: payload.ctaHref?.trim() || null,
  };
}

export async function createAdminCampaign(
  payload: Omit<Campaign, "id">,
): Promise<Campaign> {
  const raw = await apiPost<unknown>(
    "/admin/campaigns",
    buildCampaignRequestBody(payload),
  );
  const normalized = normalizeCampaign(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kampanya yanıtı işlenemedi.");
  return normalized;
}

export async function updateAdminCampaign(
  id: string | number,
  payload: Partial<Campaign>,
): Promise<Campaign> {
  const raw = await apiPutRaw<unknown>(
    `/admin/campaigns/${id}`,
    buildCampaignRequestBody(payload),
  );
  const normalized = normalizeCampaign(toRecord(raw).data ?? raw);
  if (!normalized) throw new Error("Kampanya yanıtı işlenemedi.");
  return normalized;
}

export async function deleteAdminCampaign(id: string | number): Promise<void> {
  await apiDeleteRaw(`/admin/campaigns/${id}`);
}
