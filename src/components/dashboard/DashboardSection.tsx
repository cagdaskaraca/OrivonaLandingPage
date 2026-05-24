import type { ReactNode } from "react";
import { glassCard, orivonaDashboardAnchor } from "@/src/lib/ui";

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
      className={`${orivonaDashboardAnchor} ${className}`}
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
