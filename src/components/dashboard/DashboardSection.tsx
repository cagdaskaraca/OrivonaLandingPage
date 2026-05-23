import type { ReactNode } from "react";
import { glassCard } from "@/src/lib/ui";

type DashboardSectionProps = {
  id: string;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function DashboardSection({
  id,
  title,
  children,
  className = "",
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-[calc(var(--orivona-dashboard-nav-h)+5rem)] ${className}`}
      aria-labelledby={title ? `${id}-heading` : undefined}
    >
      <div className={`${glassCard} mb-8`}>
        {title ? (
          <h2
            id={`${id}-heading`}
            className="mb-4 text-lg font-semibold text-white"
          >
            {title}
          </h2>
        ) : null}
        {children}
      </div>
    </section>
  );
}
