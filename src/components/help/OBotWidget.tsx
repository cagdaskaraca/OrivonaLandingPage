"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { CustomerAuthPromptModal } from "@/src/components/auth/CustomerAuthPromptModal";
import { useAuth } from "@/src/contexts/AuthContext";
import { postHelpAssistant, welcomeReply } from "@/src/lib/api/helpAssistant";
import { getSafeReturnUrl } from "@/src/lib/authRedirect";
import {
  executeObotAction,
  requiresCustomerAuth,
  resolveObotAction,
} from "@/src/lib/obot/actions";
import { getObotFallbackReply } from "@/src/lib/obot/fallback";
import { OBOT_QUICK_QUESTIONS } from "@/src/lib/obot/suggestedQuestions";
import type {
  HelpAssistantRole,
  OBotAction,
  OBotChatMessage,
} from "@/src/lib/obot/types";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

const PULSE_KEY = "orivona_obot_intro_seen";

type OBotWidgetProps = {
  role: HelpAssistantRole;
};

function newMessageId(): string {
  return `m-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function OBotIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        d="M12 3c-4 0-7 2.5-7 6v2c0 1.5.6 2.9 1.6 4L5 19l3.2-1.2C9.4 18.3 10.6 18.5 12 18.5c4 0 7-2.5 7-6s-3-6-7-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path
        d="M17 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

export function OBotWidget({ role }: OBotWidgetProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { isAuthenticated, role: authRole } = useAuth();
  const panelId = useId();
  const inputId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<OBotChatMessage[]>([]);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const quickQuestions = OBOT_QUICK_QUESTIONS[role];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(PULSE_KEY);
    if (!seen) setPulse(true);
  }, []);

  useEffect(() => {
    if (!open || messages.length > 0) return;
    const welcome = welcomeReply(role);
    setMessages([
      {
        id: newMessageId(),
        role: "bot",
        text: welcome.answer,
        actions: welcome.actions,
        suggestedQuestions: welcome.suggestedQuestions ?? quickQuestions.slice(0, 4),
      },
    ]);
  }, [open, messages.length, role, quickQuestions]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  const dismissPulse = useCallback(() => {
    setPulse(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PULSE_KEY, "1");
    }
  }, []);

  const closePanel = useCallback(() => {
    setOpen(false);
  }, []);

  const handleAction = useCallback(
    (action: OBotAction, e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();

      const resolved = resolveObotAction(action);

      if (
        requiresCustomerAuth(resolved) &&
        (role === "anonymous" || !isAuthenticated || authRole !== "Customer")
      ) {
        setAuthPromptOpen(true);
        return;
      }

      executeObotAction(router, resolved, { closePanel });
    },
    [router, closePanel, role, isAuthenticated, authRole],
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      dismissPulse();
      setInput("");
      setMessages((prev) => [
        ...prev,
        { id: newMessageId(), role: "user", text: trimmed },
      ]);
      setLoading(true);

      let reply =
        (await postHelpAssistant(trimmed, role)) ??
        getObotFallbackReply(trimmed, role);

      if (!reply.suggestedQuestions?.length) {
        reply = {
          ...reply,
          suggestedQuestions: quickQuestions.slice(0, 4),
        };
      }

      setMessages((prev) => [
        ...prev,
        {
          id: newMessageId(),
          role: "bot",
          text: reply.answer,
          actions: reply.actions,
          suggestedQuestions: reply.suggestedQuestions,
        },
      ]);
      setLoading(false);
    },
    [loading, role, quickQuestions, dismissPulse],
  );

  const returnUrl =
    getSafeReturnUrl(
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : pathname,
    ) ?? "/customer/dashboard";

  return (
    <>
    <CustomerAuthPromptModal
      open={authPromptOpen}
      reason="login"
      returnUrl={returnUrl}
      onClose={() => setAuthPromptOpen(false)}
    />
    <div
      className="orivona-obot-root pointer-events-none fixed z-[500] flex flex-col items-end gap-3"
      style={{
        right: "max(0.75rem, env(safe-area-inset-right))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div
        id={panelId}
        role="dialog"
        aria-label="OBot yardım asistanı"
        aria-hidden={!open}
        className={`orivona-obot-panel pointer-events-auto flex w-[min(100vw-1.5rem,22rem)] flex-col overflow-hidden rounded-2xl border border-violet-400/25 bg-[#0c0818]/95 shadow-[0_24px_64px_-12px_rgba(76,29,149,0.55)] backdrop-blur-xl sm:w-[24rem] ${
          open ? "orivona-obot-panel-open" : "orivona-obot-panel-closed"
        }`}
      >
        <header className="flex items-center justify-between gap-2 border-b border-white/10 bg-violet-500/[0.08] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/20 text-violet-100">
              <OBotIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">OBot</p>
              <p className="text-[11px] text-zinc-500">Nasıl yaparım?</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Kapat"
            onClick={() => setOpen(false)}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div
          ref={listRef}
          className="orivona-obot-messages max-h-[min(50vh,20rem)] min-h-[10rem] flex-1 space-y-3 overflow-y-auto overscroll-contain px-3 py-3 sm:max-h-[min(52vh,22rem)]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[92%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-violet-600/90 to-fuchsia-600/80 text-white"
                    : "border border-white/10 bg-white/[0.04] text-zinc-200"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.role === "bot" && msg.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((action) => {
                      const resolved = resolveObotAction(action);
                      return (
                        <button
                          key={resolved.id}
                          type="button"
                          className={`${btnSecondary} !px-3 !py-1.5 text-[11px]`}
                          onClick={(e) => handleAction(resolved, e)}
                        >
                          {resolved.label}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
                {msg.role === "bot" && msg.suggestedQuestions?.length ? (
                  <div className="mt-3 border-t border-white/[0.06] pt-2">
                    <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                      Önerilen sorular
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedQuestions.map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="rounded-full border border-violet-400/20 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-100 transition-colors hover:bg-violet-500/20"
                          onClick={() => void sendMessage(q)}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {loading ? (
            <p className="text-center text-xs text-zinc-500">OBot düşünüyor…</p>
          ) : null}
        </div>

        <form
          className="border-t border-white/10 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            void sendMessage(input);
          }}
        >
          <label htmlFor={inputId} className="sr-only">
            Sorunuzu yazın
          </label>
          <div className="flex gap-2">
            <input
              id={inputId}
              type="text"
              className={`${inputClass} min-h-0 flex-1 !py-2.5 text-sm`}
              placeholder="Sorunuzu yazın…"
              value={input}
              disabled={loading}
              onChange={(e) => setInput(e.target.value)}
              autoComplete="off"
            />
            <button
              type="submit"
              className={`${btnPrimary} shrink-0 !px-4 !py-2.5 text-xs`}
              disabled={loading || !input.trim()}
            >
              Gönder
            </button>
          </div>
        </form>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={`orivona-obot-launcher pointer-events-auto flex items-center gap-2 rounded-full border border-violet-400/35 bg-gradient-to-br from-violet-600/95 to-fuchsia-700/90 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-8px_rgba(109,40,217,0.65)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_16px_48px_-8px_rgba(109,40,217,0.75)] ${
          pulse && !open ? "orivona-obot-launcher-pulse" : ""
        }`}
        onClick={() => {
          dismissPulse();
          setOpen((o) => !o);
        }}
      >
        <OBotIcon className="h-5 w-5 shrink-0" />
        <span>OBot</span>
      </button>
    </div>
    </>
  );
}
