import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AvailabilityAPI } from "../../services/apiClient.js";
import "./MyAvailability.css";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function formatRange(start, end) {
  if (!start || !end) return "—";
  const format = (value) => {
    const [h, m] = value.split(":");
    const hour = Number(h);
    const minute = Number(m || 0);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${ampm}`;
  };
  return `${format(start)} – ${format(end)}`;
}

/**
 * Read-only single-employee availability summary used by non-manager accounts.
 */
export default function MyAvailability({ employeeId, refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!employeeId) return;
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await AvailabilityAPI.listByEmployee(employeeId);
        if (!cancelled) {
          setRows(data);
        }
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId, refreshKey]);

  const dayLookup = useMemo(() => {
    const map = new Map();
    for (const entry of rows) {
      const dayIdx = Number(entry.dayOfWeek);
      if (!map.has(dayIdx)) {
        map.set(dayIdx, []);
      }
      map.get(dayIdx).push({ start: entry.startTime, end: entry.endTime });
    }
    return map;
  }, [rows]);

  return (
    <section className="my-availability">
      <header>
        <h2>Your weekly windows</h2>
        <p>These times inform the scheduling team when you are available.</p>
      </header>

      {loading ? <p className="my-availability__state">Loading availability…</p> : null}
      {error ? (
        <p className="my-availability__state error">{error.message || "Unable to load availability."}</p>
      ) : null}

      {!loading && !error ? (
        <table>
          <tbody>
            {DAYS.map((day, idx) => {
              const slots = dayLookup.get(idx) || [];
              return (
                <tr key={day}>
                  <th>{day}</th>
                  <td>
                    {slots.length ? (
                      slots.map((slot, i) => (
                        <span key={`${day}-${i}`} className="my-availability__chip">
                          {formatRange(slot.start, slot.end)}
                        </span>
                      ))
                    ) : (
                      <span className="my-availability__muted">No availability set</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}

MyAvailability.propTypes = {
  employeeId: PropTypes.string,
  refreshKey: PropTypes.number
};
