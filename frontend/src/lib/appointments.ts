import apiClient from "@/lib/api-client";

export interface Appointment {
  id: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  requested_date: string;
  confirmed_date?: string | null;
  meeting_type: string;
  status: string;
  purpose?: string | null;
  notes?: string | null;
  agent_notes?: string | null;
  meeting_link?: string | null;
  created_at: string;
}

export const MEETING_TYPES = [
  { value: "PHONE", label: "Phone call" },
  { value: "VIDEO", label: "Video call" },
  { value: "OFFICE", label: "Office visit" },
  { value: "HOME_VISIT", label: "Home visit" },
];

export const STATUS_BADGE: Record<string, string> = {
  REQUESTED: "badge-warning",
  CONFIRMED: "badge-success",
  RESCHEDULED: "badge-primary",
  COMPLETED: "badge-primary",
  CANCELLED: "badge-danger",
};

export const meetingLabel = (v: string) => MEETING_TYPES.find((m) => m.value === v)?.label ?? v;

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Kolkata" });

export const appointmentsService = {
  async list(status?: string): Promise<{ items: Appointment[]; total: number }> {
    const { data } = await apiClient.get("/appointments", { params: { per_page: 100, status } });
    return data;
  },
  async create(payload: { requested_date: string; meeting_type: string; purpose?: string; notes?: string }) {
    const { data } = await apiClient.post<Appointment>("/appointments", payload);
    return data;
  },
  async update(id: string, payload: { status?: string; confirmed_date?: string; agent_notes?: string; meeting_link?: string }) {
    const { data } = await apiClient.patch<Appointment>(`/appointments/${id}`, payload);
    return data;
  },
};
