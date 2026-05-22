import type { ChatMessage, Conversation, UserRole } from "@/src/lib/api/types";
import { normalizeRole } from "@/src/lib/auth";

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

export function resolveMessageFromMe(
  message: ChatMessage,
  viewerRole: UserRole,
  userId?: string | number,
): boolean {
  if (message.isFromMe === true) return true;
  if (message.isFromMe === false) return false;
  const senderRole = normalizeRole(message.senderRole);
  if (senderRole && senderRole === viewerRole) return true;
  if (userId != null && message.senderId != null) {
    return String(message.senderId) === String(userId);
  }
  return false;
}
