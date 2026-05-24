/** Shared ORIVONA site header tokens (88px bar). */

export const ORIVONA_HEADER_H_PX = 88;

export const orivonaHeaderShellFixed =
  "pointer-events-auto fixed top-0 left-0 right-0 isolate z-[200] w-full border-b border-white/10 bg-[#06040c]/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#06040c]/80";

export const orivonaHeaderShellRelative =
  "pointer-events-auto relative isolate z-[200] w-full border-b border-white/10 bg-[#06040c]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[#06040c]/80";

export const orivonaHeaderInner =
  "pointer-events-auto relative z-[1] mx-auto flex h-[var(--orivona-header-h)] min-h-[var(--orivona-header-h)] max-h-[var(--orivona-header-h)] w-full max-w-6xl items-center gap-3 px-4 sm:gap-4 sm:px-6";

export const orivonaHeaderStart =
  "pointer-events-auto relative z-[1] flex min-w-0 shrink-0 items-center";

export const orivonaHeaderCenter =
  "pointer-events-auto relative z-[1] hidden min-w-0 flex-1 items-center justify-center gap-5 px-2 md:flex lg:gap-6";

export const orivonaHeaderEnd =
  "pointer-events-auto relative z-[1] flex min-w-0 shrink-0 items-center justify-end";

export const orivonaLogoBox =
  "flex h-12 min-h-12 shrink-0 items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-3 py-2";

export const orivonaLogoImageClass =
  "h-10 w-auto max-h-10 object-contain object-left sm:h-11 sm:max-h-11";

export const orivonaNavLink =
  "pointer-events-auto relative z-[1] text-sm text-violet-100/90 transition-[color,text-shadow] duration-300 hover:text-white hover:drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]";

export const orivonaNavLinkMobile =
  "pointer-events-auto relative z-[1] text-xs font-medium text-zinc-400 transition-colors hover:text-violet-200";

export const orivonaHeaderActions =
  "flex shrink-0 items-center gap-4 text-sm text-zinc-300";
