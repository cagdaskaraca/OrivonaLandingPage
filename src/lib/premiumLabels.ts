import { getStatusLabel } from "@/src/lib/statusLabels";

/** Turkish labels for API badge types (no raw enums in UI). */
const BADGE_LABELS: Record<string, string> = {
  Verified: "Doğrulandı",
  Doğrulandı: "Doğrulandı",
  PremiumPartner: "Premium Partner",
  Premium: "Premium Partner",
  Popular: "Popüler",
  FastResponse: "Hızlı Dönüş",
  HighRating: "Yüksek Puan",
  New: "Yeni",
  Featured: "Öne Çıkan",
  ÖneÇıkan: "Öne Çıkan",
  Sponsored: "Sponsorlu",
  Sponsorlu: "Sponsorlu",
};

/** Backend BadgeType enum değerleri. */
export const API_BADGE_TYPES = [
  "Verified",
  "PremiumPartner",
  "Popular",
  "FastResponse",
  "HighRating",
  "New",
  "Featured",
  "Sponsored",
] as const;

function compactBadgeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\s_\-]+/g, "");
}

/** DELETE/POST API için rozet kodunu normalize eder (ör. "Sponsorlu" → Sponsored). */
export function normalizeBadgeTypeForApi(badge: string): string {
  const key = badge.trim();
  if (!key) return key;

  for (const apiType of API_BADGE_TYPES) {
    if (apiType.toLowerCase() === key.toLowerCase()) return apiType;
  }

  for (const [apiKey, label] of Object.entries(BADGE_LABELS)) {
    if (!API_BADGE_TYPES.includes(apiKey as (typeof API_BADGE_TYPES)[number])) {
      continue;
    }
    if (label.toLowerCase() === key.toLowerCase()) return apiKey;
  }

  const compact = compactBadgeKey(key);
  for (const apiType of API_BADGE_TYPES) {
    if (compactBadgeKey(apiType) === compact) return apiType;
  }

  const pascal = key
    .split(/[\s_\-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  if (pascal) {
    for (const apiType of API_BADGE_TYPES) {
      if (compactBadgeKey(apiType) === compactBadgeKey(pascal)) return apiType;
    }
    return pascal;
  }

  return key;
}

export function formatBadgeLabel(badge: string): string {
  const key = badge.trim();
  if (!key) return "";
  if (BADGE_LABELS[key]) return BADGE_LABELS[key];
  const normalized = key.replace(/\s+/g, "");
  for (const [k, v] of Object.entries(BADGE_LABELS)) {
    if (k.toLowerCase() === normalized.toLowerCase()) return v;
  }
  if (/verified|doğrulan/i.test(key)) return "Doğrulandı";
  if (/premium/i.test(key)) return "Premium Partner";
  if (/popular|popüler/i.test(key)) return "Popüler";
  if (/fast|hızlı/i.test(key)) return "Hızlı Dönüş";
  if (/rating|puan/i.test(key)) return "Yüksek Puan";
  if (/new|yeni/i.test(key)) return "Yeni";
  if (/featured|öne/i.test(key)) return "Öne Çıkan";
  return key;
}

export const BOARD_STATUS_OPTIONS = [
  { value: "Todo", label: "Yapılacak" },
  { value: "InProgress", label: "Devam ediyor" },
  { value: "WaitingForVendor", label: "İşletme bekleniyor" },
  { value: "Approved", label: "Onaylandı" },
  { value: "Completed", label: "Tamamlandı" },
] as const;

export function boardStatusLabel(status?: string): string {
  if (!status) return "—";
  const found = BOARD_STATUS_OPTIONS.find(
    (o) => o.value.toLowerCase() === status.toLowerCase(),
  );
  if (found) return found.label;
  const map: Record<string, string> = {
    todo: "Yapılacak",
    inprogress: "Devam ediyor",
    waitingvendor: "İşletme bekleniyor",
    waitingforvendor: "İşletme bekleniyor",
    approved: "Onaylandı",
    completed: "Tamamlandı",
    waitingvendorresponse: "İşletme bekleniyor",
  };
  const normalized = status.toLowerCase().replace(/[_\s-]/g, "");
  return map[normalized] ?? getStatusLabel(status);
}

export const PIPELINE_STAGE_OPTIONS = [
  { value: "New", label: "Yeni" },
  { value: "Contacted", label: "İletişime geçildi" },
  { value: "OfferSent", label: "Teklif verildi" },
  { value: "Negotiation", label: "Pazarlık" },
  { value: "Won", label: "Kazanıldı" },
  { value: "Lost", label: "Kaybedildi" },
] as const;

export function pipelineStageLabel(stage?: string): string {
  if (!stage) return "—";
  const found = PIPELINE_STAGE_OPTIONS.find(
    (o) => o.value.toLowerCase() === stage.toLowerCase(),
  );
  if (found) return found.label;
  return getStatusLabel(stage);
}

export const HEATMAP_LEVEL_LABELS: Record<string, string> = {
  Low: "Düşük",
  Medium: "Orta",
  High: "Yüksek",
  Full: "Dolu",
  low: "Düşük",
  medium: "Orta",
  high: "Yüksek",
  full: "Dolu",
};

export function heatmapLevelLabel(level?: string): string {
  if (!level) return "—";
  return HEATMAP_LEVEL_LABELS[level] ?? level;
}

export const SEARCH_GROUP_LABELS: Record<string, string> = {
  services: "Hizmetler",
  service: "Hizmetler",
  offers: "Teklifler",
  offer: "Teklifler",
  reservations: "Rezervasyonlar",
  reservation: "Rezervasyonlar",
  messages: "Mesajlar",
  message: "Mesajlar",
  guests: "Davetliler",
  guest: "Davetliler",
  vendors: "İşletmeler",
  vendor: "İşletmeler",
  users: "Kullanıcılar",
  user: "Kullanıcılar",
};

export function searchGroupLabel(type?: string): string {
  if (!type) return "Diğer";
  const key = type.toLowerCase();
  return SEARCH_GROUP_LABELS[key] ?? type;
}

export function pricingPositionLabel(position?: string): string {
  if (!position) return "—";
  const p = position.toLowerCase();
  if (p.includes("below") || p.includes("alt")) return "Piyasa altında";
  if (p.includes("above") || p.includes("üst")) return "Piyasa üstünde";
  if (p.includes("match") || p.includes("uyum")) return "Piyasa uyumlu";
  return position;
}
