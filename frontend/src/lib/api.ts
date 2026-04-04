const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

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

// ── Members ─────────────────────────────────────────────────────────────────

export interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  student_id: string;
  program: string;
  study_year: number;
  photo_base64: string | null;
  is_active: boolean;
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
}

export interface CreateMemberPayload {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  student_id: string;
  program: string;
  study_year: number;
  photo_base64?: string | null;
}

export const api = {
  createMember: (data: CreateMemberPayload) =>
    request<Member>("/api/members", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getMember: (id: string) => request<Member>(`/api/members/${id}`),

  getCardData: (id: string) =>
    request<MemberCardData>(`/api/members/${id}/card-data`),

  listMembers: (params?: {
    search?: string;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.is_active !== undefined)
      query.set("is_active", String(params.is_active));
    if (params?.page) query.set("page", String(params.page));
    if (params?.per_page) query.set("per_page", String(params.per_page));
    return request<Member[]>(`/api/members?${query}`);
  },

  updateMember: (id: string, data: Partial<CreateMemberPayload> & { is_active?: boolean }) =>
    request<Member>(`/api/members/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteMember: (id: string) =>
    request<void>(`/api/members/${id}`, { method: "DELETE" }),

  getStats: () => request<MemberStats>("/api/members/stats/overview"),

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

  getMe: () => request<{ id: string; email: string; full_name: string }>("/api/auth/me"),
};
