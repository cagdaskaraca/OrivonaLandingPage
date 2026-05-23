import {
  apiGetPublicRaw,
  apiPostPublicRaw,
  apiPostRaw,
} from "@/src/lib/api/client";
import { recordBool, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  InviteDetails,
  InviteTicket,
  PublicInviteRsvpPayload,
  SendInvitePayload,
  SendInviteResult,
  SendInvitesBulkPayload,
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

function parseSendInviteResult(envelope: ApiEnvelope): SendInviteResult {
  const payload = extractPayload(envelope.data ?? envelope);
  const o =
    payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : {};
  const demoMode =
    recordBool(o, "demoMode", "DemoMode") ??
    (typeof envelope.message === "string" &&
    envelope.message.toLowerCase().includes("demo")
      ? true
      : undefined);
  const inviteUrl =
    recordStr(o, "inviteUrl", "InviteUrl") ??
    recordStr(o, "inviteLink", "InviteLink");
  return {
    demoMode: demoMode ?? false,
    inviteUrl,
    message:
      typeof envelope.message === "string" ? envelope.message : undefined,
  };
}

export function normalizeInviteDetails(raw: unknown): InviteDetails {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const plusOneAllowed =
    recordBool(o, "plusOneAllowed", "PlusOneAllowed") ??
    recordBool(o, "allowPlusOne", "AllowPlusOne");
  return {
    token: recordStr(o, "token", "Token"),
    eventTitle:
      recordStr(o, "eventTitle", "EventTitle") ??
      recordStr(o, "title", "Title"),
    guestName:
      recordStr(o, "guestName", "GuestName") ??
      recordStr(o, "fullName", "FullName"),
    hostName:
      recordStr(o, "hostName", "HostName") ??
      recordStr(o, "organizerName", "OrganizerName"),
    eventDate:
      recordStr(o, "eventDate", "EventDate") ??
      recordStr(o, "date", "Date"),
    eventLocation: recordStr(o, "eventLocation", "EventLocation"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    customMessage:
      recordStr(o, "customMessage", "CustomMessage") ??
      recordStr(o, "message", "Message"),
    message: recordStr(o, "message", "Message"),
    plusOneAllowed: plusOneAllowed ?? true,
    maxPlusOne:
      recordNum(o, "maxPlusOne", "MaxPlusOne") ??
      recordNum(o, "plusOneLimit", "PlusOneLimit") ??
      5,
    allowPlusOne: plusOneAllowed,
    rsvpStatus: recordStr(o, "rsvpStatus", "RsvpStatus"),
    alreadyResponded:
      recordBool(o, "alreadyResponded", "AlreadyResponded") ??
      recordBool(o, "hasResponded", "HasResponded"),
    hasResponded: recordBool(o, "hasResponded", "HasResponded"),
  };
}

export function normalizeInviteTicket(raw: unknown): InviteTicket {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  return {
    eventTitle:
      recordStr(o, "eventTitle", "EventTitle") ??
      recordStr(o, "title", "Title"),
    guestName:
      recordStr(o, "guestName", "GuestName") ??
      recordStr(o, "fullName", "FullName"),
    ticketCode:
      recordStr(o, "ticketCode", "TicketCode") ??
      recordStr(o, "code", "Code"),
    qrText:
      recordStr(o, "qrText", "QrText") ??
      recordStr(o, "qrCodeText", "QrCodeText"),
    qrCodeUrl:
      recordStr(o, "qrCodeUrl", "QrCodeUrl") ??
      recordStr(o, "qrImageUrl", "QrImageUrl"),
    qrImageUrl: recordStr(o, "qrImageUrl", "QrImageUrl"),
    plusOneCount: recordNum(o, "plusOneCount", "PlusOneCount"),
  };
}

function inviteMessageBody(payload: SendInvitePayload): Record<string, unknown> {
  const message =
    payload.customMessage?.trim() ?? payload.message?.trim() ?? "";
  return {
    message,
    customMessage: message,
  };
}

export async function sendGuestInvite(
  planId: string | number,
  guestId: string | number,
  payload: SendInvitePayload,
): Promise<SendInviteResult> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/${guestId}/send-invite`,
    inviteMessageBody(payload),
  );
  assertSuccess(body);
  return parseSendInviteResult(body);
}

export async function sendGuestInvitesBulk(
  planId: string | number,
  payload: SendInvitesBulkPayload,
): Promise<SendInviteResult> {
  const message =
    payload.customMessage?.trim() ?? payload.message?.trim() ?? "";
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/guests/send-invites-bulk`,
    {
      guestIds: payload.guestIds,
      message,
      customMessage: message,
    },
  );
  assertSuccess(body);
  return parseSendInviteResult(body);
}

export async function fetchInviteByToken(token: string): Promise<InviteDetails> {
  const body = await apiGetPublicRaw<ApiEnvelope>(`/invites/${token}`);
  assertSuccess(body);
  return normalizeInviteDetails(extractPayload(body.data) ?? body.data);
}

export async function submitInviteRsvp(
  token: string,
  payload: PublicInviteRsvpPayload,
): Promise<InviteDetails> {
  const body = await apiPostPublicRaw<ApiEnvelope>(`/invites/${token}/rsvp`, {
    rsvpStatus: payload.rsvpStatus,
    plusOneCount: payload.plusOneCount ?? 0,
    note: payload.note?.trim() ?? "",
  });
  assertSuccess(body);
  return normalizeInviteDetails(extractPayload(body.data) ?? body.data);
}

export async function fetchInviteTicket(token: string): Promise<InviteTicket> {
  const body = await apiGetPublicRaw<ApiEnvelope>(`/invites/${token}/ticket`);
  assertSuccess(body);
  return normalizeInviteTicket(extractPayload(body.data) ?? body.data);
}
