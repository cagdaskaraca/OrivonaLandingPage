"use client";

import { useState, type ReactNode } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  DashboardSidebar,
  type DashboardNavGroup,
  type DashboardNavItem,
} from "@/src/components/dashboard/DashboardSidebar";
import { DashboardMobileNav } from "@/src/components/premium/DashboardMobileNav";

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  navGroups?: DashboardNavGroup[];
  fullWidth?: boolean;
  sidebarExpandedWidthClassName?: string;
  toolbar?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({
  title,
  subtitle,
  navItems,
  navGroups,
  fullWidth = false,
  sidebarExpandedWidthClassName,
  toolbar,
  children,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DemoShell
      title={title}
      subtitle={subtitle}
      stickyNav
      mainClassName={
        fullWidth ? "w-full max-w-none px-4 sm:px-6" : undefined
      }
    >
      {toolbar ? <div className="mb-6 flex flex-wrap gap-3">{toolbar}</div> : null}
      <div className="flex flex-col gap-0 lg:flex-row lg:items-start lg:gap-8">
        <DashboardSidebar
          items={navItems}
          groups={navGroups}
          expandedWidthClassName={sidebarExpandedWidthClassName}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <div className="min-w-0 flex-1 overflow-x-clip pb-20 lg:pb-[240px]">
          {children}
        </div>
      </div>
      <DashboardMobileNav items={navItems} />
    </DemoShell>
  );
}
