import { humanizeKnownApiError } from "@/src/lib/api/errorMessages";
import { getToken, removeToken } from "@/src/lib/auth";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function messageLooksLikeNotFound(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("404") ||
    m.includes("not found") ||
    m.includes("bulunamad") ||
    m === "notfound"
  );
}

export function isApiNotFound(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 404) return true;
  if (err instanceof ApiError && messageLooksLikeNotFound(err.message)) {
    return true;
  }
  if (err instanceof Error && messageLooksLikeNotFound(err.message)) {
    return true;
  }
  return false;
}

/** Runs a request; on 404 returns fallback and logs (optional). */
export async function withOptionalNotFound<T>(
  fn: () => Promise<T>,
  fallback: T,
  notFoundLog?: string,
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (isApiNotFound(err)) {
      if (notFoundLog) console.warn(notFoundLog);
      return fallback;
    }
    throw err;
  }
}

/** Logs API failures to console; never surfaces 404 to the UI. */
export function logApiError(context: string, err: unknown): void {
  if (isApiNotFound(err)) return;
  console.error(context, err);
  if (err instanceof ApiError) {
    console.error("Backend error message:", err.message);
    console.error("Backend error response", err.body);
  }
}

/** User-facing error text; never exposes raw 404 / Not Found strings. */
export function formatUiErrorMessage(err: unknown, fallback: string): string {
  if (isApiNotFound(err)) return fallback;
  const formatted = formatApiErrorMessage(err, fallback);
  if (messageLooksLikeNotFound(formatted)) return fallback;
  return formatted;
}

export function formatApiErrorMessage(err: unknown, fallback: string): string {
  if (isApiNotFound(err)) return fallback;
  if (!(err instanceof ApiError)) return fallback;
  return humanizeKnownApiError(err, fallback);
}

export function getApiBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";
  return base.replace(/\/$/, "");
}

function buildUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getApiBaseUrl()}${normalized}`;
}

async function parseBody<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return { message: text } as T;
  }
}

function unwrapData<T>(body: unknown): T {
  if (body && typeof body === "object" && "data" in body) {
    return (body as { data: T }).data;
  }
  return body as T;
}

async function request<T>(
  path: string,
  options: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);

  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(buildUrl(path), { ...rest, headers });

  const body = await parseBody<unknown>(res);

  if (res.status === 401) {
    throw new ApiError(401, "Oturum süresi doldu veya yetkisiz erişim.", body);
  }

  if (!res.ok) {
    let message = `İstek başarısız (${res.status})`;
    if (body && typeof body === "object") {
      if ("message" in body && (body as { message: unknown }).message != null) {
        message = String((body as { message: unknown }).message);
      } else if ("title" in body && (body as { title: unknown }).title != null) {
        message = String((body as { title: unknown }).title);
      }
    }
    throw new ApiError(res.status, message, body);
  }

  return unwrapData<T>(body);
}

export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET" });
}

export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function apiPostPublic<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
    auth: false,
  });
}

/** POST without unwrapping the top-level `data` field (for nested envelopes). */
export async function apiPostPublicRaw<T>(path: string, body: unknown): Promise<T> {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");

  const res = await fetch(buildUrl(path), {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });

  const parsed = await parseBody<unknown>(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parseApiErrorMessage(res.status, parsed),
      parsed,
    );
  }

  return parsed as T;
}

export function apiGetPublic<T>(path: string): Promise<T> {
  return request<T>(path, { method: "GET", auth: false });
}

/** GET without auth and without unwrapping the top-level `data` field. */
export async function apiGetPublicRaw<T>(path: string): Promise<T> {
  const res = await fetch(buildUrl(path), { method: "GET" });
  const parsed = await parseBody<unknown>(res);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      parseApiErrorMessage(res.status, parsed),
      parsed,
    );
  }

  return parsed as T;
}

function parseApiErrorMessage(
  status: number,
  parsed: unknown,
): string {
  let message = `İstek başarısız (${status})`;
  if (parsed && typeof parsed === "object") {
    if ("message" in parsed && (parsed as { message: unknown }).message != null) {
      message = String((parsed as { message: unknown }).message);
    } else if ("title" in parsed && (parsed as { title: unknown }).title != null) {
      message = String((parsed as { title: unknown }).title);
    }
  }
  return message;
}

/** Authenticated request without unwrapping the top-level `data` field. */
export async function requestRaw<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const headers = new Headers();
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (body !== undefined) headers.set("Content-Type", "application/json");

  const res = await fetch(buildUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const parsed = await parseBody<unknown>(res);

  if (!res.ok) {
    throw new ApiError(res.status, parseApiErrorMessage(res.status, parsed), parsed);
  }

  return parsed as T;
}

/** GET with Bearer token, without unwrapping the top-level `data` field. */
export async function apiGetRaw<T>(path: string): Promise<T> {
  return requestRaw<T>("GET", path);
}

export async function apiPostRaw<T>(path: string, body: unknown): Promise<T> {
  return requestRaw<T>("POST", path, body);
}

export async function apiPutRaw<T>(path: string, body: unknown): Promise<T> {
  return requestRaw<T>("PUT", path, body);
}

export async function apiPatchRaw<T>(path: string, body: unknown): Promise<T> {
  return requestRaw<T>("PATCH", path, body);
}

export async function apiDeleteRaw<T>(path: string): Promise<T> {
  return requestRaw<T>("DELETE", path);
}

export async function apiGetOptional<T>(path: string): Promise<T | null> {
  try {
    return await apiGet<T>(path);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 405)) {
      return null;
    }
    throw e;
  }
}

export function buildQuery(
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const q = search.toString();
  return q ? `?${q}` : "";
}
