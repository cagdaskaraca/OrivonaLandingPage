import type { LucideIcon } from "lucide-react";

export type DashboardNavItem = {
  id: string;
  label: string;
  icon?: LucideIcon;
  /** In-app route (e.g. /account) — scroll spy skipped */
  href?: string;
  /** Sidebar logout button */
  action?: "logout";
  /** Custom click handler (e.g. customer logout) */
  onClick?: () => void;
  disabled?: boolean;
};

export type DashboardNavGroup = {
  title: string;
  items: DashboardNavItem[];
};

export function flattenNavGroups(groups: DashboardNavGroup[]): DashboardNavItem[] {
  return groups.flatMap((g) => g.items);
}

export function scrollNavItems(groups: DashboardNavGroup[]): DashboardNavItem[] {
  return flattenNavGroups(groups).filter(
    (item) =>
      !item.disabled &&
      !item.href &&
      item.action !== "logout" &&
      !item.onClick,
  );
}

export function flatItemsToGroups(
  items: DashboardNavItem[],
  fallbackIcon: LucideIcon,
): DashboardNavGroup[] {
  return [
    {
      title: "Menü",
      items: items.map((item) => ({
        ...item,
        icon: item.icon ?? fallbackIcon,
      })),
    },
  ];
}
