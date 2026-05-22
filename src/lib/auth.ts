import { apiGet, apiPostPublic } from "@/src/lib/api/client";
import type { AuthResponse, AuthUser, UserRole } from "@/src/lib/api/types";

const TOKEN_KEY = "orivona_auth_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function normalizeRole(role?: string | null): UserRole | null {
  if (!role) return null;
  const r = role.toLowerCase();
  if (r === "customer" || r === "user") return "Customer";
  if (r === "vendor" || r === "business") return "Vendor";
  if (r === "admin" || r === "administrator") return "Admin";
  return null;
}

export function getRoleFromUser(user?: AuthUser | null): UserRole | null {
  if (!user) return null;
  const direct = normalizeRole(user.role);
  if (direct) return direct;
  if (user.roles?.length) {
    for (const r of user.roles) {
      const n = normalizeRole(r);
      if (n) return n;
    }
  }
  return null;
}

export function getDashboardPathForRole(role: UserRole): string {
  switch (role) {
    case "Customer":
      return "/customer/dashboard";
    case "Vendor":
      return "/vendor/dashboard";
    case "Admin":
      return "/admin/dashboard";
    default:
      return "/login";
  }
}

function extractToken(data: AuthResponse): string | null {
  return data.token ?? data.accessToken ?? null;
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: AuthUser; role: UserRole | null }> {
  const data = await apiPostPublic<AuthResponse>("/auth/login", {
    email,
    password,
  });
  const token = extractToken(data);
  if (!token) throw new Error("Sunucu geçerli bir oturum anahtarı döndürmedi.");
  setToken(token);
  const user = data.user ?? { email, role: data.role };
  return { user, role: getRoleFromUser(user) ?? normalizeRole(data.role) };
}

export async function registerCustomer(payload: Record<string, unknown>) {
  const data = await apiPostPublic<AuthResponse>(
    "/auth/register/customer",
    payload,
  );
  const token = extractToken(data);
  if (token) setToken(token);
  return data;
}

export async function registerVendor(payload: Record<string, unknown>) {
  const data = await apiPostPublic<AuthResponse>(
    "/auth/register/vendor",
    payload,
  );
  const token = extractToken(data);
  if (token) setToken(token);
  return data;
}

export async function getCurrentUser(): Promise<AuthUser> {
  return apiGet<AuthUser>("/auth/me");
}

export function logout(): void {
  removeToken();
}
