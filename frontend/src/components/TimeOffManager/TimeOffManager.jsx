import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import './TimeOffManager.css';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'cancelled'];

const INITIAL_FORM = {
  employeeId: '',
  startDate: '',
  endDate: '',
  reason: ''
};

/**
 * TimeOffManager
 * - Managers: create requests for anyone, change statuses, delete records.
 * - Employees: submit requests for themselves (using JWT identity) and view status chips.
 */
export function TimeOffManager({
  employees,
  requests,
  loading,
  error,
  onCreate,
  onUpdateStatus,
  onDelete,
  mode = 'manager',
  currentUser
}) {
  const isManagerView = mode === 'manager';
  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    employeeId: isManagerView ? '' : currentUser?.id || ''
  }));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [listError, setListError] = useState(null);

  const canSubmit = useMemo(() => {
    const hasDates = form.startDate && form.endDate;
    return isManagerView ? Boolean(form.employeeId && hasDates) : Boolean(hasDates);
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
      const payload = isManagerView
        ? form
        : {
            startDate: form.startDate,
            endDate: form.endDate,
            reason: form.reason
          };
      await onCreate(payload);
      setForm((prev) => ({
        ...INITIAL_FORM,
        employeeId: isManagerView ? '' : prev.employeeId
      }));
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="timeoff-manager">
      <header className="timeoff-manager__header">
        <div>
          <h2>Time Off Requests</h2>
          <p>Log and manage PTO, sick days, and other leave.</p>
        </div>
      </header>

      <form className="timeoff-manager__form" onSubmit={handleSubmit}>
        <div className="timeoff-manager__grid">
          {isManagerView ? (
            <label className="timeoff-manager__field">
              <span>Team Member</span>
              <select name="employeeId" value={form.employeeId} onChange={handleChange} required>
                <option value="">Select person…</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} · {employee.role}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="timeoff-manager__field">
              <span>Team Member</span>
              <input type="text" value={currentUser?.name || currentUser?.email || 'You'} disabled />
            </label>
          )}

          <label className="timeoff-manager__field">
            <span>Start Date</span>
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          </label>

          <label className="timeoff-manager__field">
            <span>End Date</span>
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required />
          </label>

          <label className="timeoff-manager__field timeoff-manager__field--full">
            <span>Reason</span>
            <input name="reason" type="text" value={form.reason} onChange={handleChange} placeholder="Optional notes" />
          </label>
        </div>

        {formError ? <p className="timeoff-manager__error">{formError}</p> : null}

        <button type="submit" disabled={!canSubmit || submitting}>
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </form>

      {error ? <p className="timeoff-manager__error">{error.message}</p> : null}
      {listError ? <p className="timeoff-manager__error">{listError}</p> : null}

      <div className="timeoff-manager__list">
        {loading ? (
          <p className="timeoff-manager__empty">Loading requests…</p>
        ) : requests.length ? (
          <ul>
            {requests.map((request) => {
              const employee = employees.find((person) => person.id === request.employeeId);
              return (
                <li key={request.id} className="timeoff-manager__item">
                  <div>
                    <h3>{employee ? employee.name : request.employeeId}</h3>
                    <p>
                      {new Date(request.startDate).toLocaleDateString()} → {new Date(request.endDate).toLocaleDateString()}
                    </p>
                    {request.reason ? <p className="timeoff-manager__reason">{request.reason}</p> : null}
                  </div>
                  <div className="timeoff-manager__actions">
                    {isManagerView ? (
                      <>
                        <select
                          value={request.status}
                          onChange={async (event) => {
                            try {
                              setListError(null);
                              await onUpdateStatus(request.id, event.target.value);
                            } catch (err) {
                              setListError(err instanceof Error ? err.message : 'Unable to update status.');
                            }
                          }}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setListError(null);
                              await onDelete(request.id);
                            } catch (err) {
                              setListError(err instanceof Error ? err.message : 'Unable to delete request.');
                            }
                          }}
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <>
                        <span className={`timeoff-manager__status timeoff-manager__status--${request.status}`}>
                          {request.status}
                        </span>
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              setListError(null);
                              await onDelete(request.id);
                            } catch (err) {
                              setListError(err instanceof Error ? err.message : 'Unable to cancel request.');
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="timeoff-manager__empty">No time off requests yet.</p>
        )}
      </div>
    </section>
  );
}

TimeOffManager.propTypes = {
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      role: PropTypes.string
    })
  ).isRequired,
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      employeeId: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      reason: PropTypes.string,
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
