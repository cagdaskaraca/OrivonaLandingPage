"use client";

import type { ReactNode } from "react";
import { OrivonaSiteHeader } from "@/src/components/nav/OrivonaSiteHeader";

type DemoShellProps = {
  title: string;
  subtitle?: string;
  /** Center the page title block (e.g. login). */
  centerHeader?: boolean;
  /** Fixed top nav for customer/vendor/admin dashboards. */
  stickyNav?: boolean;
  /** Override main container layout (rare; use sparingly). */
  mainClassName?: string;
  children: ReactNode;
};

export function DemoShell({
  title,
  subtitle,
  centerHeader = false,
  stickyNav = false,
  mainClassName,
  children,
}: DemoShellProps) {
  return (
    <div
      className={`relative min-h-screen text-zinc-100 ${
        stickyNav ? "orivona-dashboard-shell" : ""
      }`}
    >
      <OrivonaSiteHeader
        variant="app"
        fixed={stickyNav}
        showSearch={stickyNav}
      />
      <main
        className={`relative z-10 ${
          mainClassName ?? "mx-auto max-w-6xl px-4 sm:px-6"
        } ${
          stickyNav
            ? "orivona-main-below-header pb-10 sm:pb-14"
            : "orivona-main-below-header py-10 sm:py-14"
        }`}
      >
        <div
          className={`mb-8 ${centerHeader ? "mx-auto max-w-md text-center" : ""}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            ORIVONA
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p
              className={`mt-3 text-sm text-zinc-400 sm:text-base ${
                centerHeader ? "mx-auto" : "max-w-2xl"
              }`}
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
