/** Kullanıcıya gösterilen durum metinleri — ham enum/API değerleri UI'da kullanılmaz. */

export type StatusBadgeVariant =
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "muted";

export type StatusDisplayContext = "customer" | "vendor" | "default";

const VARIANT_CLASSES: Record<StatusBadgeVariant, string> = {
  success: "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
  warning: "border-amber-400/30 bg-amber-500/15 text-amber-100",
  danger: "border-red-400/30 bg-red-500/15 text-red-200",
  info: "border-violet-400/30 bg-violet-500/15 text-violet-100",
  muted: "border-zinc-500/30 bg-zinc-500/15 text-zinc-400",
};

/** Normalize: PendingVendorResponse → pendingvendorresponse */
export function normalizeStatusKey(status?: string | null): string {
  if (!status?.trim()) return "";
  return status.trim().replace(/[\s_-]+/g, "").toLowerCase();
}

const STATUS_LABELS: Record<string, string> = {
  // Teklif / talep
  pendingvendorresponse: "İşletme yanıtı bekleniyor",
  pending: "İşletme yanıtı bekleniyor",
  offersent: "Teklif gönderildi",
  acceptedbycustomer: "Müşteri kabul etti",
  customeraccepted: "Müşteri kabul etti",
  accepted: "Müşteri kabul etti",
  rejectedbycustomer: "Müşteri reddetti",
  rejectedbyvendor: "İşletme reddetti",
  rejected: "Reddedildi",
  cancelled: "İptal edildi",
  canceled: "İptal edildi",
  cancelledbycustomer: "İptal edildi",
  completed: "Tamamlandı",
  expired: "Süresi doldu",

  // Davetiye tasarımı
  senttovendor: "Davetiyeciye gönderildi",
  vendorrevised: "Davetiyeci taslak yükledi",
  approved: "Onaylandı",
  draft: "Taslak",
  ready: "Hazır",
  published: "Yayında",
  attached: "Talebe bağlı",

  // Etkinlik talebi / plan
  submitted: "Gönderildi",
  inreview: "İnceleniyor",
  inprogress: "Devam ediyor",
  todo: "Yapılacak",
  done: "Tamamlandı",
  skipped: "Atlandı",
  waitingforvendor: "İşletme bekleniyor",
  waitingvendor: "İşletme bekleniyor",
  waitingvendorresponse: "İşletme bekleniyor",

  // Rezervasyon
  confirmed: "Onaylandı",
  active: "Aktif",
  awaitingconfirmation: "Onay bekliyor",
  awaitingvendorconfirmation: "Onay bekliyor",
  awaitingvendorapproval: "İşletme onayı bekliyor",
  beklemede: "Beklemede",
  awaitingapproval: "Onay bekliyor",
  awaitingpayment: "Ödeme bekliyor",
  paymentpending: "Ödeme bekliyor",
  paid: "Ödendi",

  // CRM / pipeline (görünürse)
  new: "Yeni",
  contacted: "İletişime geçildi",
  negotiation: "Pazarlık",
  won: "Kazanıldı",
  lost: "Kaybedildi",
};

const STATUS_VARIANTS: Record<string, StatusBadgeVariant> = {
  pendingvendorresponse: "warning",
  pending: "warning",
  senttovendor: "info",
  vendorrevised: "info",
  offersent: "info",
  acceptedbycustomer: "success",
  customeraccepted: "success",
  accepted: "success",
  approved: "success",
  completed: "success",
  confirmed: "success",
  awaitingconfirmation: "warning",
  awaitingvendorconfirmation: "warning",
  awaitingvendorapproval: "warning",
  beklemede: "warning",
  awaitingapproval: "warning",
  awaitingpayment: "info",
  paymentpending: "info",
  paid: "success",
  ready: "info",
  published: "info",
  attached: "info",
  rejectedbycustomer: "danger",
  rejectedbyvendor: "danger",
  rejected: "danger",
  cancelled: "muted",
  canceled: "muted",
  cancelledbycustomer: "muted",
  draft: "muted",
  expired: "muted",
  submitted: "info",
  inreview: "warning",
};

const CONTEXT_LABEL_OVERRIDES: Record<
  StatusDisplayContext,
  Record<string, string>
> = {
  vendor: {
    senttovendor: "Yeni taslak bekleniyor",
    vendorrevised: "Revizyon yüklendi",
    approved: "Müşteriye gönderildi",
    pendingvendorresponse: "Yanıt bekleniyor",
    offersent: "Teklif gönderildi",
    cancelledbycustomer: "Müşteri iptal etti",
    cancelled: "Müşteri iptal etti",
    canceled: "Müşteri iptal etti",
    awaitingpayment: "Müşteri ödemesi bekleniyor",
    paymentpending: "Müşteri ödemesi bekleniyor",
  },
  customer: {
    cancelledbycustomer: "İptal ettiniz",
    cancelled: "İptal ettiniz",
    canceled: "İptal ettiniz",
    awaitingpayment: "Ödeme yapın",
    paymentpending: "Ödeme yapın",
    confirmed: "Onaylandı — ödeme bekliyor",
  },
  default: {},
};

const UNKNOWN_LABEL = "Beklemede";

function lookupLabel(
  normalized: string,
  context: StatusDisplayContext,
): string | undefined {
  const ctxOverride = CONTEXT_LABEL_OVERRIDES[context][normalized];
  if (ctxOverride) return ctxOverride;
  if (context !== "default") {
    const defaultOverride = CONTEXT_LABEL_OVERRIDES.default[normalized];
    if (defaultOverride) return defaultOverride;
  }
  return STATUS_LABELS[normalized];
}

function lookupLabelByRawKey(raw: string): string | undefined {
  return STATUS_LABELS[normalizeStatusKey(raw)];
}

/**
 * Ham status → Türkçe kullanıcı metni.
 * Bilinmeyen değerler için ham enum gösterilmez.
 */
export function getStatusLabel(
  status?: string | null,
  context: StatusDisplayContext = "default",
): string {
  if (!status?.trim()) {
    return context === "vendor"
      ? "Yanıt bekleniyor"
      : STATUS_LABELS.pendingvendorresponse;
  }

  const raw = status.trim();
  const normalized = normalizeStatusKey(raw);

  const fromContext = lookupLabel(normalized, context);
  if (fromContext) return fromContext;

  const fromDefault = lookupLabel(normalized, "default");
  if (fromDefault) return fromDefault;

  const fromRaw = lookupLabelByRawKey(raw);
  if (fromRaw) return fromRaw;

  for (const [k, label] of Object.entries(STATUS_LABELS)) {
    if (normalizeStatusKey(k) === normalized) return label;
  }

  return UNKNOWN_LABEL;
}

export function getStatusBadgeVariant(
  status?: string | null,
): StatusBadgeVariant {
  const normalized = normalizeStatusKey(status);
  if (normalized && STATUS_VARIANTS[normalized]) {
    return STATUS_VARIANTS[normalized];
  }
  if (status?.trim()) {
    const fromRaw = STATUS_VARIANTS[normalizeStatusKey(status.trim())];
    if (fromRaw) return fromRaw;
  }
  return "muted";
}

export function getStatusBadgeClassName(status?: string | null): string {
  return VARIANT_CLASSES[getStatusBadgeVariant(status)];
}
