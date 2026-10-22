import React from 'react';
import { UserStats } from '../../types';
import { PixelCard, PixelProgressBar } from '../ui/PixelUI';

interface FocusStatsWidgetsProps {
  stats: UserStats;
  compact?: boolean;
}

export const FocusStatsWidgets: React.FC<FocusStatsWidgetsProps> = ({
  stats,
  compact = false,
}) => {
  const streak = stats.focusStreakCurrent || 0;
  const bestStreak = stats.focusStreakBest || streak;
  const totalMins = stats.focusMinutesTotal || 0;
  const completedSessions = stats.focusSessionsCompleted || Math.floor(totalMins / 25);
  const attemptedSessions = Math.max(completedSessions, stats.focusSessionsAttempted || completedSessions);
  const completionRate =
    attemptedSessions > 0
      ? Math.round((completedSessions / attemptedSessions) * 100)
      : 100;

  // Chrono Rank calculation
  const getChronoRank = (mins: number) => {
    if (mins >= 1000) return { title: 'TIME LORD', tier: 'PLATINUM', color: 'text-[#38bdf8]', icon: '⏳' };
    if (mins >= 500) return { title: 'CHRONO GRANDMASTER', tier: 'GOLD', color: 'text-[#f59e0b]', icon: '⌛' };
    if (mins >= 250) return { title: 'FOCUS KNIGHT', tier: 'SILVER', color: 'text-[#cbd5e1]', icon: '🛡️' };
    if (mins >= 100) return { title: 'TIME ADEPT', tier: 'BRONZE', color: 'text-[#39ff14]', icon: '⚡' };
    return { title: 'INITIATE CHRONOMANCER', tier: 'NOVICE', color: 'text-[#94a3b8]', icon: '🕯️' };
  };

  const chronoRank = getChronoRank(totalMins);

  if (compact) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Compact Streak */}
        <div className="bg-[#1a1208] border-2 border-[#f59e0b] p-3 flex items-center justify-between shadow-[2px_2px_0_0_#06090e]">
          <div>
            <span className="font-pixel text-[9px] text-[#f59e0b] block uppercase">FOCUS STREAK</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-pixel text-xl text-white">{streak}</span>
              <span className="font-mono text-xs text-[#f59e0b]">COMBO</span>
            </div>
          </div>
          <div className="text-2xl animate-pixel-bounce">🔥</div>
        </div>

        {/* Compact Total Focus Time */}
        <div className="bg-[#091a27] border-2 border-[#38bdf8] p-3 flex items-center justify-between shadow-[2px_2px_0_0_#06090e]">
          <div>
            <span className="font-pixel text-[9px] text-[#38bdf8] block uppercase">ACCUMULATED TIME</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-pixel text-xl text-white">
                {Math.floor(totalMins / 60)}h {totalMins % 60}m
              </span>
            </div>
          </div>
          <div className="text-2xl">⏳</div>
        </div>

        {/* Compact Completion Rate */}
        <div className="bg-[#0a2014] border-2 border-[#39ff14] p-3 flex items-center justify-between shadow-[2px_2px_0_0_#06090e]">
          <div>
            <span className="font-pixel text-[9px] text-[#39ff14] block uppercase">CLEAR RATE</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-pixel text-xl text-white">{completionRate}%</span>
              <span className="font-mono text-[10px] text-[#64748b]">({completedSessions}/{attemptedSessions})</span>
            </div>
          </div>
          <div className="text-2xl">🎯</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. FOCUS STREAK COUNTER */}
      <PixelCard
        title="FOCUS STREAK COUNTER"
        badge={<span className="text-sm">🔥</span>}
        variant="amber"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#94a3b8]">CURRENT COMBO</span>
            <span className="font-pixel text-[9px] text-[#f59e0b] bg-[#3a2007] border border-[#f59e0b] px-1.5 py-0.5">
              BEST: {bestStreak} STREAK
            </span>
          </div>

          {/* Retro Big Flame Display */}
          <div className="bg-[#0b0e14] border-2 border-[#f59e0b]/60 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#291705] border-2 border-[#f59e0b] flex items-center justify-center text-2xl shadow-[inset_0_0_10px_rgba(245,158,11,0.5)]">
                🔥
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-pixel text-3xl text-[#fbbf24]">{streak}</span>
                  <span className="font-pixel text-xs text-[#f59e0b]">SESSIONS</span>
                </div>
                <span className="font-mono text-[10px] text-[#94a3b8]">
                  {streak >= 5 ? '⚡ GODLIKE FOCUS BUFF ACTIVE (+20% XP)' : streak >= 3 ? '⚔️ ON A ROLL! (+10% XP)' : 'Complete sessions without aborting'}
                </span>
              </div>
            </div>
          </div>

          {/* Stepped Pixel Flame Ticks */}
          <div className="flex items-center gap-1.5 pt-1">
            {Array.from({ length: 8 }).map((_, idx) => {
              const active = idx < streak;
              return (
                <div
                  key={idx}
                  className={`flex-1 h-3 border ${
                    active
                      ? 'bg-[#f59e0b] border-[#fde047] shadow-[0_0_6px_#f59e0b]'
                      : 'bg-[#151b26] border-[#2c384e]'
                  }`}
                  title={`Streak tier ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </PixelCard>

      {/* 2. TOTAL FOCUS TIME METER (Arcade Battery / Mana Meter) */}
      <PixelCard
        title="TOTAL FOCUS TIME METER"
        badge={<span className="text-sm">⏳</span>}
        variant="cyan"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#94a3b8]">CHRONO ENERGY</span>
            <span className={`font-pixel text-[9px] ${chronoRank.color} border border-current px-1.5 py-0.5 bg-[#0b0e14]`}>
              {chronoRank.title}
            </span>
          </div>

          <div className="bg-[#0b0e14] border-2 border-[#38bdf8]/60 p-3 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-pixel text-2xl sm:text-3xl text-[#38bdf8]">
                  {Math.floor(totalMins / 60)}h {totalMins % 60}m
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8]">
                {totalMins} total minutes of deep immersion
              </span>
            </div>
            <div className="text-3xl">{chronoRank.icon}</div>
          </div>

          {/* Stepped Mana Meter Gauge */}
          <PixelProgressBar
            value={totalMins % 250}
            max={250}
            label={`NEXT RANK (${totalMins % 250}/250m)`}
            color="cyan"
            showNumeric={false}
          />
        </div>
      </PixelCard>

      {/* 3. COMPLETION RATIO (Planned vs Completed) */}
      <PixelCard
        title="FOCUS SUCCESS RATIO"
        badge={<span className="text-sm">🎯</span>}
        variant="green"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-[#94a3b8]">PLANNED COMPLETION</span>
            <span className="font-pixel text-[9px] text-[#39ff14] bg-[#0c2412] border border-[#39ff14] px-1.5 py-0.5">
              {completionRate}% EFFICIENCY
            </span>
          </div>

          <div className="bg-[#0b0e14] border-2 border-[#39ff14]/60 p-3 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-pixel text-3xl text-[#39ff14]">{completionRate}%</span>
                <span className="font-mono text-xs text-[#cbd5e1]">
                  ({completedSessions}/{attemptedSessions})
                </span>
              </div>
              <span className="font-mono text-[10px] text-[#94a3b8]">
                Finished without early abandonment
              </span>
            </div>
            <div className="w-10 h-10 border-2 border-[#39ff14] bg-[#122416] flex items-center justify-center font-pixel text-xs text-[#39ff14]">
              {completionRate >= 90 ? 'S' : completionRate >= 75 ? 'A' : 'B'}
            </div>
          </div>

          <PixelProgressBar
            value={completedSessions}
            max={Math.max(1, attemptedSessions)}
            label="SESSIONS CLEARED"
            color="green"
            showNumeric={true}
          />
        </div>
      </PixelCard>
    </div>
  );
};
