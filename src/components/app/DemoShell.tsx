"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { AuthNavLinks } from "@/src/components/nav/AuthNavLinks";
import { NotificationBell } from "@/src/components/nav/NotificationBell";

type DemoShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export function DemoShell({ title, subtitle, children }: DemoShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06040c] text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,rgba(167,139,250,0.18),transparent_55%)]"
        aria-hidden
      />
      <header className="relative z-10 border-b border-white/10 bg-black/70 backdrop-blur-xl">
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
      <main className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-300/90">
            ORIVONA
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-3 max-w-2xl text-sm text-zinc-400 sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {children}
      </main>
    </div>
  );
}
