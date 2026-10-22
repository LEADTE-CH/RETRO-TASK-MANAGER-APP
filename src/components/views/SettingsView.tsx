import React, { useState } from 'react';
import { UserSettings, AuthUser } from '../../types';
import { PixelCard, PixelButton, PixelInput, PixelCheckbox } from '../ui/PixelUI';
import { SUPABASE_MIGRATION_SQL } from '../../db/schema.sql';
import { syncEngine, SyncEngineStatus } from '../../db/supabase';
import { notificationService, NotificationPermissionState } from '../../utils/notifications';
import { retroAudio } from '../../utils/audio';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  user: AuthUser;
  onUpdateUser: (newUser: AuthUser) => void;
  syncStatus: SyncEngineStatus;
  onTriggerSync: () => void;
  pendingSyncCount: number;
  onShowToast: (msg: string, type?: 'success' | 'alert' | 'info') => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  user,
  onUpdateUser,
  syncStatus,
  onTriggerSync,
  pendingSyncCount,
  onShowToast,
  onResetData,
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [useCloudSync, setUseCloudSync] = useState(settings.useCloudSync || false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);

  const [copiedSql, setCopiedSql] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermissionState>(
    notificationService.getPermission()
  );

  const handleSavePreferences = () => {
    retroAudio.playSuccess();
    const updated: UserSettings = {
      ...settings,
      supabaseUrl: supabaseUrl.trim(),
      supabaseAnonKey: supabaseAnonKey.trim(),
      useCloudSync,
    };
    onUpdateSettings(updated);
    syncEngine.initFromSettings();
    onShowToast('Settings and configuration persisted to storage.', 'success');
  };

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) {
      setTestResult({ ok: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }
    setTestingConnection(true);
    setTestResult(null);
    const res = await syncEngine.testConnection(supabaseUrl.trim(), supabaseAnonKey.trim());
    setTestingConnection(false);
    setTestResult(res);
  };

  const handleRequestNotifPermission = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(notificationService.getPermission());
    if (granted) {
      notificationService.sendTestNotification((msg) => onShowToast(msg, 'success'));
    } else {
      onShowToast('Notification permission denied or dismissed.', 'alert');
    }
  };

  const handleCopySql = () => {
    retroAudio.playBlip();
    navigator.clipboard.writeText(SUPABASE_MIGRATION_SQL);
    setCopiedSql(true);
    onShowToast('Supabase PostgreSQL migration SQL copied to clipboard!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#121824] pixel-border p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-[#94a3b8] bg-[#1a2234] px-2 py-0.5 border border-[#475569]">
              SYSTEM CONFIG
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">v1.0.0</span>
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#ede4ce] tracking-tight">
            CONSOLE SETTINGS & INTEGRATIONS
          </h2>
          <p className="font-mono text-xs text-[#94a3b8] mt-1">
            Configure local durability, sound synthesis, focus cycles, and Supabase cloud sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/download"
            download="pixelquest-task-manager.zip"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-pixel bg-[#0c202d] text-[#38bdf8] border-2 border-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0b0e14] transition cursor-pointer shadow-[2px_2px_0_0_#06090e]"
            title="Download full project source code as a ZIP archive"
          >
            <span>📦</span>
            <span>DOWNLOAD ZIP</span>
          </a>
          <PixelButton variant="primary" onClick={handleSavePreferences}>
            SAVE ALL SETTINGS
          </PixelButton>
        </div>
      </div>

      {/* 1. Supabase Cloud Sync & Durable Queue */}
      <PixelCard
        title="SUPABASE CLOUD SYNCHRONIZATION"
        subtitle="PostgreSQL Backend & Cross-Device Sync"
        badge={<span className="text-sm">⚡</span>}
        variant={useCloudSync ? 'green' : 'default'}
      >
        <div className="space-y-4">
          <p className="font-mono text-xs text-[#cbd5e1] leading-relaxed">
            PixelQuest runs on a durable <strong>offline-first local engine</strong>. When you configure your Supabase project, tasks and progress synchronize seamlessly when online with zero duplicates and Last-Write-Wins (LWW) conflict resolution.
          </p>

          <div className="bg-[#0b0e14] border border-[#2d3748] p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-[#94a3b8] block">Sync Engine State:</span>
              <strong className="text-white font-pixel text-[11px] uppercase">
                {syncStatus}
              </strong>
            </div>

            <div>
              <span className="text-[#94a3b8] block">Offline Queue:</span>
              <strong className="text-[#f59e0b] font-pixel text-[11px]">
                {pendingSyncCount} pending change(s)
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <PixelButton variant="cyan" size="sm" onClick={onTriggerSync}>
                SYNC NOW ↻
              </PixelButton>
            </div>
          </div>

          <div className="pt-2">
            <PixelCheckbox
              checked={useCloudSync}
              onChange={(checked) => setUseCloudSync(checked)}
              label={
                <span className="font-pixel text-[10px] text-[#39ff14]">
                  ENABLE CLOUD SYNC WITH SUPABASE
                </span>
              }
            />
          </div>

          {useCloudSync && (
            <div className="space-y-3 pt-2 border-t border-[#1e293b]">
              <PixelInput
                label="Supabase Project URL"
                placeholder="https://xyzcompany.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                helperText="Found in Supabase Dashboard > Project Settings > API"
              />

              <PixelInput
                label="Supabase Anon / Public Key"
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                helperText="Safe for client use with Row Level Security (RLS) policies enabled."
              />

              <div className="flex items-center gap-3 pt-2">
                <PixelButton
                  type="button"
                  variant="amber"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testingConnection}
                >
                  {testingConnection ? 'TESTING...' : 'TEST CONNECTION'}
                </PixelButton>
                {testResult && (
                  <span
                    className={`font-mono text-xs ${
                      testResult.ok ? 'text-[#39ff14]' : 'text-[#ef4444]'
                    }`}
                  >
                    {testResult.ok ? '✔ ' : '✕ '}
                    {testResult.message}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </PixelCard>

      {/* 2. SQL Migration Exporter & Schema Setup Guide */}
      <PixelCard
        title="SUPABASE SQL MIGRATION SCRIPT"
        subtitle="1-Click Database Setup & RLS Security Rules"
        badge={<span className="text-sm">📜</span>}
      >
        <div className="space-y-3">
          <p className="font-mono text-xs text-[#94a3b8]">
            Copy and paste this script into your <strong>Supabase SQL Editor</strong> to create the <code>profiles</code>, <code>user_stats</code>, <code>tasks</code>, <code>focus_sessions</code>, and <code>achievements</code> tables with strict Row Level Security (RLS) user isolation.
          </p>

          <div className="flex items-center justify-between">
            <span className="font-pixel text-[9px] text-[#64748b]">
              PostgreSQL 15+ compatible with uuid triggers
            </span>
            <PixelButton
              variant={copiedSql ? 'primary' : 'cyan'}
              size="sm"
              onClick={handleCopySql}
            >
              {copiedSql ? '✔ COPIED TO CLIPBOARD!' : 'COPY SQL SCRIPT'}
            </PixelButton>
          </div>

          <div className="bg-[#0b0e14] border-2 border-[#222d3f] p-3 max-h-48 overflow-y-auto">
            <pre className="font-mono text-[11px] text-[#a5b4fc] whitespace-pre">
              {SUPABASE_MIGRATION_SQL}
            </pre>
          </div>
        </div>
      </PixelCard>

      {/* 3. Audio & Retro Console Visual Settings */}
      <PixelCard
        title="RETRO CONSOLE VISUALS & AUDIO"
        badge={<span className="text-sm">🎮</span>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <PixelCheckbox
              checked={settings.themeScanlines}
              onChange={(checked) =>
                onUpdateSettings({ ...settings, themeScanlines: checked })
              }
              label={
                <span className="font-mono text-xs">
                  <strong>CRT Scanline Overlay</strong> (Retro arcade feel)
                </span>
              }
            />

            <PixelCheckbox
              checked={settings.reducedMotion}
              onChange={(checked) =>
                onUpdateSettings({ ...settings, reducedMotion: checked })
              }
              label={
                <span className="font-mono text-xs">
                  <strong>Reduced Motion</strong> (Disable pulsating CRT animations)
                </span>
              }
            />
          </div>

          <div className="space-y-3">
            <PixelCheckbox
              checked={settings.soundEnabled}
              onChange={(checked) => {
                retroAudio.enabled = checked;
                onUpdateSettings({ ...settings, soundEnabled: checked });
              }}
              label={
                <span className="font-mono text-xs">
                  <strong>8-Bit Sound Effects</strong> (Synthesizer chimes & fanfare)
                </span>
              }
            />

            <div className="flex items-center gap-3">
              <label className="font-pixel text-[10px] text-[#94a3b8] whitespace-nowrap">
                VOLUME:
              </label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={settings.soundVolume}
                onChange={(e) => {
                  const vol = Number(e.target.value);
                  retroAudio.volume = vol;
                  onUpdateSettings({ ...settings, soundVolume: vol });
                }}
                className="w-full accent-[#39ff14]"
              />
              <button
                type="button"
                onClick={() => retroAudio.playSuccess()}
                className="font-pixel text-[9px] text-[#38bdf8] hover:underline cursor-pointer"
              >
                TEST
              </button>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* 4. Notifications & Alarms */}
      <PixelCard
        title="NOTIFICATIONS & REMINDERS"
        badge={<span className="text-sm">🔔</span>}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-[#ede4ce] block">
                Browser Notification Permission:
              </span>
              <span className="font-pixel text-[10px] text-[#94a3b8]">
                Status:{' '}
                <strong
                  className={
                    notifPermission === 'granted'
                      ? 'text-[#39ff14]'
                      : notifPermission === 'denied'
                      ? 'text-[#ef4444]'
                      : 'text-[#f59e0b]'
                  }
                >
                  {notifPermission.toUpperCase()}
                </strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {notifPermission !== 'granted' && (
                <PixelButton
                  variant="primary"
                  size="sm"
                  onClick={handleRequestNotifPermission}
                >
                  REQUEST PERMISSION
                </PixelButton>
              )}
              <PixelButton
                variant="ghost"
                size="sm"
                onClick={() =>
                  notificationService.sendTestNotification((m) => onShowToast(m, 'info'))
                }
              >
                TEST ALARM
              </PixelButton>
            </div>
          </div>

          <p className="font-mono text-[11px] text-[#64748b]">
            When enabled, PixelQuest alerts you 15 minutes prior to any quest deadline, and announces focus session completion.
          </p>
        </div>
      </PixelCard>

      {/* 5. Chrono Focus Chamber Timer Settings */}
      <PixelCard
        title="FOCUS CHAMBER INTERVALS"
        badge={<span className="text-sm">⌛</span>}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8]">
              FOCUS DURATION (MIN)
            </label>
            <input
              type="number"
              min="5"
              max="90"
              value={settings.focusDuration}
              onChange={(e) =>
                onUpdateSettings({ ...settings, focusDuration: Number(e.target.value) })
              }
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-xs font-mono px-3 py-2 text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8]">
              SHORT BREAK (MIN)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={settings.shortBreakDuration}
              onChange={(e) =>
                onUpdateSettings({ ...settings, shortBreakDuration: Number(e.target.value) })
              }
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-xs font-mono px-3 py-2 text-white"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8]">
              LONG BREAK (MIN)
            </label>
            <input
              type="number"
              min="5"
              max="60"
              value={settings.longBreakDuration}
              onChange={(e) =>
                onUpdateSettings({ ...settings, longBreakDuration: Number(e.target.value) })
              }
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-xs font-mono px-3 py-2 text-white"
            />
          </div>
        </div>
      </PixelCard>

      {/* 6. Hero Profile & Data Reset */}
      <PixelCard
        title="HERO PROFILE & LOCAL STORAGE PURGE"
        badge={<span className="text-sm">🛡️</span>}
        variant="red"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PixelInput
              label="Hero Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <PixelInput
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <PixelButton
              variant="cyan"
              size="sm"
              onClick={() => {
                onUpdateUser({ ...user, displayName, email });
                onShowToast('Hero profile updated!', 'success');
              }}
            >
              UPDATE PROFILE
            </PixelButton>

            <PixelButton
              variant="danger"
              size="sm"
              onClick={() => {
                retroAudio.playAlert();
                onResetData();
                onShowToast('Local quest data reset to factory template.', 'alert');
              }}
            >
              PURGE & RESET TO DEFAULTS
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    </div>
  );
};
