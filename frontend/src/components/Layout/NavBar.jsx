import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import "./NavBar.css";

const NAV_LINKS = [
  { to: "/employees", label: "Employees" },
  { to: "/availabilities", label: "Availabilities" },
  { to: "/shifts", label: "Shift Management" }
];

export default function NavBar() {
  const barRef = useRef(null);
  const location = useLocation();
  const [indicatorRect, setIndicatorRect] = useState(null);

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
  }, [location.pathname, updateIndicator]);

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
    <nav className="navbar" ref={barRef}>
      <span className="navbar__indicator" style={indicatorStyle} />
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
