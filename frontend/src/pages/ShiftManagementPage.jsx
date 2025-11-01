import { useMemo } from 'react';
import { Layout } from '../components/Layout/Layout.jsx';
import { ShiftAssignments } from '../components/ShiftAssignments/ShiftAssignments.jsx';
import { TimeOffManager } from '../components/TimeOffManager/TimeOffManager.jsx';
import { useShifts } from '../hooks/useShifts.js';
import { useTimeOffRequests } from '../hooks/useTimeOff.js';
import { EMPLOYEES } from '../data/sampleData.js';
import './ShiftManagementPage.css';

// -----------------------------------------------------------------------------
// ShiftManagementPage
// -----------------------------------------------------------------------------
// Focused view for CRUD around shift assignments and time-off requests.

export function ShiftManagementPage() {
  const shiftsState = useShifts();
  const timeOffState = useTimeOffRequests();

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
        <h1>Coordinate shifts and time-off in one view.</h1>
        <p className="shift-page__subtitle">
          Add coverage, adjust statuses, and respond to leave requests without switching
          screens. All actions sync directly with the MongoDB collections.
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
        <li>
          <span>Pending Time Off</span>
          <strong>{stats.timeOffPending}</strong>
        </li>
      </ul>
    </div>
  );

  return (
    <Layout header={header} sidebar={sidebar}>
      <ShiftAssignments
        employees={EMPLOYEES}
        shifts={shiftsState.shifts}
        loading={shiftsState.loading}
        error={shiftsState.error}
        onCreate={shiftsState.createShift}
        onUpdateStatus={(id, updates) => shiftsState.updateShift(id, updates)}
        onDelete={shiftsState.deleteShift}
      />
      <TimeOffManager
        employees={EMPLOYEES}
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
