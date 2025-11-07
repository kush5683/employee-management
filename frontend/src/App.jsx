import { Routes, Route, Navigate } from "react-router-dom";

import NavBar from "./components/Layout/NavBar";
import EmployeesPage from "./pages/EmployeesPage.jsx";
import AvailabilitiesPage from "./pages/AvailabilitiesPage.jsx";
import { ShiftManagementPage } from "./pages/ShiftManagementPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import { useAuth } from "./context/AuthContext.jsx";

export default function App() {
  const { isAuthenticated, isManager } = useAuth();
  const homePath = isManager ? "/employees" : "/availabilities";

  if (!isAuthenticated) {
    // Unauthenticated users only see the login route until they provide credentials.
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
        <Route path="/" element={<Navigate to={homePath} replace />} />
        <Route
          path="/employees"
          element={isManager ? <EmployeesPage /> : <Navigate to="/availabilities" replace />}
        />
        <Route path="/availabilities" element={<AvailabilitiesPage />} />
        <Route path="/shifts" element={<ShiftManagementPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<Navigate to={homePath} replace />} />
        <Route path="*" element={<Navigate to={homePath} replace />} />
      </Routes>
    </>
  );
}
