import {
  ApiError,
  apiDeleteRaw,
  apiGet,
  apiGetPublic,
  apiPost,
  apiPutRaw,
  buildQuery,
  withOptionalNotFound,
} from "@/src/lib/api/client";
import { normalizeBadgeTypeForApi } from "@/src/lib/premiumLabels";
import {
  envelopeToList,
  vendorGetWithRetry,
} from "@/src/lib/api/vendorDashboardFetch";

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

// —— Global search ——

export type GlobalSearchHit = {
  type: string;
  title: string;
  description?: string;
  url?: string;
  id?: string | number;
};

export async function fetchGlobalSearch(query: string): Promise<GlobalSearchHit[]> {
  const q = query.trim();
  if (!q) return [];
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(
        `/search/global${buildQuery({ q })}`,
      );
      const list = toList<unknown>(raw);
      return list.map((item) => {
        const o = toRecord(item);
        return {
          type: pickStr(o, "type", "Type", "entityType") ?? "other",
          title: pickStr(o, "title", "Title", "name", "Name") ?? "Sonuç",
          description: pickStr(o, "description", "Description", "subtitle"),
          url: pickStr(o, "url", "Url", "link", "href"),
          id: pickId(o, "id", "Id"),
        } satisfies GlobalSearchHit;
      });
    },
    [],
    "Global search not available",
  );
}

// —— Activity feed ——

export type ActivityFeedItem = {
  id?: string | number;
  icon?: string;
  title: string;
  description?: string;
  createdAt?: string;
  url?: string;
};

function normalizeActivityItem(raw: unknown): ActivityFeedItem {
  const o = toRecord(raw);
  return {
    id: pickId(o, "id", "Id"),
    icon: pickStr(o, "icon", "Icon"),
    title: pickStr(o, "title", "Title") ?? "Aktivite",
    description: pickStr(o, "description", "Description", "message"),
    createdAt: pickStr(o, "createdAt", "CreatedAt", "timestamp"),
    url: pickStr(o, "url", "Url", "link"),
  };
}

export async function fetchMyActivityFeed(): Promise<ActivityFeedItem[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/activity-feed/my");
      return toList(raw).map(normalizeActivityItem);
    },
    [],
  );
}

export async function fetchVendorActivityFeed(): Promise<ActivityFeedItem[]> {
  const body = await vendorGetWithRetry("/vendor/activity-feed", {
    sectionKey: "activity",
    devLogLabel: "Vendor activity feed response",
    allowNotFound: true,
  });
  return envelopeToList(body.data).map(normalizeActivityItem);
}

export async function fetchAdminActivityFeed(): Promise<ActivityFeedItem[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/admin/activity-feed");
      return toList(raw).map(normalizeActivityItem);
    },
    [],
  );
}

// —— Event board ——

export type EventBoardItem = {
  id: string | number;
  title: string;
  description?: string;
  status: string;
  sortOrder?: number;
};

export type EventBoardColumn = {
  status: string;
  items: EventBoardItem[];
};

export type EventBoard = {
  columns: EventBoardColumn[];
  items: EventBoardItem[];
};

function normalizeBoardItem(raw: unknown): EventBoardItem | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id", "itemId");
  if (id == null) return null;
  return {
    id,
    title: pickStr(o, "title", "Title", "name") ?? "Görev",
    description: pickStr(o, "description", "Description"),
    status: pickStr(o, "status", "Status") ?? "Todo",
    sortOrder: pickNum(o, "sortOrder", "SortOrder"),
  };
}

export async function fetchEventPlanBoard(
  planId: string | number,
): Promise<EventBoard | null> {
  return withOptionalNotFound(
    async () => {
      const { getEventPlanBoard } = await import("@/src/lib/api/eventPlans");
      const data = await getEventPlanBoard(planId);
      const items: EventBoardItem[] = [];
      const columns: EventBoardColumn[] = (data.columns ?? []).map((col) => {
        const colItems = (col.items ?? [])
          .filter((item) => item.id != null)
          .map((item) => ({
            id: item.id as string | number,
            title: item.title ?? "Görev",
            description: item.description,
            status: item.status ?? col.key ?? "Todo",
          }));
        items.push(...colItems);
        return {
          status: col.key ?? col.title ?? "Todo",
          items: colItems,
        };
      });
      return { columns, items };
    },
    null,
  );
}

export async function updateEventBoardItemStatus(
  planId: string | number,
  itemId: string | number,
  status: string,
): Promise<void> {
  await apiPutRaw(`/event-plans/${planId}/board/items/${itemId}/status`, {
    status,
  });
}

// —— Vendor pipeline ——

