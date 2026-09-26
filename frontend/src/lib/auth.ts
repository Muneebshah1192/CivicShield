export interface AuthUser {
  id: number;
  email: string;
  full_name: string;
  role: "CITIZEN" | "WORKER" | "OFFICER" | "SUPER_ADMIN" | "ADMIN" | string;
  phone?: string | null;
  department_id?: number | null;
  department_name?: string | null;
  created_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function setAuthSession(token: string, user: AuthUser, rememberMe = true) {
  if (typeof window === "undefined") return;
  const days = rememberMe ? 14 : 1;
  localStorage.setItem("civicshield_token", token);
  localStorage.setItem("civicshield_user", JSON.stringify(user));
  setCookie("civicshield_token", token, days);
  setCookie("civicshield_role", user.role.toUpperCase(), days);
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("civicshield_token");
  localStorage.removeItem("civicshield_user");
  deleteCookie("civicshield_token");
  deleteCookie("civicshield_role");
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem("civicshield_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("civicshield_token");
}

export function getRoleDashboardPath(role?: string): string {
  switch (role?.toUpperCase()) {
    case "OFFICER":
      return "/officer";
    case "WORKER":
      return "/worker";
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/super-admin";
    case "CITIZEN":
    default:
      return "/citizen";
  }
}

export async function loginWithCredentials(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Invalid credentials" }));
    throw new Error(errorData.detail || "Authentication failed");
  }
  return res.json();
}

export async function verifyOtpCode(email: string, otp: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Invalid OTP code" }));
    throw new Error(errorData.detail || "OTP verification failed");
  }
  return res.json();
}

export async function registerWithCredentials(data: {
  email: string;
  password: string;
  full_name: string;
  role?: string;
  phone?: string;
  department_id?: number;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(errorData.detail || "Registration failed");
  }
  return res.json();
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }
  return res.json();
}
