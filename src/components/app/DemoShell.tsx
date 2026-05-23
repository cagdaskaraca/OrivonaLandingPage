"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthNavLinks } from "@/src/components/nav/AuthNavLinks";
import { NotificationBell } from "@/src/components/nav/NotificationBell";

type DemoShellProps = {
  title: string;
  subtitle?: string;
  /** Center the page title block (e.g. login). */
  centerHeader?: boolean;
  /** Fixed top nav for customer/vendor/admin dashboards. */
  stickyNav?: boolean;
  children: ReactNode;
};

const DASHBOARD_HEADER_CLASS =
  "fixed top-0 left-0 right-0 z-[100] w-full border-b border-white/10 bg-[#06040c]/90 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl supports-[backdrop-filter]:bg-[#06040c]/80";

export function DemoShell({
  title,
  subtitle,
  centerHeader = false,
  stickyNav = false,
  children,
}: DemoShellProps) {
  return (
    <div
      className={`relative min-h-screen bg-[#06040c] text-zinc-100 ${
        stickyNav ? "orivona-dashboard-shell" : "overflow-x-hidden"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.18),transparent_55%)]"
        aria-hidden
      />
      <header
        className={
          stickyNav
            ? DASHBOARD_HEADER_CLASS
            : "relative z-10 border-b border-white/10 bg-black/70 backdrop-blur-xl"
        }
      >
        <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <span className="flex items-center rounded-xl border border-violet-200/10 bg-white/[0.03] px-3 py-2">
              <Image
                src="/orivona-logo.png"
                alt="ORIVONA"
                width={120}
                height={36}
                className="h-8 w-auto object-contain"
              />
            </span>
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-medium text-zinc-400 sm:gap-x-4 sm:text-sm">
            <Link href="/marketplace" className="hover:text-violet-200">
              Marketplace
            </Link>
            <Link href="/ai-planner" className="hover:text-violet-200">
              AI Planlayıcı
            </Link>
            <NotificationBell variant="demo" />
            <AuthNavLinks variant="demo" />
          </div>
        </nav>
      </header>
      <main
        className={`relative z-10 mx-auto max-w-6xl px-4 sm:px-6 ${
          stickyNav
            ? "pt-[calc(var(--orivona-dashboard-nav-h)+1.5rem)] pb-10 sm:pb-14"
            : "py-10 sm:py-14"
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
