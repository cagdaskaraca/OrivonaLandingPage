"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/src/contexts/AuthContext";
import {
  getQuickNavItems,
  quickNavHref,
  type QuickNavItem,
} from "@/src/lib/dashboardQuickNav";
import { resolveNotificationActionUrl } from "@/src/lib/notificationNavigation";
import { navigateToResolvedLink } from "@/src/lib/scrollToDashboardSection";
import { orivonaDropdownScroll } from "@/src/lib/ui";

type AccountQuickNavDropdownProps = {
  variant?: "landing" | "demo";
};

const triggerBase =
  "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium transition-[color,box-shadow,border-color]";

export function AccountQuickNavDropdown({
  variant = "demo",
}: AccountQuickNavDropdownProps) {
  const router = useRouter();
  const { role, hesabimPath } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const items = getQuickNavItems(role);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const triggerClass = `${triggerBase} border-white/10 bg-white/[0.04] text-zinc-200 hover:border-violet-400/35 hover:text-white hover:shadow-[0_0_18px_rgba(167,139,250,0.25)]`;

  function navigate(item: QuickNavItem) {
    setOpen(false);
    const href = quickNavHref(role, item);
    if (item.external || item.target.startsWith("/")) {
      router.push(href);
      return;
    }
    const resolved = resolveNotificationActionUrl(
      href,
      typeof window !== "undefined" ? window.location.origin : undefined,
    );
    if (resolved) {
      navigateToResolvedLink(router, resolved);
    } else {
      router.push(href);
    }
  }

  if (!items.length) {
    return (
      <Link href={hesabimPath} className={triggerClass.replace("inline-flex", "inline-block")}>
        Hesabım
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={triggerClass}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        Hesabım
        <svg
          className={`h-3.5 w-3.5 opacity-70 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-[70] mt-2 w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-violet-200/10 bg-[#0c0814]/98 shadow-[0_24px_64px_-16px_rgba(24,12,48,0.95)] backdrop-blur-xl"
        >
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#0c0814]/98 px-4 py-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Hızlı erişim
            </p>
          </div>
          <div
            className={`${orivonaDropdownScroll} max-h-[min(24rem,70vh)] overflow-y-auto overflow-x-hidden py-1`}
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="block w-full px-4 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-violet-500/10 hover:text-white"
                onClick={() => navigate(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
