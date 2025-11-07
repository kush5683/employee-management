const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const API_PREFIX = '';

let authToken = null;

export function setAuthToken(token) {
  authToken = token || null;
}

async function request(path, options = {}) {
  const { skipAuth, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(rest.headers || {})
  };

  if (!skipAuth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${API_PREFIX}${path}`, {
    ...rest,
    headers
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.message || 'Request failed';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const apiClient = {
  async login(credentials) {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true
    });
    return payload;
  },
  async changePassword(body) {
    await request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  async listTimeOff() {
    const payload = await request('/time-off');
    return payload?.data ?? [];
  },
  async createTimeOff(body) {
    const payload = await request('/time-off', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return payload?.data;
  },
  async updateTimeOffStatus(id, status) {
    const payload = await request(`/time-off/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return payload?.data;
  },
  async deleteTimeOff(id) {
    await request(`/time-off/${id}`, { method: 'DELETE' });
  },
  async listShifts() {
    const payload = await request('/shifts');
    return payload?.data ?? [];
  },
  async createShift(body) {
    const payload = await request('/shifts', {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return payload?.data;
  },
  async updateShift(id, updates) {
    const payload = await request(`/shifts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
    return payload?.data;
  },
  async deleteShift(id) {
    await request(`/shifts/${id}`, { method: 'DELETE' });
  }
};

// ---------- Employees ----------
export const EmployeesAPI = {
  async list() {
    const payload = await request('/employees');
    return payload?.data ?? [];              // expect array
  },
  async create(body) {
    const payload = await request('/employees', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return payload?.data;                    // created employee
  },
  async update(id, updates) {
    const payload = await request(`/employees/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return payload?.data;                    // updated employee
  },
  async remove(id) {
    await request(`/employees/${id}`, { method: 'DELETE' });
  },
};

// ---------- Availability ----------
export const AvailabilityAPI = {
  // GET /availabilities?employeeId=<id>
  async listByEmployee(employeeId) {
    const payload = await request(`/availabilities?employeeId=${encodeURIComponent(employeeId)}`);
    return payload?.data ?? [];              // [{ dayOfWeek, startTime, endTime, ... }]
  },

  // POST /availabilities  (upsert a single day window)
  // body: { employeeId, dayOfWeek, startTime, endTime }
  async upsertOne(body) {
    const payload = await request('/availabilities', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    return payload?.data;                    // saved doc
  },

  // DELETE /availabilities/one  (body: { employeeId, dayOfWeek })
  async deleteOne(employeeId, dayOfWeek) {
    await request('/availabilities/one', {
      method: 'DELETE',
      body: JSON.stringify({ employeeId, dayOfWeek }),
    });
  },
};