export type VendorPipelineLead = {
  id: string | number;
  customerMasked?: string;
  serviceTitle?: string;
  score?: number;
  lastActivityAt?: string;
  stage: string;
};

export type VendorPipeline = {
  columns: { stage: string; leads: VendorPipelineLead[] }[];
  leads: VendorPipelineLead[];
};

function normalizeLead(raw: unknown): VendorPipelineLead | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id", "leadId");
  if (id == null) return null;
  return {
    id,
    customerMasked: pickStr(o, "customerMasked", "CustomerMasked", "customerName"),
    serviceTitle: pickStr(o, "serviceTitle", "ServiceTitle", "service"),
    score: pickNum(o, "score", "Score", "matchScore"),
    lastActivityAt: pickStr(o, "lastActivityAt", "LastActivityAt", "updatedAt"),
    stage: pickStr(o, "stage", "Stage", "status") ?? "New",
  };
}

export async function fetchVendorPipeline(): Promise<VendorPipeline> {
  const body = await vendorGetWithRetry("/vendor/pipeline", {
    sectionKey: "pipeline",
    devLogLabel: "Vendor pipeline response",
    allowNotFound: true,
  });
  const raw = body.data ?? {};
  const leads = toList(raw, ["leads", "items"])
    .map(normalizeLead)
    .filter(Boolean) as VendorPipelineLead[];
  const o = toRecord(raw);
  const columnsRaw = Array.isArray(o.columns) ? o.columns : [];
  const columns = columnsRaw.map((col) => {
    const c = toRecord(col);
    const stage = pickStr(c, "stage", "Stage") ?? "New";
    const colLeads = toList(c.leads ?? c.Leads)
      .map(normalizeLead)
      .filter(Boolean) as VendorPipelineLead[];
    return { stage, leads: colLeads };
  });
  if (columns.length === 0 && leads.length > 0) {
    const byStage = new Map<string, VendorPipelineLead[]>();
    for (const lead of leads) {
      const list = byStage.get(lead.stage) ?? [];
      list.push(lead);
      byStage.set(lead.stage, list);
    }
    return {
      leads,
      columns: [...byStage.entries()].map(([stage, colLeads]) => ({
        stage,
        leads: colLeads,
      })),
    };
  }
  return { columns, leads };
}

export async function updateVendorLeadStage(
  leadId: string | number,
  stage: string,
): Promise<void> {
  await apiPutRaw(`/vendor/leads/${leadId}/stage`, { stage });
}

// —— Smart pricing ——

export type PricingInsights = {
  marketAverage?: number;
  suggestedPriceMin?: number;
  suggestedPriceMax?: number;
  position?: string;
  percentageDifference?: number;
  tips?: string[];
};

export async function fetchAiPricingInsights(payload: {
  serviceId?: string | number;
  categoryId?: string | number;
  city?: string;
  basePrice?: number;
}): Promise<PricingInsights | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiPost<unknown>("/ai/pricing-insights", payload);
      const o = toRecord(raw);
      const tipsRaw = o.tips ?? o.Tips;
      return {
        marketAverage: pickNum(o, "marketAverage", "MarketAverage"),
        suggestedPriceMin: pickNum(o, "suggestedPriceMin", "SuggestedPriceMin"),
        suggestedPriceMax: pickNum(o, "suggestedPriceMax", "SuggestedPriceMax"),
        position: pickStr(o, "position", "Position", "marketPosition"),
        percentageDifference: pickNum(
          o,
          "percentageDifference",
          "PercentageDifference",
        ),
        tips: Array.isArray(tipsRaw) ? tipsRaw.map(String) : undefined,
      };
    },
    null,
  );
}

// —— Badges ——

export async function fetchBadgeCatalog(): Promise<string[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/badges");
      const list = toList(raw);
      if (list.length === 0 && Array.isArray(raw)) return raw.map(String);
      return list.map((b) => {
        if (typeof b === "string") return b;
        const o = toRecord(b);
        return pickStr(o, "type", "Type", "badgeType", "name") ?? String(b);
      });
    },
    [],
  );
}

function parseBadgeList(raw: unknown): string[] {
  return toList(raw)
    .map((b) =>
      typeof b === "string"
        ? b
        : pickStr(toRecord(b), "type", "Type", "badgeType", "BadgeType", "name") ??
          "",
    )
    .filter(Boolean);
}

/** Admin: yalnızca hizmete doğrudan atanmış rozetler. */
export async function fetchAdminServiceBadges(
  serviceId: string | number,
): Promise<string[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(`/admin/services/${serviceId}/badges`);
      return parseBadgeList(raw);
    },
    [],
  );
}

