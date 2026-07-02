import type { LoginPayload, RegisterPayload, AuthResponse, AuthUser, ApiResult } from "./types";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${API}${path}`, {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    const json = (await res.json()) as ApiResult<T>;
    return json;
  } catch {
    return { success: false, error: { code: "NETWORK_ERROR", message: "Tidak dapat terhubung ke server." } };
  }
}

export async function register(payload: RegisterPayload): Promise<ApiResult<{ userId: string; message: string }>> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload): Promise<ApiResult<AuthResponse>> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout(): Promise<ApiResult<{ message: string }>> {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

export async function refreshToken(): Promise<ApiResult<{ accessToken: string }>> {
  return apiFetch("/api/auth/refresh", { method: "POST" });
}

export async function getMe(accessToken: string): Promise<ApiResult<AuthUser>> {
  return apiFetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function forgotPassword(email: string): Promise<ApiResult<{ message: string }>> {
  return apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<ApiResult<{ message: string }>> {
  return apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export async function verifyEmail(token: string): Promise<ApiResult<{ message: string }>> {
  return apiFetch("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function buildGoogleLoginUrl(): string {
  return `${API}/api/auth/google`;
}
