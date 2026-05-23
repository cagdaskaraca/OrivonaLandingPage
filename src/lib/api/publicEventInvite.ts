import {
  apiGetPublicRaw,
  apiGetRaw,
  apiPostPublicRaw,
  apiPostRaw,
} from "@/src/lib/api/client";
import { recordBool, recordNum, recordStr } from "@/src/lib/normalize";
import type {
  ApiEnvelope,
  EventInviteInfo,
  EventInviteRsvpPayload,
  InviteTicket,
  PublicEventInvite,
  VerifyGuestPayload,
  VerifyGuestResult,
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

export function normalizePublicEventInvite(raw: unknown): PublicEventInvite {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const disabled =
    recordBool(o, "disabled", "Disabled") ??
    recordBool(o, "isDisabled", "IsDisabled");
  const isActive =
    recordBool(o, "isActive", "IsActive") ??
    (disabled === true ? false : disabled === false ? true : undefined);
  return {
    token: recordStr(o, "token", "Token"),
    inviteUrl:
      recordStr(o, "inviteUrl", "InviteUrl") ??
      recordStr(o, "url", "Url"),
    welcomeMessage:
      recordStr(o, "welcomeMessage", "WelcomeMessage") ??
      recordStr(o, "message", "Message"),
    isActive,
    disabled,
  };
}

export function normalizeEventInviteInfo(raw: unknown): EventInviteInfo {
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
    eventType: recordStr(o, "eventType", "EventType"),
    eventDate:
      recordStr(o, "eventDate", "EventDate") ??
      recordStr(o, "date", "Date"),
    city: recordStr(o, "city", "City"),
    district: recordStr(o, "district", "District"),
    eventLocation: recordStr(o, "eventLocation", "EventLocation"),
    hostName:
      recordStr(o, "hostName", "HostName") ??
      recordStr(o, "organizerName", "OrganizerName"),
    welcomeMessage:
      recordStr(o, "welcomeMessage", "WelcomeMessage") ??
      recordStr(o, "customMessage", "CustomMessage"),
    message: recordStr(o, "message", "Message"),
    plusOneAllowed: plusOneAllowed ?? true,
    maxPlusOne:
      recordNum(o, "maxPlusOne", "MaxPlusOne") ??
      recordNum(o, "plusOneLimit", "PlusOneLimit") ??
      5,
    isActive: recordBool(o, "isActive", "IsActive"),
  };
}

export function normalizeVerifyGuestResult(raw: unknown): VerifyGuestResult {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const matched =
    recordBool(o, "matched", "Matched") ??
    recordBool(o, "isMatch", "IsMatch");
  return {
    matched: matched ?? !!recordStr(o, "guestAccessToken", "GuestAccessToken"),
    guestAccessToken:
      recordStr(o, "guestAccessToken", "GuestAccessToken") ??
      recordStr(o, "accessToken", "AccessToken"),
    guestName:
      recordStr(o, "guestName", "GuestName") ??
      recordStr(o, "fullName", "FullName"),
    maskedName:
      recordStr(o, "maskedName", "MaskedName") ??
      recordStr(o, "displayName", "DisplayName"),
    maskedPhone: recordStr(o, "maskedPhone", "MaskedPhone"),
    maskedEmail: recordStr(o, "maskedEmail", "MaskedEmail"),
    requiresEmail: recordBool(o, "requiresEmail", "RequiresEmail"),
    requiresPhone: recordBool(o, "requiresPhone", "RequiresPhone"),
    multipleMatches:
      recordBool(o, "multipleMatches", "MultipleMatches") ??
      recordBool(o, "ambiguous", "Ambiguous"),
    rsvpStatus: recordStr(o, "rsvpStatus", "RsvpStatus"),
    alreadyResponded:
      recordBool(o, "alreadyResponded", "AlreadyResponded") ??
      recordBool(o, "hasResponded", "HasResponded"),
  };
}

function normalizeInviteTicket(raw: unknown): InviteTicket {
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
    plusOneCount: recordNum(o, "plusOneCount", "PlusOneCount"),
    qrText:
      recordStr(o, "qrText", "QrText") ??
      recordStr(o, "qrCodeText", "QrCodeText"),
    qrCodeUrl:
      recordStr(o, "qrCodeUrl", "QrCodeUrl") ??
      recordStr(o, "qrImageUrl", "QrImageUrl"),
    qrImageUrl: recordStr(o, "qrImageUrl", "QrImageUrl"),
  };
}

// ——— Customer (authenticated) ———

export async function fetchEventPlanPublicInvite(
  planId: string | number,
): Promise<PublicEventInvite> {
  const body = await apiGetRaw<ApiEnvelope>(
    `/event-plans/${planId}/public-invite`,
  );
  assertSuccess(body);
  return normalizePublicEventInvite(extractPayload(body.data) ?? body.data);
}

export async function createEventPlanPublicInvite(
  planId: string | number,
  welcomeMessage?: string,
): Promise<PublicEventInvite> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/public-invite`,
    welcomeMessage?.trim()
      ? { welcomeMessage: welcomeMessage.trim(), message: welcomeMessage.trim() }
      : {},
  );
  assertSuccess(body);
  return normalizePublicEventInvite(extractPayload(body.data) ?? body.data);
}

export async function disableEventPlanPublicInvite(
  planId: string | number,
): Promise<void> {
  const body = await apiPostRaw<ApiEnvelope>(
    `/event-plans/${planId}/public-invite/disable`,
    {},
  );
  assertSuccess(body);
}

// ——— Public event invite ———

export async function fetchEventInviteByToken(
  token: string,
): Promise<EventInviteInfo> {
  const body = await apiGetPublicRaw<ApiEnvelope>(`/invites/event/${token}`);
  assertSuccess(body);
  return normalizeEventInviteInfo(extractPayload(body.data) ?? body.data);
}

export async function verifyEventInviteGuest(
  token: string,
  payload: VerifyGuestPayload,
): Promise<VerifyGuestResult> {
  const body = await apiPostPublicRaw<ApiEnvelope>(
    `/invites/event/${token}/verify-guest`,
    {
      fullName: payload.fullName.trim(),
      phone: payload.phone?.trim() ?? "",
      email: payload.email?.trim() ?? "",
    },
  );
  assertSuccess(body);
  return normalizeVerifyGuestResult(extractPayload(body.data) ?? body.data);
}

export async function submitEventInviteRsvp(
  token: string,
  payload: EventInviteRsvpPayload,
): Promise<VerifyGuestResult> {
  const body = await apiPostPublicRaw<ApiEnvelope>(
    `/invites/event/${token}/rsvp`,
    {
      guestAccessToken: payload.guestAccessToken,
      rsvpStatus: payload.rsvpStatus,
      plusOneCount: payload.plusOneCount ?? 0,
      note: payload.note?.trim() ?? "",
    },
  );
  assertSuccess(body);
  return normalizeVerifyGuestResult(extractPayload(body.data) ?? body.data);
}

export async function fetchEventInviteTicket(
  token: string,
  guestAccessToken: string,
): Promise<InviteTicket> {
  const body = await apiPostPublicRaw<ApiEnvelope>(
    `/invites/event/${token}/ticket`,
    { guestAccessToken },
  );
  assertSuccess(body);
  return normalizeInviteTicket(extractPayload(body.data) ?? body.data);
}
