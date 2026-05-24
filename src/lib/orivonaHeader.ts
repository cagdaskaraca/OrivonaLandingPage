/** Shared ORIVONA site header tokens (88px bar). */

export const ORIVONA_HEADER_H_PX = 88;

export const orivonaHeaderShellFixed =
  "fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/10 bg-[#06040c]/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#06040c]/80";

export const orivonaHeaderShellRelative =
  "relative z-[100] w-full border-b border-white/10 bg-[#06040c]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#06040c]/80";

export const orivonaHeaderInner =
  "mx-auto grid h-[var(--orivona-header-h)] min-h-[var(--orivona-header-h)] max-h-[var(--orivona-header-h)] w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-x-3 px-4 sm:gap-x-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]";

export const orivonaHeaderStart =
  "flex min-w-0 items-center justify-self-start";

export const orivonaHeaderCenter =
  "hidden min-w-0 items-center justify-center justify-self-center gap-5 md:flex lg:gap-6";

export const orivonaHeaderEnd =
  "flex min-w-0 items-center justify-end justify-self-end";

export const orivonaLogoBox =
  "flex h-12 min-h-12 shrink-0 items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-3 py-2";

export const orivonaLogoImageClass =
  "h-10 w-auto max-h-10 object-contain object-left sm:h-11 sm:max-h-11";

export const orivonaNavLink =
  "text-sm text-violet-100/90 transition-[color,text-shadow] duration-300 hover:text-white hover:drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]";

export const orivonaNavLinkMobile =
  "text-xs font-medium text-zinc-400 transition-colors hover:text-violet-200";

export const orivonaHeaderActions =
  "flex shrink-0 items-center gap-4 text-sm text-zinc-300";