/** Public/marketplace: hizmet + işletme birleşik rozetler. */
export async function fetchServiceBadges(
  serviceId: string | number,
): Promise<string[]> {
  const fromPublic = await withOptionalNotFound(
    async () => {
      const raw = await apiGetPublic<unknown>(`/services/${serviceId}/badges`);
      return parseBadgeList(raw);
    },
    null,
  );
  if (fromPublic != null && fromPublic.length > 0) return fromPublic;

  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(`/services/${serviceId}/badges`);
      return parseBadgeList(raw);
    },
    [],
  );
}

export function isServiceBadgeNotFoundError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  const message = err.message.toLowerCase();
  return (
    err.status === 404 ||
    message.includes("hizmet rozeti bulunamadı") ||
    message.includes("service badge")
  );
}

/** İşletmeye atanmış rozetler (hizmet kartlarında miras alınır). */
export async function fetchVendorBadges(
  vendorId: string | number,
): Promise<string[]> {
  const paths = [
    `/vendors/${vendorId}/badges`,
    `/admin/vendors/${vendorId}/badges`,
  ];

  for (const path of paths) {
    const list = await withOptionalNotFound(
      async () => {
        const raw = await apiGet<unknown>(path);
        return parseBadgeList(raw);
      },
      null,
    );
    if (list != null && list.length > 0) return list;
  }

  return [];
}

export async function assignAdminVendorBadge(
  vendorId: string | number,
  badgeType: string,
): Promise<void> {
  const normalized = normalizeBadgeTypeForApi(badgeType);
  await apiPost(`/admin/vendors/${vendorId}/badges`, { badgeType: normalized });
}

export async function removeAdminVendorBadge(
  vendorId: string | number,
  badgeType: string,
): Promise<void> {
  const normalized = normalizeBadgeTypeForApi(badgeType);
  await apiDeleteRaw(
    `/admin/vendors/${vendorId}/badges/${encodeURIComponent(normalized)}`,
  );
}

export async function assignAdminServiceBadge(
  serviceId: string | number,
  badgeType: string,
): Promise<void> {
  const normalized = normalizeBadgeTypeForApi(badgeType);
  await apiPost(`/admin/services/${serviceId}/badges`, { badgeType: normalized });
}

export async function removeAdminServiceBadge(
  serviceId: string | number,
  badgeType: string,
): Promise<void> {
  const normalized = normalizeBadgeTypeForApi(badgeType);
  await apiDeleteRaw(
    `/admin/services/${serviceId}/badges/${encodeURIComponent(normalized)}`,
  );
}

// —— Service media ——

export type ServiceMediaItem = {
  id: string | number;
  url: string;
  mediaType: "Image" | "Video" | string;
  isCover?: boolean;
  sortOrder?: number;
};

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

export async function fetchServiceMedia(
  serviceId: string | number,
): Promise<ServiceMediaItem[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(`/services/${serviceId}/media`);
      return toList(raw).map(normalizeMediaItem).filter(Boolean) as ServiceMediaItem[];
    },
    [],
  );
}

export async function addVendorServiceMedia(
  serviceId: string | number,
  payload: {
    url: string;
    mediaType: string;
    isCover?: boolean;
    sortOrder?: number;
  },
): Promise<void> {
  await apiPost(`/vendor/services/${serviceId}/media`, payload);
}

export async function deleteVendorServiceMedia(
  serviceId: string | number,
  mediaId: string | number,
): Promise<void> {
  await apiDeleteRaw(`/vendor/services/${serviceId}/media/${mediaId}`);
}

// —— Availability heatmap ——

export type HeatmapMonth = {
  month: string;
  year?: number;
  level: string;
  occupancyRate?: number;
};

export async function fetchServiceAvailabilityHeatmap(
  serviceId: string | number,
): Promise<HeatmapMonth[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(
        `/services/${serviceId}/availability/heatmap`,
      );
      return toList(raw, ["months", "items"]).map((m) => {
        const o = toRecord(m);
        return {
          month: pickStr(o, "month", "Month", "monthName") ?? "—",
          year: pickNum(o, "year", "Year"),
          level: pickStr(o, "level", "Level", "density") ?? "Medium",
          occupancyRate: pickNum(o, "occupancyRate", "OccupancyRate"),
        };
      });
    },
    [],
  );
}

