"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/src/contexts/AuthContext";

export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
