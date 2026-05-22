import type { AuthUser, ChatMessage, Conversation, UserRole } from "@/src/lib/api/types";

const warnedMissingSender = new Set<string>();

export function getConversationTitle(
  conversation: Conversation,
  viewerRole: UserRole,
): string {
  if (viewerRole === "Customer") {
    return (
      conversation.vendorName?.trim() ||
      conversation.serviceTitle?.trim() ||
      "İşletme"
    );
  }
  return conversation.customerName?.trim() || "Müşteri";
}

export function getConversationSubtitle(
  conversation: Conversation,
  viewerRole: UserRole,
): string | undefined {
  if (viewerRole === "Customer" && conversation.serviceTitle?.trim()) {
    return conversation.serviceTitle.trim();
  }
  if (viewerRole === "Vendor" && conversation.serviceTitle?.trim()) {
    return conversation.serviceTitle.trim();
  }
  return undefined;
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
): string {
  if (fromMe) return "Siz";
  return message.senderName?.trim() || "Karşı taraf";
}
