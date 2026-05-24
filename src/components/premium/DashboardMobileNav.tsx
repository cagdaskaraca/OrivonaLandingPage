"use client";

import Link from "next/link";

type NavItem = { id: string; label: string; href?: string };

type DashboardMobileNavProps = {
  items: NavItem[];
};

export function DashboardMobileNav({ items }: DashboardMobileNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-[#06040c]/95 px-2 py-2 backdrop-blur-xl lg:hidden"
      aria-label="Mobil navigasyon"
    >
      <ul className="flex justify-around gap-1">
        {items.slice(0, 5).map((item) => (
          <li key={item.id} className="flex-1">
            {item.href ? (
              <Link
                href={item.href}
                className="flex flex-col items-center rounded-lg px-1 py-2 text-[10px] font-medium text-zinc-400 hover:bg-white/[0.06] hover:text-violet-200"
              >
                {item.label}
              </Link>
            ) : (
              <button
                type="button"
                className="flex w-full flex-col items-center rounded-lg px-1 py-2 text-[10px] font-medium text-zinc-400 hover:bg-white/[0.06] hover:text-violet-200"
                onClick={() => {
                  document
                    .getElementById(item.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
