"use client";

import { type Appointment, STATUS_BADGE, formatDateTime, meetingLabel } from "@/lib/appointments";

export function AppointmentTable({
  items,
  showCustomer,
  renderActions,
}: {
  items: Appointment[];
  showCustomer?: boolean;
  renderActions?: (a: Appointment) => React.ReactNode;
}) {
  return (
    <div className="table-container">
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            {showCustomer && <th>Customer</th>}
            <th>Requested</th>
            <th>Type</th>
            <th>Purpose</th>
            <th>Status</th>
            {renderActions && <th />}
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id}>
              {showCustomer && (
                <td>
                  <div style={{ fontWeight: 600 }}>{a.customer_name}</div>
                  {a.customer_phone && <a href={`tel:${a.customer_phone}`} style={{ fontSize: "0.8rem" }}>{a.customer_phone}</a>}
                </td>
              )}
              <td>
                {formatDateTime(a.requested_date)}
                {a.confirmed_date && (
                  <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Confirmed: {formatDateTime(a.confirmed_date)}</div>
                )}
              </td>
              <td>{meetingLabel(a.meeting_type)}</td>
              <td>{a.purpose || "—"}</td>
              <td><span className={`badge ${STATUS_BADGE[a.status] ?? "badge-primary"}`}>{a.status}</span></td>
              {renderActions && <td style={{ whiteSpace: "nowrap" }}>{renderActions(a)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
