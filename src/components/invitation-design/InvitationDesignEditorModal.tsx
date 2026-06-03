"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { btnSecondary } from "@/src/lib/ui";

let lockCount = 0;
let prevOverflow = "";
let prevHtmlOverflow = "";

function lockScroll() {
  lockCount += 1;
  if (lockCount !== 1) return;
  prevOverflow = document.body.style.overflow;
  prevHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  document.documentElement.setAttribute("data-invitation-editor-open", "");
}

function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount !== 0) return;
  document.body.style.overflow = prevOverflow;
  document.documentElement.style.overflow = prevHtmlOverflow;
  document.documentElement.removeAttribute("data-invitation-editor-open");
}

type InvitationDesignEditorModalProps = {
  open: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Canva editörü için geniş panel */
  wide?: boolean;
};

export function InvitationDesignEditorModal({
  open,
  title,
  onClose,
  children,
  footer,
  wide = false,
}: InvitationDesignEditorModalProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !open) return;
    lockScroll();
    const onTouchMove = (e: TouchEvent) => {
      if (scrollRef.current?.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      document.removeEventListener("touchmove", onTouchMove);
      unlockScroll();
    };
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted || !open || !onClose) return;
    const close = onClose;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose, open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9000] flex items-center justify-center p-4 md:p-6"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
      style={{
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
      onMouseDown={(e) => {
        if (!onClose) return;
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative z-[9010] flex w-full max-h-[90vh] flex-col overflow-hidden rounded-none border border-[rgba(190,140,255,0.28)] bg-[rgba(20,14,32,0.98)] shadow-[0_30px_100px_rgba(0,0,0,0.55)] max-md:h-[100vh] max-md:max-h-[100vh] md:rounded-3xl ${
          wide ? "md:w-[min(1400px,98vw)]" : "md:w-[min(1100px,96vw)]"
        }`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h2>
          {onClose ? (
            <button type="button" className={btnSecondary} onClick={onClose}>
              Kapat
            </button>
          ) : null}
        </header>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 max-md:max-h-[calc(100vh-8rem)]"
          style={{ maxHeight: "calc(90vh - 120px)" }}
        >
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-white/10 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
