import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./NavBar.css";
import { useAuth } from "../../context/AuthContext.jsx";

/**
 * Base navigation links and the roles they belong to.
 * We hide manager-only tabs entirely when an employee signs in.
 */
const NAV_LINKS = [
  { to: "/employees", label: "Employees", managerOnly: true },
  { to: "/availabilities", label: "Availabilities" },
  { to: "/shifts", label: "Shift Management" },
  { to: "/settings", label: "Settings" }
];

export default function NavBar() {
  const { user, logout, isManager } = useAuth();
  const barRef = useRef(null);
  const location = useLocation();
  const [indicatorRect, setIndicatorRect] = useState(null);
  const links = NAV_LINKS.filter((link) => !link.managerOnly || isManager);

  /**
   * Measure the active nav item so the animated bubble can slide underneath it.
   */
  const updateIndicator = useCallback(() => {
    const container = barRef.current;
    if (!container) {
      return;
    }
    const activeLink = container.querySelector(".nav-item.active");
    if (!activeLink) {
      setIndicatorRect(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeLink.getBoundingClientRect();
    setIndicatorRect({
      width: activeRect.width,
      height: activeRect.height,
      x: activeRect.left - containerRect.left,
      y: activeRect.top - containerRect.top
    });
  }, []);

  useEffect(() => {
    updateIndicator();
  }, [location.pathname, links.length, updateIndicator]);

  useEffect(() => {
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [updateIndicator]);

  const indicatorStyle = indicatorRect
    ? {
        width: `${indicatorRect.width}px`,
        height: `${indicatorRect.height}px`,
        transform: `translate(${indicatorRect.x}px, ${indicatorRect.y}px)`,
        opacity: 1
      }
    : { opacity: 0 };

  return (
    <nav className="navbar">
      <div className="nav-links" ref={barRef}>
        {/* Bubble only renders when at least one link is visible (i.e. managers) */}
        {links.length ? <span className="navbar__indicator" style={indicatorStyle} /> : null}
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
          >
            {link.label}
          </NavLink>
        ))}
      </div>
      {user ? (
        <div className="nav-user">
          <div className="nav-user__meta">
            <span className="nav-user__name">{user.name ?? user.email}</span>
            <span className={`nav-role ${isManager ? 'nav-role--manager' : 'nav-role--employee'}`}>
              {isManager ? 'Manager' : 'Employee'}
            </span>
          </div>
          <button type="button" className="nav-logout" onClick={logout}>
            Log out
          </button>
        </div>
      ) : null}
    </nav>
  );
}
