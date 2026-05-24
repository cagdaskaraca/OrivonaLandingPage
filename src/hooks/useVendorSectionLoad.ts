"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/src/lib/api/client";
import { VendorSectionLoadError } from "@/src/lib/api/vendorDashboardFetch";
import { useAuth } from "@/src/contexts/AuthContext";

type UseVendorSectionLoadOptions = {
  enabled?: boolean;
};

/**
 * Loads vendor dashboard section data after auth is ready.
 * Does not surface errors while auth is still loading.
 */
export function useVendorSectionLoad<T>(
  fetcher: () => Promise<T>,
  options?: UseVendorSectionLoadOptions,
) {
  const { loading: authLoading, isAuthenticated } = useAuth();
  const enabled = options?.enabled ?? true;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (authLoading || !isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      if (err instanceof VendorSectionLoadError) {
        setError(err.message);
      } else if (err instanceof ApiError && err.status === 401) {
        setError(null);
      } else {
        setError("Veriler şu anda alınamadı.");
      }
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    if (authLoading) {
      setLoading(true);
      setError(null);
      return;
    }
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    void load();
  }, [enabled, authLoading, isAuthenticated, load]);

  return {
    data,
    loading: enabled && (loading || authLoading),
    error,
    reload: load,
    setData,
  };
}
