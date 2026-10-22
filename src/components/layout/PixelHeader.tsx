import React, { useState, useEffect } from 'react';
import { ViewTab, UserStats, AuthUser } from '../../types';
import { SyncEngineStatus } from '../../db/supabase';
import { retroAudio } from '../../utils/audio';

interface PixelHeaderProps {
  activeTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  stats: UserStats;
  user: AuthUser;
  syncStatus: SyncEngineStatus;
  pendingSyncCount: number;
  onSyncClick: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAuth: () => void;
}

export const PixelHeader: React.FC<PixelHeaderProps> = ({
  activeTab,
  onSelectTab,
  stats,
  user,
  syncStatus,
  pendingSyncCount,
  onSyncClick,
  soundEnabled,
  onToggleSound,
  onOpenAuth,
}) => {
  const [clockTime, setClockTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      setClockTime(
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: ViewTab; label: string; shortcut: string; icon: string }[] = [
    { id: 'dashboard', label: 'RADAR', shortcut: '1', icon: '⚡' },
    { id: 'tasks', label: 'QUESTS', shortcut: '2', icon: '⚔️' },
    { id: 'matrix', label: 'MATRIX', shortcut: '3', icon: '🧭' },
    { id: 'focus', label: 'FOCUS', shortcut: '4', icon: '⌛' },
    { id: 'stats', label: 'STATS', shortcut: '5', icon: '👑' },
    { id: 'assistant', label: 'ORACLE', shortcut: '6', icon: '👾' },
    { id: 'settings', label: 'CONFIG', shortcut: '7', icon: '⚙️' },
  ];

  const syncColor = {
    idle: 'text-[#94a3b8] border-[#334155]',
    synced: 'text-[#39ff14] border-[#39ff14] bg-[#0c2412]',
    syncing: 'text-[#38bdf8] border-[#38bdf8] bg-[#0c202d] animate-retro-pulse',
    offline: 'text-[#f59e0b] border-[#f59e0b] bg-[#271a06]',
    error: 'text-[#ef4444] border-[#ef4444] bg-[#290d11]',
  }[syncStatus];

  return (
    <header className="w-full bg-[#0d121c] border-b-3 border-[#222d3f] shadow-md sticky top-0 z-40 select-none">
      {/* Top HUD: Hero Stats & System Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1e3a24] border-2 border-[#39ff14] flex items-center justify-center text-sm shadow-[2px_2px_0_0_#06090e] animate-pixel-bounce">
            👾
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-pixel text-xs sm:text-sm text-[#ede4ce] tracking-tight">
                PIXEL<span className="text-[#39ff14]">QUEST</span>
              </span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39ff14] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39ff14]"></span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[9px] font-mono text-[#64748b]">
              <span className="hidden sm:inline">CONSOLE v1.0</span>
              <span className="text-[#38bdf8] font-bold">[{clockTime || 'LIVE'}]</span>
            </div>
          </div>
        </div>

        {/* RPG HUD: Level, HP, XP, Streak */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Level Badge */}
          <div className="flex items-center gap-1.5 bg-[#121824] border-2 border-[#38bdf8] px-2 py-0.5">
            <span className="text-[9px] font-pixel text-[#38bdf8]">LV</span>
            <span className="font-pixel text-xs text-white">{stats.level}</span>
          </div>

          {/* HP Bar */}
          <div className="flex items-center gap-1.5 bg-[#121824] border-2 border-[#ef4444] px-2 py-0.5">
            <span className="text-[9px] font-pixel text-[#ef4444]">HP</span>
            <div className="w-14 sm:w-20 h-2 bg-[#1f1013] border border-[#ef4444]/40 overflow-hidden relative">
              <div
                className="h-full bg-[#ef4444] transition-all duration-300"
                style={{ width: `${(stats.hp / stats.maxHp) * 100}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#ede4ce]">{stats.hp}</span>
          </div>

          {/* XP Progress */}
          <div className="flex items-center gap-1.5 bg-[#121824] border-2 border-[#39ff14] px-2 py-0.5">
            <span className="text-[9px] font-pixel text-[#39ff14]">XP</span>
            <div className="w-14 sm:w-20 h-2 bg-[#0c2412] border border-[#39ff14]/40 overflow-hidden relative">
              <div
                className="h-full bg-[#39ff14] transition-all duration-300"
                style={{ width: `${Math.min(100, (stats.xp / stats.xpToNextLevel) * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-[#ede4ce]">{stats.xp}/{stats.xpToNextLevel}</span>
          </div>

          {/* Streak Flame */}
          <div className="flex items-center gap-1 bg-[#121824] border-2 border-[#f59e0b] px-2 py-0.5" title="Daily Streak">
            <span className="text-xs">🔥</span>
            <span className="font-pixel text-[10px] text-[#f59e0b]">{stats.streakDays}D</span>
          </div>
        </div>

        {/* System Controls: Audio, Sync, Profile */}
        <div className="flex items-center gap-2">
          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              retroAudio.playBlip();
            }}
            className={`p-1.5 border-2 ${
              soundEnabled
                ? 'border-[#38bdf8] text-[#38bdf8] bg-[#0c202d]'
                : 'border-[#475569] text-[#64748b] bg-[#121824]'
            } hover:opacity-80 transition-opacity cursor-pointer`}
            title={soundEnabled ? 'Mute 8-bit sound fx' : 'Enable 8-bit sound fx'}
            aria-label="Sound toggle"
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>

          {/* Sync Button */}
          <button
            onClick={onSyncClick}
            className={`px-2 py-1 border text-[10px] font-mono uppercase flex items-center gap-1.5 cursor-pointer ${syncColor} hover:brightness-125 transition`}
            title="Durable Sync Status (Click to force sync)"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
            <span className="font-pixel text-[9px]">{syncStatus}</span>
            {pendingSyncCount > 0 && (
              <span className="bg-[#f59e0b] text-[#0b0e14] px-1 text-[9px] font-bold">
                +{pendingSyncCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Button */}
          <button
            onClick={() => {
              retroAudio.playBlip();
              onOpenAuth();
            }}
            className="flex items-center gap-1.5 bg-[#1a2234] border-2 border-[#475569] hover:border-[#ede4ce] px-2 py-1 cursor-pointer transition-colors"
          >
            <span className="text-xs">🛡️</span>
            <span className="font-pixel text-[9px] text-[#ede4ce] max-w-[80px] truncate">
              {user.isGuest ? 'GUEST' : user.displayName.split(' ')[0]}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <nav className="bg-[#090c12] border-t border-[#1c2436] px-2 sm:px-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 sm:gap-2 py-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  retroAudio.playBlip();
                  onSelectTab(tab.id);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-pixel whitespace-nowrap cursor-pointer transition-all ${
                  isActive
                    ? 'bg-[#1e293b] text-[#39ff14] border-b-2 border-[#39ff14] shadow-[0_2px_0_0_#39ff14]'
                    : 'text-[#94a3b8] hover:text-[#ede4ce] hover:bg-[#121824]'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
