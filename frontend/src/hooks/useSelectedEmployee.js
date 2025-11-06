import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const KEY = "selectedEmployeeId";

export function useSelectedEmployee() {
  const [params, setParams] = useSearchParams();
  const id = params.get("employeeId") || localStorage.getItem(KEY) || "";

  useEffect(() => {
    if (id) localStorage.setItem(KEY, id);
  }, [id]);

  function setId(next) {
    const p = new URLSearchParams(params);
    if (next) p.set("employeeId", next);
    else p.delete("employeeId");
    setParams(p, { replace: true });
    if (next) localStorage.setItem(KEY, next);
    else localStorage.removeItem(KEY);
  }

  return { selectedEmployeeId: id, setSelectedEmployeeId: setId };
}