export async function fetchVendorAvailabilityHeatmap(): Promise<HeatmapMonth[]> {
  const body = await vendorGetWithRetry("/vendor/availability/heatmap", {
    sectionKey: "availability",
    devLogLabel: "Vendor availability response",
    allowNotFound: true,
  });
  return envelopeToList(body.data).map((m) => {
    const o = toRecord(m);
    return {
      month: pickStr(o, "month", "Month", "monthName") ?? "—",
      year: pickNum(o, "year", "Year"),
      level: pickStr(o, "level", "Level", "density") ?? "Medium",
      occupancyRate: pickNum(o, "occupancyRate", "OccupancyRate"),
    };
  });
}

// —— Saved AI plans ——

export type SavedAiPlan = {
  id: string | number;
  title?: string;
  eventType?: string;
  city?: string;
  budget?: number;
  budgetMin?: number;
  budgetMax?: number;
  createdAt?: string;
  payload?: unknown;
};

function normalizeSavedPlan(raw: unknown): SavedAiPlan | null {
  const o = toRecord(raw);
  const id = pickId(o, "id", "Id");
  if (id == null) return null;
  return {
    id,
    title: pickStr(o, "title", "Title"),
    eventType: pickStr(o, "eventType", "EventType"),
    city: pickStr(o, "city", "City"),
    budget: pickNum(o, "budget", "Budget"),
    budgetMin: pickNum(o, "budgetMin", "BudgetMin"),
    budgetMax: pickNum(o, "budgetMax", "BudgetMax"),
    createdAt: pickStr(o, "createdAt", "CreatedAt"),
    payload: o.payload ?? o.plan ?? o.data,
  };
}

export async function saveAiPlan(payload: unknown): Promise<SavedAiPlan | null> {
  const raw = await apiPost<unknown>("/ai/plans/save", payload);
  return normalizeSavedPlan(raw) ?? normalizeSavedPlan(toRecord(raw).data);
}

export async function fetchMySavedAiPlans(): Promise<SavedAiPlan[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/ai/plans/my");
      return toList(raw).map(normalizeSavedPlan).filter(Boolean) as SavedAiPlan[];
    },
    [],
  );
}

export async function fetchSavedAiPlanById(
  id: string | number,
): Promise<SavedAiPlan | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(`/ai/plans/${id}`);
      return normalizeSavedPlan(raw);
    },
    null,
  );
}

export async function deleteSavedAiPlan(id: string | number): Promise<void> {
  await apiDeleteRaw(`/ai/plans/${id}`);
}

// —— Event wizard ——

export type EventWizardPayload = {
  eventType: string;
  eventDate: string;
  city: string;
  district?: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  style?: string;
  categories?: string[];
};

export type EventWizardResult = {
  eventPlanId?: string | number;
  plan?: unknown;
  tasks?: unknown[];
  recommendedServices?: unknown[];
};

export async function completeEventWizard(
  payload: EventWizardPayload,
): Promise<EventWizardResult | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiPost<unknown>("/ai/event-wizard/complete", payload);
      const o = toRecord(raw);
      return {
        eventPlanId: pickId(o, "eventPlanId", "EventPlanId", "planId"),
        plan: o.plan ?? o.eventPlan,
        tasks: toList(o.tasks ?? o.checklist),
        recommendedServices: toList(o.recommendedServices ?? o.services),
      };
    },
    null,
  );
}

// —— Public event page ——

export type PublicEventPageConfig = {
  enabled?: boolean;
  slug?: string;
  publicUrl?: string;
  description?: string;
  dressCode?: string;
};

export async function fetchEventPlanPublicPage(
  planId: string | number,
): Promise<PublicEventPageConfig | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>(`/event-plans/${planId}/public-page`);
      const o = toRecord(raw);
      return {
        enabled: o.enabled === true || o.isEnabled === true,
        slug: pickStr(o, "slug", "Slug"),
        publicUrl: pickStr(o, "publicUrl", "PublicUrl", "url"),
        description: pickStr(o, "description", "Description"),
        dressCode: pickStr(o, "dressCode", "DressCode"),
      };
    },
    null,
  );
}

export async function createOrUpdateEventPlanPublicPage(
  planId: string | number,
  payload: { description?: string; dressCode?: string },
): Promise<PublicEventPageConfig | null> {
  const raw = await apiPost<unknown>(
    `/event-plans/${planId}/public-page`,
    payload,
  );
  const o = toRecord(raw);
  return {
    enabled: true,
    slug: pickStr(o, "slug", "Slug"),
    publicUrl: pickStr(o, "publicUrl", "PublicUrl", "url"),
    description: payload.description,
    dressCode: payload.dressCode,
  };
}

export async function disableEventPlanPublicPage(
  planId: string | number,
): Promise<void> {
  await apiPost(`/event-plans/${planId}/public-page/disable`, {});
}

