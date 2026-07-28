const SPACES_KEY = 'neuron_learning_spaces_v2';
const SESSIONS_KEY = 'neuron_recent_sessions_v1';
const METRICS_KEY = 'neuron_learning_metrics_v2';
const PROFILE_KEY = 'neuron_user_profile_v1';
const WORKSPACE_CACHE_KEY = 'neuron_workspace_cache_v1';

export function getUserProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : { name: 'Srinivas', initials: 'S', role: 'Learner' };
  } catch (e) {
    return { name: 'Srinivas', initials: 'S', role: 'Learner' };
  }
}

export function saveUserProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    return profile;
  } catch (e) {
    return profile;
  }
}

export function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function getLearningSpaces() {
  try {
    const raw = localStorage.getItem(SPACES_KEY);
    return raw ? JSON.parse(raw) : [
      { id: 'space_1', title: 'Machine Learning', count: 7, color: 'bg-indigo-500' },
      { id: 'space_2', title: 'System Design', count: 5, color: 'bg-emerald-500' },
      { id: 'space_3', title: 'Algorithms & Data Structures', count: 8, color: 'bg-amber-500' }
    ];
  } catch (e) {
    return [];
  }
}

export function deleteLearningSpace(spaceId, spaceTitle) {
  try {
    const spaces = getLearningSpaces();
    const filtered = spaces.filter(s => s.id !== spaceId && s.title.toLowerCase() !== String(spaceTitle).toLowerCase());
    localStorage.setItem(SPACES_KEY, JSON.stringify(filtered));

    // Also purge cached workspace entry
    clearWorkspaceCache(spaceId);
    clearWorkspaceCache(spaceTitle);

    return filtered;
  } catch (e) {
    return [];
  }
}

/* =========================================================================
   Instant Local Workspace Cache Storage & Lookup
   ========================================================================= */

export function saveWorkspaceToCache(workspaceData, spaceId = null) {
  if (!workspaceData) return;
  try {
    const raw = localStorage.getItem(WORKSPACE_CACHE_KEY);
    const cache = raw ? JSON.parse(raw) : {};

    if (workspaceData.topic) {
      const topicKey = workspaceData.topic.toLowerCase().trim();
      cache[topicKey] = workspaceData;
    }

    if (spaceId) {
      const idKey = String(spaceId).toLowerCase().trim();
      cache[idKey] = workspaceData;
    }

    localStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to save workspace to cache:', e);
  }
}

export function getCachedWorkspace(topicOrId) {
  if (!topicOrId) return null;
  try {
    const raw = localStorage.getItem(WORKSPACE_CACHE_KEY);
    if (!raw) return null;
    const cache = JSON.parse(raw);
    const targetKey = String(topicOrId).toLowerCase().trim();

    // 1. Direct key match
    if (cache[targetKey]) return cache[targetKey];

    // 2. Search values by topic, category, or title
    const allWorkspaces = Object.values(cache);
    const match = allWorkspaces.find(w => {
      if (!w || !w.topic) return false;
      const t = w.topic.toLowerCase();
      return t === targetKey || t.includes(targetKey) || targetKey.includes(t);
    });

    return match || null;
  } catch (e) {
    return null;
  }
}

export function clearWorkspaceCache(topic) {
  if (!topic) return;
  try {
    const raw = localStorage.getItem(WORKSPACE_CACHE_KEY);
    if (!raw) return;
    const cache = JSON.parse(raw);
    const key = String(topic).toLowerCase().trim();
    delete cache[key];
    const foundKey = Object.keys(cache).find(k => k.includes(key) || key.includes(k));
    if (foundKey) delete cache[foundKey];
    localStorage.setItem(WORKSPACE_CACHE_KEY, JSON.stringify(cache));
  } catch (e) {
    console.warn('Failed to clear workspace cache:', e);
  }
}

/* =========================================================================
   Metrics & Progress Persistence
   ========================================================================= */

export function getLearningMetrics() {
  try {
    const raw = localStorage.getItem(METRICS_KEY);
    return raw ? JSON.parse(raw) : {
      streakDays: 1,
      conceptsMastered: 0,
      flashcardsReviewed: 0,
      weakTopicsCount: 0,
      studyTimeMinutes: 0
    };
  } catch (e) {
    return { streakDays: 1, conceptsMastered: 0, flashcardsReviewed: 0, weakTopicsCount: 0, studyTimeMinutes: 0 };
  }
}

export function recordCardSwipe(isKnown) {
  try {
    const m = getLearningMetrics();
    m.flashcardsReviewed += 1;
    if (isKnown) {
      m.conceptsMastered += 1;
    } else {
      m.weakTopicsCount += 1;
    }
    localStorage.setItem(METRICS_KEY, JSON.stringify(m));
    return m;
  } catch (e) {
    return null;
  }
}

export function recordQuizAnswer(isCorrect) {
  try {
    const m = getLearningMetrics();
    if (isCorrect) {
      m.conceptsMastered += 1;
    } else {
      m.weakTopicsCount += 1;
    }
    localStorage.setItem(METRICS_KEY, JSON.stringify(m));
    return m;
  } catch (e) {
    return null;
  }
}

export function recordQuizCompletion(score) {
  try {
    const m = getLearningMetrics();
    localStorage.setItem(METRICS_KEY, JSON.stringify(m));
    return m;
  } catch (e) {
    return null;
  }
}

export function recordRevisionStepCompleted() {
  try {
    const m = getLearningMetrics();
    m.conceptsMastered += 1;
    localStorage.setItem(METRICS_KEY, JSON.stringify(m));
    return m;
  } catch (e) {
    return null;
  }
}

export function addStudyTimeMinutes(mins = 1) {
  try {
    const m = getLearningMetrics();
    m.studyTimeMinutes += mins;
    localStorage.setItem(METRICS_KEY, JSON.stringify(m));
    return m;
  } catch (e) {
    return null;
  }
}

export function resetMetricsToZero() {
  const fresh = {
    streakDays: 1,
    conceptsMastered: 0,
    flashcardsReviewed: 0,
    weakTopicsCount: 0,
    studyTimeMinutes: 0
  };
  localStorage.setItem(METRICS_KEY, JSON.stringify(fresh));
  return fresh;
}

export function saveSessionToSpace(sessionData) {
  try {
    const spaces = getLearningSpaces();
    const existing = spaces.find(s => s.title.toLowerCase() === sessionData.topic.toLowerCase());

    const conceptCount = sessionData.conceptNodes?.length || sessionData.statsSummary?.conceptsCount || 5;

    if (!existing) {
      spaces.unshift({
        id: `space_${Date.now()}`,
        title: sessionData.topic,
        count: conceptCount,
        color: 'bg-indigo-500'
      });
    } else {
      existing.count = conceptCount;
    }
    localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
    return spaces;
  } catch (e) {
    return [];
  }
}
