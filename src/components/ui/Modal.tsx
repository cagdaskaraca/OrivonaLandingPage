"use client";

import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { btnSecondary, glassCard } from "@/src/lib/ui";

let bodyLockCount = 0;
let lockedScrollY = 0;
let prevBodyOverflow = "";
let prevBodyPosition = "";
let prevBodyTop = "";
let prevBodyWidth = "";

function lockBodyScroll() {
  bodyLockCount += 1;
  if (bodyLockCount !== 1) return;

  lockedScrollY = window.scrollY || 0;
  prevBodyOverflow = document.body.style.overflow;
  prevBodyPosition = document.body.style.position;
  prevBodyTop = document.body.style.top;
  prevBodyWidth = document.body.style.width;

  // Strong scroll lock (prevents wheel/touch from scrolling the page behind).
  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.width = "100%";
}

function unlockBodyScroll() {
  bodyLockCount = Math.max(0, bodyLockCount - 1);
  if (bodyLockCount !== 0) return;

  document.body.style.overflow = prevBodyOverflow;
  document.body.style.position = prevBodyPosition;
  document.body.style.top = prevBodyTop;
  document.body.style.width = prevBodyWidth;

  window.scrollTo(0, lockedScrollY);
}

type ModalProps = {
  open: boolean;
  title: string;
  onClose?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const [mounted, setMounted] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!open) return;

    lockBodyScroll();

    // Prevent scroll chaining on touch devices.
    const preventTouchMove = (e: TouchEvent) => {
      // Allow scrolling inside the modal content; blocking body scroll is handled
      // via fixed body styles, but this avoids edge cases on mobile browsers.
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

  const ui = useMemo(() => {
    if (!open) return null;

    return (
      <div className="fixed inset-0" role="dialog" aria-modal aria-labelledby={titleId}>
        <div
          className="fixed inset-0 z-[9998] bg-[rgba(0,0,0,0.75)] backdrop-blur-[10px]"
          onMouseDown={(e) => {
            if (!onClose) return;
            if (e.target === e.currentTarget) onClose();
          }}
        />
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          <div
            className={`${glassCard} flex h-[100vh] w-[100vw] flex-col overflow-hidden rounded-none md:h-auto md:max-h-[90vh] md:w-[95vw] md:max-w-[1400px] md:rounded-2xl`}
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
              {children}
            </div>

            {footer ? (
              <div className="shrink-0 border-t border-white/10 px-5 py-4">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }, [children, footer, onClose, open, title, titleId]);

  if (!open) return null;
  if (!mounted) return null;
  return createPortal(ui, document.body);
}
