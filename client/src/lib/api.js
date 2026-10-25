import { offlineApi, getOfflineStats, resetOfflineDb } from './offlineDb';

const TOKEN_KEY = 'revalida_tracker_token';
const FORCE_OFFLINE_KEY = 'revalida_force_offline';

let backendReachable = true;
const statusListeners = new Set();

function notifyListeners() {
  const state = getConnectionState();
  statusListeners.forEach((cb) => {
    try {
      cb(state);
    } catch {
      // ignore
    }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    backendReachable = true;
    notifyListeners();
  });
  window.addEventListener('offline', () => {
    notifyListeners();
  });
}

export function isForceOffline() {
  return localStorage.getItem(FORCE_OFFLINE_KEY) === 'true';
}

export function setForceOffline(val) {
  if (val) {
    localStorage.setItem(FORCE_OFFLINE_KEY, 'true');
  } else {
    localStorage.removeItem(FORCE_OFFLINE_KEY);
    backendReachable = true;
  }
  notifyListeners();
}

export function getConnectionState() {
  const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const forced = isForceOffline();
  const usingOffline = forced || !browserOnline || !backendReachable;
  return {
    online: !usingOffline,
    forcedOffline: forced,
    browserOnline,
    backendReachable,
    stats: getOfflineStats(),
  };
}

export function subscribeConnectionStatus(cb) {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

export { getOfflineStats, resetOfflineDb };

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}, offlineFallbackFn = null) {
  const state = getConnectionState();

  // If in offline mode (forced, browser offline, or backend unreachable), use local DB directly
  if (!state.online && offlineFallbackFn) {
    return offlineFallbackFn();
  }

  const token = getStoredToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(`/api${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    // If Vite/proxy returns 502/503/504 because backend server is off, fallback to offlineDb
    if ([502, 503, 504].includes(response.status) && offlineFallbackFn) {
      backendReachable = false;
      notifyListeners();
      return offlineFallbackFn();
    }

    let data = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      // If token is an offline-generated token and backend returned 401, use offline fallback
      if (
        response.status === 401 &&
        token &&
        token.startsWith('offline-jwt-token') &&
        offlineFallbackFn
      ) {
        return offlineFallbackFn();
      }

      const error = new Error(
        (data && (data.error || data.message)) ||
          `Erro na requisição (${response.status})`
      );
      error.status = response.status;
      error.data = data;
      throw error;
    }

    if (!backendReachable) {
      backendReachable = true;
      notifyListeners();
    }

    return data;
  } catch (err) {
    // If it's an explicit HTTP 4xx error thrown above, rethrow it
    if (err.status && err.status >= 400 && err.status < 500) {
      throw err;
    }

    // Network error / offline / server down -> fallback to local offlineDb seamlessly!
    if (offlineFallbackFn) {
      backendReachable = false;
      notifyListeners();
      return offlineFallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await request(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      () => offlineApi.login(credentials)
    );
    return res;
  },

  register: async (payload) => {
    const res = await request(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.register(payload)
    );
    return res;
  },

  me: () => request('/auth/me', {}, () => offlineApi.me()),

  updateProfile: async (payload) => {
    const res = await request(
      '/auth/me',
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => offlineApi.updateProfile(payload)
    );
    try {
      offlineApi.updateProfile(payload);
    } catch {
      // ignore
    }
    return res;
  },

  // Specialties
  getSpecialties: () =>
    request('/specialties', {}, () => offlineApi.getSpecialties()),

  getSpecialtyBySlug: (slug) =>
    request(
      `/specialties/${encodeURIComponent(slug)}`,
      {},
      () => offlineApi.getSpecialtyBySlug(slug)
    ),

  // Stations
  getStation: (id) =>
    request(`/stations/${id}`, {}, () => offlineApi.getStation(id)),

  createStation: async (payload) => {
    const state = getConnectionState();
    if (!state.online) {
      return offlineApi.createStation(payload);
    }
    const res = await request(
      '/stations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.createStation(payload)
    );
    return res;
  },

  updateStation: async (id, payload) =>
    request(
      `/stations/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      () => offlineApi.updateStation(id, payload)
    ),

  deleteStation: async (id) =>
    request(
      `/stations/${id}`,
      {
        method: 'DELETE',
      },
      () => offlineApi.deleteStation(id)
    ),

  addChecklistItem: async (stationId, item) =>
    request(
      `/stations/${stationId}/items`,
      {
        method: 'POST',
        body: JSON.stringify(item),
      },
      () => offlineApi.addChecklistItem(stationId, item)
    ),

  updateChecklistItem: async (stationId, itemId, item) =>
    request(
      `/stations/${stationId}/items/${itemId}`,
      {
        method: 'PUT',
        body: JSON.stringify(item),
      },
      () => offlineApi.updateChecklistItem(stationId, itemId, item)
    ),

  deleteChecklistItem: async (stationId, itemId) =>
    request(
      `/stations/${stationId}/items/${itemId}`,
      {
        method: 'DELETE',
      },
      () => offlineApi.deleteChecklistItem(stationId, itemId)
    ),

  // Attempts
  getAttempts: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.specialty_id) qs.set('specialty_id', params.specialty_id);
    if (params.station_id) qs.set('station_id', params.station_id);
    if (params.from) qs.set('from', params.from);
    if (params.to) qs.set('to', params.to);
    const queryStr = qs.toString();
    return request(
      `/attempts${queryStr ? `?${queryStr}` : ''}`,
      {},
      () => offlineApi.getAttempts(params)
    );
  },

  getAttempt: (id) =>
    request(`/attempts/${id}`, {}, () => offlineApi.getAttempt(id)),

  createAttempt: async (payload) => {
    const state = getConnectionState();
    if (!state.online) {
      return offlineApi.createAttempt(payload);
    }
    const res = await request(
      '/attempts',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.createAttempt(payload)
    );
    // Mirror attempt locally so offline history also stays updated
    try {
      offlineApi.createAttempt(payload);
    } catch {
      // ignore
    }
    return res;
  },

  deleteAttempt: async (id) =>
    request(
      `/attempts/${id}`,
      {
        method: 'DELETE',
      },
      () => offlineApi.deleteAttempt(id)
    ),

  getAnalyticsSummary: () =>
    request(
      '/attempts/analytics/summary',
      {},
      () => offlineApi.getAnalyticsSummary()
    ),

  exportAttempts: () =>
    request('/attempts/export', {}, () => offlineApi.exportAttempts()),

  importAttempts: (payload) =>
    request(
      '/attempts/import',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.importAttempts(payload)
    ),
};

export default api;
