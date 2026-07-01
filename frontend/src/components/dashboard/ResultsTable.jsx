import { POSITION_LABELS } from "./dashboardUtils";

export default function ResultsTable({ results }) {
  if (!results.length) {
    return <div className="dash-empty">No results published yet.</div>;
  }

  return (
    <div className="dash-table-wrap">
      <table className="dash-table">
        <thead>
          <tr>
            <th>Event</th>
            <th>Winner</th>
            <th>College</th>
            <th>Position</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.id}>
              <td data-label="Event">{r.event_title}</td>
              <td data-label="Winner"><strong>{r.participant_name}</strong></td>
              <td data-label="College">{r.college_name}</td>
              <td data-label="Position">
                <span className="dash-tag gold">
                  {POSITION_LABELS[r.position] || r.position}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
