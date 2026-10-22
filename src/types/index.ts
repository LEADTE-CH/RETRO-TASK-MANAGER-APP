export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type MatrixQuadrant = 
  | 'q1_do_first'     // Urgent & Important
  | 'q2_schedule'     // Not Urgent & Important
  | 'q3_delegate'     // Urgent & Not Important
  | 'q4_eliminate';   // Not Urgent & Not Important

export type TaskCategory = 
  | 'Main Quest'
  | 'Work' 
  | 'Study' 
  | 'Health' 
  | 'Personal' 
  | 'Side Quest';

export type SyncStatus = 'synced' | 'pending' | 'conflict' | 'failed';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string;
  dueDate: string;          // YYYY-MM-DD
  dueTime: string;          // HH:MM
  priority: Priority;
  category: TaskCategory | string;
  isImportant: boolean;
  isUrgent: boolean;
  matrixQuadrant: MatrixQuadrant;
  estimatedMinutes: number; // e.g. 25, 50
  isCompleted: boolean;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  xpAwarded: number;
  reminderSet: boolean;
  syncStatus: SyncStatus;
  isDeleted?: boolean;      // Tombstone for sync
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  hp: number;
  maxHp: number;
  streakDays: number;
  lastActiveDate: string;
  tasksCompletedTotal: number;
  focusMinutesTotal: number;
  // Gamified Focus Mode Stats
  focusStreakCurrent: number;       // Consecutive completed focus sessions
  focusStreakBest: number;          // All-time best focus streak
  focusSessionsAttempted: number;   // Total sessions initiated
  focusSessionsCompleted: number;   // Total sessions finished successfully
  focusCompletionRate: number;      // Completed / Attempted * 100
  focusMinutesToday: number;
  focusRank: string;                // e.g. 'Chrono Novice', 'Focus Knight', 'Chrono Lord'
  // Daily Quest System
  dailyQuestClaimedDate: string;    // YYYY-MM-DD of last claimed daily quest
  dailyQuestStreak: number;         // Consecutive daily quest check-in streak
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  criteria: string;
  icon: string;
  badgeArt: 'sword' | 'shield' | 'trophy' | 'chrono' | 'compass' | 'flame' | 'crown' | 'dragon';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  unlockedAt: string | null;
  xpBonus: number;
  category: 'completion' | 'focus' | 'streak' | 'matrix';
  progress?: { current: number; max: number };
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  taskTitle: string | null;
  mode: 'focus' | 'short_break' | 'long_break';
  durationMinutes: number;
  completed: boolean;
  abandoned?: boolean;
  timestamp: string;
}

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  entity: 'task' | 'stats' | 'session' | 'profile' | 'achievement';
  payload: any;
  timestamp: number;
  attempts: number;
  lastError: string | null;
}

export interface UserSettings {
  themeScanlines: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  notificationsEnabled: boolean;
  focusDuration: number;       // default 25
  shortBreakDuration: number;  // default 5
  longBreakDuration: number;   // default 15
  autoStartBreaks: boolean;
  reducedMotion: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  useCloudSync: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  isGuest: boolean;
  createdAt: string;
}

export type ViewTab = 
  | 'dashboard' 
  | 'tasks' 
  | 'matrix' 
  | 'focus' 
  | 'stats' 
  | 'assistant' 
  | 'settings';
