import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient.js';

export function useTimeOffRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.listTimeOff();
      setRequests(data);
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
      await fetchRequests();
      return created;
    },
    [fetchRequests]
  );

  const updateStatus = useCallback(async (id, status) => {
    const updated = await apiClient.updateTimeOffStatus(id, status);
    setRequests((prev) => prev.map((item) => (item.id === id ? updated : item)));
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
