"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  DASHBOARD_SCROLL_OFFSET_PX,
  scrollToHashWhenReady,
} from "@/src/lib/scrollToDashboardSection";
import { orivonaScrollY } from "@/src/lib/ui";

export type DashboardNavItem = {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
};

export type DashboardNavGroup = {
  title: string;
  items: DashboardNavItem[];
};

function isScrollSpyItem(item: DashboardNavItem): boolean {
  return !item.href && !item.onClick;
}

type DashboardSidebarProps = {
  items: DashboardNavItem[];
  groups?: DashboardNavGroup[];
  expandedWidthClassName?: string;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
};

export function DashboardSidebar({
  items,
  groups,
  expandedWidthClassName,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileOpenChange,
}: DashboardSidebarProps) {
  const router = useRouter();
  const sidebarScrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const scrollSpyItems = items.filter(isScrollSpyItem);
  const initialActive = scrollSpyItems[0]?.id ?? items[0]?.id ?? "";
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
    if (collapsed || !activeId) return;
    const btn = itemRefs.current.get(activeId);
    const container = sidebarScrollRef.current;
    if (!btn || !container) return;
    btn.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId, collapsed]);

  const handleItemClick = useCallback(
    (item: DashboardNavItem) => {
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
      });
      onMobileOpenChange(false);
    },
    [onMobileOpenChange, router],
  );

  const renderNavButton = (item: DashboardNavItem) => {
    const active = activeId === item.id;
    const className = `rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
      active
        ? "bg-violet-500/25 text-white ring-1 ring-inset ring-violet-400/35"
        : "text-zinc-400 hover:bg-white/[0.05] hover:text-violet-100"
    }`;

    if (item.href) {
      return (
        <Link
          key={item.id}
          href={item.href}
          className={className}
          onClick={() => onMobileOpenChange(false)}
        >
          {collapsed ? (
            <span className="block text-center text-xs">
              {item.label.charAt(0)}
            </span>
          ) : (
            item.label
          )}
        </Link>
      );
    }

    return (
      <button
        key={item.id}
        ref={(el) => {
          if (el) itemRefs.current.set(item.id, el);
          else itemRefs.current.delete(item.id);
        }}
        type="button"
        title={collapsed ? item.label : undefined}
        onClick={() => handleItemClick(item)}
        className={className}
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
  };

  const renderGroups = (groupsToRender: DashboardNavGroup[]) => (
    <nav className="flex flex-col gap-2 p-2">
      {groupsToRender.map((group) => (
        <div key={group.title} className="space-y-1">
          {!collapsed ? (
            <p className="px-3 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              {group.title}
            </p>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => renderNavButton(item))}
          </div>
        </div>
      ))}
    </nav>
  );

  const navButtons = renderGroups(
    groups?.length
      ? groups
      : [
          {
            title: "Menü",
            items,
          },
        ],
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
          collapsed ? "lg:w-14" : (expandedWidthClassName ?? "lg:w-56")
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
          <div
            ref={sidebarScrollRef}
            className="min-h-0 flex-1 overflow-y-auto"
          >
            {navButtons}
          </div>
        </div>
      </aside>
    </>
  );
}
