import type { AuthUser, ChatMessage, Conversation, UserRole } from "@/src/lib/api/types";

const warnedMissingSender = new Set<string>();

const GENERIC_CUSTOMER_LABELS = new Set(
  ["müşteri", "musteri", "customer", "user", "kullanıcı", "kullanici"].map((s) =>
    s.toLocaleLowerCase("tr"),
  ),
);

function firstNonEmpty(...values: (string | undefined | null)[]): string | undefined {
  for (const v of values) {
    const t = v?.trim();
    if (t) return t;
  }
  return undefined;
}

function isGenericCustomerLabel(value: string): boolean {
  return GENERIC_CUSTOMER_LABELS.has(value.trim().toLocaleLowerCase("tr"));
}

/** Masks each name part for vendor-side customer privacy. */
export function maskFullName(fullName: string): string {
  const trimmed = fullName.trim();
  if (!trimmed) return "";

  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => {
      if (part.length > 3) {
        return part.slice(0, 3) + "*".repeat(part.length - 3);
      }
      if (part.length <= 1) return part;
      return part.slice(0, 1) + "*".repeat(part.length - 1);
    })
    .join(" ");
}

/** Masks email local part: cagdaskrc@gmail.com -> cag****** */
export function maskEmail(email: string): string {
  const trimmed = email.trim();
  if (!trimmed) return "";

  const at = trimmed.indexOf("@");
  const local = (at >= 0 ? trimmed.slice(0, at) : trimmed).trim();
  if (!local) return "";

  if (local.length > 3) {
    return local.slice(0, 3) + "*".repeat(local.length - 3);
  }
  if (local.length <= 1) return local;
  return local.slice(0, 1) + "*".repeat(local.length - 1);
}

export type CustomerIdentity = {
  name?: string;
  email?: string;
};

/** Raw customer identity from conversation and/or message (unmasked). */
export function resolveCustomerIdentity(
  conversation?: Conversation | null,
  message?: ChatMessage,
): CustomerIdentity {
  const name = firstNonEmpty(
    message?.senderFullName,
    message?.senderName,
    message?.customerFullName,
    message?.customerName,
    conversation?.customerFullName,
    conversation?.customerName,
  );
  const email = firstNonEmpty(
    message?.senderEmail,
    message?.customerEmail,
    conversation?.customerEmail,
  );

  const cleanName =
    name && !isGenericCustomerLabel(name) ? name : undefined;

  return { name: cleanName, email };
}

/** Masked display for vendor view. */
export function maskCustomerDisplay(identity: CustomerIdentity): string | undefined {
  if (identity.name) {
    const masked = maskFullName(identity.name);
    if (masked) return masked;
  }
  if (identity.email) {
    const masked = maskEmail(identity.email);
    if (masked) return masked;
  }
  return undefined;
}

export function resolveVendorBusinessName(
  conversation?: Conversation | null,
  message?: ChatMessage,
): string | undefined {
  return firstNonEmpty(
    message?.senderBusinessName,
    message?.vendorBusinessName,
    message?.businessName,
    message?.vendorName,
    conversation?.vendorBusinessName,
    conversation?.vendorName,
    conversation?.businessName,
  );
}

/** @deprecated Prefer resolveCustomerIdentity */
export function resolveCustomerFullName(
  conversation?: Conversation | null,
  message?: ChatMessage,
): string | undefined {
  const { name, email } = resolveCustomerIdentity(conversation, message);
  return name ?? email;
}

/** Customer view: vendor business name, else service title. */
export function getCustomerViewOtherPartyLabel(
  conversation?: Conversation | null,
  message?: ChatMessage,
): string {
  return (
    resolveVendorBusinessName(conversation, message) ??
    conversation?.serviceTitle?.trim() ??
    "İşletme"
  );
}

/** Vendor view: masked customer name or email prefix. */
export function getVendorViewOtherPartyLabel(
  conversation?: Conversation | null,
  message?: ChatMessage,
): string {
  return (
    maskCustomerDisplay(resolveCustomerIdentity(conversation, message)) ??
    "Müşteri"
  );
}

export function getOtherPartyLabel(
  viewerRole: UserRole,
  conversation?: Conversation | null,
  message?: ChatMessage,
): string {
  if (viewerRole === "Customer") {
    return getCustomerViewOtherPartyLabel(conversation, message);
  }
  if (viewerRole === "Vendor") {
    return getVendorViewOtherPartyLabel(conversation, message);
  }
  const masked = maskCustomerDisplay(
    resolveCustomerIdentity(conversation, message),
  );
  return masked ?? "Müşteri";
}

