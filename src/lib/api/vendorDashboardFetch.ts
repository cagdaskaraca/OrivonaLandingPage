import { ApiError, apiGetRaw } from "@/src/lib/api/client";
import type { ApiEnvelope } from "@/src/lib/api/types";
import { removeToken } from "@/src/lib/auth";

export type VendorSectionKey =
  | "services"
  | "offers"
  | "reservations"
  | "availability"
  | "coupons"
  | "promotions"
  | "analytics"
  | "crm"
  | "activity"
  | "reviews"
  | "pipeline"
  | "profile"
  | "summary";

export const VENDOR_SECTION_ERROR: Record<VendorSectionKey, string> = {
  services: "Hizmet verileri şu anda alınamadı.",
  offers: "Teklif verileri şu anda alınamadı.",
  reservations: "Rezervasyon verileri şu anda alınamadı.",
  availability: "Müsaitlik verileri şu anda alınamadı.",
  coupons: "Kupon verileri şu anda alınamadı.",
  promotions: "Promosyon verileri şu anda alınamadı.",
  analytics: "Analitik veriler şu anda alınamadı.",
  crm: "CRM verileri şu anda alınamadı.",
  activity: "Aktivite verileri şu anda alınamadı.",
  reviews: "Yorum verileri şu anda alınamadı.",
  pipeline: "Pipeline verileri şu anda alınamadı.",
  profile: "Profil verileri şu anda alınamadı.",
  summary: "Özet veriler şu anda alınamadı.",
};

export const VENDOR_LOADING_MESSAGE = "Veriler yükleniyor…";
export const VENDOR_FORBIDDEN_MESSAGE = "Bu alana erişim yetkiniz bulunmuyor.";

const RETRY_DELAYS_MS = [800, 1500] as const;

export class VendorSectionLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VendorSectionLoadError";
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function devLog(label: string | undefined, data: unknown): void {
  if (process.env.NODE_ENV === "development" && label) {
    console.log(label, data);
  }
}

export function handleVendorAuthHttpError(err: unknown): void {
  if (!(err instanceof ApiError)) return;
  if (err.status === 401) {
    removeToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}

function mapHttpToSectionMessage(
  err: unknown,
  sectionKey: VendorSectionKey,
): string {
  if (err instanceof VendorSectionLoadError) return err.message;
  if (err instanceof ApiError) {
    if (err.status === 403) return VENDOR_FORBIDDEN_MESSAGE;
    if (err.status === 401) return "Oturum süresi doldu.";
  }
  return VENDOR_SECTION_ERROR[sectionKey];
}

function isNotFoundError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 404 || err.status === 405);
}

/**
 * GET with 2 retries (800ms, 1500ms). Treats success:false as section error.
 * Returns envelope when success === true (including empty data).
 */
export async function vendorGetWithRetry(
  path: string,
  options: {
    sectionKey: VendorSectionKey;
    devLogLabel?: string;
    allowNotFound?: boolean;
  },
): Promise<ApiEnvelope> {
  const { sectionKey, devLogLabel, allowNotFound = false } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    if (attempt > 0) {
      await sleep(RETRY_DELAYS_MS[attempt - 1]!);
    }
    try {
      const body = await apiGetRaw<ApiEnvelope>(path);
      devLog(devLogLabel, body);

      if (body.success === false) {
        lastError = new VendorSectionLoadError(VENDOR_SECTION_ERROR[sectionKey]);
        continue;
      }

      return body;
    } catch (err) {
      lastError = err;
      if (isNotFoundError(err) && allowNotFound) {
        return { success: true, data: [] };
      }
      handleVendorAuthHttpError(err);
      if (err instanceof ApiError && err.status === 403) {
        throw new VendorSectionLoadError(VENDOR_FORBIDDEN_MESSAGE);
      }
      if (attempt === RETRY_DELAYS_MS.length) {
        throw new VendorSectionLoadError(mapHttpToSectionMessage(err, sectionKey));
      }
    }
  }

  throw new VendorSectionLoadError(
    mapHttpToSectionMessage(lastError, sectionKey),
  );
}

export function envelopeToList(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    for (const key of [
      "items",
      "results",
      "data",
      "leads",
      "services",
      "stages",
      "months",
      "rows",
    ]) {
      if (Array.isArray(o[key])) return o[key] as unknown[];
    }
  }
  return [];
}
