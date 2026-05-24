/** Shared ORIVONA demo / app surface styles (matches landing glass cards). */
export const glassCard =
  "rounded-2xl border border-violet-200/[0.07] bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 shadow-[0_12px_48px_-18px_rgba(24,12,48,0.75)] backdrop-blur-xl";

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none transition-colors focus:border-violet-400/40 focus:bg-white/[0.06]";

/** Dark-theme native select (options stay readable on Windows/Chrome). */
export const selectClass =
  `${inputClass} cursor-pointer appearance-none bg-zinc-950/90 text-white [&>option]:bg-zinc-900 [&>option]:text-zinc-100`;

export const btnPrimary =
  "inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-300 via-violet-400 to-fuchsia-400 px-6 py-2.5 text-sm font-semibold text-[#0a0612] shadow-[0_8px_28px_-6px_rgba(167,139,250,0.55)] transition-[transform,box-shadow] hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none";

export const btnSecondary =
  "inline-flex items-center justify-center rounded-full border border-violet-300/25 bg-violet-500/10 px-6 py-2.5 text-sm font-semibold text-violet-50 backdrop-blur-sm transition-[transform,background-color] hover:-translate-y-0.5 hover:bg-violet-500/18 disabled:opacity-50";

export const cardHover =
  "transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:shadow-[0_18px_48px_-16px_rgba(109,40,217,0.35)]";

export const badgeClass =
  "inline-flex rounded-full border border-violet-400/25 bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-100";

/** Marketplace featured service card glow (gold + purple). */
export const marketplaceFeaturedGlow =
  "ring-1 ring-amber-300/35 border-amber-200/20 shadow-[0_0_36px_-6px_rgba(251,191,36,0.45),0_0_56px_-12px_rgba(139,92,246,0.4)]";

export const skeletonClass =
  "animate-pulse rounded-xl bg-white/[0.06]";

/** Themed horizontal scroll for dashboard tables (see globals.css). */
export const orivonaScrollX = "orivona-scroll-x";

/** Themed vertical scroll for sticky sidebar nav. */
export const orivonaScrollY = "orivona-scroll-y";

/** Themed vertical scroll for dropdowns / floating menus (see globals.css). */
export const orivonaDropdownScroll = "orivona-dropdown-scroll";

/** Wrapper for wide tables inside dashboard content. */
export const dashboardTableWrap = `${orivonaScrollX} rounded-xl border border-white/[0.08] pb-0.5`;
