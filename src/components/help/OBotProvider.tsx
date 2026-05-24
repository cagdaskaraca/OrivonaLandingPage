"use client";

import { usePathname } from "next/navigation";
import { OBotWidget } from "@/src/components/help/OBotWidget";
import { useAuth } from "@/src/contexts/AuthContext";
import { toHelpAssistantRole } from "@/src/lib/obot/types";

const OBOT_ROUTE_PATTERNS: RegExp[] = [
  /^\/$/,
  /^\/marketplace\/?$/,
  /^\/services\/[^/]+\/?$/,
  /^\/customer\/dashboard\/?$/,
  /^\/vendor\/dashboard\/?$/,
];

function isObotRoute(pathname: string): boolean {
  return OBOT_ROUTE_PATTERNS.some((re) => re.test(pathname));
}

export function OBotProvider() {
  const pathname = usePathname() ?? "";
  const { role } = useAuth();

  if (!isObotRoute(pathname)) return null;

  const assistantRole = toHelpAssistantRole(role);

  return <OBotWidget role={assistantRole} />;
}
