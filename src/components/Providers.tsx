"use client";

import type { ReactNode } from "react";
import { OBotProvider } from "@/src/components/help/OBotProvider";
import { OrivonaGlobalBackground } from "@/src/components/landing/OrivonaGlobalBackground";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { ToastProvider } from "@/src/contexts/ToastContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <OrivonaGlobalBackground />
        <div className="relative z-[1] flex min-h-full flex-1 flex-col">
          {children}
        </div>
        <OBotProvider />
      </AuthProvider>
    </ToastProvider>
  );
}
