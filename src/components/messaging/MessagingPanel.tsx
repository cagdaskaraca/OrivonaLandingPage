"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  fetchConversationMessages,
  fetchConversations,
  sendConversationMessage,
} from "@/src/lib/api";
import { formatUiErrorMessage, logApiError } from "@/src/lib/api/client";
import type { ChatMessage, Conversation, UserRole } from "@/src/lib/api/types";
import {
  getConversationSubtitle,
  getConversationTitle,
  resolveMessageFromMe,
} from "@/src/lib/messaging";
import { formatChatTimestamp, formatRelativeTime } from "@/src/lib/relativeTime";
import { btnPrimary, btnSecondary, glassCard, inputClass } from "@/src/lib/ui";

const CONVERSATION_POLL_MS = 5000;
const MESSAGE_POLL_MS = 4000;

type MessagingPanelProps = {
  viewerRole: Extract<UserRole, "Customer" | "Vendor">;
  initialConversationId?: string | null;
};

function sortConversations(list: Conversation[]): Conversation[] {
  return [...list].sort((a, b) => {
    const ta = new Date(a.lastMessageAt ?? a.updatedAt ?? a.createdAt ?? 0).getTime();
    const tb = new Date(b.lastMessageAt ?? b.updatedAt ?? b.createdAt ?? 0).getTime();
    return tb - ta;
  });
}

function sortMessages(list: ChatMessage[]): ChatMessage[] {
  return [...list].sort((a, b) => {
    const ta = new Date(a.createdAt ?? 0).getTime();
    const tb = new Date(b.createdAt ?? 0).getTime();
    return ta - tb;
  });
}

