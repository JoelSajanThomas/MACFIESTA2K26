import { formatDate } from "./dashboardUtils";

export default function EventTable({ events }) {
  if (!events.length) {
    return <div className="dash-empty">No events found.</div>;
  }

  const publishedCount = events.filter((e) => e.is_result_published).length;
  const pendingCount = events.length - publishedCount;

  return (
    <>
      <div className="dash-result-summary">
        <span className="dash-result-stat published">
          <strong>{publishedCount}</strong> Published
        </span>
        <span className="dash-result-stat pending">
          <strong>{pendingCount}</strong> Pending
        </span>
      </div>

      <div className="dash-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Event</th>
              <th>Category</th>
              <th>Date</th>
              <th>Venue</th>
              <th>Participants</th>
              <th>Registration</th>
              <th>Result Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((ev) => (
              <tr key={ev.id} className={ev.is_result_published ? "row-published" : "row-pending"}>
                <td data-label="Event"><strong>{ev.title}</strong></td>
                <td data-label="Category"><span className="dash-tag">{ev.category}</span></td>
                <td data-label="Date">{formatDate(ev.event_date)}</td>
                <td data-label="Venue">{ev.venue}</td>
                <td data-label="Participants">
                  <span className="dash-highlight">{ev.participant_count ?? 0}</span>
                </td>
                <td data-label="Registration">
                  <span className={`dash-badge ${ev.is_registration_open ? "open" : "closed"}`}>
                    {ev.is_registration_open ? "Open" : "Closed"}
                  </span>
                </td>
                <td data-label="Result Status">
                  <span
                    className={`dash-result-pill ${
                      ev.is_result_published ? "published" : "pending"
                    }`}
                  >
                    <span className="dash-result-dot" />
                    {ev.is_result_published ? "Published" : "Pending"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
