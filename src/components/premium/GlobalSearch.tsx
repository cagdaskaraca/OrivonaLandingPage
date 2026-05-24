"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchGlobalSearch, type GlobalSearchHit } from "@/src/lib/api/premiumSaas";
import { logApiError } from "@/src/lib/api/client";
import { searchGroupLabel } from "@/src/lib/premiumLabels";
import { inputClass, orivonaDropdownScroll } from "@/src/lib/ui";

function groupHits(hits: GlobalSearchHit[]): Map<string, GlobalSearchHit[]> {
  const map = new Map<string, GlobalSearchHit[]>();
  for (const hit of hits) {
    const label = searchGroupLabel(hit.type);
    const list = map.get(label) ?? [];
    list.push(hit);
    map.set(label, list);
  }
  return map;
}

type GlobalSearchProps = {
  /** Fits inside the 88px site header without changing bar height. */
  compact?: boolean;
};

export function GlobalSearch({ compact = false }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<GlobalSearchHit[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flatHits = hits.filter((h) => h.url);

  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (trimmed.length < 2) {
      setHits([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const results = await fetchGlobalSearch(trimmed);
      setHits(results);
      setOpen(true);
      setActiveIndex(-1);
    } catch (err) {
      logApiError("Global search", err);
      setHits([]);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function navigateTo(hit: GlobalSearchHit) {
    if (!hit.url) return;
    setOpen(false);
    setQuery("");
    if (hit.url.startsWith("http")) {
      window.location.href = hit.url;
    } else {
      router.push(hit.url);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || flatHits.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatHits.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? flatHits.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      navigateTo(flatHits[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const grouped = groupHits(hits);
  let flatIdx = -1;

  return (
    <div
      ref={wrapRef}
      className={`relative w-full ${compact ? "max-w-none" : "max-w-md"}`}
    >
      <input
        type="search"
        className={`${inputClass} pr-10 text-sm ${
          compact ? "!h-10 !max-h-10 !min-h-10 !py-2" : ""
        }`}
        placeholder="Her yerde ara..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => {
          if (query.trim().length >= 2) setOpen(true);
        }}
        onKeyDown={onKeyDown}
        aria-label="Global arama"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      {loading ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
          …
        </span>
      ) : null}

      {open && query.trim().length >= 2 ? (
        <div
          className={`${orivonaDropdownScroll} absolute left-0 right-0 top-[calc(100%+0.5rem)] z-[200] max-h-[min(24rem,70vh)] overflow-y-auto overflow-x-hidden rounded-2xl border border-violet-200/15 bg-[#0c0814]/98 p-2 shadow-[0_24px_64px_-12px_rgba(0,0,0,0.85)] backdrop-blur-xl`}
          role="listbox"
        >
          {hits.length === 0 && !loading ? (
            <p className="px-3 py-4 text-center text-sm text-zinc-500">
              Sonuç bulunamadı.
            </p>
          ) : (
            [...grouped.entries()].map(([group, items]) => (
              <div key={group} className="mb-2 last:mb-0">
                <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-300/80">
                  {group}
                </p>
                <ul>
                  {items.map((hit) => {
                    flatIdx += 1;
                    const idx = flatIdx;
                    const isActive = idx === activeIndex;
                    const content = (
                      <>
                        <span className="block font-medium text-white">{hit.title}</span>
                        {hit.description ? (
                          <span className="mt-0.5 block text-xs text-zinc-500 line-clamp-1">
                            {hit.description}
                          </span>
                        ) : null}
                      </>
                    );
                    return (
                      <li key={`${group}-${hit.title}-${idx}`}>
                        {hit.url ? (
                          <button
                            type="button"
                            role="option"
                            aria-selected={isActive}
                            className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                              isActive
                                ? "bg-violet-500/20 text-violet-50"
                                : "hover:bg-white/[0.06]"
                            }`}
                            onClick={() => navigateTo(hit)}
                          >
                            {content}
                          </button>
                        ) : (
                          <div className="px-3 py-2 text-sm text-zinc-500">{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
