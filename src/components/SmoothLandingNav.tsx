"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import {
  homeSectionHref,
  scrollToHomeHashWhenReady,
  setPendingHashScroll,
} from "@/src/lib/scrollToDashboardSection";

function isHomePath(pathname: string): boolean {
  return pathname === "/" || pathname === "";
}

export function SmoothScrollToSection({
  sectionId,
  className,
  children,
  onClick,
  ...rest
}: {
  sectionId: string;
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname() ?? "";
  const href = homeSectionHref(sectionId);
  const onHome = isHomePath(pathname);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;

    if (onHome) {
      e.preventDefault();
      scrollToHomeHashWhenReady(`#${sectionId}`, {
        highlight: false,
        forceSameHash: true,
        updateHash: true,
      });
      return;
    }

    setPendingHashScroll(sectionId);
  }

  return (
    <Link {...rest} href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}

export function SmoothScrollToTop({
  className,
  children,
  ...rest
}: {
  children: ReactNode;
} & Omit<ComponentProps<typeof Link>, "href">) {
  const pathname = usePathname();

  if (!isHomePath(pathname ?? "")) {
    return (
      <Link href="/" className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className={className}
      {...rest}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {children}
    </Link>
  );
}
