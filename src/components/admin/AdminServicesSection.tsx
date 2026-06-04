"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createAdminService,
  deleteAdminService,
  fetchAdminCategories,
  updateAdminService,
} from "@/src/lib/api";
import { formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  AdminCategory,
  AdminService,
  AdminVendor,
  VendorServicePayload,
} from "@/src/lib/api/types";
import { formatCityForApi } from "@/src/lib/turkish";
import {
  AdminServiceFormModal,
  adminServiceToForm,
  defaultAdminServiceForm,
  type AdminServiceFormState,
} from "@/src/components/admin/AdminServiceFormModal";
import { ServiceListTable } from "@/src/components/admin/ServiceListTable";
import { btnPrimary } from "@/src/lib/ui";

type AdminServicesSectionProps = {
  services: AdminService[];
  vendors: AdminVendor[];
  loading?: boolean;
  actionServiceId?: string | number | null;
  onToggleFeature: (service: AdminService) => void;
  onPromote: (service: AdminService) => void;
  onRefresh: () => void | Promise<void>;
  onToastSuccess: (msg: string) => void;
  onToastError: (msg: string) => void;
};

export function AdminServicesSection({
  services,
  vendors,
  loading,
  actionServiceId,
  onToggleFeature,
  onPromote,
  onRefresh,
  onToastSuccess,
  onToastError,
}: AdminServicesSectionProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(null);
  const [form, setForm] = useState<AdminServiceFormState>(defaultAdminServiceForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setCategories(await fetchAdminCategories());
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  function openCreate() {
    setEditingService(null);
    setForm(defaultAdminServiceForm());
    setModalOpen(true);
  }

  function openEdit(service: AdminService) {
    if (service.id == null) return;
    setEditingService(service);
    setForm(adminServiceToForm(service, vendors));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingService(null);
    setForm(defaultAdminServiceForm());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      onToastError("Hizmet başlığı zorunludur.");
      return;
    }
    if (!form.vendorId) {
      onToastError("İşletme seçin.");
      return;
    }
    if (!form.categoryId) {
      onToastError("Kategori seçin.");
      return;
    }

    const payload: VendorServicePayload = {
      ...form,
      city: formatCityForApi(form.city),
    };

    setSaving(true);
    try {
      if (editingService?.id != null) {
        await updateAdminService(
          editingService.id,
          form.vendorId,
          payload,
        );
        onToastSuccess("Hizmet güncellendi.");
      } else {
        await createAdminService(form.vendorId, payload);
        onToastSuccess("Hizmet eklendi.");
      }
      closeModal();
      await onRefresh();
    } catch (err) {
      onToastError(formatApiErrorMessage(err, "Kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(service: AdminService) {
    const id = service.id;
    if (id == null) return;
    const label = service.title ?? "bu hizmet";
    if (!window.confirm(`"${label}" hizmetini silmek istediğinize emin misiniz?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteAdminService(id);
      onToastSuccess("Hizmet silindi.");
      if (editingService?.id === id) closeModal();
      await onRefresh();
    } catch (err) {
      onToastError(formatApiErrorMessage(err, "Hizmet silinemedi."));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Hizmetler</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Marketplace hizmetleri — ekle, düzenle, öne çıkar ve tanıt.
          </p>
        </div>
        <button type="button" className={btnPrimary} onClick={openCreate}>
          Hizmet ekle
        </button>
      </div>

      <ServiceListTable
        services={services}
        loading={loading}
        actionServiceId={actionServiceId}
        deletingId={deletingId}
        onToggleFeature={onToggleFeature}
        onPromote={onPromote}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <AdminServiceFormModal
        open={modalOpen}
        editing={editingService}
        form={form}
        saving={saving}
        vendors={vendors}
        categories={categories}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onSubmit={(e) => void handleSubmit(e)}
        onClose={closeModal}
      />
    </>
  );
}
