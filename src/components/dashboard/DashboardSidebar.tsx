"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardNavGroup, DashboardNavItem } from "@/src/lib/dashboardNavTypes";
import {
  DASHBOARD_SCROLL_OFFSET_PX,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";
import { orivonaScrollY } from "@/src/lib/ui";

export type { DashboardNavItem, DashboardNavGroup };

function isScrollSpyItem(item: DashboardNavItem): boolean {
  return !item.href && !item.onClick && item.action !== "logout";
}

type DashboardSidebarProps = {
  groups: DashboardNavGroup[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
  onLogout?: () => void;
};

function NavItemContent({
  item,
  collapsed,
  active,
}: {
  item: DashboardNavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;
  if (collapsed && Icon) {
    return (
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
          active
            ? "bg-violet-500/30 text-violet-50 ring-2 ring-violet-400/45"
            : "text-zinc-400 group-hover:bg-white/[0.06] group-hover:text-violet-100"
        }`}
      >
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} aria-hidden />
      </span>
    );
  }
  if (Icon) {
    return (
      <>
        <Icon
          className={`h-4 w-4 shrink-0 ${active ? "text-violet-200" : "text-zinc-500"}`}
          strokeWidth={2}
          aria-hidden
        />
        <span className="min-w-0 truncate">{item.label}</span>
      </>
    );
  }
  return <span className="min-w-0 truncate">{item.label}</span>;
}

function CollapsedTooltip({ label }: { label: string }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-[calc(100%+0.5rem)] top-1/2 z-[80] hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-violet-400/25 bg-[#120a1c] px-2.5 py-1.5 text-xs font-medium text-violet-50 shadow-lg group-hover:block group-focus-within:block"
    >
      {label}
    </span>
  );
}

export function DashboardSidebar({
  groups,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
  onLogout,
}: DashboardSidebarProps) {
  const router = useRouter();
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  const scrollSpyItems = groups.flatMap((g) => g.items).filter(isScrollSpyItem);
  const initialActive = scrollSpyItems[0]?.id ?? "";
  const [activeId, setActiveId] = useState(initialActive);

  const updateActiveFromScroll = useCallback(() => {
    if (scrollSpyItems.length === 0) return;

    const offset = DASHBOARD_SCROLL_OFFSET_PX + 8;
    const positioned = scrollSpyItems
      .map((item) => {
        const el = document.getElementById(item.id);
        if (!el) return null;
        return {
          id: item.id,
          top: el.getBoundingClientRect().top,
          docTop: el.getBoundingClientRect().top + window.scrollY,
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => a.docTop - b.docTop);

    if (positioned.length === 0) return;

    const doc = document.documentElement;
    const atBottom =
      window.innerHeight + window.scrollY >= doc.scrollHeight - 48;

    let current = positioned[0].id;
    if (atBottom) {
      current = positioned[positioned.length - 1].id;
    } else {
      for (const section of positioned) {
        if (section.top <= offset) {
          current = section.id;
        }
      }
    }

    setActiveId((prev) => (prev === current ? prev : current));
  }, [scrollSpyItems]);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateActiveFromScroll);
    };

    updateActiveFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("orivona-dashboard-layout-ready", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("orivona-dashboard-layout-ready", onScroll);
    };
  }, [updateActiveFromScroll]);

  useEffect(() => {
    if (!activeId) return;
    const el = itemRefs.current.get(activeId);
    const container = sidebarScrollRef.current;
    if (!el || !container) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId, collapsed]);

  const handleItemClick = useCallback(
    (item: DashboardNavItem) => {
      if (item.action === "logout") {
        onLogout?.();
        onMobileOpenChange(false);
        return;
      }
      if (item.onClick) {
        item.onClick();
        onMobileOpenChange(false);
        return;
      }
      if (item.href) {
        if (item.href.startsWith("/")) {
          router.push(item.href);
        } else {
          window.location.href = item.href;
        }
        onMobileOpenChange(false);
        return;
      }
      setActiveId(item.id);
      scrollToHashWhenReady(`#${item.id}`, {
        highlight: true,
        forceSameHash: true,
        updateHash: true,
        immediate: true,
      });
      onMobileOpenChange(false);
    },
    [onMobileOpenChange, onLogout, router],
  );

  const itemClassName = (active: boolean, isCollapsed: boolean) =>
    `group relative flex w-full items-center rounded-xl text-sm font-medium transition ${
      isCollapsed ? "justify-center px-0 py-1" : "gap-2.5 px-3 py-2.5 text-left"
    } ${
      active
        ? isCollapsed
          ? ""
          : "bg-violet-500/25 text-white ring-1 ring-inset ring-violet-400/35"
        : isCollapsed
          ? ""
          : "text-zinc-400 hover:bg-white/[0.05] hover:text-violet-100"
    }`;

  const renderNavButton = (item: DashboardNavItem) => {
    const active = activeId === item.id;
    const setRef = (el: HTMLElement | null) => {
      if (el) itemRefs.current.set(item.id, el);
      else itemRefs.current.delete(item.id);
    };

    if (item.href) {
      return (
        <div key={item.id} className="group relative">
          <Link
            ref={setRef as (el: HTMLAnchorElement | null) => void}
            href={item.href}
            className={itemClassName(active, collapsed)}
            onClick={() => onMobileOpenChange(false)}
          >
            <NavItemContent item={item} collapsed={collapsed} active={active} />
          </Link>
          {collapsed ? <CollapsedTooltip label={item.label} /> : null}
        </div>
      );
    }

    return (
      <div key={item.id} className="group relative">
        <button
          ref={setRef as (el: HTMLButtonElement | null) => void}
          type="button"
          onClick={() => handleItemClick(item)}
          className={itemClassName(active, collapsed)}
          disabled={item.disabled}
        >
          <NavItemContent item={item} collapsed={collapsed} active={active} />
        </button>
        {collapsed ? <CollapsedTooltip label={item.label} /> : null}
      </div>
    );
  };

  const navButtons = (
    <nav className="flex flex-col gap-1 p-2">
      {groups.map((group, groupIndex) => (
        <div key={group.title} className="space-y-1">
          {collapsed ? (
            groupIndex > 0 ? (
              <div
                className="mx-2 my-1.5 border-t border-violet-500/20"
                aria-hidden
              />
            ) : null
          ) : (
            <p className="px-3 pb-0.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 first:pt-2">
              {group.title}
            </p>
          )}
          <div
            className={`flex flex-col ${collapsed ? "items-center gap-0.5" : "gap-0.5"}`}
          >
            {group.items.map((item) => renderNavButton(item))}
          </div>
        </div>
      ))}
    </nav>
  );

  const asideInner = (
    <div
      className="orivona-panel-sidebar-inner rounded-2xl border border-violet-500/20 bg-gradient-to-b from-[#100818]/98 to-[#08050f]/95 shadow-[inset_0_1px_0_rgba(167,139,250,0.06)]"
    >
      <div
        className={`flex shrink-0 items-center border-b border-violet-500/15 px-2 py-2.5 ${
          collapsed ? "justify-center" : "justify-between gap-2"
        }`}
      >
        {!collapsed ? (
          <span className="truncate px-2 text-xs font-semibold uppercase tracking-wide text-violet-300/80">
            Menü
          </span>
        ) : null}
        <button
          type="button"
          className="shrink-0 rounded-lg border border-violet-400/25 p-1.5 text-violet-200 transition-colors hover:bg-violet-500/15"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>
      <div
        ref={sidebarScrollRef}
        className={`orivona-panel-sidebar-scroll ${orivonaScrollY}`}
      >
        {navButtons}
      </div>
    </div>
  );

  return (
    <>
      <div className="mb-4 flex items-center gap-2 lg:hidden">
        <button
          type="button"
          className="rounded-xl border border-violet-400/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-100"
          onClick={() => onMobileOpenChange(true)}
        >
          Menü
        </button>
      </div>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
          aria-hidden
          onClick={() => onMobileOpenChange(false)}
        />
      ) : null}

      {mobileOpen ? (
        <aside className="orivona-panel-sidebar-drawer fixed inset-y-0 left-0 z-[61] flex w-[min(280px,88vw)] flex-col p-3 pt-[calc(var(--orivona-header-h)+0.75rem)] lg:hidden">
          <button
            type="button"
            className="absolute right-3 top-[calc(var(--orivona-header-h)+0.5rem)] rounded-lg border border-white/10 p-1.5 text-zinc-400 hover:text-white"
            onClick={() => onMobileOpenChange(false)}
            aria-label="Menüyü kapat"
          >
            <X className="h-5 w-5" />
          </button>
          {asideInner}
        </aside>
      ) : null}

      <aside
        className={`orivona-panel-sidebar ${collapsed ? "is-collapsed" : ""}`}
      >
        {asideInner}
      </aside>
    </>
  );
}
