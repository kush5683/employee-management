import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { EmployeesAPI, AvailabilityAPI } from "../../services/apiClient";
import "./TeamAvailabilityMatrix.css";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Format "HH:mm" or "HH:mm:ss" or "HHmm" into "h:mm AM/PM". */
function fmt(time) {
  if (!time) return "";
  let h, m;
  if (time.includes(":")) {
    [h, m] = time.split(":");
  } else if (time.length >= 3) {
    h = time.slice(0, time.length - 2);
    m = time.slice(-2);
  }
  h = Number(h ?? 0);
  m = Number(m ?? 0);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 || 12;
  const mm = String(m).padStart(2, "0");
  return `${hh}:${mm} ${ampm}`;
}

/** Build a [employeeId][day] => [{start,end}] lookup */
function indexWindows(rows) {
  const byEmp = {};
  for (const r of rows) {
    const dayIdx =
      typeof r.dayOfWeek === "number"
        ? r.dayOfWeek
        : Math.max(0, DAYS.findIndex((d) => d.toLowerCase() === String(r.dayOfWeek).toLowerCase()));
    if (!byEmp[r.employeeId]) byEmp[r.employeeId] = Array(7)
      .fill(0).map(() => []);
    if (dayIdx >= 0 && dayIdx < 7) {
      byEmp[r.employeeId][dayIdx].push({ start: r.startTime, end: r.endTime });
    }
  }
  return byEmp;
}

export default function TeamAvailabilityMatrix({ refreshKey = 0 }) {
  const [employees, setEmployees] = useState([]);
  const [matrix, setMatrix] = useState({});     // { [employeeId]: [dayIdx] => [{start,end}] }
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setErr(null);

        const emps = await EmployeesAPI.list(); // [{_id, name, ...}]
        if (cancelled) return;
        setEmployees(emps);

        // Fetch each employee's weekly windows (simple + reliable)
        const all = await Promise.all(
          emps.map(async (e) => {
            const rows = await AvailabilityAPI.listByEmployee(e._id || e.id);
            return rows.map((r) => ({ ...r, employeeId: e._id || e.id }));
          })
        );

        if (cancelled) return;
        const flat = all.flat();
        setMatrix(indexWindows(flat));
      } catch (e) {
        if (!cancelled) setErr(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const hasData = useMemo(
    () => employees.length > 0,
    [employees]
  );

  return (
    <section className="team-matrix-card">
      <div className="team-matrix__header">
        <h2>Team Availability</h2>
        <p>Weekly windows summarized by person and weekday. Refresh to see updated availability</p>
      </div>

      {loading && <div className="team-matrix__state">Loading availability…</div>}
      {err && <div className="team-matrix__state error">Failed to load: {err.message || String(err)}</div>}
      {!loading && hasData && (
        <div className="team-matrix__table-wrap">
          <table className="team-matrix">
            <thead>
              <tr>
                <th className="sticky-col">Team Member</th>
                {DAYS.map((d) => (
                  <th key={d}>{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => {
                const id = e._id || e.id;
                const row = matrix[id] || Array(7).fill(0).map(() => []);
                return (
                  <tr key={id}>
                    <th className="sticky-col name-col">{e.name || e.email || id}</th>
                    {row.map((cells, dayIdx) => {
                      if (!cells || cells.length === 0) return <td key={dayIdx} className="none">—</td>;
                      // If multiple windows per day, list them stacked
                      return (
                        <td key={dayIdx}>
                          {cells.map((w, i) => (
                            <div className="chip" key={i}>
                              {fmt(w.start)}–{fmt(w.end)}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !hasData && <div className="team-matrix__state">No employees yet.</div>}
    </section>
  );
}

TeamAvailabilityMatrix.propTypes = {
  refreshKey: PropTypes.number
};
