import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AvailabilityAPI, EmployeesAPI } from "../../services/apiClient";
import "./AvailabilityManager.css";

/** Weekday labels (0..6) */
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

/**
 * AvailabilityManager
 * - Select an employee
 * - Edit weekly availability (start/end per day)
 * - Save (upserts non-empty rows; deletes cleared rows)
 *
 * Expected backend endpoints:
 *   GET    /api/employees                             -> [{ _id, name, role, ... }]
 *   GET    /api/availabilities?employeeId=<id>        -> [{ _id, employeeId, dayOfWeek, startTime, endTime }]
 *   POST   /api/availabilities                         (body: { employeeId, dayOfWeek, startTime, endTime })
 *   DELETE /api/availabilities/one                     (body: { employeeId, dayOfWeek })
 */
export default function AvailabilityManager({ onAvailabilityChange }) {
  const [employees, setEmployees] = useState([]);
  const [empId, setEmpId] = useState("");
  const [rows, setRows] = useState(DAYS.map((_,i)=>({ dayOfWeek:i, startTime:"", endTime:"" })));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Fetch employees once
  useEffect(() => {
    (async () => {
      try {
        const data = await EmployeesAPI.list();
        setEmployees(data);
        if (data[0]?._id) setEmpId(data[0]._id);
      } catch {
        setErr("Failed to fetch employees");
      }
    })();
  }, []);

  const currentEmp = useMemo(() => employees.find(e => e._id === empId), [employees, empId]);

  // Load availability when employee changes
  useEffect(() => { if (empId) loadAvail(empId); }, [empId]);

  async function loadAvail(id) {
    try {
      setLoading(true);
      const list = await AvailabilityAPI.listByEmployee(id);
      const map = new Map(list.map(a => [a.dayOfWeek, a]));
      setRows(DAYS.map((_, i) => ({
        dayOfWeek: i,
        startTime: map.get(i)?.startTime || "",
        endTime:   map.get(i)?.endTime   || "",
      })));
      setErr("");
    } catch {
      setErr("Failed to fetch availability");
    } finally {
      setLoading(false);
    }
  }

  function updateRow(idx, field, value) {
    setRows(list => list.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function clearRow(idx) {
    setRows(list => list.map((row, i) => (i === idx ? { ...row, startTime: "", endTime: "" } : row)));
  }

  async function saveAll() {
    if (!empId) return;
    setLoading(true);
    try {
      const ops = rows.map((r) => {
        if (r.startTime && r.endTime) {
          return AvailabilityAPI.upsertOne({ employeeId: empId, ...r });
        }
        // If either is blank, remove the availability for that day
        return AvailabilityAPI.deleteOne(empId, r.dayOfWeek);
      });
      await Promise.all(ops);
      await loadAvail(empId);
      setErr("");
      if (typeof onAvailabilityChange === "function") {
        onAvailabilityChange();
      }
    } catch {
      setErr("Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="avail-card">
      <div className="avail-head">
        <div>
          <h2>Availability</h2>
          <p className="muted">Weekly windows per employee.</p>
        </div>
        <select
          className="avail-input avail-select"
          value={empId}
          onChange={(e) => setEmpId(e.target.value)}
        >
          {employees.map((e) => (
            <option key={e._id} value={e._id}>
              {e.name} — {e.role || "Employee"}
            </option>
          ))}
        </select>
      </div>

      {err && <div className="error">{err}</div>}
      {loading && <div className="muted">Loading…</div>}

      <table className="avail-table">
        <thead>
          <tr>
            <th>Day</th>
            <th style={{width: 220}}>Start</th>
            <th style={{width: 220}}>End</th>
            <th style={{width: 120}}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td>{DAYS[r.dayOfWeek]}</td>
              <td>
                <input
                  type="time"
                  className="avail-input"
                  value={r.startTime}
                  onChange={(e) => updateRow(idx, "startTime", e.target.value)}
                />
              </td>
              <td>
                <input
                  type="time"
                  className="avail-input"
                  value={r.endTime}
                  onChange={(e) => updateRow(idx, "endTime", e.target.value)}
                />
              </td>
              <td>
                <button className="btn subtle" onClick={() => clearRow(idx)}>Clear</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="avail-actions">
        {currentEmp && (
          <span className="muted" title={currentEmp.email || ""}>
            Editing: <strong>{currentEmp.name}</strong>
          </span>
        )}
        <button className="btn" onClick={saveAll}>Save Availability</button>
      </div>
    </section>
  );
}

AvailabilityManager.propTypes = {
  onAvailabilityChange: PropTypes.func
};
