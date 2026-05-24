"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchConversations, fetchNotifications } from "@/src/lib/api";
import { logApiError } from "@/src/lib/api/client";
import type { AppNotification } from "@/src/lib/api/types";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  mergeBellNotifications,
  sumConversationUnread,
} from "@/src/lib/notificationMessages";

const POLL_MS = 45_000;

export function useBellNotifications(options?: { enabled?: boolean }) {
  const { role, isAuthenticated, loading: authLoading } = useAuth();
  const enabled = options?.enabled !== false && isAuthenticated && !authLoading;

  const [items, setItems] = useState<AppNotification[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [messageUnread, setMessageUnread] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!enabled) {
      setItems([]);
      setBadgeCount(0);
      setMessageUnread(0);
      return;
    }
    setLoading(true);
    try {
      const [apiItems, conversations] = await Promise.all([
        fetchNotifications(),
        fetchConversations().catch((err) => {
          logApiError("Conversations for bell", err);
          return [];
        }),
      ]);
      const unreadMessages = sumConversationUnread(conversations);
      const merged = mergeBellNotifications(apiItems, unreadMessages, role);
      setItems(merged.items);
      setBadgeCount(merged.badgeCount);
      setMessageUnread(unreadMessages);
    } catch (err) {
      logApiError("Bell notifications load", err);
      setItems([]);
      setBadgeCount(0);
      setMessageUnread(0);
    } finally {
      setLoading(false);
    }
  }, [enabled, role]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [enabled, load]);

  return {
    items,
    badgeCount,
    messageUnread,
    loading,
    reload: load,
  };
}
