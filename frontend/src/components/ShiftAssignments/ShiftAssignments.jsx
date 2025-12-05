import { useMemo, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import './ShiftAssignments.css';

const SHIFT_STATUS_OPTIONS = ['scheduled', 'in-progress', 'completed', 'cancelled'];

const INITIAL_FORM = {
  employeeId: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  status: 'scheduled'
};

/**
 * ShiftAssignments
 * Manager view: full CRUD, employee selector, inline status updates and removals.
 * Employee view: read-only table showing their shifts without edit affordances.
 */
export function ShiftAssignments({
  employees,
  shifts,
  loading,
  error,
  onCreate,
  onUpdateStatus,
  onDelete,
  mode = 'manager',
  currentUser
}) {
  const isManagerView = mode === 'manager';
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [listError, setListError] = useState(null);
  const [feedback, setFeedback] = useState('');
  const feedbackTimer = useRef(null);

  // Employees never touch the form, so we guard against accidental submissions.
  const canSubmit = useMemo(() => {
    if (!isManagerView) return false;
    return form.employeeId && form.date && form.startTime && form.endTime;
  }, [form, isManagerView]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSubmit || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setFormError(null);
      setListError(null);
      await onCreate(form);
      setForm(INITIAL_FORM);
      showFeedback('Shift created.');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create shift.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentUserLabel = currentUser?.name || currentUser?.email || 'You';

  const showFeedback = (message) => {
    setFeedback(message);
    if (feedbackTimer.current) {
      clearTimeout(feedbackTimer.current);
    }
    feedbackTimer.current = setTimeout(() => setFeedback(''), 2800);
  };

  return (
    <section className="shifts">
      <header className="shifts__header">
        <div>
          <h2>Shift Assignments</h2>
          <p>
            {isManagerView
              ? 'Create and manage scheduled coverage for your team.'
              : `${currentUserLabel}, these are the shifts assigned to you.`}
          </p>
        </div>
      </header>

            {isManagerView ? (
        <form className="shifts__form" onSubmit={handleSubmit}>
          <div className="shifts__grid">
            <label className="shifts__field">
              <span>Team Member</span>
              <select
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="">Select person…</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} · {employee.role}
                  </option>
                ))}
              </select>
            </label>

            <label className="shifts__field">
              <span>Date</span>
              <input
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                className="input"
                required
              />
            </label>

            <label className="shifts__field">
              <span>Start</span>
              <input
                name="startTime"
                type="time"
                value={form.startTime}
                onChange={handleChange}
                className="input"
                required
              />
            </label>

            <label className="shifts__field">
              <span>End</span>
              <input
                name="endTime"
                type="time"
                value={form.endTime}
                onChange={handleChange}
                className="input"
                required
              />
            </label>

            <label className="shifts__field">
              <span>Location</span>
              <input
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                className="input"
                placeholder="Cambridge Cafe"
              />
            </label>

            <label className="shifts__field">
              <span>Status</span>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                {SHIFT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {formError ? <p className="shifts__error">{formError}</p> : null}

          <button type="submit" className="button button--primary" disabled={!canSubmit || submitting}>
            {submitting ? 'Saving…' : 'Add Shift'}
          </button>
        </form>
      ) : (
        <p className="shifts__note">Managers will update this schedule when new shifts are assigned.</p>
      )}

      {error ? <p className="shifts__error">{error.message}</p> : null}
      {listError ? <p className="shifts__error">{listError}</p> : null}
      {feedback ? <p className="shifts__feedback">{feedback}</p> : null}

      <div className="shifts__table-wrapper">
        <table className="shifts__table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Status</th>
              {isManagerView ? <th aria-label="actions" /> : null}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={isManagerView ? 7 : 6} className="shifts__empty">
                  Loading shifts…
                </td>
              </tr>
            ) : shifts.length ? (
              shifts.map((shift) => {
                const employee = employees.find((person) => person.id === shift.employeeId);
                return (
                  <tr key={shift.id}>
                    <td>{employee ? employee.name : shift.employeeId}</td>
                    <td>{shift.date ? new Date(shift.date).toLocaleDateString() : '—'}</td>
                    <td>{shift.startTime}</td>
                    <td>{shift.endTime}</td>
                    <td>{shift.location || '—'}</td>
                    <td>
                      {isManagerView ? (
                        <select
                          value={shift.status}
                          className="input"
                          onChange={async (event) => {
                            try {
                              setListError(null);
                              await onUpdateStatus(shift.id, { status: event.target.value });
                              showFeedback('Status updated.');
                            } catch (err) {
                              setListError(err instanceof Error ? err.message : 'Unable to update status.');
                            }
                          }}
                        >
                          {SHIFT_STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className={`shifts__status shifts__status--${shift.status}`}>{shift.status}</span>
                      )}
                    </td>
                    {isManagerView ? (
                      <td>
                        <button
                          type="button"
                          className="shifts__delete button button--secondary"
                          onClick={async () => {
                            try {
                              setListError(null);
                              await onDelete(shift.id);
                              showFeedback('Shift removed.');
                            } catch (err) {
                              setListError(err instanceof Error ? err.message : 'Unable to delete shift.');
                            }
                          }}
                        >
                          Remove
                        </button>
                      </td>
                    ) : null}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={isManagerView ? 7 : 6} className="shifts__empty">
                  {isManagerView ? 'No shifts scheduled yet. Add your first one above.' : 'No shifts scheduled yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

ShiftAssignments.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string
    })
  ).isRequired,
  shifts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      employeeId: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      startTime: PropTypes.string.isRequired,
      endTime: PropTypes.string.isRequired,
      location: PropTypes.string,
      status: PropTypes.string
    })
  ).isRequired,
  loading: PropTypes.bool,
  error: PropTypes.shape({ message: PropTypes.string }),
  onCreate: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['manager', 'employee']),
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string
  })
};
