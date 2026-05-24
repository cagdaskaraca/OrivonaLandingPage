"use client";

import type { ReactNode } from "react";
import { OBotProvider } from "@/src/components/help/OBotProvider";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ToastProvider } from "@/src/contexts/ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        {children}
        <OBotProvider />
      </AuthProvider>
    </ToastProvider>
  );
}
