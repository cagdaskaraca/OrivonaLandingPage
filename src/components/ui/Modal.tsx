"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { btnSecondary } from "@/src/lib/ui";

let bodyLockCount = 0;
let prevBodyOverflow = "";
let prevHtmlOverflow = "";

/** Scroll pozisyonunu koruyarak arka plan kaydırmayı kilitle (position:fixed kullanma). */
function lockBodyScroll() {
  bodyLockCount += 1;
  if (bodyLockCount !== 1) return;

  prevBodyOverflow = document.body.style.overflow;
  prevHtmlOverflow = document.documentElement.style.overflow;
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
  document.documentElement.setAttribute("data-orivona-modal-open", "");
}

function unlockBodyScroll() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount !== 0) return;

  document.body.style.overflow = prevBodyOverflow;
  document.documentElement.style.overflow = prevHtmlOverflow;
  document.documentElement.removeAttribute("data-orivona-modal-open");
}

type ModalProps = {
  open: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** Wider panel for editors (e.g. davetiye). Default fits teklif formları. */
  size?: "default" | "wide";
};

export function Modal({
  open,
  title,
  onClose,
  children,
  footer,
  size = "default",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!open) return;

    lockBodyScroll();

    const preventTouchMove = (e: TouchEvent) => {
      const scrollEl = scrollRef.current;
      if (scrollEl?.contains(e.target as Node)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", preventTouchMove, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventTouchMove);
      unlockBodyScroll();
    };
  }, [mounted, open]);

  useEffect(() => {
    if (!mounted) return;
    if (!open) return;
    if (!onClose) return;

    const close = onClose;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mounted, onClose, open]);

  const panelWidthClass =
    size === "wide"
      ? "w-[min(1400px,96vw)]"
      : "w-[min(960px,96vw)]";

  const ui = useMemo(() => {
    if (!open) return null;

    return (
      <div
        className="fixed inset-0 z-[9000] flex items-center justify-center p-6"
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
          className={`relative z-[9010] flex max-h-[90vh] flex-col overflow-hidden rounded-3xl border border-[rgba(190,140,255,0.25)] bg-[rgba(20,14,32,0.98)] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85)] max-md:h-[100vh] max-md:max-h-[100vh] max-md:w-full max-md:rounded-none ${panelWidthClass}`}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
            <h2 id={titleId} className="text-lg font-semibold text-white">
              {title}
            </h2>
            <button
              type="button"
              className={btnSecondary}
              onClick={onClose}
              disabled={!onClose}
            >
              Kapat
            </button>
          </div>

          <div
            ref={scrollRef}
            data-orivona-modal-scroll
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 max-md:max-h-[calc(100vh-5.5rem)]"
            style={{ maxHeight: "calc(90vh - 6rem)" }}
          >
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-white/10 px-5 py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    );
  }, [children, footer, onClose, open, panelWidthClass, title, titleId]);

  if (!open) return null;
  if (!mounted) return null;
  return createPortal(ui, document.body);
}
