"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "@/src/lib/api";
import { formatApiErrorMessage } from "@/src/lib/api/client";
import type {
  AdminCategory,
  AdminCategoryPayload,
  AdminService,
} from "@/src/lib/api/types";
import {
  activeStatusClass,
  formatAdminCategoryLabel,
  slugifyCategoryName,
} from "@/src/lib/adminDashboard";
import { linkedCountsForCategory } from "@/src/lib/adminCategoryLinks";
import { AdminCategoryEditModal } from "@/src/components/admin/AdminCategoryEditModal";
import { AdminPaginationBar } from "@/src/components/admin/AdminPaginationBar";
import { useAdminPagination } from "@/src/components/admin/useAdminPagination";
import { btnPrimary, btnSecondary, inputClass, skeletonClass } from "@/src/lib/ui";

function filterCategory(cat: AdminCategory, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [cat.name, cat.slug, cat.description]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

const btnDanger =
  "inline-flex items-center justify-center rounded-full border border-red-400/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-100 transition hover:bg-red-500/18 disabled:opacity-50";

function defaultForm(): AdminCategoryPayload {
  return { name: "", slug: "", description: "", isActive: true };
}

type AdminCategoryManagementProps = {
  allServices: AdminService[];
  onToastSuccess: (msg: string) => void;
  onToastError: (msg: string) => void;
};

export function AdminCategoryManagement({
  allServices,
  onToastSuccess,
  onToastError,
}: AdminCategoryManagementProps) {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState<AdminCategoryPayload>(defaultForm);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setCategories(await fetchAdminCategories());
    } catch (e) {
      setError(formatApiErrorMessage(e, "Kategoriler yüklenemedi."));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openCreate() {
    setEditingCategory(null);
    setForm(defaultForm());
    setSlugTouched(false);
    setShowCreateForm(true);
  }

  function openEdit(cat: AdminCategory) {
    if (cat.id == null) return;
    setShowCreateForm(false);
    setEditingCategory(cat);
    setForm({
      name: cat.name ?? "",
      slug: cat.slug ?? "",
      description: cat.description ?? "",
      isActive: cat.isActive !== false,
    });
    setSlugTouched(true);
  }

  function closeEditModal() {
    setEditingCategory(null);
    setForm(defaultForm());
  }

  function handleNameChange(name: string) {
    setForm((f) => ({
      ...f,
      name,
      slug: slugTouched ? f.slug : slugifyCategoryName(name),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      onToastError("Kategori adı zorunludur.");
      return;
    }
    const payload: AdminCategoryPayload = {
      name: form.name.trim(),
      description: form.description,
      isActive: form.isActive,
    };
    const slugTrim = (form.slug ?? "").trim();
    if (slugTrim) payload.slug = slugTrim;

    setSaving(true);
    try {
      if (editingCategory?.id != null) {
        await updateAdminCategory(editingCategory.id, payload);
        onToastSuccess("Kategori güncellendi.");
        closeEditModal();
      } else {
        await createAdminCategory(payload);
        onToastSuccess("Kategori eklendi.");
        setShowCreateForm(false);
        setForm(defaultForm());
      }
      await load();
    } catch (err) {
      onToastError(formatApiErrorMessage(err, "Kaydedilemedi."));
    } finally {
      setSaving(false);
    }
  }

  const {
    page,
    setPage,
    pageSize,
    setPageSize,
    searchQuery,
    setSearchQuery,
    pageItems,
    totalPages,
    totalCount,
  } = useAdminPagination(categories, { filterFn: filterCategory });

  const countsByCategoryId = useMemo(() => {
    const map = new Map<string, { serviceCount: number; vendorCount: number }>();
    for (const cat of categories) {
      if (cat.id == null) continue;
      map.set(String(cat.id), linkedCountsForCategory(cat, allServices));
    }
    return map;
  }, [categories, allServices]);

  async function handleDelete(id: string | number) {
    if (!window.confirm("Bu kategori silinsin mi?")) return;
    setDeletingId(id);
    try {
      await deleteAdminCategory(id);
      onToastSuccess("Kategori silindi.");
      if (editingCategory?.id === id) closeEditModal();
      await load();
    } catch (err) {
      onToastError(
        formatApiErrorMessage(
          err,
          "Kategori silinemedi. Bu kategoriye bağlı hizmetler olabilir.",
        ),
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="mt-1 text-sm text-zinc-500">
            Marketplace filtreleri ayrıca genel kategori listesini kullanır;
            burada yönetilen kayıtlar admin API üzerinden güncellenir.
          </p>
        </div>
        {!showCreateForm && editingCategory == null ? (
          <button type="button" className={btnPrimary} onClick={openCreate}>
            Kategori ekle
          </button>
        ) : null}
      </div>

      {showCreateForm ? (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-4 rounded-xl border border-violet-400/20 bg-violet-500/[0.06] p-4 sm:grid-cols-2"
        >
          <p className="text-sm font-medium text-white sm:col-span-2">
            Yeni kategori
          </p>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1.5 block text-xs text-zinc-400">Ad</span>
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">
              Bağlantı kodu (boş bırakılırsa otomatik oluşturulur)
            </span>
            <input
              className={inputClass}
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                setForm((f) => ({ ...f, slug: e.target.value }));
              }}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-xs text-zinc-400">Durum</span>
            <select
              className={inputClass}
              value={form.isActive ? "active" : "passive"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  isActive: e.target.value === "active",
                }))
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
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </label>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <button type="submit" className={btnPrimary} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Ekle"}
            </button>
            <button
              type="button"
              className={btnSecondary}
              onClick={() => {
                setShowCreateForm(false);
                setForm(defaultForm());
              }}
            >
              İptal
            </button>
          </div>
        </form>
      ) : null}

      <AdminCategoryEditModal
        open={editingCategory != null}
        category={editingCategory}
        allServices={allServices}
        form={form}
        saving={saving}
        onFormChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
        onNameChange={handleNameChange}
        onSlugTouched={() => setSlugTouched(true)}
        onSubmit={handleSubmit}
        onClose={closeEditModal}
      />

      {loading ? (
        <div className={`${skeletonClass} mt-4 h-40`} />
      ) : error ? (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-300/90">{error}</p>
          <button
            type="button"
            className={`${btnSecondary} mt-3 text-xs`}
            onClick={() => void load()}
          >
            Tekrar dene
          </button>
        </div>
      ) : categories.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">Henüz kayıt yok.</p>
      ) : (
        <div className="mt-4">
          <AdminPaginationBar
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Kategori ara..."
          />
          <div className="orivona-scroll-x rounded-xl border border-white/10 pb-0.5">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[0.03] text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Açıklama</th>
                  <th className="px-4 py-3">Bağlı</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {pageItems.map((cat) => {
                  const id = cat.id;
                  const busy = id != null && deletingId === id;
                  const counts =
                    id != null
                      ? countsByCategoryId.get(String(id))
                      : undefined;
                  const serviceCount =
                    counts?.serviceCount ?? cat.serviceCount ?? 0;
                  const vendorCount = counts?.vendorCount ?? 0;

                  return (
                    <tr
                      key={String(id ?? cat.slug)}
                      className="bg-white/[0.02] hover:bg-white/[0.04]"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-white">
                          {formatAdminCategoryLabel(cat)}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {cat.slug ?? "—"}
                        </p>
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-zinc-400">
                        {cat.description?.trim() || "—"}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        <span className="block text-sm">
                          {serviceCount} hizmet
                        </span>
                        {vendorCount > 0 ? (
                          <span className="text-xs text-zinc-500">
                            {vendorCount} işletme
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${activeStatusClass(cat.isActive)}`}
                        >
                          {cat.isActive === false ? "Pasif" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className={`${btnSecondary} !px-3 !py-1.5 text-xs`}
                            onClick={() => openEdit(cat)}
                          >
                            Düzenle
                          </button>
                          {id != null ? (
                            <button
                              type="button"
                              className={btnDanger}
                              disabled={busy}
                              onClick={() => void handleDelete(id)}
                            >
                              {busy ? "…" : "Sil"}
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pageItems.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Arama sonucu bulunamadı.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
