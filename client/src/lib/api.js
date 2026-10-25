import { offlineApi, getOfflineStats, resetOfflineDb } from './offlineDb';

const TOKEN_KEY = 'revalida_tracker_token';
const FORCE_OFFLINE_KEY = 'revalida_force_offline';

// Detect static hosts (like GitHub Pages) where no Node backend exists
const isStaticHost =
  typeof window !== 'undefined' &&
  (window.location.hostname.endsWith('github.io') ||
    window.location.protocol === 'file:');

let backendReachable = !isStaticHost;
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
    if (!isStaticHost) backendReachable = true;
    notifyListeners();
  });
  window.addEventListener('offline', () => {
    notifyListeners();
  });
}

export function isForceOffline() {
  if (isStaticHost) return true;
  return localStorage.getItem(FORCE_OFFLINE_KEY) === 'true';
}

export function setForceOffline(val) {
  if (val) {
    localStorage.setItem(FORCE_OFFLINE_KEY, 'true');
  } else {
    localStorage.removeItem(FORCE_OFFLINE_KEY);
    if (!isStaticHost) backendReachable = true;
  }
  notifyListeners();
}

export function getConnectionState() {
  const browserOnline =
    typeof navigator !== 'undefined' ? navigator.onLine : true;
  const forced = isForceOffline();
  const usingOffline = isStaticHost || forced || !browserOnline || !backendReachable;
  return {
    online: !usingOffline,
    forcedOffline: forced,
    browserOnline,
    backendReachable,
    isStaticHost,
    stats: getOfflineStats(),
  };
}

export function subscribeConnectionStatus(cb) {
  statusListeners.add(cb);
  return () => statusListeners.delete(cb);
}

export { getOfflineStats, resetOfflineDb };

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || 'local-device-token';
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

  // When running on GitHub Pages / static host / offline mode, execute locally in 0ms
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
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(`/api${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type') || '';

    // If static server returned HTML (like GitHub Pages 404) or any non-OK status,
    // mark backend as unreachable and fall back to local offlineDb seamlessly
    if (!response.ok || !contentType.includes('application/json')) {
      if (offlineFallbackFn) {
        backendReachable = false;
        notifyListeners();
        return offlineFallbackFn();
      }
      throw new Error(`Erro na requisição (${response.status})`);
    }

    const data = await response.json();

    if (!backendReachable) {
      backendReachable = true;
      notifyListeners();
    }

    return data;
  } catch (err) {
    // Always fall back to local offlineDb on any error
    if (offlineFallbackFn) {
      backendReachable = false;
      notifyListeners();
      return offlineFallbackFn();
    }
    throw err;
  }
}

export const api = {
  // Auth / Profile (local-first, no login blocker)
  login: async (credentials) =>
    request(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      },
      () => offlineApi.login(credentials)
    ),

  register: async (payload) =>
    request(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.register(payload)
    ),

  me: () => request('/auth/me', {}, () => offlineApi.me()),

  updateProfile: async (payload) => {
    const localUpdated = offlineApi.updateProfile(payload);
    try {
      await request(
        '/auth/me',
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        },
        () => localUpdated
      );
    } catch {
      // ignore
    }
    return localUpdated;
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

  createStation: async (payload) =>
    request(
      '/stations',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => offlineApi.createStation(payload)
    ),

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
