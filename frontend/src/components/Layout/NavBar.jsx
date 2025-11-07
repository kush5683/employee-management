import { NavLink } from "react-router-dom";
import "./NavBar.css";

export default function NavBar() {
  return (
    <nav className="navbar">
      <NavLink
        to="/employees"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Employees
      </NavLink>

      <NavLink
        to="/availabilities"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Availabilities
      </NavLink>

      <NavLink
        to="/shifts"
        className={({ isActive }) =>
          isActive ? "nav-item active" : "nav-item"
        }
      >
        Shift Management
      </NavLink>
    </nav>
  );
}