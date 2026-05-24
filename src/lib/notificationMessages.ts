import type { AppNotification, Conversation, UserRole } from "@/src/lib/api/types";
import { getDashboardPathForRole } from "@/src/lib/auth";

/** Stable id for client-only unread-messages row (not sent to API). */
export const SYNTHETIC_UNREAD_MESSAGES_ID = "__orivona_synthetic_unread_messages__";

export function getMessagesDashboardHref(
  role: UserRole | null,
): string {
  const base = getDashboardPathForRole(
    role === "Vendor" ? "Vendor" : role === "Admin" ? "Admin" : "Customer",
  );
  return `${base}#dashboard-messages`;
}

export function sumConversationUnread(
  conversations: Conversation[],
): number {
  return conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
}

function notificationText(n: AppNotification): string {
  return [n.title, n.message, n.type, n.actionUrl].filter(Boolean).join(" ");
}

/** Message-related API notification (e.g. MessageReceived). */
export function isMessageNotification(n: AppNotification): boolean {
  if (n.synthetic) return true;
  const type = n.type?.trim().toLowerCase() ?? "";
  if (
    type.includes("message") ||
    type.includes("mesaj") ||
    type === "messagereceived"
  ) {
    return true;
  }
  const text = notificationText(n).toLowerCase();
  return (
    text.includes("mesaj") ||
    text.includes("message received") ||
    text.includes("new message") ||
    text.includes("yeni mesaj")
  );
}

export function withMessagesActionUrl(
  n: AppNotification,
  role: UserRole | null,
): AppNotification {
  if (!isMessageNotification(n) || n.actionUrl?.trim()) return n;
  return { ...n, actionUrl: getMessagesDashboardHref(role) };
}

export function createSyntheticUnreadMessagesNotification(
  role: UserRole | null,
  unreadCount: number,
): AppNotification {
  const countLabel = unreadCount > 1 ? ` (${unreadCount})` : "";
  return {
    id: SYNTHETIC_UNREAD_MESSAGES_ID,
    title: "Yeni mesajınız var",
    message: `Okunmamış mesajlarınızı görüntüleyin${countLabel}.`,
    createdAt: new Date().toISOString(),
    isRead: false,
    actionUrl: getMessagesDashboardHref(role),
    synthetic: true,
  };
}

export function hasUnreadMessageNotification(
  items: AppNotification[],
): boolean {
  return items.some((n) => !n.isRead && isMessageNotification(n));
}

export type MergedBellNotifications = {
  items: AppNotification[];
  badgeCount: number;
  messageUnread: number;
  showSynthetic: boolean;
};

export function mergeBellNotifications(
  apiItems: AppNotification[],
  messageUnread: number,
  role: UserRole | null,
): MergedBellNotifications {
  const enriched = apiItems.map((n) => withMessagesActionUrl(n, role));
  const showSynthetic =
    messageUnread > 0 && !hasUnreadMessageNotification(enriched);

  const items = showSynthetic
    ? [
        createSyntheticUnreadMessagesNotification(role, messageUnread),
        ...enriched,
      ]
    : enriched;

  const unreadOther = enriched.filter(
    (n) => !n.isRead && !isMessageNotification(n),
  ).length;
  const unreadMessageNotifs = enriched.filter(
    (n) => !n.isRead && isMessageNotification(n),
  ).length;
  const messageBadge = showSynthetic
    ? 1
    : messageUnread > 0
      ? Math.max(unreadMessageNotifs, messageUnread)
      : unreadMessageNotifs;
  const badgeCount = unreadOther + messageBadge;

  return { items, badgeCount, messageUnread, showSynthetic };
}

export function isSyntheticNotification(
  n: AppNotification,
): boolean {
  return (
    n.synthetic === true ||
    n.id === SYNTHETIC_UNREAD_MESSAGES_ID
  );
}
