import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Layout/NavBar";

import EmployeesPage from "./pages/EmployeesPage.jsx";
import AvailabilitiesPage from "./pages/AvailabilitiesPage.jsx";
import { ShiftManagementPage } from "./pages/ShiftManagementPage.jsx";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />

        <Route path="/employees" element={<EmployeesPage />} />

        <Route path="/availabilities" element={<AvailabilitiesPage />} />

        <Route path="/shifts" element={<ShiftManagementPage />} />
      </Routes>
    </>
  );
}