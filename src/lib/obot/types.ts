import type { UserRole } from "@/src/lib/api/types";

export type HelpAssistantRole = "customer" | "vendor" | "admin" | "anonymous";

export type OBotAction = {
  id: string;
  label: string;
  href?: string;
  sectionId?: string;
};

export type OBotReply = {
  answer: string;
  actions?: OBotAction[];
  suggestedQuestions?: string[];
};

export type OBotChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
  actions?: OBotAction[];
  suggestedQuestions?: string[];
};

export function toHelpAssistantRole(role: UserRole | null): HelpAssistantRole {
  if (!role) return "anonymous";
  if (role === "Customer") return "customer";
  if (role === "Vendor") return "vendor";
  if (role === "Admin") return "admin";
  return "anonymous";
}
