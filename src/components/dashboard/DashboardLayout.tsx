"use client";

import { useState, type ReactNode } from "react";
import { DemoShell } from "@/src/components/app/DemoShell";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/src/components/dashboard/DashboardSidebar";

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  navItems: DashboardNavItem[];
  toolbar?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({
  title,
  subtitle,
  navItems,
  toolbar,
  children,
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <DemoShell title={title} subtitle={subtitle} stickyNav>
      {toolbar ? <div className="mb-6 flex flex-wrap gap-3">{toolbar}</div> : null}
      <div className="flex flex-col gap-0 lg:flex-row lg:items-start lg:gap-8">
        <DashboardSidebar
          items={navItems}
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((c) => !c)}
          mobileOpen={mobileOpen}
          onMobileOpenChange={setMobileOpen}
        />
        <div className="min-w-0 flex-1 overflow-x-clip">{children}</div>
      </div>
    </DemoShell>
  );
}
