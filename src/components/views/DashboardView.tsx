import React from 'react';
import { Task, UserStats, ViewTab } from '../../types';
import { PixelCard, PixelButton, PixelProgressBar, PixelBadge } from '../ui/PixelUI';
import { TaskCard } from '../tasks/TaskCard';
import { FocusStatsWidgets } from '../focus/FocusStatsWidgets';
import { DailyQuestCard } from '../dashboard/DailyQuestCard';

interface DashboardViewProps {
  tasks: Task[];
  stats: UserStats;
  onNavigate: (tab: ViewTab) => void;
  onOpenCreateTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onClaimDailyQuest: (bonusXP: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  stats,
  onNavigate,
  onOpenCreateTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onClaimDailyQuest,
}) => {
  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const todayStr = new Date().toISOString().split('T')[0];

  const dueToday = activeTasks.filter((t) => t.dueDate === todayStr);
  const overdueTasks = activeTasks.filter((t) => t.dueDate && t.dueDate < todayStr);
  const criticalTasks = activeTasks.filter((t) => t.priority === 'critical');
  const q1Tasks = activeTasks.filter((t) => t.isUrgent && t.isImportant);

  return (
    <div className="space-y-6">
      {/* Hero Banner: Radar Summary Bar */}
      <div className="bg-[#121824] pixel-border p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-[#39ff14] bg-[#0c2412] px-2 py-0.5 border border-[#39ff14]">
              CONSOLE RADAR ONLINE
            </span>
            <span className="text-xs font-mono text-[#94a3b8]">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#ede4ce] tracking-tight">
            COMMAND CENTER & CAMPAIGN LOG
          </h2>
          <p className="font-mono text-xs text-[#94a3b8] mt-1">
            {activeTasks.length} active quests remaining · {completedTasks.length} cleared today · {stats.streakDays} day battle streak
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <PixelButton variant="primary" onClick={onOpenCreateTask}>
            + FORGE QUEST
          </PixelButton>
          <PixelButton variant="cyan" onClick={() => onNavigate('focus')}>
            ⌛ FOCUS MODE
          </PixelButton>
          <PixelButton variant="amber" onClick={() => onNavigate('assistant')}>
            👾 ASK ORACLE
          </PixelButton>
        </div>
      </div>

      {/* Daily Quest: 24-Hour Recurring Task Review Bounty */}
      <DailyQuestCard
        tasks={tasks}
        stats={stats}
        onClaimDailyQuest={onClaimDailyQuest}
        onReviewTasksClick={() => onNavigate('tasks')}
      />

      {/* 4 Core Vital Stat Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PixelCard className="border-t-4 border-t-[#39ff14]">
          <div className="flex items-center justify-between text-xs font-pixel text-[#94a3b8]">
            <span>CLEARED</span>
            <span className="text-[#39ff14]">✔</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-pixel text-2xl sm:text-3xl text-[#39ff14]">
              {completedTasks.length}
            </span>
            <span className="font-mono text-xs text-[#64748b]">/ {tasks.length}</span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8] mt-1 block">
            {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}% quest clear rate
          </span>
        </PixelCard>

        <PixelCard className="border-t-4 border-t-[#38bdf8]">
          <div className="flex items-center justify-between text-xs font-pixel text-[#94a3b8]">
            <span>DUE TODAY</span>
            <span className="text-[#38bdf8]">★</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-pixel text-2xl sm:text-3xl text-[#38bdf8]">
              {dueToday.length}
            </span>
            <span className="font-mono text-xs text-[#64748b]">quests</span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8] mt-1 block">
            Scheduled for current day
          </span>
        </PixelCard>

        <PixelCard className={`border-t-4 ${overdueTasks.length > 0 ? 'border-t-[#ef4444]' : 'border-t-[#475569]'}`}>
          <div className="flex items-center justify-between text-xs font-pixel text-[#94a3b8]">
            <span>OVERDUE</span>
            <span className={overdueTasks.length > 0 ? 'text-[#ef4444]' : 'text-[#64748b]'}>⚠</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`font-pixel text-2xl sm:text-3xl ${overdueTasks.length > 0 ? 'text-[#ef4444]' : 'text-[#ede4ce]'}`}>
              {overdueTasks.length}
            </span>
            <span className="font-mono text-xs text-[#64748b]">alerts</span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8] mt-1 block">
            {overdueTasks.length > 0 ? 'Attention required!' : 'Radar clean'}
          </span>
        </PixelCard>

        <PixelCard className="border-t-4 border-t-[#f59e0b]">
          <div className="flex items-center justify-between text-xs font-pixel text-[#94a3b8]">
            <span>DEEP FOCUS</span>
            <span className="text-[#f59e0b]">⚡</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-pixel text-2xl sm:text-3xl text-[#f59e0b]">
              {stats.focusMinutesTotal}
            </span>
            <span className="font-mono text-xs text-[#64748b]">mins</span>
          </div>
          <span className="font-mono text-[11px] text-[#94a3b8] mt-1 block">
            {Math.round(stats.focusMinutesTotal / 25)} Pomodoro cycles
          </span>
        </PixelCard>
      </div>

      {/* Gamified Focus Mode Stats Section (Streak Counter, Total Time Meter & Completion Rate) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[#38bdf8] font-pixel text-xs">⌛</span>
            <h3 className="font-pixel text-xs text-[#ede4ce] tracking-wide">
              FOCUS MODE MASTERY & COMBOS
            </h3>
          </div>
          <button
            onClick={() => onNavigate('focus')}
            className="font-pixel text-[9px] text-[#38bdf8] hover:underline cursor-pointer"
          >
            OPEN FOCUS CHAMBER →
          </button>
        </div>
        <FocusStatsWidgets stats={stats} />
      </div>

      {/* Main Grid: Left Column (Quests) / Right Column (Eisenhower Radar & Character Status) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Boss Battles / Q1 Priority */}
          {q1Tasks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#ef4444] font-pixel text-xs animate-retro-pulse">●</span>
                  <h3 className="font-pixel text-xs text-[#ef4444] tracking-wide">
                    BOSS BATTLES (QUADRANT 1: URGENT & IMPORTANT)
                  </h3>
                </div>
                <PixelBadge variant="red" size="sm">
                  {q1Tasks.length} CRITICAL
                </PixelBadge>
              </div>

              <div className="space-y-3">
                {q1Tasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartFocus={onStartFocus}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Today's Quests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#38bdf8] font-pixel text-xs">▶</span>
                <h3 className="font-pixel text-xs text-[#ede4ce] tracking-wide">
                  ACTIVE CAMPAIGN QUESTS ({activeTasks.length})
                </h3>
              </div>
              <button
                onClick={() => onNavigate('tasks')}
                className="font-pixel text-[10px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                VIEW ALL →
              </button>
            </div>

            {activeTasks.length === 0 ? (
              <div className="bg-[#121824] pixel-border p-8 text-center space-y-3">
                <span className="text-3xl block">🏆</span>
                <h4 className="font-pixel text-xs text-[#39ff14]">QUEST LOG CLEARED!</h4>
                <p className="font-mono text-xs text-[#94a3b8] max-w-sm mx-auto">
                  All monsters defeated and todos resolved. Forge a new quest or review your Eisenhower Matrix!
                </p>
                <PixelButton variant="primary" onClick={onOpenCreateTask}>
                  + CREATE NEW QUEST
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-3">
                {activeTasks.slice(0, 5).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onStartFocus={onStartFocus}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Eisenhower Matrix Preview & RPG Status */}
        <div className="space-y-6">
          {/* Character RPG Status Sheet */}
          <PixelCard
            title="HERO ATTRIBUTES"
            badge={<span className="text-sm">🛡️</span>}
            variant="cyan"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-pixel text-xs text-white">KNIGHT LEVEL {stats.level}</span>
                  <span className="font-mono text-xs text-[#94a3b8] block">Paladin Class</span>
                </div>
                <div className="text-right">
                  <span className="font-pixel text-xs text-[#f59e0b]">🔥 {stats.streakDays} DAYS</span>
                  <span className="font-mono text-[10px] text-[#64748b] block">Streak Bonus Active</span>
                </div>
              </div>

              {/* XP Gauge */}
              <PixelProgressBar
                label="EXPERIENCE (XP)"
                value={stats.xp}
                max={stats.xpToNextLevel}
                color="green"
              />

              {/* Health (HP) Gauge */}
              <PixelProgressBar
                label="STAMINA & HP"
                value={stats.hp}
                max={stats.maxHp}
                color={stats.hp < 40 ? 'red' : 'amber'}
              />

              <div className="pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
                <span className="text-[#94a3b8]">Quests Cleared Total:</span>
                <span className="font-bold text-[#39ff14]">{stats.tasksCompletedTotal}</span>
              </div>
            </div>
          </PixelCard>

          {/* Eisenhower Matrix Snapshot */}
          <PixelCard
            title="EISENHOWER MATRIX RADAR"
            badge={<span className="text-sm">🧭</span>}
            headerAction={
              <button
                onClick={() => onNavigate('matrix')}
                className="font-pixel text-[9px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                OPEN MATRIX →
              </button>
            }
          >
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div
                onClick={() => onNavigate('matrix')}
                className="p-3 bg-[#241014] border border-[#ef4444] cursor-pointer hover:brightness-125"
              >
                <span className="font-pixel text-[9px] text-[#ef4444] block">Q1: DO FIRST</span>
                <span className="font-pixel text-xl text-white mt-1 block">
                  {tasks.filter((t) => !t.isCompleted && t.matrixQuadrant === 'q1_do_first').length}
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">Urgent & Imp.</span>
              </div>

              <div
                onClick={() => onNavigate('matrix')}
                className="p-3 bg-[#0c202d] border border-[#38bdf8] cursor-pointer hover:brightness-125"
              >
                <span className="font-pixel text-[9px] text-[#38bdf8] block">Q2: SCHEDULE</span>
                <span className="font-pixel text-xl text-white mt-1 block">
                  {tasks.filter((t) => !t.isCompleted && t.matrixQuadrant === 'q2_schedule').length}
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">Important</span>
              </div>

              <div
                onClick={() => onNavigate('matrix')}
                className="p-3 bg-[#261c0d] border border-[#f59e0b] cursor-pointer hover:brightness-125"
              >
                <span className="font-pixel text-[9px] text-[#f59e0b] block">Q3: DELEGATE</span>
                <span className="font-pixel text-xl text-white mt-1 block">
                  {tasks.filter((t) => !t.isCompleted && t.matrixQuadrant === 'q3_delegate').length}
                </span>
                <span className="font-mono text-[9px] text-[#94a3b8]">Urgent</span>
              </div>

              <div
                onClick={() => onNavigate('matrix')}
                className="p-3 bg-[#131b29] border border-[#475569] cursor-pointer hover:brightness-125"
              >
                <span className="font-pixel text-[9px] text-[#94a3b8] block">Q4: ELIMINATE</span>
                <span className="font-pixel text-xl text-white mt-1 block">
                  {tasks.filter((t) => !t.isCompleted && t.matrixQuadrant === 'q4_eliminate').length}
                </span>
                <span className="font-mono text-[9px] text-[#64748b]">Don't Do</span>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  );
};
