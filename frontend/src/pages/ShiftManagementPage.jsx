import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout/Layout.jsx';
import { ShiftAssignments } from '../components/ShiftAssignments/ShiftAssignments.jsx';
import { TimeOffManager } from '../components/TimeOffManager/TimeOffManager.jsx';
import { useShifts } from '../hooks/useShifts.js';
import { useTimeOffRequests } from '../hooks/useTimeOff.js';
import { EmployeesAPI } from '../services/apiClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ShiftManagementPage.css';

// -----------------------------------------------------------------------------
// ShiftManagementPage
// -----------------------------------------------------------------------------
// Focused view for CRUD around shift assignments and time-off requests.

function mapEmployee(record) {
  if (!record) return null;
  return {
    id: record._id || record.id,
    name: record.name || record.email || 'Unnamed',
    role: record.role || 'Team Member'
  };
}

export function ShiftManagementPage() {
  const shiftsState = useShifts();
  const timeOffState = useTimeOffRequests();
  const { user, isManager } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    // Managers load the entire team list, while employees just hydrate their own profile.
    async function load() {
      if (!isManager) {
        setEmployees(user ? [mapEmployee({ ...user, _id: user.id })] : []);
        setEmployeesError(null);
        setEmployeesLoading(false);
        return;
      }

      try {
        setEmployeesLoading(true);
        setEmployeesError(null);
        const list = await EmployeesAPI.list();
        if (!cancelled) {
          setEmployees(list.map(mapEmployee).filter(Boolean));
        }
      } catch (err) {
        if (!cancelled) setEmployeesError(err);
      } finally {
        if (!cancelled) setEmployeesLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isManager, user]);

  const stats = useMemo(() => {
    const upcomingShifts = shiftsState.shifts.filter((shift) => shift.status !== 'completed');
    const pendingRequests = timeOffState.requests.filter((request) => request.status === 'pending');
    return {
      shifts: shiftsState.shifts.length,
      upcoming: upcomingShifts.length,
      timeOffPending: pendingRequests.length
    };
  }, [shiftsState.shifts, timeOffState.requests]);

  const header = (
    <div className="shift-page__hero">
      <div>
        <p className="shift-page__eyebrow">Scheduling Operations</p>
        <h1>{isManager ? 'Coordinate shifts and time-off in one view.' : 'See your schedule and submit time off.'}</h1>
        <p className="shift-page__subtitle">
          {isManager
            ? 'Add coverage, adjust statuses, and respond to leave requests without switching screens.'
            : 'Review the shifts assigned to you and send requests directly to your manager.'}
        </p>
      </div>
    </div>
  );

  const sidebar = (
    <div className="shift-page__sidebar">
      <h3>Quick Overview</h3>
      <ul>
        <li>
          <span>Total Shifts</span>
          <strong>{stats.shifts}</strong>
        </li>
        <li>
          <span>Upcoming / Active</span>
          <strong>{stats.upcoming}</strong>
        </li>
        {isManager ? (
          <li>
            <span>Pending Time Off</span>
            <strong>{stats.timeOffPending}</strong>
          </li>
        ) : null}
      </ul>
    </div>
  );

  return (
    <Layout header={header} sidebar={sidebar}>
      {employeesLoading ? (
        <div className="shift-page__notice">Loading employees…</div>
      ) : employeesError ? (
        <div className="shift-page__notice shift-page__notice--error">
          Unable to load employees: {employeesError.message}
        </div>
      ) : null}
      <ShiftAssignments
        mode={isManager ? 'manager' : 'employee'}
        currentUser={user}
        employees={employees}
        shifts={shiftsState.shifts}
        loading={shiftsState.loading}
        error={shiftsState.error}
        onCreate={shiftsState.createShift}
        onUpdateStatus={(id, updates) => shiftsState.updateShift(id, updates)}
        onDelete={shiftsState.deleteShift}
      />
      <TimeOffManager
        mode={isManager ? 'manager' : 'employee'}
        currentUser={user}
        employees={employees}
        requests={timeOffState.requests}
        loading={timeOffState.loading}
        error={timeOffState.error}
        onCreate={timeOffState.createRequest}
        onUpdateStatus={timeOffState.updateStatus}
        onDelete={timeOffState.deleteRequest}
      />
    </Layout>
  );
}
