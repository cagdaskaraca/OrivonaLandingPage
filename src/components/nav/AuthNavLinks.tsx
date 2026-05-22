"use client";

import Link from "next/link";
import { useAuth } from "@/src/contexts/AuthContext";

const linkClass =
  "transition-[color,text-shadow] duration-300 hover:text-white hover:drop-shadow-[0_0_14px_rgba(167,139,250,0.55)]";

const compactLinkClass = "hover:text-violet-200";

type AuthNavLinksProps = {
  variant?: "landing" | "demo";
};

export function AuthNavLinks({ variant = "demo" }: AuthNavLinksProps) {
  const { loading, isAuthenticated, hesabimPath, logout } = useAuth();
  const cls = variant === "landing" ? linkClass : compactLinkClass;

  if (loading) {
    return <span className="text-xs text-zinc-500">…</span>;
  }

  if (isAuthenticated) {
    return (
      <>
        <Link href={hesabimPath} className={cls}>
          Hesabım
        </Link>
        <button
          type="button"
          className={cls}
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
        >
          Çıkış
        </button>
      </>
    );
  }

  return (
    <>
      <Link href="/login" className={cls}>
        Giriş Yap
      </Link>
      <Link href="/register" className={cls}>
        Kayıt Ol
      </Link>
    </>
  );
}
