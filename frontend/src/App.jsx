import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Layout/NavBar";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import AvailabilitiesPage from "./pages/AvailabilitiesPage.jsx";
import { ShiftManagementPage } from "./pages/ShiftManagementPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/employees" replace />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/availabilities" element={<AvailabilitiesPage />} />
        <Route path="/shifts" element={<ShiftManagementPage />} />
        <Route path="/login" element={<Navigate to="/employees" replace />} />
        <Route path="*" element={<Navigate to="/employees" replace />} />
      </Routes>
    </>
  );
}
