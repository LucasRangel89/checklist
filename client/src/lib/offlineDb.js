import {
  INITIAL_SPECIALTIES,
  INITIAL_STATIONS,
  INITIAL_DEMO_ATTEMPTS,
} from './seedData';

const DB_STORAGE_KEY = 'revalida_offline_db_v1';
const CURRENT_USER_KEY = 'revalida_offline_current_user';

function daysAgoISO(daysAgo, hour = 14, minute = 30) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
}

function buildInitialDb() {
  const demoUser = {
    id: 1,
    name: 'Dra. Ana Beatriz',
    email: 'demo@revalida.app',
    password_plain: 'demo1234',
    created_at: daysAgoISO(30, 10, 0),
  };

  const specialties = INITIAL_SPECIALTIES.map((sp) => ({ ...sp }));
  const specBySlug = Object.fromEntries(specialties.map((s) => [s.slug, s]));

  const stations = [];
  const checklist_items = [];
  let nextStationId = 1;
  let nextItemId = 1;

  INITIAL_STATIONS.forEach((st, idx) => {
    const spec = specBySlug[st.specialty_slug];
    const stationId = nextStationId++;
    stations.push({
      id: stationId,
      specialty_id: spec.id,
      title: st.title,
      description: st.description,
      difficulty: st.difficulty,
      duration_min: st.duration_min,
      created_at: daysAgoISO(25 - (idx % 15), 9, 0),
    });

    st.items.forEach((it, itemIdx) => {
      checklist_items.push({
        id: nextItemId++,
        station_id: stationId,
        category: it.category,
        order_idx: itemIdx + 1,
        description: it.description,
        expected_standard: it.expected_standard,
        weight: Number(it.weight) || 1.0,
      });
    });
  });

  const attempts = [];
  const attempt_items = [];
  let nextAttemptId = 1;
  let nextAttemptItemId = 1;

  INITIAL_DEMO_ATTEMPTS.forEach((attSpec) => {
    const station = stations[attSpec.stationIdx];
    if (!station) return;
    const stItems = checklist_items
      .filter((ci) => ci.station_id === station.id)
      .sort((a, b) => a.order_idx - b.order_idx);

    let totalScore = 0;
    let maxScore = 0;
    stItems.forEach((ci, idx) => {
      const status = attSpec.statuses[idx] || 'omitido';
      const w = Number(ci.weight) || 1.0;
      maxScore += w;
      if (status === 'ok') totalScore += w;
      else if (status === 'parcial') totalScore += w * 0.5;
    });

    totalScore = Math.round(totalScore * 100) / 100;
    maxScore = Math.round(maxScore * 100) / 100;

    const attemptId = nextAttemptId++;
    attempts.push({
      id: attemptId,
      user_id: demoUser.id,
      station_id: station.id,
      performed_at: daysAgoISO(attSpec.daysAgo, 15, 20),
      duration_sec: attSpec.duration_sec,
      total_score: totalScore,
      max_score: maxScore,
      notes: attSpec.notes || '',
    });

    stItems.forEach((ci, idx) => {
      const status = attSpec.statuses[idx] || 'omitido';
      const note = (attSpec.itemNotes && attSpec.itemNotes[idx]) || '';
      attempt_items.push({
        id: nextAttemptItemId++,
        attempt_id: attemptId,
        checklist_item_id: ci.id,
        status,
        notes: note,
      });
    });
  });

  return {
    version: '1.0.0',
    users: [demoUser],
    specialties,
    stations,
    checklist_items,
    attempts,
    attempt_items,
    seq: {
      users: 2,
      stations: nextStationId,
      checklist_items: nextItemId,
      attempts: nextAttemptId,
      attempt_items: nextAttemptItemId,
    },
  };
}

export function loadOfflineDb() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) {
      const initial = buildInitialDb();
      saveOfflineDb(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.specialties) || parsed.specialties.length === 0) {
      const initial = buildInitialDb();
      saveOfflineDb(initial);
      return initial;
    }
    return parsed;
  } catch {
    const initial = buildInitialDb();
    saveOfflineDb(initial);
    return initial;
  }
}

