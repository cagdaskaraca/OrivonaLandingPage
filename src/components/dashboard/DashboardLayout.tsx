"use client";

import { useCallback, useState, type ReactNode } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  DashboardSidebar,
  type DashboardNavGroup,
  type DashboardNavItem,
} from "@/src/components/dashboard/DashboardSidebar";
import { DashboardMobileNav } from "@/src/components/premium/DashboardMobileNav";
import { Circle } from "lucide-react";
import {
  flatItemsToGroups,
  flattenNavGroups,
  type DashboardNavGroup as NavGroupType,
} from "@/src/lib/dashboardNavTypes";

export type { DashboardNavItem, DashboardNavGroup };

const STORAGE_PREFIX = "orivona-sidebar-collapsed:";

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  /** Grouped navigation (preferred) */
  navGroups?: DashboardNavGroup[];
  /** Flat navigation (legacy fallback) */
  navItems?: DashboardNavItem[];
  storageKey?: string;
  onLogout?: () => void;
  fullWidth?: boolean;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({
  title,
  subtitle,
  navGroups,
  navItems,
  storageKey = "default",
  onLogout,
  fullWidth = true,
  toolbar,
  children,
}: DashboardLayoutProps) {
  const groups: NavGroupType[] =
    navGroups ??
    (navItems
      ? flatItemsToGroups(
          navItems.map(({ id, label, href, action, disabled, icon, onClick }) => ({
            id,
            label,
            href,
            action,
            disabled,
            icon,
            onClick,
          })),
          Circle,
        )
      : []);

  const mobileNavItems = flattenNavGroups(groups).filter(
    (item) =>
      item.action !== "logout" && !item.onClick && !item.disabled,
  );

  const storageId = `${STORAGE_PREFIX}${storageKey}`;

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(storageId) === "1";
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(storageId, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, [storageId]);

  return (
    <DemoShell
      title={title}
      subtitle={subtitle}
      stickyNav
      panelLayout
      mainClassName={
        fullWidth ? "orivona-panel-main w-full max-w-none px-4 sm:px-6 lg:px-8" : undefined
      }
    >
      <div className="orivona-panel-layout">
        <DashboardSidebar
          groups={groups}
          collapsed={collapsed}
          onToggleCollapsed={toggleCollapsed}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
          onLogout={onLogout}
        />
        <div className="orivona-panel-content pb-20 lg:pb-[240px]">
          {toolbar ? (
            <div className="mb-6 flex flex-wrap items-center gap-3">{toolbar}</div>
          ) : null}
          {children}
        </div>
      </div>
      <DashboardMobileNav items={mobileNavItems} />
    </DemoShell>
  );
}
