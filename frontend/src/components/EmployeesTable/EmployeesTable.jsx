import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './EmployeesTable.css';

// -----------------------------------------------------------------------------
// EmployeesTable Component
// -----------------------------------------------------------------------------
// Renders the roster list, including its inline creation form. All data flows
// through props so the component can run against local state, API responses, or
// mocked data with no modifications.

// Default values for the creation form. Keeping this object in one place makes
// resets trivial and ensures the UI stays in sync with the underlying schema.
const DEFAULT_FORM = {
  name: '',
  email: '',
  role: 'Team Member',
  hourlyRate: 18,
  location: '',
  active: true
};

export function EmployeesTable({ employees, loading, error, onCreate }) {
  // Track the form state locally; the rest of the table remains purely presentational.
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Basic validation: disable the submit button until all required fields exist.
  const canSubmit = useMemo(() => form.name && form.email && form.role, [form]);

  // Keep `handleChange` minimal by computing the new form state from the event.
  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      await onCreate(form);
      // Reset the form to a clean state so the user can add another employee quickly.
      setForm(DEFAULT_FORM);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create employee.');
    } finally {
      setSubmitting(false);
    }
  };

  // Split the markup into three sections: header copy, creation form, and data table.
  return (
    <section className="employees">
      {/* Section intro copy */}
      <header className="employees__header">
        <div>
          <h2>Team Roster</h2>
          <p>Manage employee availability and eligibility for scheduling.</p>
        </div>
      </header>

      {/* Employee creation form ------------------------------------------------ */}
      <form className="employees__form" onSubmit={handleSubmit}>
        <div className="employees__grid">
          {/* Individual field labels are stacked for clarity on smaller screens */}
          <label className="employees__field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              placeholder="Jane Doe"
            />
          </label>

          <label className="employees__field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              placeholder="jane@example.com"
            />
          </label>

          <label className="employees__field">
            <span>Role</span>
            <input
              name="role"
              type="text"
              required
              value={form.role}
              onChange={handleChange}
            />
          </label>

          <label className="employees__field">
            <span>Location</span>
            <input
              name="location"
              type="text"
              value={form.location}
              onChange={handleChange}
              placeholder="Boston HQ"
            />
          </label>

          <label className="employees__field">
            <span>Hourly Rate ($)</span>
            <input
              name="hourlyRate"
              type="number"
              min="0"
              step="0.5"
              value={form.hourlyRate}
              onChange={handleChange}
            />
          </label>

          <label className="employees__checkbox">
            <input
              name="active"
              type="checkbox"
              checked={form.active}
              onChange={handleChange}
            />
            <span>Eligible for scheduling</span>
          </label>
        </div>

        <button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? 'Saving…' : 'Add Employee'}
        </button>
      </form>

      {/* Display any surfaced errors beneath the form for quick feedback */}
      {error ? <p className="employees__error">{error.message}</p> : null}
      {formError ? <p className="employees__error">{formError}</p> : null}

      {/* Employee list -------------------------------------------------------- */}
      <div className="employees__table-wrapper">
        <table className="employees__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Location</th>
              <th>Hourly Rate</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="employees__loading">
                  Loading team members…
                </td>
              </tr>
            ) : employees.length ? (
              // Render the roster when we have data
              employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.email}</td>
                  <td>{employee.role}</td>
                  <td>{employee.location || '—'}</td>
                  <td>${employee.hourlyRate?.toFixed ? employee.hourlyRate.toFixed(2) : employee.hourlyRate}</td>
                  <td>
                    <span className={employee.active ? 'badge badge--success' : 'badge badge--muted'}>
                      {employee.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                {/* Friendly empty state when no employees exist */}
                <td colSpan="6" className="employees__empty">
                  No employees found yet. Add your first team member above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// Prop definitions keep the component self-documenting and surface mistakes in dev.
EmployeesTable.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      location: PropTypes.string,
      hourlyRate: PropTypes.number,
      active: PropTypes.bool
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  onCreate: PropTypes.func.isRequired
};
