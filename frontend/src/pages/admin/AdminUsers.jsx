import { SAMPLE_COORDINATORS } from "../../utils/pageContent";

export default function AdminUsers() {
  return (
    <div className="admin-page">
      <header className="admin-page-head">
        <h1>Users</h1>
        <p>Sample coordinator accounts for testing. Manage real accounts via Django admin.</p>
      </header>

      <p className="sample-data-note">All entries below are dummy data — not real fest staff.</p>

      <div className="admin-users-table-wrap">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_COORDINATORS.map((u) => (
              <tr key={u.id}>
                <td data-label="Name">{u.name}</td>
                <td data-label="Role">{u.role}</td>
                <td data-label="Email">{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
