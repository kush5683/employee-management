import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient.js';

// Hook dedicated to shift CRUD via the backend API.
export function useShifts() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchShifts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listShifts();
      setShifts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = useCallback(async (payload) => {
    const created = await apiClient.createShift(payload);
    setShifts((prev) => [created, ...prev]);
    return created;
  }, []);

  const updateShift = useCallback(async (id, updates) => {
    const updated = await apiClient.updateShift(id, updates);
    setShifts((prev) => prev.map((shift) => (shift.id === id ? updated : shift)));
    return updated;
  }, []);

  const removeShift = useCallback(async (id) => {
    await apiClient.deleteShift(id);
    setShifts((prev) => prev.filter((shift) => shift.id !== id));
  }, []);

  return {
    shifts,
    loading,
    error,
    refresh: fetchShifts,
    createShift,
    updateShift,
    deleteShift: removeShift
  };
}
