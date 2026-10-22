import { Task, UserStats, Achievement, FocusSession, SyncQueueItem, UserSettings, AuthUser, MatrixQuadrant } from '../types';

const STORAGE_KEYS = {
  TASKS: 'pixelquest_tasks_v1',
  STATS: 'pixelquest_stats_v1',
  ACHIEVEMENTS: 'pixelquest_achievements_v1',
  SESSIONS: 'pixelquest_sessions_v1',
  QUEUE: 'pixelquest_sync_queue_v1',
  SETTINGS: 'pixelquest_settings_v1',
  USER: 'pixelquest_auth_user_v1',
};

// Calculate Eisenhower quadrant based on urgent/important flags
export function calculateQuadrant(isUrgent: boolean, isImportant: boolean): MatrixQuadrant {
  if (isUrgent && isImportant) return 'q1_do_first';
  if (!isUrgent && isImportant) return 'q2_schedule';
  if (isUrgent && !isImportant) return 'q3_delegate';
  return 'q4_eliminate';
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task_completed',
    title: 'First Task Completed',
    description: 'Vanquish your very first quest from the active log.',
    criteria: 'Complete 1 task',
    icon: '⚔️',
    badgeArt: 'sword',
    tier: 'bronze',
    unlockedAt: null,
    xpBonus: 50,
    category: 'completion',
    progress: { current: 0, max: 1 },
  },
  {
    id: 'ten_tasks_completed',
    title: '10 Tasks Completed',
    description: 'Prove your dedication by clearing 10 quests.',
    criteria: 'Complete 10 tasks',
    icon: '🛡️',
    badgeArt: 'shield',
    tier: 'silver',
    unlockedAt: null,
    xpBonus: 100,
    category: 'completion',
    progress: { current: 0, max: 10 },
  },
  {
    id: 'perfect_week',
    title: 'Perfect Week',
    description: 'Forge an unbroken 7-day daily quest streak.',
    criteria: 'Maintain a 7-day streak',
    icon: '🔥',
    badgeArt: 'flame',
    tier: 'gold',
    unlockedAt: null,
    xpBonus: 200,
    category: 'streak',
    progress: { current: 0, max: 7 },
  },
  {
    id: 'focus_master',
    title: 'Focus Master',
    description: 'Attain chrono mastery through 10 sessions or 250+ focus minutes.',
    criteria: '10 focus sessions or 250+ focus mins',
    icon: '⏳',
    badgeArt: 'chrono',
    tier: 'gold',
    unlockedAt: null,
    xpBonus: 250,
    category: 'focus',
    progress: { current: 0, max: 10 },
  },
  {
    id: 'eisenhower_expert',
    title: 'Eisenhower Expert',
    description: 'Achieve 4-quadrant balance by completing tasks in Q1, Q2, Q3, and Q4.',
    criteria: 'Complete at least 1 task in all 4 quadrants',
    icon: '🧭',
    badgeArt: 'compass',
    tier: 'platinum',
    unlockedAt: null,
    xpBonus: 300,
    category: 'matrix',
    progress: { current: 0, max: 4 },
  },
  {
    id: 'boss_slayer',
    title: 'Dragon Slayer',
    description: 'Slay a Critical (Rank-S) priority quest boss.',
    criteria: 'Complete 1 Critical priority task',
    icon: '🐉',
    badgeArt: 'dragon',
    tier: 'gold',
    unlockedAt: null,
    xpBonus: 150,
    category: 'completion',
    progress: { current: 0, max: 1 },
  },
  {
    id: 'centurion',
    title: 'Grand Paladin Centurion',
    description: 'Reach legendary status by completing 25 total quests.',
    criteria: 'Complete 25 tasks',
    icon: '👑',
    badgeArt: 'crown',
    tier: 'platinum',
    unlockedAt: null,
    xpBonus: 500,
    category: 'completion',
    progress: { current: 0, max: 25 },
  },
];

export const DEFAULT_SETTINGS: UserSettings = {
  themeScanlines: true,
  soundEnabled: true,
  soundVolume: 0.5,
  notificationsEnabled: true,
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: false,
  reducedMotion: false,
  supabaseUrl: '',
  supabaseAnonKey: '',
  useCloudSync: false,
};

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getTomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