export function saveOfflineDb(db) {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.warn('Falha ao salvar banco offline no localStorage:', err);
  }
}

export function resetOfflineDb() {
  const initial = buildInitialDb();
  saveOfflineDb(initial);
  return initial;
}

export function getOfflineStats() {
  const db = loadOfflineDb();
  return {
    specialties: db.specialties.length,
    stations: db.stations.length,
    checklistItems: db.checklist_items.length,
    attempts: db.attempts.length,
    users: db.users.length,
  };
}

function getCurrentUser(db) {
  try {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    if (stored) {
      const u = JSON.parse(stored);
      const found = db.users.find((x) => x.id === u.id || x.email === u.email);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return db.users[0];
}

function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
}

function calcPercentage(total, max) {
  if (!max || max <= 0) return 0;
  return Math.round(((total * 100.0) / max) * 10) / 10;
}

export const offlineApi = {
  // Auth
  login({ email, password }) {
    const db = loadOfflineDb();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const userRow = db.users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!userRow || (userRow.password_plain && userRow.password_plain !== String(password))) {
      throw new Error('Credenciais inválidas. Verifique e-mail e senha.');
    }

    const user = {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      created_at: userRow.created_at,
    };
    setCurrentUser(user);
    return {
      user,
      token: `offline-jwt-token-user-${user.id}`,
    };
  },

  register({ name, email, password }) {
    const db = loadOfflineDb();
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanName = String(name || '').trim();

    if (!cleanName || !cleanEmail || !password) {
      throw new Error('Nome, e-mail e senha são obrigatórios.');
    }

    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Já existe uma conta cadastrada com este e-mail.');
    }

    const newUser = {
      id: db.seq.users++,
      name: cleanName,
      email: cleanEmail,
      password_plain: String(password),
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    saveOfflineDb(db);

    const user = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      created_at: newUser.created_at,
    };
    setCurrentUser(user);
    return {
      user,
      token: `offline-jwt-token-user-${user.id}`,
    };
  },

  me() {
    const db = loadOfflineDb();
    const u = getCurrentUser(db);
    return {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        created_at: u.created_at,
      },
    };
  },

  updateProfile({ name, email }) {
    const db = loadOfflineDb();
    const u = getCurrentUser(db);
    if (name) u.name = String(name).trim();
    if (email) u.email = String(email).trim().toLowerCase();
    saveOfflineDb(db);
    setCurrentUser(u);
    return {
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        created_at: u.created_at,
      },
      token: `offline-jwt-token-user-${u.id}`,
    };
  },

  // Specialties
  getSpecialties() {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);

    return db.specialties.map((sp) => {
      const spStations = db.stations.filter((st) => st.specialty_id === sp.id);
      const stIds = new Set(spStations.map((st) => st.id));
      const userAttempts = db.attempts.filter(
        (a) => a.user_id === user.id && stIds.has(a.station_id)
      );

      const avgScore =
        userAttempts.length > 0
          ? Math.round(
              (userAttempts.reduce(
                (acc, a) => acc + calcPercentage(a.total_score, a.max_score),
                0
              ) /
                userAttempts.length) *
                10
            ) / 10
          : null;

      const distinctStations = new Set(userAttempts.map((a) => a.station_id)).size;

      return {
        ...sp,
        total_stations: spStations.length,
        total_attempts: userAttempts.length,
        avg_score: avgScore,
        stations_attempted: distinctStations,
      };
    });
  },

  getSpecialtyBySlug(slug) {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const sp = db.specialties.find((s) => s.slug === slug);
    if (!sp) throw new Error('Especialidade não encontrada.');

    const spStations = db.stations.filter((st) => st.specialty_id === sp.id);
    const stIds = new Set(spStations.map((st) => st.id));
    const spAttempts = db.attempts.filter(
      (a) => a.user_id === user.id && stIds.has(a.station_id)
    );

    const specialty = {
      ...sp,
      total_stations: spStations.length,
      total_attempts: spAttempts.length,
      avg_score:
        spAttempts.length > 0
          ? Math.round(
              (spAttempts.reduce(
                (acc, a) => acc + calcPercentage(a.total_score, a.max_score),
                0
              ) /
                spAttempts.length) *
                10
            ) / 10
          : null,
      stations_attempted: new Set(spAttempts.map((a) => a.station_id)).size,
    };

    const stations = spStations.map((st) => {
      const items = db.checklist_items.filter((ci) => ci.station_id === st.id);
      const maxScore =
        Math.round(
          items.reduce((sum, ci) => sum + (Number(ci.weight) || 1.0), 0) * 100
        ) / 100;
      const stAttempts = db.attempts.filter(
        (a) => a.station_id === st.id && a.user_id === user.id
      );

      const avgScore =
        stAttempts.length > 0
          ? Math.round(
              (stAttempts.reduce(
                (acc, a) => acc + calcPercentage(a.total_score, a.max_score),
                0
              ) /
                stAttempts.length) *
                10
            ) / 10
          : null;

      const sortedByDate = [...stAttempts].sort((a, b) =>
        String(b.performed_at).localeCompare(String(a.performed_at))
      );

      return {
        ...st,
        item_count: items.length,
        max_score: maxScore,
        attempt_count: stAttempts.length,
        avg_score: avgScore,
        last_attempt_at: sortedByDate[0]?.performed_at || null,
      };
    });

    return { specialty, stations };
  },

  // Stations
  getStation(id) {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const stationId = Number(id);
    const st = db.stations.find((s) => s.id === stationId);
    if (!st) throw new Error('Estação clínica não encontrada.');

    const sp = db.specialties.find((s) => s.id === st.specialty_id) || {};
    const station = {
      ...st,
      specialty_name: sp.name,
      specialty_slug: sp.slug,
      specialty_color: sp.color,
      specialty_icon: sp.icon,
      specialty_skeleton: sp.skeleton,
    };

    const items = db.checklist_items
      .filter((ci) => ci.station_id === stationId)
      .sort((a, b) => a.order_idx - b.order_idx || a.id - b.id);

    const recentAttempts = db.attempts
      .filter((a) => a.station_id === stationId && a.user_id === user.id)
      .sort((a, b) => String(b.performed_at).localeCompare(String(a.performed_at)))
      .slice(0, 10)
      .map((a) => {
        const aItems = db.attempt_items.filter((ai) => ai.attempt_id === a.id);
        return {
          ...a,
          percentage: calcPercentage(a.total_score, a.max_score),
          ok_count: aItems.filter((x) => x.status === 'ok').length,
          parcial_count: aItems.filter((x) => x.status === 'parcial').length,
          erro_count: aItems.filter((x) => x.status === 'erro').length,
          omitido_count: aItems.filter((x) => x.status === 'omitido').length,
        };
      });

    return { station, items, recentAttempts };
  },

  createStation(payload) {
    const db = loadOfflineDb();
    const stationId = db.seq.stations++;
    const newStation = {
      id: stationId,
      specialty_id: Number(payload.specialty_id),
      title: String(payload.title).trim(),
      description: String(payload.description).trim(),
      difficulty: payload.difficulty || 'intermediário',
      duration_min: Number(payload.duration_min) || 10,
      created_at: new Date().toISOString(),
    };
    db.stations.push(newStation);

    if (Array.isArray(payload.items)) {
      payload.items.forEach((it, idx) => {
        if (it.description && it.expected_standard) {
          db.checklist_items.push({
            id: db.seq.checklist_items++,
            station_id: stationId,
            category: it.category || 'Avaliação',
            order_idx: it.order_idx ? Number(it.order_idx) : idx + 1,
            description: String(it.description).trim(),
            expected_standard: String(it.expected_standard).trim(),
            weight: Number(it.weight) > 0 ? Number(it.weight) : 1.0,
          });
        }
      });
    }

    saveOfflineDb(db);
    return this.getStation(stationId);
  },

  updateStation(id, payload) {
    const db = loadOfflineDb();
    const stationId = Number(id);
    const st = db.stations.find((s) => s.id === stationId);
    if (!st) throw new Error('Estação não encontrada.');

    if (payload.title) st.title = String(payload.title).trim();
    if (payload.description) st.description = String(payload.description).trim();
    if (payload.difficulty) st.difficulty = payload.difficulty;
    if (payload.duration_min) st.duration_min = Number(payload.duration_min);
    if (payload.specialty_id) st.specialty_id = Number(payload.specialty_id);

    saveOfflineDb(db);
    return this.getStation(stationId);
  },

  deleteStation(id) {
    const db = loadOfflineDb();
    const stationId = Number(id);
    db.stations = db.stations.filter((s) => s.id !== stationId);
    db.checklist_items = db.checklist_items.filter((ci) => ci.station_id !== stationId);
    const removedAttemptIds = new Set(
      db.attempts.filter((a) => a.station_id === stationId).map((a) => a.id)
    );
    db.attempts = db.attempts.filter((a) => a.station_id !== stationId);
    db.attempt_items = db.attempt_items.filter(
      (ai) => !removedAttemptIds.has(ai.attempt_id)
    );
    saveOfflineDb(db);
    return { success: true, deletedId: stationId };
  },

  addChecklistItem(stationId, item) {
    const db = loadOfflineDb();
    const stId = Number(stationId);
    const existing = db.checklist_items.filter((ci) => ci.station_id === stId);
    const maxOrder = existing.reduce((m, c) => Math.max(m, c.order_idx || 0), 0);
    const newItem = {
      id: db.seq.checklist_items++,
      station_id: stId,
      category: item.category || 'Avaliação',
      order_idx: item.order_idx ? Number(item.order_idx) : maxOrder + 1,
      description: String(item.description).trim(),
      expected_standard: String(item.expected_standard).trim(),
      weight: Number(item.weight) > 0 ? Number(item.weight) : 1.0,
    };
    db.checklist_items.push(newItem);
    saveOfflineDb(db);
    return { item: newItem };
  },

  updateChecklistItem(stationId, itemId, item) {
    const db = loadOfflineDb();
    const target = db.checklist_items.find(
      (ci) => ci.id === Number(itemId) && ci.station_id === Number(stationId)
    );
    if (!target) throw new Error('Item não encontrado.');

    if (item.category) target.category = item.category;
    if (item.description) target.description = String(item.description).trim();
    if (item.expected_standard)
      target.expected_standard = String(item.expected_standard).trim();
    if (item.weight) target.weight = Number(item.weight);

    saveOfflineDb(db);
    return { item: target };
  },

  deleteChecklistItem(stationId, itemId) {
    const db = loadOfflineDb();
    db.checklist_items = db.checklist_items.filter(
      (ci) => !(ci.id === Number(itemId) && ci.station_id === Number(stationId))
    );
    db.attempt_items = db.attempt_items.filter(
      (ai) => ai.checklist_item_id !== Number(itemId)
    );
    saveOfflineDb(db);
    return { success: true, deletedItemId: Number(itemId) };
  },

  // Attempts
  getAttempts(params = {}) {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);

    let list = db.attempts.filter((a) => a.user_id === user.id);

    if (params.station_id) {
      list = list.filter((a) => a.station_id === Number(params.station_id));
    }

    if (params.from) {
      const fromStr = String(params.from).slice(0, 10);
      list = list.filter((a) => String(a.performed_at).slice(0, 10) >= fromStr);
    }

    if (params.to) {
      const toStr = String(params.to).slice(0, 10);
      list = list.filter((a) => String(a.performed_at).slice(0, 10) <= toStr);
    }

    const enriched = list
      .map((a) => {
        const st = db.stations.find((s) => s.id === a.station_id);
        if (!st) return null;
        const sp = db.specialties.find((s) => s.id === st.specialty_id) || {};
        if (params.specialty_id && sp.id !== Number(params.specialty_id)) {
          return null;
        }
        const aItems = db.attempt_items.filter((ai) => ai.attempt_id === a.id);
        return {
          ...a,
          percentage: calcPercentage(a.total_score, a.max_score),
          station_title: st.title,
          station_difficulty: st.difficulty,
          specialty_id: sp.id,
          specialty_name: sp.name,
          specialty_slug: sp.slug,
          specialty_color: sp.color,
          specialty_icon: sp.icon,
          ok_count: aItems.filter((x) => x.status === 'ok').length,
          parcial_count: aItems.filter((x) => x.status === 'parcial').length,
          erro_count: aItems.filter((x) => x.status === 'erro').length,
          omitido_count: aItems.filter((x) => x.status === 'omitido').length,
        };
      })
      .filter(Boolean)
      .sort((a, b) => String(b.performed_at).localeCompare(String(a.performed_at)));

    return enriched;
  },

  getAttempt(id) {
    const db = loadOfflineDb();
    const attemptId = Number(id);
    const a = db.attempts.find((x) => x.id === attemptId);
    if (!a) throw new Error('Tentativa não encontrada.');

    const st = db.stations.find((s) => s.id === a.station_id) || {};
    const sp = db.specialties.find((s) => s.id === st.specialty_id) || {};

    const attempt = {
      ...a,
      percentage: calcPercentage(a.total_score, a.max_score),
      station_title: st.title,
      station_description: st.description,
      station_difficulty: st.difficulty,
      station_duration_min: st.duration_min,
      specialty_id: sp.id,
      specialty_name: sp.name,
      specialty_slug: sp.slug,
      specialty_color: sp.color,
      specialty_icon: sp.icon,
    };

    const items = db.attempt_items
      .filter((ai) => ai.attempt_id === attemptId)
      .map((ai) => {
        const ci =
          db.checklist_items.find((c) => c.id === ai.checklist_item_id) || {};
        return {
          ...ai,
          category: ci.category || 'Avaliação',
          order_idx: ci.order_idx || 1,
          description: ci.description || '',
          expected_standard: ci.expected_standard || '',
          weight: ci.weight || 1.0,
        };
      })
      .sort((x, y) => x.order_idx - y.order_idx);

    return { attempt, items };
  },

  createAttempt(payload) {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const stationId = Number(payload.station_id);
    const stItems = db.checklist_items
      .filter((ci) => ci.station_id === stationId)
      .sort((a, b) => a.order_idx - b.order_idx);

    const subMap = new Map();
    if (Array.isArray(payload.items)) {
      payload.items.forEach((it) => {
        subMap.set(Number(it.checklist_item_id), {
          status: it.status || 'omitido',
          notes: it.notes || '',
        });
      });
    }

    let totalScore = 0;
    let maxScore = 0;
    stItems.forEach((ci) => {
      const w = Number(ci.weight) || 1.0;
      maxScore += w;
      const sub = subMap.get(ci.id);
      const st = sub?.status || 'omitido';
      if (st === 'ok') totalScore += w;
      else if (st === 'parcial') totalScore += w * 0.5;
    });

    totalScore = Math.round(totalScore * 100) / 100;
    maxScore = Math.round(maxScore * 100) / 100;

    const attemptId = db.seq.attempts++;
    const newAttempt = {
      id: attemptId,
      user_id: user.id,
      station_id: stationId,
      performed_at: payload.performed_at || new Date().toISOString(),
      duration_sec: Number(payload.duration_sec) || 0,
      total_score: totalScore,
      max_score: maxScore,
      notes: payload.notes || '',
    };
    db.attempts.push(newAttempt);

    stItems.forEach((ci) => {
      const sub = subMap.get(ci.id);
      db.attempt_items.push({
        id: db.seq.attempt_items++,
        attempt_id: attemptId,
        checklist_item_id: ci.id,
        status: sub?.status || 'omitido',
        notes: sub?.notes || '',
      });
    });

    saveOfflineDb(db);
    return this.getAttempt(attemptId);
  },

  deleteAttempt(id) {
    const db = loadOfflineDb();
    const attemptId = Number(id);
    db.attempts = db.attempts.filter((a) => a.id !== attemptId);
    db.attempt_items = db.attempt_items.filter((ai) => ai.attempt_id !== attemptId);
    saveOfflineDb(db);
    return { success: true, deletedId: attemptId };
  },

  getAnalyticsSummary() {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const userAttempts = db.attempts.filter((a) => a.user_id === user.id);
    const attemptIds = new Set(userAttempts.map((a) => a.id));
    const userAttemptItems = db.attempt_items.filter((ai) =>
      attemptIds.has(ai.attempt_id)
    );

    const avgScore =
      userAttempts.length > 0
        ? Math.round(
            (userAttempts.reduce(
              (acc, a) => acc + calcPercentage(a.total_score, a.max_score),
              0
            ) /
              userAttempts.length) *
              10
          ) / 10
        : 0;

    const summary = {
      avgScore,
      totalAttempts: userAttempts.length,
      stationsPracticed: new Set(userAttempts.map((a) => a.station_id)).size,
      totalOk: userAttemptItems.filter((x) => x.status === 'ok').length,
      totalParcial: userAttemptItems.filter((x) => x.status === 'parcial').length,
      totalErrors: userAttemptItems.filter((x) => x.status === 'erro').length,
      totalOmitted: userAttemptItems.filter((x) => x.status === 'omitido').length,
      totalItemsEvaluated: userAttemptItems.length,
    };

    const bySpecialty = this.getSpecialties().map((sp) => ({
      id: sp.id,
      slug: sp.slug,
      name: sp.name,
      icon: sp.icon,
      color: sp.color,
      total_stations: sp.total_stations,
      attempts: sp.total_attempts,
      stations_attempted: sp.stations_attempted,
      avg_score: sp.avg_score || 0,
    }));

    const catMap = new Map();
    userAttemptItems.forEach((ai) => {
      const ci = db.checklist_items.find((c) => c.id === ai.checklist_item_id);
      if (!ci) return;
      const cat = ci.category || 'Avaliação';
      if (!catMap.has(cat)) {
        catMap.set(cat, { category: cat, total: 0, ok: 0, parcial: 0, erro: 0, omitido: 0 });
      }
      const entry = catMap.get(cat);
      entry.total++;
      if (entry[ai.status] !== undefined) entry[ai.status]++;
    });

    const byCategory = Array.from(catMap.values()).sort((a, b) => b.total - a.total);

    const itemFailMap = new Map();
    userAttemptItems.forEach((ai) => {
      const ci = db.checklist_items.find((c) => c.id === ai.checklist_item_id);
      if (!ci) return;
      if (!itemFailMap.has(ci.id)) {
        const st = db.stations.find((s) => s.id === ci.station_id) || {};
        const sp = db.specialties.find((s) => s.id === st.specialty_id) || {};
        itemFailMap.set(ci.id, {
          item_id: ci.id,
          description: ci.description,
          expected_standard: ci.expected_standard,
          category: ci.category,
          weight: ci.weight,
          station_id: st.id,
          station_title: st.title,
          specialty_name: sp.name,
          specialty_slug: sp.slug,
          specialty_color: sp.color,
          total_attempts: 0,
          erro_count: 0,
          omitido_count: 0,
          parcial_count: 0,
          ok_count: 0,
        });
      }
      const rec = itemFailMap.get(ci.id);
      rec.total_attempts++;
      if (ai.status === 'erro') rec.erro_count++;
      else if (ai.status === 'omitido') rec.omitido_count++;
      else if (ai.status === 'parcial') rec.parcial_count++;
      else if (ai.status === 'ok') rec.ok_count++;
    });

    const topErrors = Array.from(itemFailMap.values())
      .filter((r) => r.erro_count + r.omitido_count + r.parcial_count > 0)
      .sort(
        (a, b) =>
          b.erro_count * 3 +
          b.omitido_count * 2 +
          b.parcial_count -
          (a.erro_count * 3 + a.omitido_count * 2 + a.parcial_count)
      )
      .slice(0, 10);

    const timeline = [...userAttempts]
      .sort((a, b) => String(a.performed_at).localeCompare(String(b.performed_at)))
      .map((a) => {
        const st = db.stations.find((s) => s.id === a.station_id) || {};
        const sp = db.specialties.find((s) => s.id === st.specialty_id) || {};
        return {
          attempt_id: a.id,
          date: String(a.performed_at).slice(0, 10),
          performed_at: a.performed_at,
          score: calcPercentage(a.total_score, a.max_score),
          station_title: st.title,
          specialty_name: sp.name,
          specialty_color: sp.color,
        };
      });

    return {
      summary,
      bySpecialty,
      byCategory,
      topErrors,
      timeline,
    };
  },

  exportAttempts() {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const attempts = db.attempts
      .filter((a) => a.user_id === user.id)
      .map((a) => {
        const st = db.stations.find((s) => s.id === a.station_id);
        return {
          ...a,
          station_title: st?.title || '',
        };
      });
    const attemptIds = new Set(attempts.map((a) => a.id));
    const items = db.attempt_items
      .filter((ai) => attemptIds.has(ai.attempt_id))
      .map((ai) => {
        const ci = db.checklist_items.find((c) => c.id === ai.checklist_item_id);
        return {
          ...ai,
          order_idx: ci?.order_idx || 1,
          item_description: ci?.description || '',
        };
      });

    return {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      user: { id: user.id, name: user.name, email: user.email },
      attempts,
      items,
    };
  },

  importAttempts(payload) {
    const db = loadOfflineDb();
    const user = getCurrentUser(db);
    const rawAttempts = Array.isArray(payload?.attempts) ? payload.attempts : [];
    const rawItems = Array.isArray(payload?.items) ? payload.items : [];

    if (rawAttempts.length === 0) {
      throw new Error('Nenhuma tentativa encontrada no JSON.');
    }

    let importedAttempts = 0;
    let importedItems = 0;
    let skippedAttempts = 0;

    rawAttempts.forEach((att) => {
      let st = db.stations.find((s) => s.id === Number(att.station_id));
      if (!st && att.station_title) {
        st = db.stations.find(
          (s) => s.title.toLowerCase() === String(att.station_title).toLowerCase()
        );
      }
      if (!st) {
        skippedAttempts++;
        return;
      }

      const newAttemptId = db.seq.attempts++;
      const stChecklist = db.checklist_items
        .filter((ci) => ci.station_id === st.id)
        .sort((a, b) => a.order_idx - b.order_idx);

      const candidateItems = rawItems.filter(
        (ri) => Number(ri.attempt_id) === Number(att.id)
      );

      let totalScore = Number(att.total_score) || 0;
      const maxScore =
        Math.round(
          stChecklist.reduce((s, c) => s + (Number(c.weight) || 1.0), 0) * 100
        ) / 100;

      if (candidateItems.length > 0) {
        totalScore = 0;
        candidateItems.forEach((ri, idx) => {
          const targetCi =
            stChecklist.find((c) => c.id === Number(ri.checklist_item_id)) ||
            stChecklist[idx];
          if (!targetCi) return;
          const status = ri.status || 'omitido';
          if (status === 'ok') totalScore += Number(targetCi.weight) || 1.0;
          else if (status === 'parcial')
            totalScore += (Number(targetCi.weight) || 1.0) * 0.5;

          db.attempt_items.push({
            id: db.seq.attempt_items++,
            attempt_id: newAttemptId,
            checklist_item_id: targetCi.id,
            status,
            notes: ri.notes || '',
          });
          importedItems++;
        });
      }

      db.attempts.push({
        id: newAttemptId,
        user_id: user.id,
        station_id: st.id,
        performed_at: att.performed_at || new Date().toISOString(),
        duration_sec: Number(att.duration_sec) || 0,
        total_score: Math.round(totalScore * 100) / 100,
        max_score: maxScore || Number(att.max_score) || 1,
        notes: att.notes || '',
      });
      importedAttempts++;
    });

    saveOfflineDb(db);
    return { importedAttempts, importedItems, skippedAttempts };
  },
};
