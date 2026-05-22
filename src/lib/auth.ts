import { apiGetRaw, apiPostPublic } from "@/src/lib/api/client";
import type {
  ApiEnvelope,
  AuthResponse,
  AuthUser,
  UserRole,
} from "@/src/lib/api/types";

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

/** Primary "Hesabım" destination by role (role dashboards). */
export function getHesabimPath(role: UserRole | null): string {
  if (!role) return "/login";
  return getDashboardPathForRole(role);
}

function normalizeAuthUser(raw: unknown): AuthUser {
  if (!raw || typeof raw !== "object") return {};
  const o = raw as Record<string, unknown>;
  const str = (key: string, alt?: string) => {
    const v = o[key] ?? (alt ? o[alt] : undefined);
    return typeof v === "string" ? v : undefined;
  };
  const rolesRaw = o.roles ?? o.Roles;
  const roles = Array.isArray(rolesRaw) ? rolesRaw.map(String) : undefined;
  const id =
    o.id != null
      ? String(o.id)
      : o.Id != null
        ? String(o.Id)
        : o.userId != null
          ? String(o.userId)
          : o.UserId != null
            ? String(o.UserId)
            : undefined;
  return {
    id,
    userId:
      o.userId != null
        ? String(o.userId)
        : o.UserId != null
          ? String(o.UserId)
          : id,
    email: str("email", "Email"),
    fullName: str("fullName", "FullName") ?? str("name", "Name"),
    name: str("name", "Name"),
    role: str("role", "Role"),
    roles,
  };
}

function extractAuthUserFromEnvelope(envelope: ApiEnvelope): AuthUser {
  if (envelope.success === false) {
    throw new Error(
      typeof envelope.message === "string"
        ? envelope.message
        : "Oturum doğrulanamadı.",
    );
  }
  const payload = envelope.data;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const obj = payload as Record<string, unknown>;
    if (obj.user && typeof obj.user === "object") {
      return normalizeAuthUser(obj.user);
    }
    return normalizeAuthUser(payload);
  }
  throw new Error("Geçersiz oturum yanıtı.");
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
  const body = await apiGetRaw<ApiEnvelope>("/auth/me");
  return extractAuthUserFromEnvelope(body);
}

export function logout(): void {
  removeToken();
}
