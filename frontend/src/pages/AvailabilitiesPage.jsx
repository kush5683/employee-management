import { useState } from "react";
import AvailabilityManager from "../components/AvailabilityManager/AvailabilityManager";
import TeamAvailabilityMatrix from "../components/AvailabilityManager/TeamAvailabilityMatrix.jsx";
import MyAvailability from "../components/AvailabilityManager/MyAvailability.jsx";
import { useAuth } from "../context/AuthContext.jsx";

import "./ShiftManagementPage.css"; // reuse layout styles

export default function AvailabilitiesPage() {
  const { isManager, user } = useAuth();
  const [availabilityVersion, setAvailabilityVersion] = useState(0);

  const handleAvailabilityChange = () => {
    setAvailabilityVersion((prev) => prev + 1);
  };

  return (
    <div className="page-wrap">
      <header className="hero">
        <h1>{isManager ? "Employee Availabilities" : "My Availability"}</h1>
        <p>
          {isManager
            ? "Define and manage weekly availability windows for each team member."
            : "Review and update the availability managers use when building the schedule."}
        </p>
      </header>

      {isManager ? (
        <>
          <AvailabilityManager onAvailabilityChange={handleAvailabilityChange} />
          <div style={{ marginTop: 16 }}>
            <TeamAvailabilityMatrix refreshKey={availabilityVersion} />
          </div>
        </>
      ) : (
        <>
          <AvailabilityManager
            onAvailabilityChange={handleAvailabilityChange}
            employeeOverride={{ _id: user?.id, name: user?.name, role: user?.role }}
            canSelectEmployee={false}
          />
          <div style={{ marginTop: 16 }}>
            <MyAvailability employeeId={user?.id} refreshKey={availabilityVersion} />
          </div>
        </>
      )}
    </div>
  );
}

