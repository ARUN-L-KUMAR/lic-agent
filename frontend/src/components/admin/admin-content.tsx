"use client";

import { ResourceManager, yesNo, trunc } from "@/components/admin/resource-manager";

const CATEGORIES = [
  "Protection", "Savings", "Endowment", "Money Back", "Whole Life", "Pension",
  "Child Plans", "ULIP", "Health", "Micro Insurance", "Riders",
].map((c) => ({ value: c, label: c }));

const PLAN_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => ({ value: s, label: s }));

export function AdminPlans() {
  return (
    <ResourceManager
      title="Plans"
      description="Only PUBLISHED plans are visible on the website. Mark plan data as verified only after checking official LIC documents."
      queryKey="admin-plans"
      itemName="Plan"
      removeLabel="Archive"
      api={{
        list: "/admin/plans",
        create: "/plans",
        update: (id) => `/plans/${id}`,
        remove: (id) => `/plans/${id}`,
      }}
      defaults={{ status: "DRAFT", category: "Protection", data_status: "unverified", is_featured: false, display_order: 0 }}
      columns={[
        { key: "plan_code", label: "Code" },
        { key: "name", label: "Name" },
        { key: "category", label: "Category" },
        { key: "status", label: "Status", render: (r) => <span className={`badge ${r.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}>{String(r.status)}</span> },
        { key: "is_featured", label: "Featured", render: (r) => yesNo(r.is_featured) },
      ]}
      fields={[
        { name: "plan_code", label: "Plan code", required: true },
        { name: "name", label: "Name", required: true },
        { name: "slug", label: "URL slug", required: true, hint: "lowercase-with-dashes" },
        { name: "category", label: "Category", type: "select", options: CATEGORIES },
        { name: "short_description", label: "Short description" },
        { name: "description", label: "Description", type: "textarea" },
        { name: "official_reference", label: "Official LIC reference (URL or document)" },
        { name: "data_status", label: "Data status", type: "select", options: [{ value: "unverified", label: "unverified" }, { value: "verified", label: "verified" }] },
        { name: "status", label: "Status", type: "select", options: PLAN_STATUS },
        { name: "is_featured", label: "Featured on homepage", type: "checkbox" },
        { name: "display_order", label: "Display order", type: "number" },
      ]}
    />
  );
}

export function AdminKnowledge() {
  return (
    <ResourceManager
      title="AI Knowledge"
      description="Questions and answers the AI assistant may use. Only add information you have verified from official LIC sources."
      queryKey="admin-faqs"
      itemName="FAQ"
      api={{ list: "/admin/faqs", create: "/admin/faqs", update: (id) => `/admin/faqs/${id}`, remove: (id) => `/admin/faqs/${id}` }}
      defaults={{ is_published: true, include_in_ai: true, display_order: 0 }}
      columns={[
        { key: "question", label: "Question", render: (r) => trunc(r.question, 90) },
        { key: "category", label: "Category" },
        { key: "is_published", label: "On website", render: (r) => yesNo(r.is_published) },
        { key: "include_in_ai", label: "Used by AI", render: (r) => yesNo(r.include_in_ai) },
      ]}
      fields={[
        { name: "question", label: "Question", type: "textarea", required: true },
        { name: "answer", label: "Answer", type: "textarea", required: true },
        { name: "category", label: "Category" },
        { name: "display_order", label: "Display order", type: "number" },
        { name: "is_published", label: "Show on website", type: "checkbox" },
        { name: "include_in_ai", label: "Use in AI answers", type: "checkbox" },
      ]}
    />
  );
}

export function AdminBlog() {
  return (
    <ResourceManager
      title="Blog"
      description="Only PUBLISHED posts appear on the website."
      queryKey="admin-blog"
      itemName="Post"
      api={{ list: "/admin/blog", create: "/admin/blog", update: (id) => `/admin/blog/${id}`, remove: (id) => `/admin/blog/${id}` }}
      defaults={{ status: "DRAFT" }}
      columns={[
        { key: "title", label: "Title" },
        { key: "status", label: "Status", render: (r) => <span className={`badge ${r.status === "PUBLISHED" ? "badge-success" : "badge-warning"}`}>{String(r.status)}</span> },
        { key: "published_at", label: "Published", render: (r) => (r.published_at ? new Date(String(r.published_at)).toLocaleDateString("en-IN") : "—") },
      ]}
      fields={[
        { name: "title", label: "Title", required: true },
        { name: "slug", label: "URL slug", hint: "Leave empty to generate from the title" },
        { name: "excerpt", label: "Excerpt" },
        { name: "content", label: "Content", type: "textarea", required: true },
        { name: "tags", label: "Tags", hint: "Comma separated" },
        { name: "status", label: "Status", type: "select", options: PLAN_STATUS },
        { name: "seo_title", label: "SEO title" },
        { name: "seo_description", label: "SEO description" },
      ]}
    />
  );
}

export function AdminTestimonials() {
  return (
    <ResourceManager
      title="Testimonials"
      description="Add only genuine feedback received from real customers, with their permission. Only published entries appear on the website."
      queryKey="admin-testimonials"
      itemName="Testimonial"
      api={{ list: "/admin/testimonials", create: "/admin/testimonials", update: (id) => `/admin/testimonials/${id}`, remove: (id) => `/admin/testimonials/${id}` }}
      defaults={{ rating: 5, is_published: false, display_order: 0 }}
      columns={[
        { key: "name", label: "Name" },
        { key: "location", label: "Location" },
        { key: "content", label: "Feedback", render: (r) => trunc(r.content, 80) },
        { key: "rating", label: "Rating" },
        { key: "is_published", label: "Published", render: (r) => yesNo(r.is_published) },
      ]}
      fields={[
        { name: "name", label: "Customer name", required: true },
        { name: "location", label: "Location" },
        { name: "content", label: "Feedback", type: "textarea", required: true },
        { name: "rating", label: "Rating (1-5)", type: "number" },
        { name: "plan_name", label: "Plan (optional)" },
        { name: "display_order", label: "Display order", type: "number" },
        { name: "is_published", label: "Publish on website", type: "checkbox" },
      ]}
    />
  );
}
