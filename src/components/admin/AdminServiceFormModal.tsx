"use client";

import type {
  AdminCategory,
  AdminService,
  AdminVendor,
  VendorServicePayload,
} from "@/src/lib/api/types";
import { Modal } from "@/src/components/ui/Modal";
import { NumericInput } from "@/src/components/ui/NumericInput";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/src/lib/ui";

export type AdminServiceFormState = VendorServicePayload & {
  vendorId: string | number;
};

export function defaultAdminServiceForm(): AdminServiceFormState {
  return {
    vendorId: "",
    title: "",
    categoryId: "",
    description: "",
    basePrice: 0,
    city: "İzmir",
    district: "",
    capacityMin: 50,
    capacityMax: 300,
    isActive: true,
  };
}

export function adminServiceToForm(
  service: AdminService,
  vendors: { id?: string | number; businessName?: string }[] = [],
): AdminServiceFormState {
  const vendor = vendors.find(
    (v) =>
      v.businessName &&
      service.vendorName &&
      v.businessName.trim() === service.vendorName.trim(),
  );
  return {
    vendorId: vendor?.id ?? "",
    title: service.title ?? "",
    categoryId: service.categoryId ?? "",
    description: "",
    basePrice: service.basePrice ?? 0,
    city: service.city ?? "İzmir",
    district: service.district ?? "",
    capacityMin: 50,
    capacityMax: 300,
    isActive: service.isActive !== false,
  };
}

type AdminServiceFormModalProps = {
  open: boolean;
  editing: AdminService | null;
  form: AdminServiceFormState;
  saving: boolean;
  vendors: AdminVendor[];
  categories: AdminCategory[];
  onFormChange: (patch: Partial<AdminServiceFormState>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
};

export function AdminServiceFormModal({
  open,
  editing,
  form,
  saving,
  vendors,
  categories,
  onFormChange,
  onSubmit,
  onClose,
}: AdminServiceFormModalProps) {
  const isEdit = editing?.id != null;

  return (
    <Modal
      open={open}
      title={isEdit ? "Hizmet düzenle" : "Hizmet ekle"}
      onClose={onClose}
      size="wide"
    >
      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">İşletme</span>
          <select
            className={selectClass}
            value={String(form.vendorId)}
            onChange={(e) => onFormChange({ vendorId: e.target.value })}
            required
            disabled={isEdit && Boolean(form.vendorId)}
          >
            <option value="">İşletme seçin</option>
            {vendors.map((v) =>
              v.id != null ? (
                <option key={String(v.id)} value={String(v.id)}>
                  {v.businessName ?? `İşletme #${v.id}`}
                </option>
              ) : null,
            )}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">Başlık</span>
          <input
            className={inputClass}
            value={form.title}
            onChange={(e) => onFormChange({ title: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">Kategori</span>
          <select
            className={selectClass}
            value={String(form.categoryId)}
            onChange={(e) => onFormChange({ categoryId: e.target.value })}
            required
          >
            <option value="">Kategori seçin</option>
            {categories.map((c) =>
              c.id != null ? (
                <option key={String(c.id)} value={String(c.id)}>
                  {c.name ?? `Kategori #${c.id}`}
                </option>
              ) : null,
            )}
          </select>
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="mb-1.5 block text-xs text-zinc-400">Açıklama</span>
          <textarea
            className={`${inputClass} min-h-[88px] resize-y`}
            value={form.description}
            onChange={(e) => onFormChange({ description: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Şehir</span>
          <input
            className={inputClass}
            value={form.city}
            onChange={(e) => onFormChange({ city: e.target.value })}
            required
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">İlçe</span>
          <input
            className={inputClass}
            value={form.district}
            onChange={(e) => onFormChange({ district: e.target.value })}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Taban fiyat (₺)</span>
          <NumericInput
            className={inputClass}
            value={form.basePrice}
            onChange={(basePrice) => onFormChange({ basePrice })}
            min={0}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Durum</span>
          <select
            className={selectClass}
            value={form.isActive ? "active" : "passive"}
            onChange={(e) =>
              onFormChange({ isActive: e.target.value === "active" })
            }
          >
            <option value="active">Aktif</option>
            <option value="passive">Pasif</option>
          </select>
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Min. kapasite</span>
          <NumericInput
            className={inputClass}
            value={form.capacityMin}
            onChange={(capacityMin) => onFormChange({ capacityMin })}
            min={0}
            integerOnly
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block text-xs text-zinc-400">Maks. kapasite</span>
          <NumericInput
            className={inputClass}
            value={form.capacityMax}
            onChange={(capacityMax) => onFormChange({ capacityMax })}
            min={0}
            integerOnly
          />
        </label>
        <div className="flex flex-wrap gap-2 sm:col-span-2">
          <button type="submit" className={btnPrimary} disabled={saving}>
            {saving ? "Kaydediliyor…" : isEdit ? "Güncelle" : "Kaydet"}
          </button>
          <button type="button" className={btnSecondary} onClick={onClose}>
            İptal
          </button>
        </div>
      </form>
    </Modal>
  );
}
