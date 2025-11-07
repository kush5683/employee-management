import AvailabilityManager from "../components/AvailabilityManager/AvailabilityManager";
import TeamAvailabilityMatrix from "../components/AvailabilityManager/TeamAvailabilityMatrix.jsx";
import MyAvailability from "../components/AvailabilityManager/MyAvailability.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import "./ShiftManagementPage.css"; // reuse layout styles

export default function AvailabilitiesPage() {
  const { isManager, user } = useAuth();

  return (
    <div className="page-wrap">
      <header className="hero">
        <h1>{isManager ? "Employee Availabilities" : "My Availability"}</h1>
        <p>
          {isManager
            ? "Define and manage weekly availability windows for each team member."
            : "Review the availability details that managers use when building the schedule."}
        </p>
      </header>

      {/* Managers see the admin tools + team matrix, contributors only see their own snapshot */}
      {isManager ? (
        <>
          <AvailabilityManager />
          <div style={{ marginTop: 16 }}>
            <TeamAvailabilityMatrix />
          </div>
        </>
      ) : (
        <MyAvailability employeeId={user?.id} />
      )}
    </div>
  );
}

