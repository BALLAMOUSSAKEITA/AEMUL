const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("member_token") || localStorage.getItem("admin_token")
      : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Erreur ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function authedRequest<T>(path: string, tokenKey: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem(tokenKey) : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return request<T>(path, { ...options, headers });
}

// ── Members ─────────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program: string;
  study_level: string;
  photo_base64: string | null;
  is_active: boolean;
  is_approved: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberCardData {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  program: string;
  photo_base64: string | null;
  created_at: string;
}

export interface MemberStats {
  total_members: number;
  active_members: number;
  inactive_members: number;
  recent_registrations: number;
  pending_approvals: number;
}

export interface CreateMemberPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  program: string;
  study_level: string;
  photo_base64?: string | null;
}

export interface MemberRegistrationResult {
  member: Member;
  generated_password: string;
}

export interface MemberLoginResponse {
  access_token: string;
  token_type: string;
  must_change_password: boolean;
  is_approved: boolean;
}

export interface ProfileUpdatePayload {
  first_name?: string;
  last_name?: string;
  phone?: string;
  program?: string;
  study_level?: string;
  photo_base64?: string | null;
}

export const api = {
  // ── Member public ──
  createMember: (data: CreateMemberPayload) =>
    request<MemberRegistrationResult>("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  memberLogin: (email: string, password: string) =>
    request<MemberLoginResponse>("/api/members/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // ── Member authenticated ──
  getMyProfile: () => authedRequest<Member>("/api/members/me", "member_token"),

  changePassword: (new_password: string) =>
    authedRequest<{ message: string }>("/api/members/me/password", "member_token", {
      method: "PUT",
      body: JSON.stringify({ new_password }),
    }),

  updateProfile: (data: ProfileUpdatePayload) =>
    authedRequest<Member>("/api/members/me/profile", "member_token", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMyCard: () => authedRequest<MemberCardData>("/api/members/me/card", "member_token"),

  // ── Admin: members ──
  getMember: (id: string) => request<Member>(`/api/members/${id}`),

  getCardData: (id: string) =>
    request<MemberCardData>(`/api/members/${id}/card-data`),

  listMembers: (params?: {
    search?: string;
    is_active?: boolean;
    is_approved?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    if (params?.is_approved !== undefined)
      query.set("is_approved", String(params.is_approved));
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    return authedRequest<Member[]>(`/api/members?${query}`, "admin_token");
  },

  updateMember: (id: string, data: Partial<CreateMemberPayload> & { is_active?: boolean }) =>
    authedRequest<Member>(`/api/members/${id}`, "admin_token", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  approveMember: (id: string) =>
    authedRequest<Member>(`/api/members/${id}/approve`, "admin_token", {
      method: "PUT",
    }),

  deleteMember: (id: string) =>
    authedRequest<void>(`/api/members/${id}`, "admin_token", { method: "DELETE" }),

  getStats: () => authedRequest<MemberStats>("/api/members/stats/overview", "admin_token"),

  // ── Admin auth ──
  login: (email: string, password: string) =>
    request<{ access_token: string; token_type: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  seedAdmin: (email: string, password: string, full_name: string) =>
    request<unknown>("/api/auth/seed", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  getMe: () => authedRequest<{ id: string; email: string; full_name: string }>("/api/auth/me", "admin_token"),

  // ── Prayer times ──
  getPrayerTimes: () => request<PrayerTimesResponse>("/api/prayer-times"),
};

// ── Prayer Times ────────────────────────────────────────────────────────────

export interface PrayerTimeEntry {
  hijri: string;
  fajr_start: string;
  fajr_iqama: string;
  shurooq: string;
  zuhr_start: string;
  zuhr_iqama: string;
  asr_start: string;
  asr_iqama: string;
  maghrib_start: string;
  maghrib_iqama: string;
  isha_start: string;
  isha_iqama: string;
  jumah: string;
  jumah2: string;
}

export interface PrayerTimesResponse {
  times: Record<string, PrayerTimeEntry>;
  source: string;
}