export type PublicEventPageData = {
  title?: string;
  eventDate?: string;
  location?: string;
  hostName?: string;
  dressCode?: string;
  description?: string;
  inviteUrl?: string;
  slug?: string;
};

export async function fetchPublicEventBySlug(
  slug: string,
): Promise<PublicEventPageData | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGetPublic<unknown>(`/events/public/${slug}`);
      const o = toRecord(raw);
      return {
        title: pickStr(o, "title", "Title", "eventTitle"),
        eventDate: pickStr(o, "eventDate", "EventDate", "date"),
        location: pickStr(o, "location", "Location", "city"),
        hostName: pickStr(o, "hostName", "HostName", "host"),
        dressCode: pickStr(o, "dressCode", "DressCode"),
        description: pickStr(o, "description", "Description"),
        inviteUrl: pickStr(o, "inviteUrl", "InviteUrl", "rsvpUrl"),
        slug,
      };
    },
    null,
  );
}

// —— Smart notifications ——

export async function generateSmartNotifications(): Promise<number> {
  const raw = await apiPost<unknown>("/notifications/generate-smart", {});
  const o = toRecord(raw);
  return pickNum(o, "count", "Count", "generatedCount") ?? 0;
}

// —— AI vendor match ——

export type VendorMatchResult = {
  serviceId?: string | number;
  serviceTitle?: string;
  vendorName?: string;
  matchScore?: number;
  priceFit?: number;
  locationFit?: number;
  styleFit?: number;
  availabilityFit?: number;
  reasons?: string[];
};

export async function fetchAiVendorMatch(
  payload: unknown,
): Promise<VendorMatchResult[]> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiPost<unknown>("/ai/vendor-match", payload);
      return toList(raw, ["matches", "items", "results"]).map((m) => {
        const o = toRecord(m);
        const reasonsRaw = o.reasons ?? o.Reasons;
        return {
          serviceId: pickId(o, "serviceId", "vendorServiceId", "id"),
          serviceTitle: pickStr(o, "serviceTitle", "ServiceTitle", "title"),
          vendorName: pickStr(o, "vendorName", "VendorName"),
          matchScore: pickNum(o, "matchScore", "MatchScore", "score"),
          priceFit: pickNum(o, "priceFit", "PriceFit"),
          locationFit: pickNum(o, "locationFit", "LocationFit"),
          styleFit: pickNum(o, "styleFit", "StyleFit"),
          availabilityFit: pickNum(o, "availabilityFit", "AvailabilityFit"),
          reasons: Array.isArray(reasonsRaw) ? reasonsRaw.map(String) : undefined,
        };
      });
    },
    [],
  );
}

// —— Mobile home ——

export type MobileHomeSummary = {
  unreadMessages?: number;
  pendingOffers?: number;
  upcomingReservations?: number;
  latestNotifications?: number;
};

export async function fetchMobileHome(): Promise<MobileHomeSummary | null> {
  return withOptionalNotFound(
    async () => {
      const raw = await apiGet<unknown>("/mobile/home");
      const o = toRecord(raw);
      return {
        unreadMessages: pickNum(o, "unreadMessages", "UnreadMessages"),
        pendingOffers: pickNum(o, "pendingOffers", "PendingOffers"),
        upcomingReservations: pickNum(
          o,
          "upcomingReservations",
          "UpcomingReservations",
        ),
        latestNotifications: pickNum(
          o,
          "latestNotifications",
          "LatestNotifications",
        ),
      };
    },
    null,
  );
}

// —— QR check-in ——

export type QrCheckInVerifyResult = {
  valid?: boolean;
  guestName?: string;
  eventTitle?: string;
  plusOneCount?: number;
  alreadyCheckedIn?: boolean;
  ticketId?: string | number;
};

export async function verifyVendorCheckIn(payload: {
  ticketCode?: string;
  qrText?: string;
}): Promise<QrCheckInVerifyResult | null> {
  const raw = await apiPost<unknown>("/vendor/check-in/verify", payload);
  const o = toRecord(raw);
  return {
    valid: o.valid === true || o.isValid === true,
    guestName: pickStr(o, "guestName", "GuestName"),
    eventTitle: pickStr(o, "eventTitle", "EventTitle"),
    plusOneCount: pickNum(o, "plusOneCount", "PlusOneCount"),
    alreadyCheckedIn:
      o.alreadyCheckedIn === true || o.isAlreadyCheckedIn === true,
    ticketId: pickId(o, "ticketId", "TicketId"),
  };
}

export async function confirmVendorCheckIn(payload: {
  ticketCode?: string;
  qrText?: string;
  ticketId?: string | number;
}): Promise<void> {
  await apiPost("/vendor/check-in/confirm", payload);
}
