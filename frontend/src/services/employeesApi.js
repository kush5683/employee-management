const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export async function getEmployees() {
  const res = await fetch(`${BASE}/employees`);
  if (!res.ok) throw new Error("Failed to fetch employees");
  return res.json();
}

export async function addEmployee(payload) {
  const res = await fetch(`${BASE}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add employee");
  return res.json();
}

export async function updateEmployee(id, patch) {
  const res = await fetch(`${BASE}/employees/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update employee");
  return res.json();
}

export async function deleteEmployee(id) {
  const res = await fetch(`${BASE}/employees/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete employee");
}