export function getConversationParticipantName(
  conversation: Conversation,
  viewerRole: UserRole,
): string {
  return getOtherPartyLabel(viewerRole, conversation);
}

/** @deprecated Use getConversationParticipantName */
export function getConversationTitle(
  conversation: Conversation,
  viewerRole: UserRole,
): string {
  return getConversationParticipantName(conversation, viewerRole);
}

const CONVERSATION_PREVIEW_MAX = 72;

function normalizePreviewText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function previewKey(text: string): string {
  return normalizePreviewText(text).toLocaleLowerCase("tr");
}

/** Labels that must not appear as last-message preview (participant / title duplicates). */
function collectParticipantPreviewKeys(
  conversation: Conversation,
  viewerRole: UserRole,
): Set<string> {
  const keys = new Set<string>();
  const add = (value?: string | null) => {
    const t = value?.trim();
    if (t) keys.add(previewKey(t));
  };

  add(getConversationParticipantName(conversation, viewerRole));
  add(resolveVendorBusinessName(conversation));
  add(conversation.vendorName);
  add(conversation.vendorBusinessName);
  add(conversation.businessName);
  add(conversation.serviceTitle);
  const identity = resolveCustomerIdentity(conversation);
  add(identity.name);
  add(identity.email);
  add(conversation.customerName);
  add(conversation.customerFullName);
  add(conversation.customerEmail);
  const masked = maskCustomerDisplay(identity);
  if (masked) add(masked);

  return keys;
}

function previewMatchesParticipantLabel(
  preview: string,
  conversation: Conversation,
  viewerRole: UserRole,
): boolean {
  return collectParticipantPreviewKeys(conversation, viewerRole).has(
    previewKey(preview),
  );
}

/**
 * Second line in conversation list: last message only, never the participant name.
 */
export function getConversationLastMessagePreview(
  conversation: Conversation,
  viewerRole: UserRole,
  maxLength = CONVERSATION_PREVIEW_MAX,
): string {
  const raw = conversation.lastMessage?.trim();
  if (!raw) return "Henüz mesaj yok";

  const normalized = normalizePreviewText(raw);
  if (
    !normalized ||
    previewMatchesParticipantLabel(normalized, conversation, viewerRole)
  ) {
    return "Henüz mesaj yok";
  }

  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}…`;
}

/** Current session user id (id or userId from auth). */
export function getAuthUserId(user?: AuthUser | null): string | undefined {
  if (!user) return undefined;
  const raw = user.id ?? user.userId;
  if (raw == null || raw === "") return undefined;
  return String(raw);
}

/** Resolved sender id from API message fields. */
export function getMessageSenderId(message: ChatMessage): string | undefined {
  for (const candidate of [
    message.senderUserId,
    message.senderId,
    message.userId,
  ]) {
    if (candidate == null || candidate === "") continue;
    return String(candidate);
  }
  return undefined;
}

function warnMissingSender(message: ChatMessage): void {
  const key =
    message.id != null
      ? `id:${message.id}`
      : `t:${message.createdAt ?? ""}:${message.content?.slice(0, 24) ?? ""}`;
  if (warnedMissingSender.has(key)) return;
  warnedMissingSender.add(key);
  console.warn(
    "[ORIVONA messaging] Message missing sender id; showing as incoming.",
    message,
  );
}

/**
 * True when the message was sent by the logged-in user (right / purple bubble).
 */
export function resolveMessageFromMe(
  message: ChatMessage,
  currentUserId?: string | number,
): boolean {
  const currentId =
    currentUserId != null && currentUserId !== ""
      ? String(currentUserId)
      : undefined;
  const senderId = getMessageSenderId(message);

  if (currentId && senderId) {
    return senderId === currentId;
  }

  if (message.isFromMe === true) return true;
  if (message.isFromMe === false) return false;

  if (!senderId) {
    warnMissingSender(message);
    return false;
  }

  return false;
}

export function getMessageSenderLabel(
  message: ChatMessage,
  fromMe: boolean,
  viewerRole: UserRole,
  conversation?: Conversation | null,
): string {
  if (fromMe) return "Siz";
  return getOtherPartyLabel(viewerRole, conversation, message);
}
