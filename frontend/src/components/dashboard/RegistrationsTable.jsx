export default function RegistrationsTable({ registrations }) {
  if (!registrations.length) {
    return <div className="dash-empty">No registrations yet.</div>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>College</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Event</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((r) => (
            <tr key={r.id}>
              <td data-label="Participant"><strong>{r.participant_name}</strong></td>
              <td data-label="College">{r.college_name}</td>
              <td data-label="Email">{r.email}</td>
              <td data-label="Phone">{r.phone}</td>
              <td data-label="Event">{r.event_title}</td>
              <td data-label="Payment">
                <span className={`dash-badge payment-${r.payment_status}`}>
                  {r.payment_status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
