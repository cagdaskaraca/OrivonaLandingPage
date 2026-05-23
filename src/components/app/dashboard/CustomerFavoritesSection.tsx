"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchFavorites } from "@/src/lib/api";
import { isApiNotFound, logApiError } from "@/src/lib/api/client";
import type { FavoriteItem } from "@/src/lib/api/types";
import { useToast } from "@/src/contexts/ToastContext";
import { CUSTOMER_EMPTY_DATA_MESSAGE } from "@/src/lib/customerDashboard";

export function CustomerFavoritesSection() {
  const toast = useToast();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setFavorites(await fetchFavorites());
    } catch (e) {
      logApiError("Customer favorites", e);
      setFavorites([]);
      if (!isApiNotFound(e)) toast.error("Favoriler yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-zinc-500">Yükleniyor…</p>;
  if (favorites.length === 0) {
    return (
      <p className="text-sm text-zinc-500">
        {CUSTOMER_EMPTY_DATA_MESSAGE}{" "}
        <Link href="/marketplace" className="text-violet-300 hover:text-violet-200">
          Marketplace
        </Link>
        &apos;ten keşfedebilirsiniz.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-sm">
      {favorites.map((f) => (
        <li
          key={String(f.id ?? f.vendorServiceId)}
          className="rounded-lg border border-white/10 px-3 py-2"
        >
          <p className="font-medium text-white">{f.serviceTitle ?? "Hizmet"}</p>
          <p className="text-zinc-400">
            {f.vendorName} · {[f.city, f.district].filter(Boolean).join(" · ")}
          </p>
        </li>
      ))}
    </ul>
  );
}
