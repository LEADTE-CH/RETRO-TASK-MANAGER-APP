import React, { useState, useEffect, useRef } from 'react';
import { Task, FocusSession, UserSettings, UserStats } from '../../types';
import { PixelButton, PixelCard, PixelBadge, PixelProgressBar } from '../ui/PixelUI';
import { FocusStatsWidgets } from '../focus/FocusStatsWidgets';
import { retroAudio } from '../../utils/audio';
import { notificationService } from '../../utils/notifications';

interface FocusTimerViewProps {
  tasks: Task[];
  activeTask: Task | null;
  onSelectTask: (task: Task | null) => void;
  onSessionComplete: (session: FocusSession, markTaskCompleted: boolean) => void;
  onSessionAborted?: () => void;
  settings: UserSettings;
  sessionHistory: FocusSession[];
  stats: UserStats;
}

type TimerMode = 'focus' | 'short_break' | 'long_break';

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({
  tasks,
  activeTask,
  onSelectTask,
  onSessionComplete,
  onSessionAborted,
  settings,
  sessionHistory,
  stats,
}) => {
  const [mode, setMode] = useState<TimerMode>('focus');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(settings.focusDuration * 60);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState<boolean>(false);

  // Background-drift-proof timer tracking
  const targetEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const getDurationForMode = (m: TimerMode): number => {
    switch (m) {
      case 'focus':
        return (settings.focusDuration || 25) * 60;
      case 'short_break':
        return (settings.shortBreakDuration || 5) * 60;
      case 'long_break':
        return (settings.longBreakDuration || 15) * 60;
    }
  };

  // Switch mode
  const switchMode = (newMode: TimerMode) => {
    if (isRunning && mode === 'focus' && onSessionAborted) {
      onSessionAborted();
    }
    stopTimer();
    setMode(newMode);
    setTimeLeft(getDurationForMode(newMode));
    setShowCompletionPrompt(false);
  };

  const startTimer = () => {
    retroAudio.playBlip();
    const now = Date.now();
    targetEndTimeRef.current = now + timeLeft * 1000;
    setIsRunning(true);
  };

  const pauseTimer = () => {
    retroAudio.playBlip();
    stopTimer();
  };

  const resetTimer = () => {
    retroAudio.playAlert();
    if (isRunning && mode === 'focus' && onSessionAborted) {
      onSessionAborted();
    }
    stopTimer();
    setTimeLeft(getDurationForMode(mode));
    setShowCompletionPrompt(false);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    targetEndTimeRef.current = null;
    setIsRunning(false);
  };

  // Background-safe interval ticker
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        if (!targetEndTimeRef.current) return;

        const remainingMs = targetEndTimeRef.current - Date.now();
        const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

        setTimeLeft(remainingSeconds);

        if (remainingSeconds <= 0) {
          stopTimer();
          handleTimerFinished();
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, mode, activeTask]);

  // Handle timer completion
  const handleTimerFinished = () => {
    retroAudio.playFocusComplete();

    // Browser notification
    if (notificationService.getPermission() === 'granted') {
      try {
        new Notification(
          mode === 'focus' ? '🎯 Focus Session Complete!' : '🔔 Break Period Ended!',
          {
            body:
              mode === 'focus'
                ? `Epic work! Take a ${settings.shortBreakDuration}m breath, Hero.`
                : 'Ready for the next quest grind!',
            icon: '/favicon.ico',
          }
        );
      } catch {}
    }

    const durationMins = Math.round(getDurationForMode(mode) / 60);
    const newSession: FocusSession = {
      id: 'session_' + Math.random().toString(36).substring(2, 9),
      userId: activeTask?.userId || 'hero',
      taskId: activeTask ? activeTask.id : null,
      taskTitle: activeTask ? activeTask.title : null,
      mode,
      durationMinutes: durationMins,
      completed: true,
      timestamp: new Date().toISOString(),
    };

    if (mode === 'focus' && activeTask) {
      // Prompt user whether to mark task complete
      setShowCompletionPrompt(true);
      onSessionComplete(newSession, false);
    } else {
      onSessionComplete(newSession, false);
    }
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const totalDuration = getDurationForMode(mode);
  const progressPercent = Math.min(100, Math.round(((totalDuration - timeLeft) / totalDuration) * 100));

  const activeBacklogTasks = tasks.filter((t) => !t.isCompleted);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Console Header */}
      <div className="bg-[#121824] pixel-border p-4 sm:p-6 text-center space-y-2">
        <div className="inline-block bg-[#0c202d] border border-[#38bdf8] px-2.5 py-0.5 text-[10px] font-pixel text-[#38bdf8]">
          HYPER-FOCUS CONSOLE
        </div>
        <h2 className="font-pixel text-base sm:text-xl text-[#ede4ce] tracking-tight">
          CHRONO FOCUS CHAMBER
        </h2>
        <p className="font-mono text-xs text-[#94a3b8]">
          Lock onto your target task without distractions. 8-bit time dilation active.
        </p>
      </div>

      {/* Gamified Focus Mode Stats Widgets (Streak Counter, Total Time Meter, Ratio) */}
      <FocusStatsWidgets stats={stats} />

      {/* Target Task Selector */}
      <PixelCard
        title="LOCKED TARGET QUEST"
        badge={<span className="text-sm">🎯</span>}
        variant={activeTask ? 'cyan' : 'default'}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1 min-w-0 w-full">
            {activeTask ? (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <PixelBadge variant="amber" size="sm">
                    {activeTask.priority.toUpperCase()}
                  </PixelBadge>
                  <span className="font-mono text-xs text-[#38bdf8]">
                    #{activeTask.category}
                  </span>
                </div>
                <h3 className="font-mono font-bold text-base text-[#ede4ce] truncate">
                  {activeTask.title}
                </h3>
              </div>
            ) : (
              <span className="font-mono text-xs text-[#64748b]">
                No target locked. Select a quest below or run a freeform focus session.
              </span>
            )}
          </div>

          {/* Selector dropdown */}
          <div className="w-full sm:w-auto">
            <select
              value={activeTask?.id || ''}
              onChange={(e) => {
                const found = tasks.find((t) => t.id === e.target.value) || null;
                onSelectTask(found);
              }}
              className="w-full bg-[#0b0e14] border-2 border-[#2c384e] text-xs font-mono px-3 py-2 text-[#ede4ce] focus:border-[#38bdf8] focus:outline-none cursor-pointer"
            >
              <option value="">-- Freeform Focus (No Linked Quest) --</option>
              {activeBacklogTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.priority.toUpperCase()}] {t.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PixelCard>

      {/* Main Retro Timer Screen */}
      <div className="bg-[#0b0e14] pixel-border border-4 border-[#222d3f] p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.9)]">
        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-2 mb-8 flex-wrap justify-center z-10">
          {(
            [
              { id: 'focus', label: `⚔️ FOCUS (${settings.focusDuration}M)` },
              { id: 'short_break', label: `☕ SHORT BREAK (${settings.shortBreakDuration}M)` },
              { id: 'long_break', label: `🛡️ LONG BREAK (${settings.longBreakDuration}M)` },
            ] as { id: TimerMode; label: string }[]
          ).map((m) => {
            const isSelected = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => switchMode(m.id)}
                className={`px-3 py-2 text-xs font-pixel border-2 cursor-pointer transition ${
                  isSelected
                    ? 'border-[#39ff14] bg-[#0c2412] text-[#39ff14] shadow-[0_0_12px_rgba(57,255,20,0.3)]'
                    : 'border-[#1e293b] bg-[#121824] text-[#94a3b8] hover:text-white hover:border-[#38bdf8]'
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Digital Clock Display */}
        <div className="text-center my-4 z-10">
          <div className="font-vt text-7xl sm:text-9xl text-[#39ff14] tracking-widest font-bold drop-shadow-[0_0_15px_rgba(57,255,20,0.6)] select-none">
            {timeFormatted}
          </div>
          <span className="font-pixel text-[10px] text-[#64748b] tracking-widest uppercase block mt-1">
            {mode.replace('_', ' ')} IN PROGRESS
          </span>
        </div>

        {/* Segmented Progress Meter */}
        <div className="w-full max-w-md my-4 z-10">
          <PixelProgressBar
            value={totalDuration - timeLeft}
            max={totalDuration}
            label="SESSION PROGRESS"
            color="green"
            showNumeric={false}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-6 z-10">
          {!isRunning ? (
            <PixelButton
              variant="primary"
              size="lg"
              onClick={startTimer}
              className="text-sm px-8"
            >
              ▶ ENGAGE FOCUS
            </PixelButton>
          ) : (
            <PixelButton
              variant="amber"
              size="lg"
              onClick={pauseTimer}
              className="text-sm px-8"
            >
              ⏸ PAUSE
            </PixelButton>
          )}

          <PixelButton variant="ghost" size="md" onClick={resetTimer}>
            ↺ RESET
          </PixelButton>
        </div>

        {/* Completion Prompt Notice (does NOT auto complete task - prompts user) */}
        {showCompletionPrompt && activeTask && (
          <div className="mt-6 z-20 bg-[#122416] border-2 border-[#39ff14] p-4 max-w-md w-full text-center space-y-3">
            <span className="font-pixel text-xs text-[#39ff14] block">
              ★ FOCUS SESSION CONCLUDED! ★
            </span>
            <p className="font-mono text-xs text-[#ede4ce]">
              Did you vanquish <strong className="text-white">"{activeTask.title}"</strong> during this session?
            </p>
            <div className="flex items-center justify-center gap-3">
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => {
                  retroAudio.playSuccess();
                  setShowCompletionPrompt(false);
                  onSessionComplete(
                    {
                      id: 'session_' + Math.random().toString(36).substring(2, 9),
                      userId: activeTask.userId,
                      taskId: activeTask.id,
                      taskTitle: activeTask.title,
                      mode: 'focus',
                      durationMinutes: settings.focusDuration,
                      completed: true,
                      timestamp: new Date().toISOString(),
                    },
                    true
                  );
                }}
              >
                ✔ YES, MARK COMPLETE (+XP)
              </PixelButton>
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={() => setShowCompletionPrompt(false)}
              >
                KEEP ACTIVE FOR NEXT ROUND
              </PixelButton>
            </div>
          </div>
        )}
      </div>

      {/* Session History Log */}
      <PixelCard
        title="SESSION LOGBOOK (RECENT EXPEDITIONS)"
        badge={<span className="text-sm">📜</span>}
      >
        {sessionHistory.length === 0 ? (
          <p className="font-mono text-xs text-[#64748b] text-center py-4">
            No focus sessions logged yet. Complete a 25m cycle to record your focus history!
          </p>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto">
            {sessionHistory.slice(0, 8).map((s) => (
              <div
                key={s.id}
                className="bg-[#0b0e14] border border-[#1e293b] p-2.5 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[#39ff14]">✔</span>
                  <span className="text-[#ede4ce] font-bold">
                    {s.taskTitle || 'Freeform Focus'}
                  </span>
                  <span className="text-[#64748b]">({s.durationMinutes}m)</span>
                </div>
                <span className="text-[#64748b]">
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </PixelCard>
    </div>
  );
};