export function MessagingPanel({
  viewerRole,
  initialConversationId,
}: MessagingPanelProps) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const appliedInitialRef = useRef(false);

  const loadConversations = useCallback(async (silent = false) => {
    if (!silent) setListLoading(true);
    try {
      const list = await fetchConversations();
      setConversations(sortConversations(list));
      setListError(null);
    } catch (err) {
      logApiError("Conversations fetch failed", err);
      if (!silent) {
        setListError(
          formatUiErrorMessage(err, "Konuşmalar yüklenemedi."),
        );
      }
    } finally {
      if (!silent) setListLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string, silent = false) => {
      if (!silent) setMessagesLoading(true);
      try {
        const list = await fetchConversationMessages(conversationId);
        setMessages(sortMessages(list));
        setMessagesError(null);
      } catch (err) {
        logApiError("Messages fetch failed", err);
        if (!silent) {
          setMessagesError(
            formatUiErrorMessage(err, "Mesajlar yüklenemedi."),
          );
        }
      } finally {
        if (!silent) setMessagesLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      void loadConversations(true);
    }, CONVERSATION_POLL_MS);
    return () => clearInterval(interval);
  }, [loadConversations]);

  useEffect(() => {
    if (appliedInitialRef.current || !initialConversationId) return;
    if (listLoading) return;
    appliedInitialRef.current = true;
    setSelectedId(initialConversationId);
  }, [initialConversationId, listLoading]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedId);
  }, [selectedId, loadMessages]);

  useEffect(() => {
    if (!selectedId) return;
    const interval = setInterval(() => {
      void loadMessages(selectedId, true);
      void loadConversations(true);
    }, MESSAGE_POLL_MS);
    return () => clearInterval(interval);
  }, [selectedId, loadMessages, loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedId]);

  const selectedConversation = conversations.find(
    (c) => c.id != null && String(c.id) === selectedId,
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    const text = draft.trim();
    if (!text) return;

    setSending(true);
    const optimistic: ChatMessage = {
      content: text,
      createdAt: new Date().toISOString(),
      isFromMe: true,
      senderId: user?.id,
      senderRole: viewerRole,
    };
    setDraft("");
    setMessages((prev) => [...prev, optimistic]);
    try {
      const sent = await sendConversationMessage(selectedId, { message: text });
      setMessages((prev) => {
        const withoutLast = prev.slice(0, -1);
        return sortMessages([...withoutLast, sent]);
      });
      setMessagesError(null);
      await loadConversations(true);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      setDraft(text);
      logApiError("Send message failed", err);
      setMessagesError(
        formatUiErrorMessage(err, "Mesaj gönderilemedi."),
      );
    } finally {
      setSending(false);
    }
  }

  const totalUnread = conversations.reduce(
    (sum, c) => sum + (c.unreadCount ?? 0),
    0,
  );

  return (
    <div className={`${glassCard} mb-8`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Mesajlar</h2>
          <p className="mt-1 text-sm text-zinc-400">
            {viewerRole === "Customer"
              ? "İşletmelerle yazışmalarınız"
              : "Müşterilerinizle yazışmalarınız"}
          </p>
        </div>
        {totalUnread > 0 ? (
          <span className="rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-xs font-semibold text-violet-100">
            {totalUnread} okunmamış
          </span>
        ) : null}
      </div>

      <div className="grid min-h-[420px] gap-0 overflow-hidden rounded-2xl border border-white/10 bg-black/20 lg:grid-cols-[minmax(0,280px)_1fr]">
        <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
          {listLoading && conversations.length === 0 ? (
            <div className="space-y-0 divide-y divide-white/[0.06] p-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="animate-pulse px-3 py-4">
                  <div className="h-3.5 w-2/3 rounded bg-white/[0.08]" />
                  <div className="mt-2 h-3 w-full rounded bg-white/[0.05]" />
                </div>
              ))}
            </div>
          ) : listError && conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-red-300/90">{listError}</p>
              <button
                type="button"
                className={`${btnSecondary} mt-3 px-4 py-2 text-xs`}
                onClick={() => void loadConversations()}
              >
                Tekrar dene
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-200">
                Henüz konuşma yok
              </p>
              <p className="mt-1.5 text-xs text-zinc-500">
                {viewerRole === "Customer"
                  ? "Marketplace'ten bir hizmete Mesaj Gönder ile başlayın."
                  : "Müşteriler size yazdığında burada görünür."}
              </p>
            </div>
          ) : (
            <ul className="max-h-[min(420px,50vh)] divide-y divide-white/[0.06] overflow-y-auto lg:max-h-[480px]">
              {conversations.map((conversation) => {
                const id = conversation.id;
                if (id == null) return null;
                const idStr = String(id);
                const isActive = selectedId === idStr;
                const unread = (conversation.unreadCount ?? 0) > 0;
                const title = getConversationTitle(conversation, viewerRole);
                const subtitle = getConversationSubtitle(
                  conversation,
                  viewerRole,
                );
                return (
                  <li key={idStr}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(idStr)}
                      className={`w-full px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] ${
                        isActive
                          ? "bg-violet-500/[0.12] ring-1 ring-inset ring-violet-400/20"
                          : unread
                            ? "bg-violet-500/[0.05]"
                            : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`truncate text-sm ${
                            unread ? "font-semibold text-white" : "font-medium text-zinc-200"
                          }`}
                        >
                          {title}
                        </p>
                        {(conversation.unreadCount ?? 0) > 0 ? (
                          <span className="shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-500 px-1.5 py-0.5 text-[10px] font-bold text-[#0a0612]">
                            {conversation.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      {subtitle ? (
                        <p className="mt-0.5 truncate text-xs text-violet-200/70">
                          {subtitle}
                        </p>
                      ) : null}
                      {conversation.lastMessage ? (
                        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                          {conversation.lastMessage}
                        </p>
                      ) : null}
                      {conversation.lastMessageAt ? (
                        <p className="mt-1 text-[11px] text-zinc-600">
                          {formatRelativeTime(conversation.lastMessageAt)}
                        </p>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex min-h-[320px] flex-col">
          {!selectedId ? (
            <div className="flex flex-1 items-center justify-center px-6 py-12 text-center">
              <p className="text-sm text-zinc-500">
                Mesajları görmek için bir konuşma seçin.
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-sm font-semibold text-white">
                  {selectedConversation
                    ? getConversationTitle(selectedConversation, viewerRole)
                    : "Konuşma"}
                </p>
                {selectedConversation &&
                getConversationSubtitle(selectedConversation, viewerRole) ? (
                  <p className="text-xs text-zinc-500">
                    {getConversationSubtitle(selectedConversation, viewerRole)}
                  </p>
                ) : null}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messagesLoading && messages.length === 0 ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`animate-pulse h-12 max-w-[75%] rounded-2xl bg-white/[0.06] ${
                          i % 2 === 0 ? "ml-auto" : ""
                        }`}
                      />
                    ))}
                  </div>
                ) : messagesError && messages.length === 0 ? (
                  <div className="text-center">
                    <p className="text-sm text-red-300/90">{messagesError}</p>
                    <button
                      type="button"
                      className={`${btnSecondary} mt-3 px-4 py-2 text-xs`}
                      onClick={() =>
                        selectedId && void loadMessages(selectedId)
                      }
                    >
                      Tekrar dene
                    </button>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="text-center text-sm text-zinc-500">
                    Henüz mesaj yok. İlk mesajı gönderin.
                  </p>
                ) : (
                  messages.map((msg, index) => {
                    const fromMe = resolveMessageFromMe(
                      msg,
                      viewerRole,
                      user?.id,
                    );
                    const key = msg.id != null ? String(msg.id) : `local-${index}`;
                    return (
                      <div
                        key={key}
                        className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            fromMe
                              ? "rounded-br-md bg-gradient-to-br from-violet-500/35 to-fuchsia-500/20 text-white"
                              : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                            {msg.content?.trim() || "—"}
                          </p>
                          {msg.createdAt ? (
                            <p
                              className={`mt-1 text-[10px] ${
                                fromMe ? "text-violet-100/70" : "text-zinc-500"
                              }`}
                            >
                              {formatChatTimestamp(msg.createdAt)}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <form
                onSubmit={handleSend}
                className="flex gap-2 border-t border-white/10 p-4"
              >
                <input
                  className={inputClass}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Mesajınızı yazın…"
                  maxLength={2000}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={`${btnPrimary} shrink-0 px-5`}
                  disabled={sending || !draft.trim()}
                >
                  {sending ? "…" : "Gönder"}
                </button>
              </form>
              {messagesError && messages.length > 0 ? (
                <p className="border-t border-white/10 px-4 py-2 text-center text-xs text-red-300/80">
                  {messagesError}
                </p>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
