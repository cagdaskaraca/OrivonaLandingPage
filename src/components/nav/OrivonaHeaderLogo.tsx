import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  orivonaLogoBox,
  orivonaLogoImageClass,
} from "@/src/lib/orivonaHeader";

type OrivonaHeaderLogoProps = {
  href?: string;
  wrapper?: (props: {
    className: string;
    children: ReactNode;
  }) => ReactNode;
  priority?: boolean;
};

export function OrivonaHeaderLogo({
  href = "/",
  wrapper,
  priority = false,
}: OrivonaHeaderLogoProps) {
  const logo = (
    <span className={orivonaLogoBox}>
      <Image
        src="/orivona-logo.png"
        alt="ORIVONA"
        width={320}
        height={96}
        priority={priority}
        className={orivonaLogoImageClass}
      />
    </span>
  );

  const linkClass =
    "flex min-w-0 items-center transition-opacity hover:opacity-90";

  if (wrapper) {
    return <>{wrapper({ className: linkClass, children: logo })}</>;
  }

  return (
    <Link href={href} className={linkClass}>
      {logo}
    </Link>
  );
}
