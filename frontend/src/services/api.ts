import type {
  Analytics,
  AnalyzeResult,
  DashboardState,
  HistoryItem,
  Intervention,
  MoodEntry,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "sereneai_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("Can't reach the SereneAI server. Check your connection and try again.", 0);
  }

  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : undefined;

  if (!res.ok) {
    const detail = (body as { detail?: string } | undefined)?.detail;
    if (res.status === 401) setToken(null);
    throw new ApiError(detail || "Something went wrong. Please try again.", res.status);
  }
  return body as T;
}

export const api = {
  base: API_URL,

  register: (data: { name: string; email: string; password: string; country: string; accepted_disclaimer: boolean }) =>
    request<{ access_token: string; user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ access_token: string; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () => request<User>("/api/auth/me"),

  updateMe: (data: Partial<Pick<User, "name" | "country" | "trusted_contact_name" | "trusted_contact_phone">>) =>
    request<User>("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (data: { current_password: string; new_password: string }) =>
    request<{ status: string }>("/api/users/me/password", { method: "POST", body: JSON.stringify(data) }),

  deleteAccount: () => request<{ status: string }>("/api/users/me", { method: "DELETE" }),

  exportData: () => request<Record<string, unknown>>("/api/users/me/export"),

  analyze: (data: { message: string; session_id?: number | null; user_reported_stress?: number | null }) =>
    request<AnalyzeResult>("/api/chat/analyze", { method: "POST", body: JSON.stringify(data) }),

  endSession: (id: number) => request(`/api/sessions/${id}/end`, { method: "POST" }),

  groundingLibrary: () => request<{ exercises: Intervention[] }>("/api/grounding/library"),

  startIntervention: (data: { type: string; session_id?: number | null }) =>
    request<{ id: number; session_id: number; type: string }>("/api/interventions", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateIntervention: (
    id: number,
    data: { completed?: boolean; feedback?: string; duration_seconds?: number }
  ) => request<Record<string, unknown>>(`/api/interventions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  history: () => request<{ items: HistoryItem[] }>("/api/history"),

  addMood: (data: { mood: string; stress_level?: string; anxiety_level?: string; note?: string }) =>
    request<MoodEntry>("/api/mood", { method: "POST", body: JSON.stringify(data) }),

  listMood: () => request<MoodEntry[]>("/api/mood"),

  deleteMood: (id: number) => request(`/api/mood/${id}`, { method: "DELETE" }),

  dashboard: () => request<DashboardState>("/api/dashboard"),

  analytics: (days = 7) =>
    request<Analytics>(`/api/analytics?days=${days}&tz_offset_minutes=${-new Date().getTimezoneOffset()}`),

  emergencyInfo: () => request("/api/emergency-info"),

  deleteSession: (id: number) => request(`/api/sessions/${id}`, { method: "DELETE" }),
};
