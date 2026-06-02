import {
  apiDeleteRaw,
  apiGetPublic,
  apiGetRaw,
  apiPatchRaw,
  apiPostRaw,
  apiPutRaw,
} from "@/src/lib/api/client";
import { recordBool, recordId, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  EventPlanPublicPage,
  EventPlanPublicPagePayload,
  PublicEventPageData,
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

function extractPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || Array.isArray(data)) return data;
  const o = data as Record<string, unknown>;
  const inner = o.data ?? o.Data;
  if (inner != null && inner !== data) return extractPayload(inner);
  return data;
}

function normalizePublicPage(raw: unknown): EventPlanPublicPage {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o),
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    slug: recordStr(o, "slug", "Slug") ?? recordStr(o, "publicSlug", "PublicSlug"),
    publicSlug:
      recordStr(o, "publicSlug", "PublicSlug") ?? recordStr(o, "slug", "Slug"),
    title: recordStr(o, "title", "Title"),
    description: recordStr(o, "description", "Description"),
    dressCode: recordStr(o, "dressCode", "DressCode"),
    note: recordStr(o, "note", "Note"),
    isPublished: recordBool(o, "isPublished", "IsPublished"),
    publishedAt: recordStr(o, "publishedAt", "PublishedAt"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
    updatedAt: recordStr(o, "updatedAt", "UpdatedAt"),
  };
}

export async function getPublicPage(
  eventPlanId: string | number,
): Promise<EventPlanPublicPage | null> {
  const body = await apiGetRaw<ApiEnvelope>(`/event-plans/${eventPlanId}/public-page`);
  assertSuccess(body);
  const payload = extractPayload(body.data);
  if (!payload) return null;
  return normalizePublicPage(payload);
}

export async function createPublicPage(
  eventPlanId: string | number,
  payload: EventPlanPublicPagePayload,
): Promise<EventPlanPublicPage> {
  const body = await apiPostRaw<ApiEnvelope>(`/event-plans/${eventPlanId}/public-page`, payload);
  assertSuccess(body);
  return normalizePublicPage(extractPayload(body.data) ?? body.data);
}

export async function updatePublicPage(
  eventPlanId: string | number,
  pageId: string | number,
  payload: EventPlanPublicPagePayload,
): Promise<EventPlanPublicPage> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/public-page/${pageId}`,
    payload,
  );
  assertSuccess(body);
  return normalizePublicPage(extractPayload(body.data) ?? body.data);
}

export async function publishPublicPage(
  eventPlanId: string | number,
  pageId: string | number,
  isPublished: boolean,
): Promise<EventPlanPublicPage> {
  const body = await apiPatchRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/public-page/${pageId}/publish`,
    { isPublished },
  );
  assertSuccess(body);
  return normalizePublicPage(extractPayload(body.data) ?? body.data);
}

export async function deletePublicPage(
  eventPlanId: string | number,
  pageId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/public-page/${pageId}`,
  );
  assertSuccess(body);
}

export async function getPublicEventPage(slug: string): Promise<PublicEventPageData | null> {
  const raw = await apiGetPublic<unknown>(`/public/event-pages/${slug}`);
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  return {
    title: recordStr(o, "title", "Title"),
    eventDate: recordStr(o, "eventDate", "EventDate"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    description: recordStr(o, "description", "Description"),
    dressCode: recordStr(o, "dressCode", "DressCode"),
    note: recordStr(o, "note", "Note"),
    slug,
  };
}

