"use client";

import Link from "next/link";
import type { AdminService } from "@/src/lib/api/types";
import { activeStatusClass } from "@/src/lib/adminDashboard";
import { AdminPaginatedList } from "@/src/components/admin/AdminPaginatedList";

type CategoryLinkedServicesListProps = {
  services: AdminService[];
};

export function CategoryLinkedServicesList({
  services,
}: CategoryLinkedServicesListProps) {
  if (services.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-zinc-500">
        Bu kategoriye bağlı hizmet bulunmuyor.
      </p>
    );
  }

  return (
    <AdminPaginatedList
      items={services}
      getItemKey={(s) => String(s.id ?? s.title)}
      searchPlaceholder="Bağlı hizmet ara..."
      filterItem={(s, q) => {
        const hay = [s.title, s.vendorName, s.city, s.categoryName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      }}
      emptyMessage="Bu kategoriye bağlı hizmet bulunmuyor."
      listClassName="space-y-2"
      renderItem={(s) => {
        const active = s.isActive !== false;
        const price =
          s.basePrice != null
            ? `${s.basePrice.toLocaleString("tr-TR")} ₺`
            : null;
        return (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-white">
                  {s.id != null ? (
                    <Link
                      href={`/services/${encodeURIComponent(String(s.id))}`}
                      className="hover:text-violet-200"
                    >
                      {s.title ?? "—"}
                    </Link>
                  ) : (
                    (s.title ?? "—")
                  )}
                </p>
                <p className="mt-1 text-zinc-400">
                  {s.vendorName ?? "—"}
                  {[s.city, s.district].filter(Boolean).length > 0
                    ? ` · ${[s.city, s.district].filter(Boolean).join(" / ")}`
                    : ""}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${activeStatusClass(active)}`}
                >
                  {active ? "Aktif" : "Pasif"}
                </span>
                {price ? (
                  <span className="text-xs font-medium text-violet-200/90">
                    {price}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}
