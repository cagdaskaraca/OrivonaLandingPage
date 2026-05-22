"use client";

import { AuthNavLinks } from "@/src/components/nav/AuthNavLinks";
import { NotificationBell } from "@/src/components/nav/NotificationBell";

/** Auth links for homepage navbar (desktop + mobile). */
export function LandingNavAuth({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center gap-4 text-sm text-zinc-300 ${className}`.trim()}
    >
      <NotificationBell variant="landing" />
      <AuthNavLinks variant="landing" />
    </div>
  );
}
