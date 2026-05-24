"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";

function scrollToSection(elementId: string) {
  document.getElementById(elementId)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function SmoothScrollToSection({
  sectionId,
  className,
  children,
  ...rest
}: {
  sectionId: string;
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "onClick">) {
  return (
    <a
      {...rest}
      href="/"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        scrollToSection(sectionId);
      }}
    >
      {children}
    </a>
  );
}

export function SmoothScrollToTop({
  className,
  children,
  ...rest
}: {
  children: ReactNode;
} & Omit<ComponentProps<"a">, "href" | "onClick">) {
  const pathname = usePathname();

  if (pathname !== "/") {
    return (
      <Link href="/" className={className} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <a
      {...rest}
      href="/"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
    >
      {children}
    </a>
  );
}
