const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

const getHeaders = (token) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = token;
  return headers;
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw { status: response.status, ...data };
  }
  return data;
};

// ==========================================
// AUTH (admin login only)
// ==========================================

export const authApi = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },
};

// ==========================================
// PUBLIC DEVICES (no auth required)
// ==========================================

export const publicDevicesApi = {
  getAll: async () => {
    const res = await fetch(`${API_BASE}/devices`);
    return handleResponse(res);
  },
};

// ==========================================
// DEVICES (Admin)
// ==========================================

export const devicesApi = {
  getAll: async (token) => {
    const res = await fetch(`${API_BASE}/admin/devices`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  getById: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/devices/${id}`, {
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  create: async (token, deviceData) => {
    const res = await fetch(`${API_BASE}/admin/devices`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(deviceData),
    });
    return handleResponse(res);
  },

  update: async (token, id, deviceData) => {
    const res = await fetch(`${API_BASE}/admin/devices/${id}`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(deviceData),
    });
    return handleResponse(res);
  },

  regenerateKey: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/devices/${id}/regenerate-key`, {
      method: 'POST',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  deactivate: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/devices/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },

  reactivate: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/devices/${id}/reactivate`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify({}),
    });
    return handleResponse(res);
  },
};

// ==========================================
// SENSOR DATA (Public)
// ==========================================

export const sensorDataApi = {
  getAll: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.deviceId) query.set('deviceId', params.deviceId);
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/sensor-data?${query.toString()}`);
    return handleResponse(res);
  },

  getById: async (id) => {
    const res = await fetch(`${API_BASE}/sensor-data/${id}`);
    return handleResponse(res);
  },

  getByDevice: async (deviceId, params = {}) => {
    const query = new URLSearchParams();
    if (params.limit) query.set('limit', params.limit);
    if (params.offset) query.set('offset', params.offset);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/sensor-data/device/${deviceId}?${query.toString()}`);
    return handleResponse(res);
  },

  delete: async (token, id) => {
    const res = await fetch(`${API_BASE}/admin/sensor-data/${id}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });
    return handleResponse(res);
  },
};
