import type { AdminCategory, AdminService } from "@/src/lib/api/types";

function norm(s?: string | null): string {
  return (s ?? "").trim().toLowerCase();
}

/** Match admin services to a category using id, name, or slug (client-side only). */
export function servicesForCategory(
  category: AdminCategory,
  services: AdminService[],
): AdminService[] {
  const id = category.id != null ? String(category.id) : "";
  const name = norm(category.name);
  const slug = norm(category.slug);

  return services.filter((s) => {
    if (id && s.categoryId != null && String(s.categoryId) === id) {
      return true;
    }
    const catName = norm(s.categoryName);
    if (name && catName === name) return true;
    if (slug && catName === slug) return true;
    if (name && catName.includes(name)) return true;
    return false;
  });
}

export function uniqueVendorNamesForCategory(
  category: AdminCategory,
  services: AdminService[],
): string[] {
  const names = new Set<string>();
  for (const s of servicesForCategory(category, services)) {
    const v = s.vendorName?.trim();
    if (v) names.add(v);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "tr"));
}

export function linkedCountsForCategory(
  category: AdminCategory,
  services: AdminService[],
): { serviceCount: number; vendorCount: number } {
  const linked = servicesForCategory(category, services);
  const serviceCount =
    linked.length > 0
      ? linked.length
      : Math.max(0, category.serviceCount ?? 0);
  const vendorCount =
    linked.length > 0
      ? uniqueVendorNamesForCategory(category, services).length
      : 0;
  return { serviceCount, vendorCount };
}
