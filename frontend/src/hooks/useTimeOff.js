import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient.js';

const parseDateValue = (value) => {
  if (!value) return 0;
  // Treat YYYY-MM-DD inputs as UTC midnight to avoid timezone shifts
  const normalized = `${value}T00:00:00Z`;
  return Date.parse(normalized) || 0;
};

const sortRequests = (items) =>
  [...items].sort((a, b) => {
    const aStart = parseDateValue(a.startDate);
    const bStart = parseDateValue(b.startDate);
    if (aStart !== bStart) {
      return bStart - aStart;
    }
    const aCreated = parseDateValue(a.createdAt);
    const bCreated = parseDateValue(b.createdAt);
    return bCreated - aCreated;
  });

export function useTimeOffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listTimeOff();
      setRequests(sortRequests(data));
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = useCallback(
    async (payload) => {
      const created = await apiClient.createTimeOff(payload);
      setRequests((prev) => sortRequests([created, ...prev]));
      fetchRequests();
      return created;
    },
    [fetchRequests]
  );

  const updateStatus = useCallback(async (id, status) => {
    const updated = await apiClient.updateTimeOffStatus(id, status);
    setRequests((prev) => sortRequests(prev.map((item) => (item.id === id ? updated : item))));
    return updated;
  }, []);

  const deleteRequest = useCallback(async (id) => {
    await apiClient.deleteTimeOff(id);
    setRequests((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return {
    requests,
    loading,
    error,
    refresh: fetchRequests,
    createRequest,
    updateStatus,
    deleteRequest
  };
}
