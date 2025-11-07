import { useEffect, useState } from "react";
import { EmployeesAPI } from "../services/apiClient";
import { EmployeesTable } from "../components/EmployeesTable/EmployeesTable";
import "./EmployeesPage.css";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // NEW

  async function load() {
    try {
      setLoading(true);
      const list = await EmployeesAPI.list();
      setEmployees(list.map(e => ({ id: e._id || e.id, ...e })));
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(form) {
    const saved = await EmployeesAPI.create(form);
    const row = { id: saved._id || saved.id, ...saved };
    setEmployees(prev => [row, ...prev]);
  }

  // NEW: delete handler
  async function handleDelete(emp) {
    if (!emp) return;
    const id = emp.id || emp._id;

    const ok = window.confirm(
      `Remove ${emp.name || emp.email || "this employee"}? This cannot be undone.`
    );
    if (!ok) return;

    try {
      setDeletingId(id);
      // optimistic remove
      setEmployees(prev => prev.filter(e => (e.id || e._id) !== id));
      await EmployeesAPI.remove(id); // DELETE /employees/:id
    } catch (e) {
      // rollback on failure
      await load();
      alert(e?.message || "Failed to remove employee.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="page-wrap">
      <header className="hero">
        <h1>Employee Management</h1>
        <p>View, add, and manage all employees.</p>
      </header>

      <EmployeesTable
        employees={employees}
        loading={loading}
        error={error}
        onCreate={handleCreate}
        onDelete={handleDelete}    // NEW
        deletingId={deletingId}    // NEW (optional: to show 'Removing…' state)
      />
    </div>
  );
}
