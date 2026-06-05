"use client";

import type { ReactNode } from "react";
import { orivonaScrollX } from "@/src/lib/ui";

type DashboardHorizontalRailProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  getItemKey: (item: T) => string;
  className?: string;
  itemClassName?: string;
  /** Kayıt sayısı ipucu (varsayılan: 5’ten fazlaysa göster) */
  showHint?: boolean;
  hintThreshold?: number;
};

export function DashboardHorizontalRail<T>({
  items,
  renderItem,
  getItemKey,
  className = "",
  itemClassName = "",
  showHint = true,
  hintThreshold = 5,
}: DashboardHorizontalRailProps<T>) {
  if (items.length === 0) return null;

  const showScrollHint = showHint && items.length > hintThreshold;

  return (
    <div className={className}>
      {showScrollHint ? (
        <p className="mb-2 text-[11px] text-zinc-600">
          {items.length} kayıt · Sağa kaydırarak daha fazlasını görün
        </p>
      ) : null}
      <div
        role="list"
        className={`orivona-horizontal-rail ${orivonaScrollX}`}
      >
        {items.map((item, index) => (
          <div
            key={getItemKey(item)}
            role="listitem"
            className={`orivona-horizontal-rail-item ${itemClassName}`.trim()}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
