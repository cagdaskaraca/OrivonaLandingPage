import {
  apiDeleteRaw,
  apiGetRaw,
  apiPostRaw,
  apiPutRaw,
  getApiBaseUrl,
} from "@/src/lib/api/client";
import { getToken } from "@/src/lib/auth";
import { parseInvitationEditorJson } from "@/src/lib/invitationDesign";
import { recordId, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  CreateInvitationDesignPayload,
  InvitationDesign,
  InvitationRevision,
  UpdateInvitationDesignPayload,
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
    for (const key of ["items", "results", "data", "designs"]) {
      const v = obj[key];
      if (Array.isArray(v)) return v;
    }
  }
  return [];
}

function normalizeRevision(raw: unknown): InvitationRevision {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    id: recordId(o, "id", "Id"),
    fileUrl: recordStr(o, "fileUrl", "FileUrl"),
    fileName: recordStr(o, "fileName", "FileName"),
    mimeType: recordStr(o, "mimeType", "MimeType"),
    note: recordStr(o, "note", "Note"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
    uploadedBy: recordStr(o, "uploadedBy", "UploadedBy"),
  };
}

export function normalizeInvitationDesign(raw: unknown): InvitationDesign {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const jsonRaw = o.designJson ?? o.DesignJson;
  const parsedJson = parseInvitationEditorJson(jsonRaw);
  const designJson: InvitationDesign["designJson"] =
    parsedJson ??
    (typeof jsonRaw === "string" ? jsonRaw : undefined);
  return {
    id: recordId(o, "id", "Id"),
    eventPlanId: recordId(o, "eventPlanId", "EventPlanId"),
    title: recordStr(o, "title", "Title"),
    status: recordStr(o, "status", "Status"),
    sourceType: recordStr(o, "sourceType", "SourceType"),
    designJson,
    fileUrl: recordStr(o, "fileUrl", "FileUrl"),
    fileName: recordStr(o, "fileName", "FileName"),
    mimeType: recordStr(o, "mimeType", "MimeType"),
    previewUrl: recordStr(o, "previewUrl", "PreviewUrl"),
    createdAt: recordStr(o, "createdAt", "CreatedAt"),
    updatedAt: recordStr(o, "updatedAt", "UpdatedAt"),
  };
}

function normalizeInvitationFromNested(
  parent: Record<string, unknown>,
): InvitationDesign | undefined {
  const nested = parent.invitationDesign ?? parent.InvitationDesign;
  if (!nested) return undefined;
  return normalizeInvitationDesign(nested);
}

function normalizeRevisionsFromNested(
  parent: Record<string, unknown>,
): InvitationRevision[] | undefined {
  const nested =
    parent.invitationRevisions ??
    parent.InvitationRevisions ??
    parent.revisions ??
    parent.Revisions;
  if (!nested) return undefined;
  return toList(nested).map(normalizeRevision);
}

export function extractInvitationFields(raw: unknown): {
  invitationDesign?: InvitationDesign;
  invitationRevisions?: InvitationRevision[];
} {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    invitationDesign: normalizeInvitationFromNested(o),
    invitationRevisions: normalizeRevisionsFromNested(o),
  };
}

export async function fetchInvitationDesigns(
  eventPlanId: string | number,
): Promise<InvitationDesign[]> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/invitation-designs`,
  );
  assertSuccess(body);
  return toList(body.data).map(normalizeInvitationDesign);
}

export async function createInvitationDesign(
  eventPlanId: string | number,
  payload: CreateInvitationDesignPayload,
): Promise<InvitationDesign> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/invitation-designs`,
    {
      title: payload.title,
      sourceType: payload.sourceType,
      status: payload.status ?? "Ready",
      designJson: payload.designJson ?? null,
      fileUrl: payload.fileUrl ?? null,
      fileName: payload.fileName ?? null,
      mimeType: payload.mimeType ?? null,
    },
  );
  assertSuccess(body);
  return normalizeInvitationDesign(body.data ?? {});
}

export async function updateInvitationDesign(
  eventPlanId: string | number,
  designId: string | number,
  payload: UpdateInvitationDesignPayload,
): Promise<InvitationDesign> {
  const body = await apiPutRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/invitation-designs/${designId}`,
    {
      title: payload.title,
      sourceType: payload.sourceType,
      status: payload.status,
      designJson: payload.designJson,
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      mimeType: payload.mimeType,
    },
  );
  assertSuccess(body);
  return normalizeInvitationDesign(body.data ?? {});
}

export async function deleteInvitationDesign(
  eventPlanId: string | number,
  designId: string | number,
): Promise<void> {
  const body = await apiDeleteRaw<ApiEnvelope>(
    `/event-plans/${eventPlanId}/invitation-designs/${designId}`,
  );
  assertSuccess(body);
}

/** Müşteri dosya yükleme (backend → Supabase storage). */
export async function uploadInvitationDesignFile(
  file: File,
): Promise<{ url: string; fileName: string; mimeType: string }> {
  const form = new FormData();
  form.append("file", file);

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const paths = ["/customer/files/upload", "/customer/upload", "/storage/upload"];
  let lastError = "Dosya yüklenemedi.";

  for (const path of paths) {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      method: "POST",
      body: form,
      headers,
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      const msg = body.message ?? body.Message;
      lastError =
        typeof msg === "string" ? msg : `Yükleme başarısız (${res.status})`;
      continue;
    }
    const data =
      (body.data && typeof body.data === "object"
        ? (body.data as Record<string, unknown>)
        : body) ?? body;
    const url =
      (typeof data.url === "string" && data.url) ||
      (typeof data.fileUrl === "string" && data.fileUrl) ||
      (typeof data.publicUrl === "string" && data.publicUrl) ||
      "";
    if (url) {
      return {
        url,
        fileName:
          (typeof data.fileName === "string" && data.fileName) || file.name,
        mimeType:
          (typeof data.mimeType === "string" && data.mimeType) ||
          file.type ||
          "application/octet-stream",
      };
    }
  }

  throw new Error(lastError);
}

export async function attachInvitationDesignToEventRequest(
  requestId: string | number,
  invitationDesignId: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-requests/${requestId}/attach-invitation-design`,
    { invitationDesignId },
  );
  assertSuccess(body);
}

export async function uploadVendorInvitationRevision(
  requestId: string | number,
  file: File,
  note?: string,
): Promise<InvitationRevision> {
  const form = new FormData();
  form.append("file", file);
  if (note?.trim()) form.append("note", note.trim());

  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(
    `${getApiBaseUrl()}/vendor/event-requests/${requestId}/invitation-revisions`,
    { method: "POST", body: form, headers },
  );
  const body = (await res.json().catch(() => ({}))) as ApiEnvelope;
  if (!res.ok) {
    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `Revizyon yüklenemedi (${res.status})`,
    );
  }
  if (body.success === false) {
    throw new Error(
      typeof body.message === "string" ? body.message : "Revizyon yüklenemedi.",
    );
  }
  return normalizeRevision(body.data ?? {});
}
