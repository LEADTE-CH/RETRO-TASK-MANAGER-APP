import React, { useState, useEffect } from 'react';
import { Task, UserStats } from '../../types';
import { PixelCard, PixelButton } from '../ui/PixelUI';
import { retroAudio } from '../../utils/audio';

interface DailyQuestCardProps {
  tasks: Task[];
  stats: UserStats;
  onClaimDailyQuest: (bonusXP: number) => void;
  onReviewTasksClick?: () => void;
}

export const DailyQuestCard: React.FC<DailyQuestCardProps> = ({
  tasks,
  stats,
  onClaimDailyQuest,
  onReviewTasksClick,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const isClaimedToday = stats.dailyQuestClaimedDate === todayStr;

  const [timeUntilReset, setTimeUntilReset] = useState<string>('');
  const [isReviewing, setIsReviewing] = useState<boolean>(false);

  // Calculate live countdown until next 24-hour reset (midnight local time)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // next midnight

      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeUntilReset('Resetting now...');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeUntilReset(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const streak = stats.dailyQuestStreak || 1;

  // Base 35 XP + streak bonus (up to +25 extra XP for check-in streak)
  const streakBonus = Math.min(25, (streak - 1) * 5);
  const totalRewardXP = 35 + streakBonus;

  const handleClaim = () => {
    if (isClaimedToday || isReviewing) return;

    retroAudio.playBlip();
    setIsReviewing(true);

    // Brief retro review sequence
    setTimeout(() => {
      retroAudio.playLevelUp();
      setIsReviewing(false);
      onClaimDailyQuest(totalRewardXP);
    }, 700);
  };

  return (
    <PixelCard
      title="DAILY QUEST: MORNING ROLL CALL"
      subtitle="24-Hour Recurring Adventurer Bounty"
      badge={<span className="text-sm">📜</span>}
      variant={isClaimedToday ? 'default' : 'amber'}
      className="border-2 border-[#f59e0b]/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Left: Pixel Bounty Chest Graphic & Quest Intel */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          {/* Animated 8-bit Pixel Chest */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center border-3 shrink-0 shadow-[2px_2px_0_0_#06090e] ${
              isClaimedToday
                ? 'bg-[#1e293b] border-[#475569] text-3xl'
                : 'bg-[#2b1805] border-[#f59e0b] text-3xl animate-pixel-bounce shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            }`}
          >
            {isClaimedToday ? '📭' : '🎁'}
          </div>

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-pixel text-[10px] bg-[#291705] border border-[#f59e0b] text-[#fbbf24] px-1.5 py-0.5">
                BOUNTY: +{totalRewardXP} XP
              </span>
              <span className="font-mono text-xs text-[#a5b4fc]">
                🔥 {streak}-Day Check-in Streak
              </span>
              {streakBonus > 0 && (
                <span className="font-pixel text-[9px] text-[#39ff14]">
                  (+{streakBonus} Streak Bonus)
                </span>
              )}
            </div>

            <h4 className="font-mono text-sm sm:text-base font-bold text-[#ede4ce]">
              Inspect Log & Strategize Daily Campaign
            </h4>

            <p className="font-mono text-xs text-[#94a3b8]">
              {isClaimedToday
                ? `✔ Task review completed for today. Backlog examined (${activeTasks.length} active quests tracked).`
                : `Open the app and review your active backlog (${activeTasks.length} quests awaiting command) to claim today's bonus XP.`}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons & 24h Countdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto justify-end">
          {onReviewTasksClick && (
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={onReviewTasksClick}
              className="whitespace-nowrap"
            >
              🔍 REVIEW TASKS ({activeTasks.length})
            </PixelButton>
          )}

          {!isClaimedToday ? (
            <PixelButton
              variant="amber"
              size="md"
              onClick={handleClaim}
              disabled={isReviewing}
              className="text-xs px-5 py-2.5 whitespace-nowrap"
            >
              {isReviewing ? 'INSPECTING LOG...' : `✦ CLAIM BOUNTY (+${totalRewardXP} XP)`}
            </PixelButton>
          ) : (
            <div className="flex flex-col items-center sm:items-end bg-[#0b0e14] border border-[#2d3748] px-3 py-2 text-center sm:text-right">
              <span className="font-pixel text-[10px] text-[#39ff14] flex items-center gap-1">
                <span>✔</span> CLAIMED FOR TODAY
              </span>
              <span className="font-mono text-[11px] text-[#94a3b8] mt-0.5">
                Next reset in: <strong className="text-white font-mono">{timeUntilReset}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </PixelCard>
  );
};
