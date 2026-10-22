import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Task,
  UserStats,
  Achievement,
  FocusSession,
  UserSettings,
  AuthUser,
  ViewTab,
  MatrixQuadrant,
} from './types';
import { localDb } from './db/storage';
import { syncEngine, SyncEngineStatus } from './db/supabase';
import { notificationService } from './utils/notifications';
import { retroAudio } from './utils/audio';

import { PixelHeader } from './components/layout/PixelHeader';
import { PixelToast } from './components/ui/PixelUI';
import { TaskFormModal } from './components/tasks/TaskFormModal';
import { AuthModal } from './components/auth/AuthModal';

import { DashboardView } from './components/views/DashboardView';
import { TasksView } from './components/views/TasksView';
import { EisenhowerMatrixView } from './components/views/EisenhowerMatrixView';
import { FocusTimerView } from './components/views/FocusTimerView';
import { StatsAchievementsView } from './components/views/StatsAchievementsView';
import { AssistantView } from './components/views/AssistantView';
import { SettingsView } from './components/views/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<UserStats>(localDb.getStats());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [settings, setSettings] = useState<UserSettings>(localDb.getSettings());
  const [user, setUser] = useState<AuthUser>(localDb.getAuthUser());

  const [syncStatus, setSyncStatus] = useState<SyncEngineStatus>('idle');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultQuadrantForNew, setDefaultQuadrantForNew] = useState<MatrixQuadrant | undefined>(undefined);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Active task for focus mode
  const [activeFocusTask, setActiveFocusTask] = useState<Task | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' | 'info' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'alert' | 'info' = 'info') => {
    setToast({ message, type });
    const timer = setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Initial load
  useEffect(() => {
    const loadedTasks = localDb.getTasks();
    const loadedStats = localDb.getStats();
    const loadedAch = localDb.getAchievements();
    const loadedSessions = localDb.getFocusSessions();
    const loadedSettings = localDb.getSettings();
    const loadedUser = localDb.getAuthUser();

    setTasks(loadedTasks);
    setStats(loadedStats);
    setAchievements(loadedAch);
    setFocusSessions(loadedSessions);
    setSettings(loadedSettings);
    setUser(loadedUser);

    retroAudio.enabled = loadedSettings.soundEnabled;
    retroAudio.volume = loadedSettings.soundVolume;

    // Schedule reminders for future tasks
    loadedTasks.forEach((t) => {
      notificationService.scheduleTaskReminder(t, (alertedTask) => {
        showToast(`⏰ Deadline alert: "${alertedTask.title}" is due soon!`, 'alert');
      });
    });

    // In-app alert handler
    notificationService.setInAppAlertHandler((task) => {
      showToast(`⏰ Deadline warning: "${task.title}" is due in 15 minutes!`, 'alert');
    });

    // Sync Engine Subscription
    const unsub = syncEngine.subscribe((status) => {
      setSyncStatus(status);
      setPendingSyncCount(localDb.getSyncQueue().length);
    });

    return () => unsub();
  }, [showToast]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid hotkeys when typing in input/textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName) ||
        isTaskModalOpen ||
        isAuthModalOpen
      ) {
        return;
      }

      if (e.key === '1') setActiveTab('dashboard');
      if (e.key === '2') setActiveTab('tasks');
      if (e.key === '3') setActiveTab('matrix');
      if (e.key === '4') setActiveTab('focus');
      if (e.key === '5') setActiveTab('stats');
      if (e.key === '6') setActiveTab('assistant');
      if (e.key === '7') setActiveTab('settings');
      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingTask(null);
        setDefaultQuadrantForNew(undefined);
        setIsTaskModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isAuthModalOpen]);

  // Check achievements after stats or task changes
  const checkAchievements = useCallback(
    (currentStats: UserStats, currentTasks: Task[], currentSessions: FocusSession[]) => {
      const updatedAch = [...achievements];
      let newlyUnlocked = false;

      const completed = currentTasks.filter((t) => t.isCompleted);

      // 1. First Task Completed
      const firstTask = updatedAch.find((a) => a.id === 'first_task_completed');
      if (firstTask && !firstTask.unlockedAt && completed.length >= 1) {
        firstTask.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${firstTask.title}! (+${firstTask.xpBonus} XP)`, 'success');
      }

      // 2. 10 Tasks Completed
      const tenTasks = updatedAch.find((a) => a.id === 'ten_tasks_completed');
      if (tenTasks && !tenTasks.unlockedAt && completed.length >= 10) {
        tenTasks.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${tenTasks.title}! (+${tenTasks.xpBonus} XP)`, 'success');
      }

      // 3. Perfect Week (7-day streak)
      const perfectWeek = updatedAch.find((a) => a.id === 'perfect_week');
      if (perfectWeek && !perfectWeek.unlockedAt && currentStats.streakDays >= 7) {
        perfectWeek.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${perfectWeek.title}! (+${perfectWeek.xpBonus} XP)`, 'success');
      }

      // 4. Focus Master (10 sessions or 250+ focus minutes)
      const focusMaster = updatedAch.find((a) => a.id === 'focus_master');
      if (
        focusMaster &&
        !focusMaster.unlockedAt &&
        ((currentStats.focusSessionsCompleted || 0) >= 10 || currentStats.focusMinutesTotal >= 250)
      ) {
        focusMaster.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${focusMaster.title}! (+${focusMaster.xpBonus} XP)`, 'success');
      }

      // 5. Eisenhower Expert (Completed tasks in all 4 quadrants)
      const eisenhowerExpert = updatedAch.find((a) => a.id === 'eisenhower_expert');
      if (eisenhowerExpert && !eisenhowerExpert.unlockedAt) {
        const completedQuadrants = new Set(completed.map((t) => t.matrixQuadrant));
        if (
          completedQuadrants.has('q1_do_first') &&
          completedQuadrants.has('q2_schedule') &&
          completedQuadrants.has('q3_delegate') &&
          completedQuadrants.has('q4_eliminate')
        ) {
          eisenhowerExpert.unlockedAt = new Date().toISOString();
          newlyUnlocked = true;
          showToast(`🏆 ACHIEVEMENT UNLOCKED: ${eisenhowerExpert.title}! (+${eisenhowerExpert.xpBonus} XP)`, 'success');
        }
      }

      // 6. Dragon Slayer (Critical Boss Defeated)
      const boss = updatedAch.find((a) => a.id === 'boss_slayer');
      if (boss && !boss.unlockedAt && completed.some((t) => t.priority === 'critical')) {
        boss.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${boss.title}! (+${boss.xpBonus} XP)`, 'success');
      }

      // 7. Grand Paladin Centurion (25+ quests)
      const centurion = updatedAch.find((a) => a.id === 'centurion');
      if (centurion && !centurion.unlockedAt && completed.length >= 25) {
        centurion.unlockedAt = new Date().toISOString();
        newlyUnlocked = true;
        showToast(`🏆 ACHIEVEMENT UNLOCKED: ${centurion.title}! (+${centurion.xpBonus} XP)`, 'success');
      }

      if (newlyUnlocked) {
        retroAudio.playLevelUp();
        setAchievements(updatedAch);
        localDb.saveAchievements(updatedAch);
      }
    },
    [achievements, showToast]
  );

  // Toggle Task Completion
  const handleToggleComplete = (task: Task) => {
    const isNowCompleted = !task.isCompleted;

    let xpGained = 0;
    const isFirstTimeCompletion = isNowCompleted && task.xpAwarded === 0;

    if (isFirstTimeCompletion) {
      xpGained = localDb.calculateTaskXP(task);
      retroAudio.playSuccess();
    } else if (isNowCompleted) {
      retroAudio.playSuccess();
    } else {
      retroAudio.playBlip();
    }

    const updatedTask: Task = {
      ...task,
      isCompleted: isNowCompleted,
      completedAt: isNowCompleted ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString(),
      xpAwarded: isFirstTimeCompletion ? xpGained : task.xpAwarded,
      syncStatus: 'pending',
    };

    const nextTasks = tasks.map((t) => (t.id === task.id ? updatedTask : t));
    setTasks(nextTasks);
    localDb.saveTasks(nextTasks);
    localDb.enqueueSync('update', 'task', updatedTask);
    setPendingSyncCount(localDb.getSyncQueue().length);

    // Update stats on complete
    if (isFirstTimeCompletion) {
      const nextTotalXP = stats.xp + xpGained;
      const calculatedLevel = Math.floor(Math.sqrt(nextTotalXP / 75)) + 1;
      const isLevelUp = calculatedLevel > stats.level;

      const nextStats: UserStats = {
        ...stats,
        xp: nextTotalXP,
        level: calculatedLevel,
        xpToNextLevel: calculatedLevel * 100,
        hp: Math.min(100, stats.hp + 5), // Reward HP recovery on quest clear
        tasksCompletedTotal: stats.tasksCompletedTotal + 1,
      };

      setStats(nextStats);
      localDb.saveStats(nextStats);

      if (isLevelUp) {
        retroAudio.playLevelUp();
        try {
          confetti({
            particleCount: 75,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#39ff14', '#38bdf8', '#f59e0b', '#ede4ce'],
          });
        } catch {}
        showToast(`⚔️ LEVEL UP! You reached Paladin Level ${calculatedLevel}!`, 'success');
      } else {
        showToast(`Quest Cleared! +${xpGained} XP awarded.`, 'success');
      }

      checkAchievements(nextStats, nextTasks, focusSessions);
    } else if (isNowCompleted) {
      showToast('Quest marked as cleared.', 'info');
    } else {
      showToast('Quest reopened in active log.', 'info');
    }
  };

  // Create or Update Task
  const handleSaveTask = (taskData: Partial<Task>) => {
    retroAudio.playBlip();
    const nowIso = new Date().toISOString();

    if (editingTask) {
      // Update
      const updated: Task = {
        ...editingTask,
        ...taskData,
        updatedAt: nowIso,
        syncStatus: 'pending',
      } as Task;

      const next = tasks.map((t) => (t.id === editingTask.id ? updated : t));
      setTasks(next);
      localDb.saveTasks(next);
      localDb.enqueueSync('update', 'task', updated);
      notificationService.scheduleTaskReminder(updated);
      setPendingSyncCount(localDb.getSyncQueue().length);
      showToast('Quest details updated.', 'success');
    } else {
      // Create
      const newTask: Task = {
        id: 'task_' + Math.random().toString(36).substring(2, 9),
        userId: user.id,
        title: taskData.title || 'Untitled Quest',
        description: taskData.description || '',
        dueDate: taskData.dueDate || '',
        dueTime: taskData.dueTime || '',
        priority: taskData.priority || 'medium',
        category: taskData.category || 'Main Quest',
        isImportant: taskData.isImportant ?? true,
        isUrgent: taskData.isUrgent ?? false,
        matrixQuadrant: taskData.matrixQuadrant || 'q2_schedule',
        estimatedMinutes: taskData.estimatedMinutes || 25,
        isCompleted: false,
        completedAt: null,
        createdAt: nowIso,
        updatedAt: nowIso,
        xpAwarded: 0,
        reminderSet: taskData.reminderSet ?? true,
        syncStatus: 'pending',
      };

      const next = [newTask, ...tasks];
      setTasks(next);
      localDb.saveTasks(next);
      localDb.enqueueSync('create', 'task', newTask);
      notificationService.scheduleTaskReminder(newTask);
      setPendingSyncCount(localDb.getSyncQueue().length);
      showToast(`Quest "${newTask.title}" added to log!`, 'success');
    }

    setEditingTask(null);
  };

  // Delete Task
  const handleDeleteTask = (task: Task) => {
    notificationService.cancelTaskReminder(task.id);
    const next = tasks.filter((t) => t.id !== task.id);
    setTasks(next);
    localDb.saveTasks(next);
    localDb.enqueueSync('delete', 'task', { id: task.id, isDeleted: true });
    setPendingSyncCount(localDb.getSyncQueue().length);

    if (activeFocusTask?.id === task.id) {
      setActiveFocusTask(null);
    }

    showToast(`Quest "${task.title}" deleted.`, 'alert');
  };

  // Clear completed tasks
  const handleClearCompleted = () => {
    const activeOnly = tasks.filter((t) => !t.isCompleted);
    setTasks(activeOnly);
    localDb.saveTasks(activeOnly);
    showToast('Completed quests cleared from active log.', 'info');
  };

  // Quick move quadrant
  const handleUpdateQuadrant = (task: Task, newQuadrant: MatrixQuadrant) => {
    retroAudio.playBlip();
    const isUrgent = newQuadrant === 'q1_do_first' || newQuadrant === 'q3_delegate';
    const isImportant = newQuadrant === 'q1_do_first' || newQuadrant === 'q2_schedule';

    const updated: Task = {
      ...task,
      matrixQuadrant: newQuadrant,
      isUrgent,
      isImportant,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
    };

    const next = tasks.map((t) => (t.id === task.id ? updated : t));
    setTasks(next);
    localDb.saveTasks(next);
    localDb.enqueueSync('update', 'task', updated);
    setPendingSyncCount(localDb.getSyncQueue().length);
    showToast(`Moved to ${newQuadrant.replace('_', ' ').toUpperCase()}`, 'info');
  };

  // Launch Focus from Task
  const handleStartFocus = (task: Task) => {
    setActiveFocusTask(task);
    setActiveTab('focus');
    showToast(`Chamber calibrated for "${task.title}"`, 'info');
  };

  // Complete Focus Session with gamified streak tracking
  const handleSessionComplete = (session: FocusSession, markTaskCompleted: boolean) => {
    localDb.saveFocusSession(session);
    const nextSessions = [session, ...focusSessions];
    setFocusSessions(nextSessions);

    // Gamified Focus Streak & Metrics
    const currentStreak = (stats.focusStreakCurrent || 0) + 1;
    const bestStreak = Math.max(stats.focusStreakBest || 0, currentStreak);
    const completedSessionsCount = (stats.focusSessionsCompleted || 0) + 1;
    const attemptedSessionsCount = (stats.focusSessionsAttempted || 0) + 1;
    const completionRate = Math.round((completedSessionsCount / attemptedSessionsCount) * 100);
    const nextTotalFocusMins = stats.focusMinutesTotal + session.durationMinutes;

    // Streak Combo Multiplier: base 15 XP + up to 25 bonus XP for active streaks!
    const streakBonus = Math.min(25, (currentStreak - 1) * 5);
    const focusXP = 15 + streakBonus;

    const nextStats: UserStats = {
      ...stats,
      xp: stats.xp + focusXP,
      focusMinutesTotal: nextTotalFocusMins,
      focusStreakCurrent: currentStreak,
      focusStreakBest: bestStreak,
      focusSessionsCompleted: completedSessionsCount,
      focusSessionsAttempted: attemptedSessionsCount,
      focusCompletionRate: completionRate,
      focusMinutesToday: (stats.focusMinutesToday || 0) + session.durationMinutes,
    };
    setStats(nextStats);
    localDb.saveStats(nextStats);

    if (currentStreak > 1) {
      showToast(`⚡ FOCUS COMBO x${currentStreak}! +${focusXP} XP (${streakBonus > 0 ? `+${streakBonus} streak bonus` : ''})`, 'success');
    } else {
      showToast(`Focus session logged! +${focusXP} XP gained.`, 'success');
    }

    if (markTaskCompleted && session.taskId) {
      const target = tasks.find((t) => t.id === session.taskId);
      if (target) {
        handleToggleComplete(target);
      }
    }

    checkAchievements(nextStats, tasks, nextSessions);
  };

  // Handle Aborted / Reset Focus Session (breaks current streak)
  const handleSessionAborted = () => {
    const attemptedSessionsCount = (stats.focusSessionsAttempted || 0) + 1;
    const completedSessionsCount = stats.focusSessionsCompleted || 0;
    const completionRate = Math.round((completedSessionsCount / attemptedSessionsCount) * 100);

    const nextStats: UserStats = {
      ...stats,
      focusStreakCurrent: 0, // Streak reset
      focusSessionsAttempted: attemptedSessionsCount,
      focusCompletionRate: completionRate,
    };
    setStats(nextStats);
    localDb.saveStats(nextStats);
    showToast('Focus session abandoned! Current streak combo reset to 0.', 'alert');
  };

  // Handle claiming the Daily Quest (once every 24 hours)
  const handleClaimDailyQuest = (bonusXP: number) => {
    const today = new Date().toISOString().split('T')[0];
    if (stats.dailyQuestClaimedDate === today) {
      showToast('Daily quest already claimed for today!', 'info');
      return;
    }

    const lastClaim = stats.dailyQuestClaimedDate;
    let nextStreak = 1;
    if (lastClaim) {
      const last = new Date(lastClaim);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        nextStreak = (stats.dailyQuestStreak || 1) + 1;
      }
    }

    const nextTotalXP = stats.xp + bonusXP;
    const calculatedLevel = Math.floor(Math.sqrt(nextTotalXP / 75)) + 1;
    const isLevelUp = calculatedLevel > stats.level;

    const nextStats: UserStats = {
      ...stats,
      xp: nextTotalXP,
      level: calculatedLevel,
      xpToNextLevel: calculatedLevel * 100,
      dailyQuestClaimedDate: today,
      dailyQuestStreak: nextStreak,
      hp: Math.min(100, stats.hp + 10), // Daily roll-call restores HP!
    };

    setStats(nextStats);
    localDb.saveStats(nextStats);

    if (isLevelUp) {
      retroAudio.playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#39ff14', '#38bdf8', '#ede4ce'],
        });
      } catch {}
      showToast(`⚔️ LEVEL UP! Reached Paladin Level ${calculatedLevel}!`, 'success');
    } else {
      showToast(`Daily Bounty Claimed! +${bonusXP} XP gained (+10 HP restored)`, 'success');
    }

    checkAchievements(nextStats, tasks, focusSessions);
  };

  // Trigger Supabase Cloud Sync
  const handleTriggerSync = async () => {
    retroAudio.playBlip();
    showToast('Connecting to sync engine...', 'info');
    const res = await syncEngine.syncNow();
    setTasks(localDb.getTasks());
    setPendingSyncCount(localDb.getSyncQueue().length);
    showToast(res.message, res.success ? 'success' : 'alert');
  };

  // Factory reset to initial starter template
  const handleResetData = () => {
    localStorage.clear();
    const loadedTasks = localDb.getTasks();
    const loadedStats = localDb.getStats();
    const loadedAch = localDb.getAchievements();
    const loadedSessions = localDb.getFocusSessions();
    const loadedSettings = localDb.getSettings();
    const loadedUser = localDb.getAuthUser();

    setTasks(loadedTasks);
    setStats(loadedStats);
    setAchievements(loadedAch);
    setFocusSessions(loadedSessions);
    setSettings(loadedSettings);
    setUser(loadedUser);
    setPendingSyncCount(0);
  };

  return (
    <div className={`min-h-screen bg-[#0b0e14] text-[#ede4ce] flex flex-col font-mono relative ${settings.themeScanlines ? 'crt-scanlines' : ''}`}>
      {/* Retro Console Header Bar & RPG HUD */}
      <PixelHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        stats={stats}
        user={user}
        syncStatus={syncStatus}
        pendingSyncCount={pendingSyncCount}
        onSyncClick={handleTriggerSync}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const next = !settings.soundEnabled;
          retroAudio.enabled = next;
          const updated = { ...settings, soundEnabled: next };
          setSettings(updated);
          localDb.saveSettings(updated);
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            stats={stats}
            onNavigate={setActiveTab}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setDefaultQuadrantForNew(undefined);
              setIsTaskModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onClaimDailyQuest={handleClaimDailyQuest}
          />
        )}

        {activeTab === 'tasks' && (
          <TasksView
            tasks={tasks}
            onOpenCreateTask={() => {
              setEditingTask(null);
              setDefaultQuadrantForNew(undefined);
              setIsTaskModalOpen(true);
            }}
            onToggleComplete={handleToggleComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onClearCompleted={handleClearCompleted}
          />
        )}

        {activeTab === 'matrix' && (
          <EisenhowerMatrixView
            tasks={tasks}
            onToggleComplete={handleToggleComplete}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onStartFocus={handleStartFocus}
            onUpdateQuadrant={handleUpdateQuadrant}
            onOpenCreateTask={(quad) => {
              setEditingTask(null);
              setDefaultQuadrantForNew(quad);
              setIsTaskModalOpen(true);
            }}
          />
        )}

        {activeTab === 'focus' && (
          <FocusTimerView
            tasks={tasks}
            activeTask={activeFocusTask}
            onSelectTask={setActiveFocusTask}
            onSessionComplete={handleSessionComplete}
            onSessionAborted={handleSessionAborted}
            settings={settings}
            sessionHistory={focusSessions}
            stats={stats}
          />
        )}

        {activeTab === 'stats' && (
          <StatsAchievementsView
            stats={stats}
            achievements={achievements}
            tasks={tasks}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView
            tasks={tasks}
            stats={stats}
            user={user}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => {
              setSettings(newSettings);
              localDb.saveSettings(newSettings);
            }}
            user={user}
            onUpdateUser={(newUser) => {
              setUser(newUser);
              localDb.saveAuthUser(newUser);
            }}
            syncStatus={syncStatus}
            onTriggerSync={handleTriggerSync}
            pendingSyncCount={pendingSyncCount}
            onShowToast={showToast}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
          setDefaultQuadrantForNew(undefined);
        }}
        onSave={handleSaveTask}
        initialTask={
          editingTask
            ? editingTask
            : defaultQuadrantForNew
            ? ({
                matrixQuadrant: defaultQuadrantForNew,
                isUrgent: defaultQuadrantForNew === 'q1_do_first' || defaultQuadrantForNew === 'q3_delegate',
                isImportant: defaultQuadrantForNew === 'q1_do_first' || defaultQuadrantForNew === 'q2_schedule',
              } as any)
            : null
        }
      />

      {/* Auth & Hero Account Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={user}
        stats={stats}
        achievements={achievements}
        onLoginSuccess={(authed) => {
          setUser(authed);
          localDb.saveAuthUser(authed);
          showToast(`Welcome back, ${authed.displayName}!`, 'success');
        }}
        onSignOut={() => {
          const guest = {
            id: 'guest_hero_01',
            email: 'hero@pixelquest.local',
            displayName: 'Pixel Knight',
            isGuest: true,
            createdAt: new Date().toISOString(),
          };
          setUser(guest);
          localDb.saveAuthUser(guest);
          showToast('Signed out. Local guest session active.', 'info');
        }}
      />

      {/* Floating Retro Toast Notice */}
      {toast && (
        <PixelToast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Retro Bottom Status Bar */}
      <footer className="bg-[#070a0e] border-t-2 border-[#1a2234] px-4 py-2 text-[10px] font-mono text-[#64748b] flex flex-wrap items-center justify-between gap-2 select-none">
        <div className="flex items-center gap-3">
          <span>PIXELQUEST v1.0.0</span>
          <span>·</span>
          <span>HOTKEYS: [1..7] TABS, [N] NEW QUEST</span>
          <span>·</span>
          <span>SYNC: {syncStatus.toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>OFFLINE-FIRST DURABILITY ENGINE</span>
          <span>·</span>
          <a
            href="/api/download"
            download="pixelquest-task-manager.zip"
            className="text-[#39ff14] hover:underline flex items-center gap-1 font-bold"
          >
            <span>📦</span>
            <span>DOWNLOAD ZIP</span>
          </a>
          <span>·</span>
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('settings');
            }}
            className="text-[#38bdf8] hover:underline"
          >
            SUPABASE SQL SETUP
          </a>
        </div>
      </footer>
    </div>
  );
}
