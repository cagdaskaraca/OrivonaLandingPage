"use client";

import { useCallback, useEffect, useState } from "react";
import { scrollToHashWhenReady } from "@/src/lib/scrollToDashboardSection";
import { orivonaScrollY } from "@/src/lib/ui";

export type DashboardNavItem = {
  id: string;
  label: string;
};

/** IntersectionObserver only accepts px/% — no calc(), rem, or CSS variables. */
const DASHBOARD_SECTION_ROOT_MARGIN = "-120px 0px -60% 0px";

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function DashboardSidebar({
  items,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
}: DashboardSidebarProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  const scrollToSection = useCallback(
    (id: string) => {
      scrollToHashWhenReady(`#${id}`, {
        highlight: false,
        forceSameHash: true,
        updateHash: true,
      });
      setActiveId(id);
      onMobileOpenChange(false);
    },
    [onMobileOpenChange],
  );

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    let observer: IntersectionObserver | null = null;
    try {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((e) => e.isIntersecting)
            .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
          if (visible[0]?.target.id) {
            setActiveId(visible[0].target.id);
          }
        },
        {
          rootMargin: DASHBOARD_SECTION_ROOT_MARGIN,
          threshold: [0, 0.25, 0.5],
        },
      );
      for (const el of elements) observer.observe(el);
    } catch (err) {
      console.warn(
        "Dashboard sidebar section tracking disabled:",
        err instanceof Error ? err.message : err,
      );
      return;
    }

    return () => observer?.disconnect();
  }, [items]);

  const navButtons = (
    <nav className="flex flex-col gap-1 p-2">
      {items.map((item) => {
        const active = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            title={collapsed ? item.label : undefined}
            onClick={() => scrollToSection(item.id)}
            className={`rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
              active
                ? "bg-violet-500/25 text-white ring-1 ring-inset ring-violet-400/35"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-violet-100"
            }`}
          >
            {collapsed ? (
              <span className="block text-center text-xs">
                {item.label.charAt(0)}
              </span>
            ) : (
              item.label
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <button
          type="button"
          className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100"
          onClick={() => onMobileOpenChange(!mobileOpen)}
        >
          {mobileOpen ? "Menüyü kapat" : "Menü"}
        </button>
      </div>

      {mobileOpen ? (
        <div className="mb-6 rounded-2xl border border-violet-500/25 bg-[#0c0814]/95 p-1 lg:hidden">
          {navButtons}
        </div>
      ) : null}

      <aside
        className={`hidden shrink-0 lg:sticky lg:z-40 lg:block lg:self-start ${
          collapsed ? "lg:w-14" : "lg:w-56"
        } lg:top-24 lg:h-[calc(100vh-120px)]`}
      >
        <div
          className={`flex h-full flex-col rounded-2xl border border-violet-500/20 bg-gradient-to-b from-[#100818]/95 to-[#08050f]/90 shadow-[inset_0_1px_0_rgba(167,139,250,0.06)] ${orivonaScrollY}`}
        >
          <div
            className={`flex shrink-0 items-center border-b border-violet-500/15 px-2 py-2 ${
              collapsed ? "justify-center" : "justify-between"
            }`}
          >
            {!collapsed ? (
              <span className="px-2 text-xs font-semibold uppercase tracking-wide text-violet-300/80">
                Menü
              </span>
            ) : null}
            <button
              type="button"
              className="rounded-lg border border-violet-400/25 px-2 py-1 text-xs text-violet-200 hover:bg-violet-500/15"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
            >
              {collapsed ? "›" : "‹"}
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{navButtons}</div>
        </div>
      </aside>
    </>
  );
}
