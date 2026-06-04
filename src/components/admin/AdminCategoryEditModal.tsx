"use client";

import type { AdminCategory, AdminCategoryPayload, AdminService } from "@/src/lib/api/types";
import { servicesForCategory, linkedCountsForCategory } from "@/src/lib/adminCategoryLinks";
import { CategoryLinkedServicesList } from "@/src/components/admin/CategoryLinkedServicesList";
import { Modal } from "@/src/components/ui/Modal";
import { btnPrimary, btnSecondary, inputClass } from "@/src/lib/ui";

type AdminCategoryEditModalProps = {
  open: boolean;
  category: AdminCategory | null;
  allServices: AdminService[];
  form: AdminCategoryPayload;
  saving: boolean;
  onFormChange: (patch: Partial<AdminCategoryPayload>) => void;
  onNameChange: (name: string) => void;
  onSlugTouched: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export function AdminCategoryEditModal({
  open,
  category,
  allServices,
  form,
  saving,
  onFormChange,
  onNameChange,
  onSlugTouched,
  onSubmit,
  onClose,
}: AdminCategoryEditModalProps) {
  const linked =
    category != null ? servicesForCategory(category, allServices) : [];
  const counts =
    category != null
      ? linkedCountsForCategory(category, allServices)
      : { serviceCount: 0, vendorCount: 0 };

  return (
    <Modal
      open={open}
      title={category ? `Kategori düzenle — ${category.name ?? ""}` : "Kategori düzenle"}
      onClose={onClose}
      size="wide"
    >
      <div className="space-y-6">
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Ad</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => onNameChange(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Bağlantı kodu</span>
            <input
              className={inputClass}
              value={form.slug ?? ""}
              onChange={(e) => {
                onSlugTouched();
                onFormChange({ slug: e.target.value });
              }}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Durum</span>
            <select
              className={inputClass}
              value={form.isActive ? "active" : "passive"}
              onChange={(e) =>
                onFormChange({ isActive: e.target.value === "active" })
              }
            >
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
            <textarea
              className={`${inputClass} min-h-[72px] resize-y`}
              value={form.description ?? ""}
              onChange={(e) => onFormChange({ description: e.target.value })}
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Güncelle"}
            </button>
            <button type="button" className={btnSecondary} onClick={onClose}>
              İptal
            </button>
          </div>
        </form>

        <div className="border-t border-violet-500/15 pt-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-white">
                Bu kategoriye bağlı hizmetler
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                {counts.serviceCount} hizmet
                {counts.vendorCount > 0
                  ? ` · ${counts.vendorCount} işletme`
                  : ""}
              </p>
            </div>
          </div>
          <CategoryLinkedServicesList services={linked} />
        </div>
      </div>
    </Modal>
  );
}
