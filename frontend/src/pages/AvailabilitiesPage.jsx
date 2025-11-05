import AvailabilityManager from "../components/AvailabilityManager/AvailabilityManager";
import "./ShiftManagementPage.css"; // reuse layout styles

export default function AvailabilitiesPage() {
  return (
    <div className="page-wrap">
      <header className="hero">
        <h1>Employee Availabilities</h1>
        <p>Define and manage weekly availability windows for each employee.</p>
      </header>

      <AvailabilityManager />
    </div>
  );
}
