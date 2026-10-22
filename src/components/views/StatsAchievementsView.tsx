import React, { useState } from 'react';
import { UserStats, Achievement, Task } from '../../types';
import { PixelCard, PixelProgressBar, PixelBadge, PixelModal } from '../ui/PixelUI';
import { PixelBadgeArt } from '../ui/PixelBadgeArt';
import { FocusStatsWidgets } from '../focus/FocusStatsWidgets';
import { retroAudio } from '../../utils/audio';

interface StatsAchievementsViewProps {
  stats: UserStats;
  achievements: Achievement[];
  tasks: Task[];
}

export const StatsAchievementsView: React.FC<StatsAchievementsViewProps> = ({
  stats,
  achievements,
  tasks,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Achievement | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const completedTasks = tasks.filter((t) => t.isCompleted);

  // Quadrant distribution of completed tasks
  const q1Count = completedTasks.filter((t) => t.matrixQuadrant === 'q1_do_first').length;
  const q2Count = completedTasks.filter((t) => t.matrixQuadrant === 'q2_schedule').length;
  const q3Count = completedTasks.filter((t) => t.matrixQuadrant === 'q3_delegate').length;
  const q4Count = completedTasks.filter((t) => t.matrixQuadrant === 'q4_eliminate').length;

  const unlockedCount = achievements.filter((a) => a.unlockedAt !== null).length;

  const filteredBadges = achievements.filter((ach) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'unlocked') return ach.unlockedAt !== null;
    if (filterCategory === 'locked') return ach.unlockedAt === null;
    return ach.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#121824] pixel-border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-[#f59e0b] bg-[#271a06] px-2 py-0.5 border border-[#f59e0b]">
              RPG PROGRESSION LOG
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">Character Sheet</span>
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#ede4ce] tracking-tight">
            HERO STATS & ACHIEVEMENTS
          </h2>
          <p className="font-mono text-xs text-[#94a3b8] mt-1">
            Track character growth, gamified focus metrics, and unlocked pixel-art achievement crests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="font-pixel text-xs text-white block">CLASS: PALADIN</span>
            <span className="font-mono text-[11px] text-[#39ff14]">Rank: Level {stats.level}</span>
          </div>
          <div className="w-12 h-12 bg-[#1a2234] border-2 border-[#39ff14] flex items-center justify-center text-2xl shadow-[2px_2px_0_0_#06090e]">
            👑
          </div>
        </div>
      </div>

      {/* Gamified Focus Mode Statistics Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-[#38bdf8] font-pixel text-xs">⌛</span>
            <h3 className="font-pixel text-xs text-[#ede4ce] tracking-wide">
              FOCUS MODE PERFORMANCE & ACCUMULATED TIME
            </h3>
          </div>
          <span className="font-mono text-xs text-[#94a3b8]">
            Drift-free chrono tracking
          </span>
        </div>
        <FocusStatsWidgets stats={stats} />
      </div>

      {/* Hero Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <PixelCard title="EXPERIENCE (XP)" variant="green">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-2xl text-[#39ff14]">{stats.xp}</span>
              <span className="font-mono text-xs text-[#64748b]">/ {stats.xpToNextLevel} XP</span>
            </div>
            <PixelProgressBar
              value={stats.xp}
              max={stats.xpToNextLevel}
              color="green"
              showNumeric={false}
            />
            <span className="font-mono text-[10px] text-[#94a3b8] block">
              Level {stats.level} · {stats.xpToNextLevel - stats.xp} XP to Level {stats.level + 1}
            </span>
          </div>
        </PixelCard>

        <PixelCard title="STAMINA & HP" variant="red">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-2xl text-[#ef4444]">{stats.hp}</span>
              <span className="font-mono text-xs text-[#64748b]">/ {stats.maxHp} HP</span>
            </div>
            <PixelProgressBar
              value={stats.hp}
              max={stats.maxHp}
              color="red"
              showNumeric={false}
            />
            <span className="font-mono text-[10px] text-[#94a3b8] block">
              Clear quests to restore stamina!
            </span>
          </div>
        </PixelCard>

        <PixelCard title="DAILY BATTLE STREAK" variant="amber">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-2xl text-[#f59e0b]">{stats.streakDays}</span>
              <span className="font-mono text-xs text-[#64748b]">DAYS ACTIVE</span>
            </div>
            <div className="h-4 bg-[#0b0e14] border-2 border-[#2c384e] flex items-center px-1">
              {Array.from({ length: Math.min(7, stats.streakDays) }).map((_, i) => (
                <span key={i} className="text-xs">🔥</span>
              ))}
            </div>
            <span className="font-mono text-[10px] text-[#94a3b8] block">
              Unbroken campaign streak
            </span>
          </div>
        </PixelCard>

        <PixelCard title="TOTAL QUESTS CLEARED" variant="cyan">
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="font-pixel text-2xl text-[#38bdf8]">{stats.tasksCompletedTotal}</span>
              <span className="font-mono text-xs text-[#64748b]">CLEARED</span>
            </div>
            <span className="font-pixel text-sm text-[#cbd5e1] block">
              {tasks.length > 0 ? Math.round((stats.tasksCompletedTotal / Math.max(stats.tasksCompletedTotal, tasks.length)) * 100) : 100}% All-time rate
            </span>
            <span className="font-mono text-[10px] text-[#94a3b8] block">
              Quests dispatched without fail
            </span>
          </div>
        </PixelCard>
      </div>

      {/* Eisenhower Completion Breakdown */}
      <PixelCard
        title="EISENHOWER MATRIX MASTERY"
        subtitle="Distribution of defeated quests"
        badge={<span className="text-sm">🧭</span>}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-[#1e0d11] border border-[#ef4444]">
            <span className="font-pixel text-[10px] text-[#ef4444] block">Q1 CLEARED</span>
            <span className="font-pixel text-2xl text-white mt-1 block">{q1Count}</span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Do First Bosses</span>
          </div>

          <div className="p-3 bg-[#0a1a27] border border-[#38bdf8]">
            <span className="font-pixel text-[10px] text-[#38bdf8] block">Q2 CLEARED</span>
            <span className="font-pixel text-2xl text-white mt-1 block">{q2Count}</span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Strategic Growth</span>
          </div>

          <div className="p-3 bg-[#1f1508] border border-[#f59e0b]">
            <span className="font-pixel text-[10px] text-[#f59e0b] block">Q3 CLEARED</span>
            <span className="font-pixel text-2xl text-white mt-1 block">{q3Count}</span>
            <span className="font-mono text-[10px] text-[#94a3b8]">Delegated Tasks</span>
          </div>

          <div className="p-3 bg-[#111827] border border-[#475569]">
            <span className="font-pixel text-[10px] text-[#94a3b8] block">Q4 PURGED</span>
            <span className="font-pixel text-2xl text-white mt-1 block">{q4Count}</span>
            <span className="font-mono text-[10px] text-[#64748b]">Eliminated</span>
          </div>
        </div>
      </PixelCard>

      {/* Cosmetic Badges & Achievements Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm">🎖️</span>
            <h3 className="font-pixel text-xs text-[#ede4ce] tracking-wide">
              COSMETIC BADGES & TROPHY ROOM ({unlockedCount}/{achievements.length})
            </h3>
          </div>
          <span className="font-mono text-xs text-[#39ff14]">
            +{achievements.filter((a) => a.unlockedAt).reduce((acc, curr) => acc + curr.xpBonus, 0)} Total Bonus XP
          </span>
        </div>

        {/* Badge Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'all', label: 'ALL BADGES' },
            { id: 'unlocked', label: `UNLOCKED (${unlockedCount})` },
            { id: 'locked', label: `LOCKED (${achievements.length - unlockedCount})` },
            { id: 'completion', label: 'QUESTS' },
            { id: 'focus', label: 'FOCUS' },
            { id: 'matrix', label: 'MATRIX' },
            { id: 'streak', label: 'STREAKS' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                retroAudio.playBlip();
                setFilterCategory(tab.id);
              }}
              className={`px-2.5 py-1 text-[10px] font-pixel border cursor-pointer whitespace-nowrap transition ${
                filterCategory === tab.id
                  ? 'border-[#39ff14] bg-[#0c2412] text-[#39ff14]'
                  : 'border-[#2d3748] bg-[#0b0e14] text-[#94a3b8] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Badges Grid with PixelBadgeArt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((ach) => {
            const isUnlocked = ach.unlockedAt !== null;
            return (
              <div
                key={ach.id}
                onClick={() => {
                  retroAudio.playBlip();
                  setSelectedBadge(ach);
                }}
                className={`p-4 pixel-border flex items-start gap-3.5 transition-all cursor-pointer ${
                  isUnlocked
                    ? 'bg-[#121f18] border-[#39ff14] hover:border-[#38bdf8] shadow-[0_0_10px_rgba(57,255,20,0.15)]'
                    : 'bg-[#0f141d] border-[#222d3f] opacity-60 hover:opacity-90'
                }`}
              >
                {/* 8-Bit Pixel Badge Art Sprite */}
                <PixelBadgeArt
                  type={ach.badgeArt}
                  tier={ach.tier}
                  isUnlocked={isUnlocked}
                  size="md"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-pixel text-xs text-white truncate">
                      {ach.title}
                    </h4>
                    <span className="font-pixel text-[9px] text-[#39ff14]">
                      +{ach.xpBonus} XP
                    </span>
                  </div>

                  <p className="font-mono text-xs text-[#94a3b8] leading-tight">
                    {ach.description}
                  </p>

                  <div className="mt-2 text-[10px] font-mono flex items-center justify-between">
                    <span className="text-[#cbd5e1] font-bold">
                      [{ach.tier.toUpperCase()}]
                    </span>
                    {isUnlocked ? (
                      <span className="text-[#39ff14] font-bold flex items-center gap-1">
                        <span>✔</span> Unlocked
                      </span>
                    ) : (
                      <span className="text-[#64748b]">Click for criteria</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <PixelModal
          isOpen={Boolean(selectedBadge)}
          onClose={() => setSelectedBadge(null)}
          title="ACHIEVEMENT CREST INTEL"
        >
          <div className="space-y-4 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-[#222d3f] pb-4">
              <PixelBadgeArt
                type={selectedBadge.badgeArt}
                tier={selectedBadge.tier}
                isUnlocked={selectedBadge.unlockedAt !== null}
                size="lg"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                  <span className="font-pixel text-[10px] text-[#38bdf8] border border-[#38bdf8] px-1.5 py-0.5">
                    {selectedBadge.tier.toUpperCase()} TIER
                  </span>
                  <span className="font-pixel text-[10px] text-[#39ff14] border border-[#39ff14] px-1.5 py-0.5">
                    +{selectedBadge.xpBonus} XP BONUS
                  </span>
                </div>
                <h3 className="font-pixel text-sm text-white">{selectedBadge.title}</h3>
                <p className="font-mono text-xs text-[#cbd5e1] mt-1">{selectedBadge.description}</p>
              </div>
            </div>

            <div className="bg-[#0b0e14] border-2 border-[#2c384e] p-3 space-y-2">
              <span className="font-pixel text-[10px] text-[#f59e0b] block uppercase">
                CLEAR UNLOCK CRITERIA:
              </span>
              <p className="font-mono text-sm text-[#ede4ce] font-bold">
                🎯 {selectedBadge.criteria}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono pt-2">
              <span className="text-[#94a3b8]">Status:</span>
              {selectedBadge.unlockedAt ? (
                <span className="font-pixel text-[10px] text-[#39ff14] bg-[#0c2412] px-2 py-1 border border-[#39ff14]">
                  ✔ UNLOCKED ON {new Date(selectedBadge.unlockedAt).toLocaleDateString()}
                </span>
              ) : (
                <span className="font-pixel text-[10px] text-[#f59e0b] bg-[#291705] px-2 py-1 border border-[#f59e0b]">
                  🔒 IN PROGRESS
                </span>
              )}
            </div>
          </div>
        </PixelModal>
      )}
    </div>
  );
};
