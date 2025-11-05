import { useEffect, useState } from "react";
import { EmployeesAPI } from "../services/apiClient";
import { EmployeesTable } from "../components/EmployeesTable/EmployeesTable"; // named export
import "./EmployeesPage.css"; // optional

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  async function load() {
    try {
      setLoading(true);
      const list = await EmployeesAPI.list();
      // table expects `id`; backend likely returns `_id`
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
    // form: { name, email, role, hourlyRate, location, active }
    const saved = await EmployeesAPI.create(form);
    const row = { id: saved._id || saved.id, ...saved };
    setEmployees(prev => [row, ...prev]);
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
      />
    </div>
  );
}