const INITIAL_TASKS: Task[] = [
  {
    id: 'quest_1',
    userId: 'guest_user_1',
    title: 'Slay Inactive Inbox Dragon',
    description: 'Process all pending unread scrolls and clear inbox to zero.',
    dueDate: getTodayString(),
    dueTime: '17:00',
    priority: 'high',
    category: 'Work',
    isImportant: true,
    isUrgent: true,
    matrixQuadrant: 'q1_do_first',
    estimatedMinutes: 25,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
    xpAwarded: 0,
    reminderSet: true,
    syncStatus: 'synced',
  },
  {
    id: 'quest_2',
    userId: 'guest_user_1',
    title: 'Forge Weekly Battle Strategy',
    description: 'Map out the upcoming milestones, client deliverables, and priorities.',
    dueDate: getTomorrowString(),
    dueTime: '10:00',
    priority: 'critical',
    category: 'Main Quest',
    isImportant: true,
    isUrgent: false,
    matrixQuadrant: 'q2_schedule',
    estimatedMinutes: 50,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
    xpAwarded: 0,
    reminderSet: true,
    syncStatus: 'synced',
  },
  {
    id: 'quest_3',
    userId: 'guest_user_1',
    title: 'Upgrade Physical Armor (30m Workout)',
    description: 'Cardio run or dungeon lift to boost maximum stamina & HP.',
    dueDate: getTodayString(),
    dueTime: '19:30',
    priority: 'medium',
    category: 'Health',
    isImportant: true,
    isUrgent: false,
    matrixQuadrant: 'q2_schedule',
    estimatedMinutes: 30,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    xpAwarded: 0,
    reminderSet: false,
    syncStatus: 'synced',
  },
  {
    id: 'quest_4',
    userId: 'guest_user_1',
    title: 'Delegate Supply Inventory Order',
    description: 'Hand off office hardware requests to tavern merchant.',
    dueDate: getTomorrowString(),
    dueTime: '14:00',
    priority: 'low',
    category: 'Side Quest',
    isImportant: false,
    isUrgent: true,
    matrixQuadrant: 'q3_delegate',
    estimatedMinutes: 15,
    isCompleted: false,
    completedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    xpAwarded: 0,
    reminderSet: false,
    syncStatus: 'synced',
  },
];

