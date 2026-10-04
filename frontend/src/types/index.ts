/**
 * TypeScript types for the platform
 */

export type UserRole = "CUSTOMER" | "AGENT" | "ADMIN";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar?: string;
  created_at: string;
}

export interface CustomerProfile {
  user_id: string;
  date_of_birth?: string;
  occupation?: string;
  income_range?: string;
  city?: string;
  state?: string;
  pincode?: string;
  family_size?: number;
  dependents?: number;
  financial_goals?: string[];
  risk_preference?: string;
  saved_plans?: string[];
}

export interface AgentProfile {
  user_id: string;
  agent_code?: string;
  license_number?: string;
  experience_years?: number;
  bio?: string;
  specialization?: string[];
  office_address?: string;
  office_phone?: string;
  profile_image?: string;
}

// ── Insurance Plans ────────────────────────────────────────

export type PlanCategory =
  | "Protection"
  | "Savings"
  | "Endowment"
  | "Money Back"
  | "Whole Life"
  | "Pension"
  | "Child Plans"
  | "ULIP"
  | "Health"
  | "Micro Insurance"
  | "Riders";

export type PlanStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface Plan {
  id: string;
  plan_code: string;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  category: PlanCategory;
  minimum_entry_age?: number;
  maximum_entry_age?: number;
  minimum_term?: number;
  maximum_term?: number;
  premium_frequency?: string[];
  minimum_premium?: number;
  maximum_premium?: number;
  minimum_sum_assured?: number;
  maximum_sum_assured?: number;
  maturity_benefits?: string;
  death_benefits?: string;
  survival_benefits?: string;
  tax_benefits?: string;
  features?: { text: string }[];
  eligibility?: string;
  documents_required?: string[];
  exclusions?: string;
  faq?: { question: string; answer: string }[];
  riders?: { name: string; description: string }[];
  official_reference?: string;
  last_verified_date?: string;
  data_status: string;
  cover_image?: string;
  status: PlanStatus;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PlanSummary {
  id: string;
  plan_code: string;
  name: string;
  slug: string;
  short_description?: string;
  category: PlanCategory;
  minimum_entry_age?: number;
  maximum_entry_age?: number;
  minimum_term?: number;
  maximum_term?: number;
  minimum_premium?: number;
  premium_frequency?: string[];
  cover_image?: string;
  is_featured: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

// ── Lead ────────────────────────────────────────────────────

export type LeadStatus = "NEW" | "CONTACTED" | "QUALIFIED" | "APPOINTMENT" | "CONVERTED" | "CLOSED";
export type LeadPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  age?: number;
  city?: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  requirement?: string;
  budget?: string;
  preferred_contact_time?: string;
  message?: string;
  created_at: string;
  updated_at: string;
}

// ── Appointment ─────────────────────────────────────────────

export type MeetingType = "Phone" | "Video" | "Office" | "Home Visit";
export type AppointmentStatus = "REQUESTED" | "CONFIRMED" | "RESCHEDULED" | "COMPLETED" | "CANCELLED";

export interface Appointment {
  id: string;
  customer_id: string;
  requested_date: string;
  confirmed_date?: string;
  meeting_type: MeetingType;
  status: AppointmentStatus;
  purpose?: string;
  notes?: string;
  meeting_link?: string;
  created_at: string;
}

// ── Chat ────────────────────────────────────────────────────

export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "AI";
export type ConversationStatus = "ACTIVE" | "PENDING" | "RESOLVED" | "CLOSED";

export interface Message {
  id: string;
  conversation_id: string;
  sender_id?: string;
  message_type: MessageType;
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
  created_at: string;
  delivered_at?: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  customer_id: string;
  agent_id?: string;
  status: ConversationStatus;
  source: string;
  ai_summary?: string;
  customer_unread: number;
  agent_unread: number;
  last_message_at?: string;
  created_at: string;
  last_message?: Message;
}

// ── Blog ────────────────────────────────────────────────────

export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_id: string;
  tags?: string[];
  status: PostStatus;
  published_at?: string;
  seo_title?: string;
  seo_description?: string;
  created_at: string;
}

// ── Site Settings ────────────────────────────────────────────

export interface SiteSettings {
  business_name: string;
  agent_name: string;
  agent_code?: string;
  license_number?: string;
  tagline?: string;
  hero_headline?: string;
  hero_subtext?: string;
  about_text?: string;
  years_experience?: string;
  customers_served?: string;
  plans_supported?: string;
  service_locations?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  office_address?: string;
  working_hours?: string;
  logo_url?: string;
  profile_image_url?: string;
  hero_image_url?: string;
  social_links?: Record<string, string>;
  main_disclaimer?: string;
  insurance_disclaimer?: string;
  ai_disclaimer?: string;
  calculator_disclaimer?: string;
}

// ── AI ──────────────────────────────────────────────────────

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; source_type: string }[];
  timestamp: Date;
}

// ── Analytics ────────────────────────────────────────────────

export interface AnalyticsDashboard {
  total_customers: number;
  new_leads_today: number;
  new_leads_week: number;
  open_enquiries: number;
  appointments_today: number;
  unread_chats: number;
  popular_plans: { name: string; views: number }[];
  leads_by_day: { date: string; count: number }[];
  calculator_usage: number;
  ai_sessions: number;
}