class LocalDatabase {
  // Load tasks
  getTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(INITIAL_TASKS);
        return INITIAL_TASKS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TASKS;
    }
  }

  // Save tasks
  saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to local storage', e);
    }
  }

  // Load user stats
  getStats(): UserStats {
    const fallbackStats: UserStats = {
      level: 1,
      xp: 45,
      xpToNextLevel: 100,
      hp: 100,
      maxHp: 100,
      streakDays: 2,
      lastActiveDate: getTodayString(),
      tasksCompletedTotal: 1,
      focusMinutesTotal: 50,
      focusStreakCurrent: 2,
      focusStreakBest: 4,
      focusSessionsAttempted: 2,
      focusSessionsCompleted: 2,
      focusCompletionRate: 100,
      focusMinutesToday: 25,
      focusRank: 'Time Adept',
      dailyQuestClaimedDate: '',
      dailyQuestStreak: 0,
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        this.saveStats(fallbackStats);
        return fallbackStats;
      }
      const raw = JSON.parse(data);
      const merged: UserStats = {
        ...fallbackStats,
        ...raw,
        focusStreakCurrent: raw.focusStreakCurrent ?? 1,
        focusStreakBest: raw.focusStreakBest ?? Math.max(1, raw.focusStreakCurrent ?? 1),
        focusSessionsAttempted: raw.focusSessionsAttempted ?? Math.max(1, Math.floor((raw.focusMinutesTotal || 0) / 25)),
        focusSessionsCompleted: raw.focusSessionsCompleted ?? Math.max(1, Math.floor((raw.focusMinutesTotal || 0) / 25)),
        focusCompletionRate: raw.focusCompletionRate ?? 100,
        focusMinutesToday: raw.focusMinutesToday ?? 25,
        focusRank: raw.focusRank ?? 'Time Adept',
        dailyQuestClaimedDate: raw.dailyQuestClaimedDate ?? '',
        dailyQuestStreak: raw.dailyQuestStreak ?? 0,
      };
      return this.checkStreak(merged);
    } catch {
      return fallbackStats;
    }
  }

  private checkStreak(stats: UserStats): UserStats {
    const today = getTodayString();
    if (stats.lastActiveDate === today) {
      return stats;
    }

    const last = new Date(stats.lastActiveDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));

    if (diffDays === 1) {
      return stats;
    } else if (diffDays > 1) {
      const updated: UserStats = {
        ...stats,
        streakDays: 1,
        hp: Math.max(20, stats.hp - 10),
        lastActiveDate: today,
      };
      this.saveStats(updated);
      return updated;
    }
    return stats;
  }

  saveStats(stats: UserStats): void {
    try {
      localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  }

  // Load achievements with schema migration & sync support
  getAchievements(): Achievement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (!data) {
        this.saveAchievements(DEFAULT_ACHIEVEMENTS);
        return DEFAULT_ACHIEVEMENTS;
      }
      const savedList: Achievement[] = JSON.parse(data);
      const savedMap = new Map(savedList.map((a) => [a.id, a]));

      // Merge defaults with saved unlock timestamps
      const merged = DEFAULT_ACHIEVEMENTS.map((def) => {
        const existing = savedMap.get(def.id);
        return {
          ...def,
          unlockedAt: existing ? existing.unlockedAt : null,
          progress: existing?.progress || def.progress,
        };
      });

      return merged;
    } catch {
      return DEFAULT_ACHIEVEMENTS;
    }
  }

  saveAchievements(achievements: Achievement[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    } catch (e) {
      console.error('Failed to save achievements', e);
    }
  }

  // Focus sessions
  getFocusSessions(): FocusSession[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveFocusSession(session: FocusSession): void {
    try {
      const list = this.getFocusSessions();
      list.unshift(session);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(list.slice(0, 100)));
    } catch (e) {
      console.error('Failed to save focus session', e);
    }
  }

  // Settings
  getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // Auth User
  getAuthUser(): AuthUser {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      if (data) return JSON.parse(data);
    } catch {
      // ignore
    }
    const guest: AuthUser = {
      id: 'guest_hero_01',
      email: 'hero@pixelquest.local',
      displayName: 'Pixel Knight',
      isGuest: true,
      createdAt: new Date().toISOString(),
    };
    this.saveAuthUser(guest);
    return guest;
  }

  saveAuthUser(user: AuthUser): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save auth user', e);
    }
  }

  // Sync Queue (durable offline storage)
  getSyncQueue(): SyncQueueItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  saveSyncQueue(queue: SyncQueueItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    } catch (e) {
      console.error('Failed to save sync queue', e);
    }
  }

  enqueueSync(operation: SyncQueueItem['operation'], entity: SyncQueueItem['entity'], payload: any): void {
    const queue = this.getSyncQueue();
    // Deduplicate pending items for the same entity ID if applicable
    const existingIdx = queue.findIndex(
      (item) => item.entity === entity && item.payload?.id === payload?.id && item.operation === operation
    );

    const newItem: SyncQueueItem = {
      id: 'sync_' + Math.random().toString(36).substring(2, 9),
      operation,
      entity,
      payload,
      timestamp: Date.now(),
      attempts: 0,
      lastError: null,
    };

    if (existingIdx >= 0) {
      queue[existingIdx] = newItem;
    } else {
      queue.push(newItem);
    }
    this.saveSyncQueue(queue);
  }

  // Calculate XP gained from task
  calculateTaskXP(task: Task): number {
    let base = 20;
    switch (task.priority) {
      case 'critical': base = 50; break;
      case 'high': base = 35; break;
      case 'medium': base = 25; break;
      case 'low': base = 15; break;
    }
    // Duration bonus
    const durationBonus = Math.min(30, Math.floor((task.estimatedMinutes || 25) / 5) * 2);
    // Urgent & Important Q1 bonus
    const matrixBonus = (task.isUrgent && task.isImportant) ? 15 : 0;
    return base + durationBonus + matrixBonus;
  }
}

export const localDb = new LocalDatabase();
